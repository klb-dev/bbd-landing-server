import admin from 'firebase-admin';
import serviceAccount from '../firebaseKey.json' with { type: 'json' };


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;

