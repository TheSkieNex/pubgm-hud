export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface FileConfig {
  lottie: {
    renderer: 'svg' | 'canvas' | 'html';
    loop: boolean;
    autoplay: boolean;
  };
}
