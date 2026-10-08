export function convertToBase64FromPcm(pcm16: Int16Array) {
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function detectObjectsFromCamera() {
  return [
    { label: 'Laptop', confidence: 0.94 },
    { label: 'Person', confidence: 0.89 },
    { label: 'Desk', confidence: 0.82 },
    { label: 'Cup', confidence: 0.71 },
  ];
}
