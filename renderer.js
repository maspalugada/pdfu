const editor = document.getElementById('editor');
const saveButton = document.getElementById('save-button');
const openButton = document.getElementById('open-button');
const mergeButton = document.getElementById('merge-button');

mergeButton.addEventListener('click', async () => {
  const result = await window.electronAPI.mergePdfs();
  if (result.success) {
    alert(`PDF berhasil digabungkan dan disimpan di: ${result.path}`);
  } else if (result.error) {
    alert(`Gagal menggabungkan PDF: ${result.error}`);
  } else if (result.message) {
    alert(result.message);
  }
});

openButton.addEventListener('click', async () => {
  const result = await window.electronAPI.openPdf();
  if (result.success) {
    editor.value = result.text;
  } else if (result.error) {
    alert(`Gagal membuka PDF: ${result.error}`);
  }
});

saveButton.addEventListener('click', async () => {
  const textContent = editor.value;
  if (textContent) {
    const result = await window.electronAPI.savePdf(textContent);
    if (result.success) {
      alert(`PDF berhasil disimpan di: ${result.path}`);
    } else if (result.error) {
      alert(`Gagal menyimpan PDF: ${result.error}`);
    } else {
      console.log('Penyimpanan PDF dibatalkan oleh pengguna.');
    }
  } else {
    alert('Editor masih kosong. Silakan ketik sesuatu.');
  }
});
