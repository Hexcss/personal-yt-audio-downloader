import * as admin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';
import { readFileSync } from 'fs';
import { join } from 'path';
import { environment } from '../config';

let serviceAccount: admin.ServiceAccount | undefined;

console.log('Initializing Firebase...');

async function initializeFirebase(
  account?: admin.ServiceAccount,
): Promise<void> {
  try {
    if (environment.nodeEnv === 'production') {
      admin.initializeApp({
        credential: applicationDefault(),
      });
    } else if (account !== undefined) {
      admin.initializeApp({
        credential: admin.credential.cert(account),
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase', error);
    throw error;
  }
}

if (environment.nodeEnv !== 'production') {
  try {
    const serviceAccountPath = join(
      __dirname,
      '../../service-account.json',
    );
    const accountFile = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(accountFile) as admin.ServiceAccount;
    initializeFirebase(serviceAccount)
    .then(() => {
      console.log('Firebase initialized with service account');
    })
    .catch((error) => {
      console.error(
        'Failed to initialize Firebase with service account',
        error,
      );
    });
  } catch (error) {
    console.error('Failed to read serviceAccount from file', error);
  }
} else {
  initializeFirebase()
  .then(() => {
    console.log('Firebase initialized with application default');
  })
  .catch((error) => {
    console.error('Failed to initialize Firebase', error);
  });
}

export const db = admin.firestore();
