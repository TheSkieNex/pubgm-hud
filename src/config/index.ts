import path from 'path';

import 'dotenv/config';

class Config {
  private static DEV_HOST = 'http://localhost:3011';
  private static PROD_HOST = 'https://hud.skienex.com';

  public static readonly HOST =
    process.env.NODE_ENV === 'production' ? this.PROD_HOST : this.DEV_HOST;

  public static readonly PORT = process.env.PORT || 3011;

  public static readonly BASE_DIR = path.resolve(__dirname, '..', '..');
  public static readonly STATIC_DIR = path.join(this.BASE_DIR, 'static');
  public static readonly LOG_DIR = path.join(this.BASE_DIR, 'logs');

  public static readonly LOTTIE_SYNC_DIR = 'lottie-sync';
  public static readonly LOTTIE_SYNC_DIR_PATH = path.join(this.STATIC_DIR, this.LOTTIE_SYNC_DIR);

  public static readonly DB_PATH = path.join(this.BASE_DIR, process.env.DB_FILE_NAME || 'local.db');
}

export default Config;
