const { spawn } = require('child_process');
const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

const isWindows = process.platform === 'win32';
const PY_EMBED_VERSION = '3.11.9';
const PY_EMBED_FILENAME = `python-${PY_EMBED_VERSION}-embed-amd64.zip`;
const PY_EMBED_URL = `https://www.python.org/ftp/python/${PY_EMBED_VERSION}/${PY_EMBED_FILENAME}`;
const GET_PIP_URL = 'https://bootstrap.pypa.io/get-pip.py';

function log(message) {
    console.log(`[runtime] ${message}`);
}

function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            ...options,
            shell: false,
            windowsHide: true
        });

        let stdout = '';
        let stderr = '';

        if (child.stdout) {
            child.stdout.on('data', (chunk) => {
                stdout += chunk.toString();
            });
        }

        if (child.stderr) {
            child.stderr.on('data', (chunk) => {
                stderr += chunk.toString();
            });
        }

        child.on('error', reject);

        child.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
                return;
            }

            const err = new Error(
                `Command failed (${command} ${args.join(' ')}), code ${code}\n${stderr || stdout}`
            );
            err.code = code;
            err.stdout = stdout;
            err.stderr = stderr;
            reject(err);
        });
    });
}

async function pathExists(targetPath) {
    try {
        await fs.promises.access(targetPath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function sha256(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

async function ensureDir(dirPath) {
    await fs.promises.mkdir(dirPath, { recursive: true });
}

function getBackendSourcePath(isDev) {
    return isDev
        ? path.join(__dirname, '../../server_side')
        : path.join(process.resourcesPath, 'server_side');
}

async function ensureBackendSourceAvailable(backendSourcePath, paths) {
    const mainFile = path.join(backendSourcePath, 'main.py');
    if (await pathExists(mainFile)) {
        return backendSourcePath;
    }

    const backendBundleUrl = process.env.LOCAL_LLM_BACKEND_URL;
    if (!backendBundleUrl) {
        throw new Error(
            'Bundled backend is missing and LOCAL_LLM_BACKEND_URL is not set for auto-download.'
        );
    }

    const downloadedRoot = path.join(paths.runtimeRoot, 'downloaded-backend');
    const archivePath = path.join(paths.runtimeRoot, 'backend-bundle.zip');
    const extractedServerSide = path.join(downloadedRoot, 'server_side');

    log(`Bundled backend not found. Downloading backend bundle from ${backendBundleUrl}...`);
    await ensureDir(downloadedRoot);
    await downloadFile(backendBundleUrl, archivePath);

    await runCommand('powershell', [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        `Expand-Archive -Path '${archivePath.replace(/'/g, "''")}' -DestinationPath '${downloadedRoot.replace(/'/g, "''")}' -Force`
    ]);

    if (!(await pathExists(path.join(extractedServerSide, 'main.py')))) {
        throw new Error('Downloaded backend bundle does not contain server_side/main.py.');
    }

    return extractedServerSide;
}

function getRuntimePaths() {
    const userDataPath = app.getPath('userData');
    const runtimeRoot = path.join(userDataPath, 'runtime');
    const backendRoot = path.join(userDataPath, 'backend');

    return {
        userDataPath,
        runtimeRoot,
        backendRoot,
        backendHome: path.join(backendRoot, 'server_side'),
        backendStamp: path.join(backendRoot, '.backend-version'),
        venvPath: path.join(runtimeRoot, 'venv'),
        venvPython: isWindows
            ? path.join(runtimeRoot, 'venv', 'Scripts', 'python.exe')
            : path.join(runtimeRoot, 'venv', 'bin', 'python'),
        requirementsStamp: path.join(runtimeRoot, '.requirements-stamp'),
        embeddedRoot: path.join(runtimeRoot, 'python-embed'),
        embeddedPython: path.join(runtimeRoot, 'python-embed', 'python.exe'),
        embeddedZip: path.join(runtimeRoot, PY_EMBED_FILENAME),
        getPipScript: path.join(runtimeRoot, 'get-pip.py')
    };
}

async function downloadFile(url, destination) {
    const client = url.startsWith('https') ? https : http;

    await ensureDir(path.dirname(destination));

    return new Promise((resolve, reject) => {
        const request = client.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                downloadFile(response.headers.location, destination).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Download failed ${url}: HTTP ${response.statusCode}`));
                response.resume();
                return;
            }

            const file = fs.createWriteStream(destination);
            response.pipe(file);

            file.on('finish', () => {
                file.close(resolve);
            });

            file.on('error', (err) => {
                reject(err);
            });
        });

        request.on('error', reject);
    });
}

async function detectSystemPython() {
    const candidates = isWindows
        ? [
            { command: 'python', argsPrefix: [] },
            { command: 'py', argsPrefix: ['-3.11'] },
            { command: 'py', argsPrefix: ['-3.10'] },
            { command: 'py', argsPrefix: ['-3'] }
        ]
        : [
            { command: 'python3', argsPrefix: [] },
            { command: 'python', argsPrefix: [] }
        ];

    for (const candidate of candidates) {
        try {
            await runCommand(candidate.command, [...candidate.argsPrefix, '-c', 'import sys;print(sys.executable)']);
            return candidate;
        } catch {
            // Continue until we find a valid candidate.
        }
    }

    return null;
}

async function enableEmbeddedSitePackages(paths) {
    const files = await fs.promises.readdir(paths.embeddedRoot);
    const pthFile = files.find((name) => name.endsWith('._pth'));

    if (!pthFile) {
        return;
    }

    const pthPath = path.join(paths.embeddedRoot, pthFile);
    const pthContent = await fs.promises.readFile(pthPath, 'utf8');

    if (pthContent.includes('\nimport site')) {
        return;
    }

    const normalized = pthContent.includes('#import site')
        ? pthContent.replace('#import site', 'import site')
        : `${pthContent}${pthContent.endsWith('\n') ? '' : '\n'}import site\n`;

    await fs.promises.writeFile(pthPath, normalized, 'utf8');
}

async function installEmbeddedPython(paths) {
    if (!isWindows) {
        throw new Error('Automatic Python installation is currently supported on Windows only.');
    }

    if (await pathExists(paths.embeddedPython)) {
        return {
            command: paths.embeddedPython,
            argsPrefix: []
        };
    }

    log('No system Python detected. Downloading embedded Python runtime...');
    await ensureDir(paths.embeddedRoot);
    await downloadFile(PY_EMBED_URL, paths.embeddedZip);

    await runCommand('powershell', [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        `Expand-Archive -Path '${paths.embeddedZip.replace(/'/g, "''")}' -DestinationPath '${paths.embeddedRoot.replace(/'/g, "''")}' -Force`
    ]);

    await enableEmbeddedSitePackages(paths);

    log('Installing pip into embedded Python runtime...');
    await downloadFile(GET_PIP_URL, paths.getPipScript);
    await runCommand(paths.embeddedPython, [paths.getPipScript]);

    return {
        command: paths.embeddedPython,
        argsPrefix: []
    };
}

async function resolveBasePython(paths) {
    const systemPython = await detectSystemPython();
    if (systemPython) {
        return systemPython;
    }

    return installEmbeddedPython(paths);
}

async function ensureBackendHome(paths, backendSourcePath) {
    const appVersion = app.getVersion();
    const stampValue = `${appVersion}|${backendSourcePath}`;

    let currentStamp = '';
    if (await pathExists(paths.backendStamp)) {
        currentStamp = (await fs.promises.readFile(paths.backendStamp, 'utf8')).trim();
    }

    if (currentStamp === stampValue && (await pathExists(paths.backendHome))) {
        return;
    }

    await ensureDir(paths.backendRoot);

    await fs.promises.cp(backendSourcePath, paths.backendHome, {
        recursive: true,
        force: true,
        filter: (sourcePath) => {
            const rel = path.relative(backendSourcePath, sourcePath).replace(/\\/g, '/');
            if (!rel) {
                return true;
            }

            const ignoredPrefixes = [
                '__pycache__/',
                '.venv/',
                'venv/',
                '.pytest_cache/'
            ];

            return !ignoredPrefixes.some((prefix) => rel.startsWith(prefix));
        }
    });

    await fs.promises.writeFile(paths.backendStamp, stampValue, 'utf8');
}

async function ensureVirtualEnv(paths, basePython) {
    if (await pathExists(paths.venvPython)) {
        return;
    }

    log('Creating isolated backend virtual environment...');
    await ensureDir(paths.runtimeRoot);

    try {
        await runCommand(basePython.command, [...basePython.argsPrefix, '-m', 'venv', paths.venvPath]);
    } catch (e) {
        // Windows embedded Python ships without the venv module.
        // Fall back to virtualenv which pip can install into the embedded runtime.
        if (e.message && e.message.includes('No module named venv')) {
            log('venv not available (embedded Python) — installing virtualenv as fallback...');
            await runCommand(basePython.command, [
                ...basePython.argsPrefix,
                '-m', 'pip', 'install', 'virtualenv', '--quiet'
            ]);
            await runCommand(basePython.command, [
                ...basePython.argsPrefix,
                '-m', 'virtualenv', paths.venvPath
            ]);
        } else {
            throw e;
        }
    }
}

async function getRequirementsFingerprint(requirementsPath) {
    const requirements = await fs.promises.readFile(requirementsPath, 'utf8');
    return sha256(requirements);
}

async function verifyBackendImports(pythonPath) {
    await runCommand(pythonPath, [
        '-c',
        'import fastapi,uvicorn,ollama,pandas,numpy,docx,openpyxl,PyPDF2,aiofiles'
    ]);
}

async function ensureRequirements(paths) {
    const requirementsPath = path.join(paths.backendHome, 'requirements.txt');
    const fingerprint = await getRequirementsFingerprint(requirementsPath);

    let installedFingerprint = '';
    if (await pathExists(paths.requirementsStamp)) {
        installedFingerprint = (await fs.promises.readFile(paths.requirementsStamp, 'utf8')).trim();
    }

    const shouldInstall = fingerprint !== installedFingerprint;

    if (!shouldInstall) {
        try {
            await verifyBackendImports(paths.venvPython);
            return;
        } catch {
            log('Detected missing Python packages. Re-installing backend dependencies...');
        }
    } else {
        log('Backend dependency set changed. Installing dependencies...');
    }

    await runCommand(paths.venvPython, ['-m', 'pip', 'install', '--upgrade', 'pip', 'setuptools', 'wheel']);
    await runCommand(paths.venvPython, ['-m', 'pip', 'install', '-r', requirementsPath]);
    await verifyBackendImports(paths.venvPython);
    await fs.promises.writeFile(paths.requirementsStamp, fingerprint, 'utf8');
}

async function waitForBackendReady(timeoutMs = 60000) {
    const started = Date.now();

    while (Date.now() - started < timeoutMs) {
        const healthy = await new Promise((resolve) => {
            const req = http.get('http://127.0.0.1:8000/health', (res) => {
                resolve(res.statusCode === 200);
                res.resume();
            });

            req.on('error', () => resolve(false));
            req.setTimeout(1500, () => {
                req.destroy();
                resolve(false);
            });
        });

        if (healthy) {
            return true;
        }

        await new Promise((resolve) => setTimeout(resolve, 800));
    }

    return false;
}

async function prepareBackendRuntime(isDev) {
    const paths = getRuntimePaths();
    const backendSourcePath = await ensureBackendSourceAvailable(getBackendSourcePath(isDev), paths);

    await ensureBackendHome(paths, backendSourcePath);

    const basePython = await resolveBasePython(paths);
    await ensureVirtualEnv(paths, basePython);
    await ensureRequirements(paths);

    return {
        backendHome: paths.backendHome,
        pythonPath: paths.venvPython,
        userDataPath: paths.userDataPath
    };
}

module.exports = {
    prepareBackendRuntime,
    waitForBackendReady
};
