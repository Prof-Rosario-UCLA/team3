import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  let result = null;
  let error = null;

  try {
    result = await getDocs(collection(db, "chats"));
    // convert the firebase response object
    result = result.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  } catch (err) {
    error = err;
  }

  return NextResponse.json({ result, error });
}
