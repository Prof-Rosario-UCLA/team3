import { db } from "@/lib/firebase/config";
import { getDoc, doc } from "firebase/firestore";
import { NextResponse } from "next/server";
// import { getUidFromAuthorizationHeader } from "@/app/api/util";

/*
 * Get all the chat messages for a given user
 * Input: chat_id
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ chat_id: string }> }
) {
  const chat_id: string = (await params).chat_id;

  let result = null;
  let error = null;

  const chatDocRef = doc(db, "chats", chat_id);

  try {
    const docSnapshot = await getDoc(chatDocRef);

    // 3. Check if the document exists
    if (docSnapshot.exists()) {
      console.log(
        `Document data for chat ID '${chat_id}':`,
        docSnapshot.data()
      );
      // Return the document ID along with its data
      result = { id: docSnapshot.id, ...docSnapshot.data() };
    } else {
      console.log(`No chat document found with ID: '${chat_id}'`);
      result = null;
    }
  } catch (err) {
    console.error("Error getting chat document:", error);
    error = err;
  }

  return NextResponse.json({ result, error });
}
