type IpcComms = {
  send: (channel: string, data: unknown) => void;
  receive: (channel: string, func: (data: string) => void) => void;
};

declare global {
  interface Window {
    api: IpcComms;
  }
}

export const getApi = (): IpcComms => {
  if (typeof window !== "undefined" && window.api) {
    return window.api;
  }

  return {
    send: () => {},
    receive: () => {},
  };
};
