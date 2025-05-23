import admin from 'firebase-admin';
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: firebasePrivateKey,
        }),
    });
}
export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
