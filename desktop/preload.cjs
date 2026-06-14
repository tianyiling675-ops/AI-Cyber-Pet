const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cyberpet", {
  stepWindow: (deltaX) => ipcRenderer.invoke("pet:step-window", deltaX),
});
