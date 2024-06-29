import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import { environment } from "../config";

dotenv.config();

let serviceAccount: admin.ServiceAccount | string = "";

if (environment.nodeEnv === "production") {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: environment.storageBucket,
  });
} else {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: environment.storageBucket,
  });
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

export { bucket, db };
