const editor = document.getElementById('editor');
const saveButton = document.getElementById('save-button');

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
