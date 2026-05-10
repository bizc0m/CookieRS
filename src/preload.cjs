const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cookiers", {
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  copyText: (text) => ipcRenderer.invoke("copy-text", text)
});
