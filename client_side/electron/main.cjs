const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const isDev = process.env.NODE_ENV === 'development';
const isWindows = process.platform === 'win32';

let mainWindow;
let backendProcess;

// Determine Python command based on platform
const pythonCmd = isWindows ? 'python' : 'python3';

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
function startBackend() {
    const backendPath = isDev
        ? path.join(__dirname, '../../backend')
        : path.join(process.resourcesPath, 'backend');

    console.log('Starting backend from:', backendPath);

    // Start backend process
    backendProcess = spawn(
        pythonCmd,
        ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'],
        {
            cwd: backendPath,
            stdio: 'inherit',
            shell: true
        }
    );

    backendProcess.on('error', (err) => {
        console.error('Failed to start backend:', err);
        dialog.showErrorBox(
            'Backend Error',
            `Failed to start backend server:\n${err.message}\n\nMake sure Python and dependencies are installed.`
        );
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

// App lifecycle events
app.whenReady().then(() => {
    // Start backend first
    startBackend();

    // Wait for backend to start, then create window
    setTimeout(() => {
        createWindow();
    }, 3000);

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