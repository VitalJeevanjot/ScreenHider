import { app, BrowserWindow, dialog, ipcMain, nativeImage } from "electron";
import path from "path";
import os from "os";
import { messages } from "../src/i18n/messages";
import { DEFAULT_LOCALE, isSupportedLocale, resolveLocale } from "../src/i18n/locale.mjs";

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow;
let startupLocale = DEFAULT_LOCALE;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
    titleBarStyle: "hidden",
    titleBarOverlay: true,
  });
  mainWindow.removeMenu();

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startupLocale = resolveLocale(app.getLocale());
  ipcMain.handle("get-app-locale", () => startupLocale);
  ipcMain.handle("setup-lock-status", setupLockStatus);
  ipcMain.handle("select-and-show-IMG", selectAndShowIMG);
  createWindow();
});

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function setupLockStatus(args, status) {
  if (status) {
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setResizable(false);
    mainWindow.setMovable(false);
    mainWindow.setMinimizable(false);
    mainWindow.setMaximizable(false);
    mainWindow.setFullScreenable(false);
    mainWindow.setClosable(false);
    mainWindow.moveTop();
  } else {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setResizable(true);
    mainWindow.setMovable(true);
    mainWindow.setMinimizable(true);
    mainWindow.setMaximizable(true);
    mainWindow.setFullScreenable(true);
    mainWindow.setClosable(true);
  }
}

async function selectAndShowIMG(_event, locale) {
  const { imageDialog } = messages[isSupportedLocale(locale) ? locale : startupLocale];
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: imageDialog.title,
    buttonLabel: imageDialog.open,
    properties: ["openFile"],
    filters: [{ name: imageDialog.images, extensions: ["jpg", "png"] }],
  });

  if (canceled) return false;
  const result = nativeImage.createFromPath(filePaths[0]);
  if (result.isEmpty()) throw new Error("Empty native image");
  return result.toDataURL();
}
