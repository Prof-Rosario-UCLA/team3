import admin from "@/lib/firebaseAdmin";

async function getUidFromToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error verifying token:", error);
    } else {
      console.error("Unknown error verifying token");
    }
    return null;
  }
}

async function getEmailFromToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.email;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error verifying token:", error);
    } else {
      console.error("Unknown error verifying token");
    }
    return null;
  }
}

export async function getEmailFromAuthorizationHeader(
  authorizationHeader: string | null
) {
  if (!authorizationHeader) {
    throw new Error("Unauthorized: Missing token");
  }

  const token = authorizationHeader.split("Bearer ")[1];
  if (!token) {
    throw new Error("Unauthorized: Invalid token format");
  }

  const email = await getEmailFromToken(token);
  if (!email) {
    throw new Error("Unauthorized: Invalid token format");
  }

  return email;
}
export async function getUidFromAuthorizationHeader(
  authorizationHeader: string | null
) {
  if (!authorizationHeader) {
    throw new Error("Unauthorized: Missing token");
  }

  const token = authorizationHeader.split("Bearer ")[1];
  if (!token) {
    throw new Error("Unauthorized: Invalid token format");
  }

  const uid = await getUidFromToken(token);
  if (!uid) {
    throw new Error("Unauthorized: Invalid token format");
  }

  return uid;
}
