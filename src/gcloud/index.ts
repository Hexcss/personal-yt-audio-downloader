import { Storage } from '@google-cloud/storage';
import { environment } from '../config';
import path from 'path';

const storage = new Storage({
  projectId: environment.projectId,
  keyFilename: environment.nodeEnv !== 'production' ? 
  path.join(__dirname, '../../service-account.json') : undefined,
});
export const bucket = storage.bucket(environment.storageBucket);
