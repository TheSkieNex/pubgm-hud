export interface LottieAssetImage {
  id: string; // image_{index}
  w: number;
  h: number;
  u: string; // url
  p: string; // path
  e: number;
}

export interface LottieAssetComposition {
  id: string;
  nm: string;
  fr: string; // frame rate
  layers: LottieLayer[];
}

interface Keyframe {
  a: number;
  k: number | number[];
  ix: number;
  l?: number;
  x?: string; // expression
}

interface TextLayer {
  d: {
    k: {
      s: {
        f: string; // font family
        t: string; // text content
      };
      t: number;
    }[];
  };
}

export interface LottieLayer {
  ind: number;
  ty: number;
  nm: string;
  refId?: string; // this means its an asset
  sr: number;
  ks: {
    [key: string]: Keyframe;
  };
  ao: number;
  w?: number;
  h?: number;
  t?: TextLayer;
  ip: number;
  op: number;
}

export type LottieAsset = LottieAssetImage | LottieAssetComposition;

interface Font {
  origin: number;
  fPath: string;
  fClass: string;
  fFamily: string;
  fWeight: string;
  fStyle: string;
  fName: string;
  ascent: number;
}

export interface LottieJson {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  assets?: LottieAsset[];
  fonts: {
    list: Font[];
  };
  layers: LottieLayer[];
  markers: [];
  props: Record<string, string>;
}

export const isLottieAssetImage = (asset: LottieAsset): asset is LottieAssetImage => {
  return (
    typeof asset === 'object' && asset !== null && 'id' in asset && asset.id.startsWith('image_')
  );
};

export const getTextLayerContent = (layer: LottieLayer): string | undefined => {
  if (!layer.t) {
    throw new Error('This is not a text layer');
  }
  return layer.t.d.k[0].s.t;
};
