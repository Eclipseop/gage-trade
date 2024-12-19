type IpcComms = {
  send: (channel: string, data: unknown) => void;
  receive: (channel: string, func: (data: string) => void) => void;
};

declare global {
  interface Window {
    api: IpcComms;
  }
}

const w = window;
export const api = w.api;
