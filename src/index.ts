import { BrowserWindow, app, clipboard, globalShortcut } from "electron";
import { parse } from "./item-parser";
import { lookup } from "./trade/trade";
const ks = require("node-key-sender");

let mainWindow: BrowserWindow | null = null;

const init = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    show: false,
  });

  mainWindow.loadURL("https://pornhub.com/gay");

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
  console.log(lookup(parsedItemData));
  mainWindow.show();
  mainWindow.focus();
};

app.on("ready", init);
