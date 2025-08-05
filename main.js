const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const pdfParse = require('pdf-parse');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('save-pdf', async (event, textContent) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Simpan sebagai PDF',
    defaultPath: `dokumen-${Date.now()}.pdf`,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (filePath) {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;

      page.drawText(textContent, {
        x: 50,
        y: height - 4 * fontSize,
        font,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(filePath, pdfBytes);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Gagal menyimpan PDF:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, path: null };
});

ipcMain.handle('open-pdf', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Buka PDF',
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (filePaths && filePaths.length > 0) {
    const filePath = filePaths[0];
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return { success: true, text: data.text };
    } catch (error) {
      console.error('Gagal membuka atau membaca PDF:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false };
});

ipcMain.handle('merge-pdfs', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Pilih PDF untuk Digabungkan',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (!filePaths || filePaths.length < 2) {
    return { success: false, message: 'Pilih setidaknya dua file PDF untuk digabungkan.' };
  }

  try {
    const mergedPdf = await PDFDocument.create();
    for (const filePath of filePaths) {
      const pdfBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const { filePath: savePath } = await dialog.showSaveDialog({
      title: 'Simpan PDF Gabungan',
      defaultPath: `gabungan-${Date.now()}.pdf`,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });

    if (savePath) {
      const mergedPdfBytes = await mergedPdf.save();
      fs.writeFileSync(savePath, mergedPdfBytes);
      return { success: true, path: savePath };
    }
    return { success: false, message: 'Penyimpanan dibatalkan.' };
  } catch (error) {
    console.error('Gagal menggabungkan PDF:', error);
    return { success: false, error: error.message };
  }
});
