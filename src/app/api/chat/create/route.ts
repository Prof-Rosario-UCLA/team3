import { db } from "@/lib/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import {
  getUidFromAuthorizationHeader,
  getEmailFromAuthorizationHeader,
} from "@/app/api/util";

// defining a typescript type for data
interface ChatData {
  name: string;
}

export async function POST(req: Request) {
  const chatData: ChatData = await req.json();

  let result = null;
  let error = null;

  const authorizationHeader = req.headers.get("authorization");
  const uid = await getUidFromAuthorizationHeader(authorizationHeader);
  const email = await getEmailFromAuthorizationHeader(authorizationHeader);

  try {
    result = await addDoc(collection(db, "chats"), { name: chatData.name });

    // TODO: add chat index for drag-n-drop!
    const userToChat = {
      uid: uid,
      chatId: result.id,
      email: email,
    };

    // add user id, chat id to access list
    await addDoc(collection(db, "usersToChats"), userToChat);
  } catch (err) {
    error = err;
  }

  // do stuff here...
  return NextResponse.json({ result, error });
}
