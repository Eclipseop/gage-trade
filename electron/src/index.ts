import path, { join } from "node:path";
import {
  BrowserWindow,
  app,
  clipboard,
  globalShortcut,
  ipcMain,
} from "electron";
import { UiohookKey, uIOhook } from "uiohook-napi";
import { parse } from "./item-parser";

let mainWindow: BrowserWindow | null = null;

const init = () => {
  uIOhook.start();

  setInterval(async () => {
    const c = clipboard.readText();
    if (c !== pastClipboard) {
      pastClipboard = c;
      const p = await parse(c);
      if (!p) return;
      mainWindow?.webContents.send("item", JSON.stringify(p));
      mainWindow?.setAlwaysOnTop(true, "pop-up-menu");
      mainWindow?.show();
      mainWindow?.focus();
      mainWindow?.setAlwaysOnTop(false);
    }
  }, 100);

  mainWindow = new BrowserWindow({
    title: `Gage Trade - ${app.getVersion()}`,
    width: 500,
    height: 350,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, "preload.js"),
    },
  });

  console.log(path.join(__dirname, "web/dist/index.html"));
  mainWindow.loadFile(path.join(__dirname, "web/dist/index.html"));
  globalShortcut.register("CommandOrControl+D", toggleWindow);

  mainWindow.on("page-title-updated", (evt) => {
    evt.preventDefault();
  });
  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
  mainWindow.on("blur", (event: unknown) => mainWindow?.hide());
};

let pastClipboard = "";

const toggleWindow = async () => {
  if (!mainWindow) {
    console.log("Main Window somehow not loaded?");
    return;
  }

  console.log("HOTKEY DETECTED");

  uIOhook.keyToggle(UiohookKey.Ctrl, "down");
  uIOhook.keyTap(UiohookKey.C);
  uIOhook.keyToggle(UiohookKey.Ctrl, "up");
};

ipcMain.on("trade", async (event, args) => {
  require("electron").shell.openExternal(args.url);
});

app.on("ready", init);
