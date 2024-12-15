import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: unknown) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, func: (arg0: unknown) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(args));
  },
});
