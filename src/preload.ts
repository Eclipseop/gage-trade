import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, func: (arg0: any) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(args));
  },
});
