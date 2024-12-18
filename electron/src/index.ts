import { join } from "node:path";
import {
  BrowserWindow,
  app,
  clipboard,
  globalShortcut,
  ipcMain,
} from "electron";
import { parse } from "./item-parser";
import { uIOhook, UiohookKey } from "uiohook-napi";

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
    title: "Gage Trade",
    width: 500,
    height: 350,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL("http://localhost:5173");

  globalShortcut.register("CommandOrControl+D", toggleWindow);

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
