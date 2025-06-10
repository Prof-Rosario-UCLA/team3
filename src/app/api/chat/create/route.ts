import { db } from "@/lib/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import {
  getUidFromAuthorizationHeader,
  getEmailFromAuthorizationHeader,
} from "@/app/api/util";

export async function POST(req: Request) {
  const data = await req.json();

  let result = null;
  let error = null;

  const authorizationHeader = req.headers.get("authorization");
  const uid = await getUidFromAuthorizationHeader(authorizationHeader);
  const email = await getEmailFromAuthorizationHeader(authorizationHeader);

  const chatData = {
    name: data.name,
    members: [uid],
    member_emails: [email],
    messages: [
      {
        user: "The Campfire Team",
        content: "Welcome to the " + data.name + " channel!",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ],
  };

  try {
    result = await addDoc(collection(db, "chats"), chatData);
  } catch (err) {
    error = err;
  }

  // do stuff here...
  return NextResponse.json({ result, error });
}
