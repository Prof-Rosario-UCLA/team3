import { db } from "@/lib/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

// defining a typescript type for data
interface ChatData {
  name: string;
}

export async function POST(req: Request) {
  const chatData: ChatData = await req.json();

  let result = null;
  let error = null;

  try {
    result = await addDoc(collection(db, "chats"), chatData);
  } catch (err) {
    error = err;
  }

  // do stuff here...
  return NextResponse.json({ result, error });
}
