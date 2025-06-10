import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import {
  getUidFromAuthorizationHeader,
  getEmailFromAuthorizationHeader,
} from "@/app/api/util";

export async function POST(req: Request) {
  let result = null;
  let error = null;

  const authorizationHeader = req.headers.get("authorization");
  const uid = await getUidFromAuthorizationHeader(authorizationHeader);
  const email = await getEmailFromAuthorizationHeader(authorizationHeader);

  const userData = {
    uid,
    email,
  };

  // If uid is null, it means authentication failed or token was invalid
  if (!uid) {
    return NextResponse.json({ result: null, error: "Unauthorized" });
  }

  // 1. Create a reference to the specific user document using the UID as the document ID
  const userDocRef = doc(db, "users", uid);

  try {
    // 2. Check if the document already exists
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      // User already exists, so we don't insert a new one.
      // You might choose to update existing fields here if needed,
      // or just return success indicating the user is already there.
      console.log(
        `User with UID ${uid} already exists. Not creating a new document.`
      );
      result = {
        message: "User already exists",
        id: uid,
        data: docSnapshot.data(),
      };
    } else {
      // User does NOT exist, so we create the new document
      await setDoc(userDocRef, userData); // Use setDoc to create with a specific ID
      console.log(`New user with UID ${uid} created successfully.`);
      result = {
        message: "User created successfully",
        id: uid,
        data: userData,
      };
    }
  } catch (err) {
    console.error("Error creating/checking user document:", err);
    error = "Failed to process user registration.";
  }

  // do stuff here...
  return NextResponse.json({ result, error });
}
