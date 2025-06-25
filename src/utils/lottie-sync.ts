import { LottieLayer } from '../lib/lottie';

export function getLayersData(fileUUID: string, layers: LottieLayer[]) {
  const layersData = layers.map(layer => ({
    index: layer.ind,
    name: layer.nm,
    type: layer.ty === 5 ? 'text' : 'image',
  }));

  return {
    uuid: fileUUID,
    layers: layersData,
  };
}
