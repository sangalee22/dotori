function openFilePicker(accept, capture, callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.style.display = 'none';
  if (capture) input.capture = capture;
  input.onchange = (e) => {
    const file = e.target.files[0];
    document.body.removeChild(input);
    if (file) callback(URL.createObjectURL(file));
  };
  document.body.appendChild(input);
  input.click();
}

export function pickImageFromLibrary(callback) {
  openFilePicker('image/*', null, callback);
}

export function takePhoto(callback) {
  openFilePicker('image/*', 'environment', callback);
}
