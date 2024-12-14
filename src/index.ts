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
  mainWindow = new BrowserWindow({
    width: 500,
    height: 550,
    show: false,
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
  // console.log(lookup(parsedItemData));
  mainWindow.webContents.send("item", JSON.stringify(parsedItemData));

  // const tradeItems = lookup(parsedItemData);

  mainWindow.show();
  mainWindow.focus();
};

ipcMain.on("search", async (event, args) => {
  console.log(event);
});

app.on("ready", init);
