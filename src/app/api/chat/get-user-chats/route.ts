import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import { getUidFromAuthorizationHeader } from "@/app/api/util";

/*
 * Get all the chats for a given user
 */
export async function GET(req: Request) {
  let result = null;
  let error = null;

  const authorizationHeader = req.headers.get("authorization");
  const uid = await getUidFromAuthorizationHeader(authorizationHeader);

  // If uid is null, it means authentication failed or token was invalid
  if (!uid) {
    return NextResponse.json({ result: null, error: "Unauthorized" });
  }

  const chatsRef = collection(db, "chats");

  // query for documents where members array contains the uid
  const q = query(chatsRef, where("members", "array-contains", uid));

  try {
    result = await getDocs(q);
    // convert the firebase response object
    result = result.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      member_emails: doc.data().member_emails,
    }));
  } catch (err) {
    error = err;
  }

  return NextResponse.json({ result, error });
}
