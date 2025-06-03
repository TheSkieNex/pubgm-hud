import path from 'path';

import 'dotenv/config';

class Config {
  public static readonly PORT = process.env.PORT || 6227;

  public static readonly BASE_DIR = path.resolve(__dirname, '..');
  public static readonly DB_PATH = path.join(
    Config.BASE_DIR,
    process.env.DB_FILE_NAME || 'local.db'
  );
}

export default Config;
