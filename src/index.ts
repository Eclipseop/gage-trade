import {
  BrowserWindow,
  app,
  clipboard,
  globalShortcut,
  ipcMain,
} from "electron";
import { parse } from "./item-parser";
import { join } from "node:path";

const ks = require("node-key-sender");

let mainWindow: BrowserWindow | null = null;

const init = () => {
  ks.setOption("startDelayMillisec", 1);
  ks.setOption("globalDelayBetweenMillisec", 1);
  ks.setOption("globalDelayPressMillisec", 1);

  mainWindow = new BrowserWindow({
    title: "Gage Trade",
    width: 500,
    height: 550,
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
};

const toggleWindow = async () => {
  if (!mainWindow) {
    console.log("Main Window somehow not loaded?");
    return;
  }

  console.log("HOTKEY DETECTED");
  await ks.sendCombination(["control", "c"]);

  const parsedItemData = await parse(clipboard.readText());
  mainWindow.webContents.send("item", JSON.stringify(parsedItemData));

  mainWindow.setAlwaysOnTop(true, "pop-up-menu");
  mainWindow.show();
  mainWindow.focus();
  mainWindow.setAlwaysOnTop(false);
};

ipcMain.on("trade", async (event, args) => {
  require("electron").shell.openExternal(args["url"]);
});

app.on("ready", init);
