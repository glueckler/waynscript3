import { app } from 'electron';
import path from 'path';

export const dbPath = path.join(app.getPath('appData'), 'database.db');
