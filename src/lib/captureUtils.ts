export function compositeCanvases(layers: Array<HTMLCanvasElement | null>, video?: HTMLVideoElement | null) {
  const width = layers.find(Boolean)?.width ?? video?.videoWidth ?? window.innerWidth;
  const height = layers.find(Boolean)?.height ?? video?.videoHeight ?? window.innerHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  if (video && video.readyState >= 2) ctx.drawImage(video, 0, 0, width, height);
  layers.forEach(layer => layer && ctx.drawImage(layer, 0, 0, width, height));
  return canvas;
}

export async function saveScreenshot(layers: Array<HTMLCanvasElement | null>, video?: HTMLVideoElement | null) {
  const composed = compositeCanvases(layers, video);
  const blob = await new Promise<Blob | null>(resolve => composed.toBlob(resolve, 'image/png'));
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hologlow-${Date.now()}.png`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return blob;
}

export function createRecordingStream(layers: Array<HTMLCanvasElement | null>, video?: HTMLVideoElement | null) {
  const composed = compositeCanvases(layers, video);
  return composed.captureStream(30);
}
