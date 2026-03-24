const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { prepareBackendRuntime, waitForBackendReady } = require('./runtimeBootstrap.cjs');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        backgroundColor: '#1a1d23',
        icon: path.join(__dirname, '../build/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        titleBarStyle: 'default',
        show: false,
        frame: true
    });

    // Load URL
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Start Python FastAPI backend
async function startBackend() {
    const runtime = await prepareBackendRuntime(isDev);

    console.log('Starting backend from:', runtime.backendHome);

    backendProcess = spawn(
        runtime.pythonPath,
        ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'],
        {
            cwd: runtime.backendHome,
            stdio: 'inherit',
            shell: false,
            windowsHide: true,
            env: {
                ...process.env,
                LOCAL_LLM_USER_DATA: runtime.userDataPath,
                PYTHONUNBUFFERED: '1'
            }
        }
    );

    backendProcess.on('error', (err) => {
        console.error('Failed to start backend:', err);
        dialog.showErrorBox(
            'Backend Error',
            `Failed to start backend server:\n${err.message}\n\nThe app attempted to install required runtime components automatically but startup still failed.`
        );
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });

    const isReady = await waitForBackendReady(60000);
    if (!isReady) {
        throw new Error('Backend did not become healthy within 60 seconds.');
    }
}

// App lifecycle events
app.whenReady().then(() => {
    // Start backend first, then create the window when backend is healthy.
    startBackend()
        .then(() => {
            createWindow();
        })
        .catch((err) => {
            console.error('Startup failed:', err);
            dialog.showErrorBox(
                'Startup Error',
                `The application could not initialize the local backend automatically.\n\n${err.message}`
            );
            app.quit();
        });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});

// IPC Handlers
ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'txt', 'csv', 'xlsx', 'xls'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.filePaths[0];
});

ipcMain.handle('get-app-path', () => {
    return app.getPath('userData');
});

ipcMain.handle('get-version', () => {
    return app.getVersion();
});