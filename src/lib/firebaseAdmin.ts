import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!getApps().length) {
  try {
    // Optional: Add logging to inspect raw environment variable values for debugging
    // CAUTION: Do NOT log sensitive data like the full private key in production!
    console.log("Attempting Firebase Admin initialization...");
    console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
    console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log("Private Key length:", process.env.FIREBASE_PRIVATE_KEY?.length);
    // console.log("Private Key start (first 50 chars):", process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));
    // console.log("Private Key end (last 50 chars):", process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.slice(-50) : 'N/A');


    // Ensure all required environment variables are present
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error("Missing one or more required Firebase Admin environment variables.");
      console.error(`FIREBASE_CLIENT_EMAIL present: ${!!process.env.FIREBASE_CLIENT_EMAIL}`);
      console.error(`FIREBASE_PRIVATE_KEY present: ${!!process.env.FIREBASE_PRIVATE_KEY}`);
      console.error(`NEXT_PUBLIC_FIREBASE_PROJECT_ID present: ${!!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
      throw new Error("Firebase Admin initialization failed due to missing credentials.");
    }

    // Replace escaped newlines with actual newlines
    const formattedPrivateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedPrivateKey, // Use the formatted private key
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }),
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // This will now catch errors related to the `formattedPrivateKey` not being valid
  }
}

export default admin;