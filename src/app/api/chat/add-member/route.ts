import { db } from "@/lib/firebase/config";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import {
  getUidFromAuthorizationHeader,
  getEmailFromAuthorizationHeader,
} from "@/app/api/util";

/*
input: email, chat_id
*/
export async function POST(req: Request) {
  const data = await req.json();

  let result = false;
  let error = null;

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", data.email));
  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No user found with email: ${data.email}`);
    } else {
      // Assuming email addresses are unique per user, there should only be one document.
      const userDoc = querySnapshot.docs[0];
      const uid = userDoc.data().uid; // Get the 'uid' field from the document data
      console.log(`Found user with email '${data.email}'. UID: ${uid}`);

      // Create a reference to the specific chat document
      const chatDocRef = doc(db, "chats", data.chat_id);
      try {
        // Use updateDoc with FieldValue.arrayUnion to add to the arrays
        await updateDoc(chatDocRef, {
          members: arrayUnion(uid), // Adds UID to 'members' array
          member_emails: arrayUnion(data.email), // Adds email to 'members_emails' array
        });

        console.log(
          `UID ${uid} and email ${data.email} added to chat ${data.chat_id}.`
        );

        result = true;
      } catch (err) {
        console.error("Error updating chat document:", err);
        error = `Failed to add member to chat ${data.chat_id}.`;
      }
    }
  } catch (err) {
    console.error("Error searching for user by email:", err);
    error = err;
  }

  // do stuff here...
  return NextResponse.json({ result, error });
}
