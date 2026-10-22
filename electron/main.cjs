const { app, BrowserWindow, ipcMain, net, protocol, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "hexbrewers",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) app.quit();

let mainWindow = null;
const allowedResolutions = new Set(["1280x720", "1600x900", "1920x1080", "2560x1440"]);

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Hexbrewers of Ashenveil",
    width: 1920,
    height: 1080,
    useContentSize: true,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#060210",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("hexbrewers://game/")) event.preventDefault();
  });
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => { mainWindow = null; });
  mainWindow.loadURL("hexbrewers://game/index.html");
}

app.whenReady().then(() => {
  ipcMain.handle("display:set-resolution", (event, dimensions) => {
    const width = Number(dimensions?.width);
    const height = Number(dimensions?.height);
    if (!allowedResolutions.has(`${width}x${height}`)) return false;

    const targetWindow = BrowserWindow.fromWebContents(event.sender);
    if (!targetWindow) return false;
    if (targetWindow.isFullScreen()) targetWindow.setFullScreen(false);
    targetWindow.setContentSize(width, height, true);
    targetWindow.center();
    return true;
  });

  const distRoot = path.resolve(__dirname, "..", "dist");
  protocol.handle("hexbrewers", (request) => {
    const url = new URL(request.url);
    const requestedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    const resolvedPath = path.resolve(distRoot, requestedPath);
    if (resolvedPath !== distRoot && !resolvedPath.startsWith(`${distRoot}${path.sep}`)) {
      return new Response("Forbidden", { status: 403 });
    }
    return net.fetch(pathToFileURL(resolvedPath).toString());
  });

  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("second-instance", () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
