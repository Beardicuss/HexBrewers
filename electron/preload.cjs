const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hexbrewersDisplay", {
  setResolution(width, height) {
    return ipcRenderer.invoke("display:set-resolution", { width, height });
  },
});
