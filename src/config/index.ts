import path from 'path';

import 'dotenv/config';

import { getLocalIpAddress } from '../utils/server';

const localIpAddress = getLocalIpAddress();

const isProduction = process.env.NODE_ENV === 'production';

class Config {
  public static readonly PORT = Number(process.env.PORT) || 3011;
  public static readonly HOST = isProduction
    ? `${process.env.HOST}/api`
    : `http://${localIpAddress}:${this.PORT}`;
  public static readonly ALLOWED_ORIGINS =
    process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.length > 0
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:5173',
          'http://localhost:10086',
          'http://localhost:80',
          `http://${localIpAddress}:5173`,
          `http://${localIpAddress}:10086`,
          `http://${localIpAddress}:80`,
        ];
  public static readonly FRONTEND_URL = process.env.FRONTEND_URL || `http://${localIpAddress}:5173`;
  public static readonly ACCESS_KEY = process.env.ACCESS_KEY!;

  public static readonly BASE_DIR = path.resolve(__dirname, '..', '..');
  public static readonly STATIC_DIR = path.join(this.BASE_DIR, 'static');
  public static readonly LOG_DIR = path.join(this.BASE_DIR, 'logs');

  public static readonly TABLES_DIR = path.join(this.STATIC_DIR, 'tables');

  public static readonly LOTTIE_SYNC_DIR = 'lottie-sync';
  public static readonly LOTTIE_SYNC_DIR_PATH = path.join(this.STATIC_DIR, this.LOTTIE_SYNC_DIR);

  public static readonly DB_PATH =
    isProduction
      ? path.join(this.BASE_DIR, 'database_storage', 'database.db')
      : path.join(this.BASE_DIR, process.env.DB_FILE_NAME || 'database.db');
}

export default Config;
