const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");

const WEB_URL = process.env.CYBERPET_WEB_URL || "http://localhost:5173/desktop";

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const width = 390;
  const height = 590;
  const win = new BrowserWindow({
    width,
    height,
    x: display.workArea.x + display.workArea.width - width - 24,
    y: display.workArea.y + display.workArea.height - height - 24,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.setMenuBarVisibility(false);
  win.loadURL(WEB_URL);
}

ipcMain.handle("pet:step-window", (event, deltaX) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { direction: "right" };
  const bounds = win.getBounds();
  const display = screen.getDisplayMatching(bounds);
  const area = display.workArea;
  let x = bounds.x + deltaX;
  let direction = deltaX >= 0 ? "right" : "left";
  if (x + bounds.width >= area.x + area.width) {
    x = area.x + area.width - bounds.width;
    direction = "left";
  }
  if (x <= area.x) {
    x = area.x;
    direction = "right";
  }
  win.setBounds({ ...bounds, x });
  return { direction };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
