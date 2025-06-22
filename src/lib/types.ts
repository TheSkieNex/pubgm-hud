export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface LottieFileConfig {
  lottie: {
    renderer: 'svg' | 'canvas' | 'html';
    loop: boolean;
    autoplay: boolean;
  };
}
