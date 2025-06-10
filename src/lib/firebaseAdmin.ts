import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }),
    });
    console.log("Firebase Admin initialized");
  } catch (error: any) {
    console.error("Firebase Admin initialization error", error.stack);
  }
}

export default admin;
