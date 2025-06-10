import { db } from "@/lib/firebase/config";
import {
  doc,
  updateDoc,
  getDoc,
  runTransaction,
  FieldValue,
} from "firebase/firestore"; // Import runTransaction, getDoc
import { NextResponse } from "next/server";
import { getUidFromAuthorizationHeader } from "@/app/api/util";

// Define the structure for a message
interface Message {
  user: string; // Could be a UID or username
  content: string;
  timestamp: string | FieldValue; // Can be string (ISO) or Firestore Timestamp
}

/*
 * Appends a new message JSON to the 'messages' array field of a specified chat document,
 * allowing duplicates. Uses a transaction for atomicity.
 */
export async function POST(req: Request) {
  let result = null;
  let error = null;

  const authorizationHeader = req.headers.get("authorization");
  const requestingUid = await getUidFromAuthorizationHeader(
    authorizationHeader
  );

  if (!requestingUid) {
    return NextResponse.json(
      { result: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { chatId, message } = await req.json();

  if (!chatId || !message || !message.user || !message.content) {
    return NextResponse.json(
      {
        error:
          "Missing required parameters: chatId, message, message.user, or message.content",
      },
      { status: 400 }
    );
  }

  // Prepare the new message object.
  // Using FieldValue.serverTimestamp() is highly recommended for message timestamps
  // as it's set by Firestore servers, ensuring consistency.
  const newMessage: Message = {
    user: message.user,
    content: message.content,
    timestamp: new Date().toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // If you prefer a client-generated ISO string, ensure it's reliable:
  // const newMessage: Message = {
  //   user: message.user,
  //   content: message.content,
  //   timestamp: new Date().toISOString(),
  // };

  const chatDocRef = doc(db, "chats", chatId);

  try {
    await runTransaction(db, async (transaction) => {
      const chatDoc = await transaction.get(chatDocRef);

      if (!chatDoc.exists()) {
        throw new Error("Chat document does not exist!");
      }

      const currentMessages: Message[] = chatDoc.data().messages || []; // Get existing messages
      const updatedMessages = [...currentMessages, newMessage]; // Append the new message

      transaction.update(chatDocRef, { messages: updatedMessages }); // Write the entire array back
    });

    result = {
      message: `Message added to chat ${chatId} (allowing duplicates).`,
      timestamp: newMessage.timestamp,
    };
  } catch (err) {
    console.error(
      "Error appending message to chat document with duplicates:",
      err
    );
    error = `Failed to add message to chat ${chatId}.`;
  }

  return NextResponse.json({ result, error });
}
