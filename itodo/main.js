const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Crea la ventana del navegador.
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    minHeight:650,
    minWidth:650,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // y carga el archivo index.html de tu aplicación.
  win.loadURL('http://localhost:3000');  // Cambia 'index.html' por la ruta a tu archivo principal de React.
}

// Este método se llamará cuando Electron haya terminado de inicializarse
app.whenReady().then(createWindow);

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
if (process.platform !== 'darwin') {
  app.quit();
}

app.on('activate', function () {
  // En macOS, se vuelve a crear una ventana en la aplicación cuando el
  // icono del dock se hace clic y no hay otras ventanas abiertas.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});