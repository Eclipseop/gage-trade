import { BrowserWindow, app, clipboard, globalShortcut } from "electron";
import { parse } from "./item-parser";
import { join } from "node:path";

const ks = require("node-key-sender");

let mainWindow: BrowserWindow | null = null;

const init = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
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
  await ks.sendCombination(["control", "c"]);
  const parsedItemData = await parse(clipboard.readText());
  // console.log(lookup(parsedItemData));
  mainWindow.webContents.send("item", JSON.stringify(parsedItemData));

  // const tradeItems = lookup(parsedItemData);

  mainWindow.show();
  mainWindow.focus();
};

app.on("ready", init);
