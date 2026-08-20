import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { getAuth } from "firebase/auth";

import { requireFirebaseApp } from "./client";
import { saveUserProfile, type FirestoreUserProfile } from "./firestore";

function auth() {
  return getAuth(requireFirebaseApp());
}

async function saveOAuthProfile(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) {
  const profile: FirestoreUserProfile = {};
  if (user.email) profile.email = user.email;
  if (user.displayName) profile.full_name = user.displayName;
  if (user.photoURL) profile.avatar_url = user.photoURL;
  await saveUserProfile(user.uid, profile);
}

/** Firebase Auth owns transactional email such as verification and password reset. */
export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth(), email.trim(), password).then(async ({ user }) => {
    await saveUserProfile(user.uid, {
      email: user.email ?? email.trim(),
      ...(user.displayName ? { full_name: user.displayName } : {}),
      ...(user.photoURL ? { avatar_url: user.photoURL } : {}),
    });
    return user;
  });
}

export function signInWithGoogle() {
  return signInWithPopup(auth(), new GoogleAuthProvider()).then(async ({ user }) => {
    await saveOAuthProfile(user);
    return user;
  });
}

export function signInWithGitHub() {
  return signInWithPopup(auth(), new GithubAuthProvider()).then(async ({ user }) => {
    await saveOAuthProfile(user);
    return user;
  });
}

export async function registerWithEmail(email: string, password: string): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth(), email.trim(), password);
  await sendEmailVerification(credential.user);
  await saveUserProfile(credential.user.uid, { email: credential.user.email ?? email.trim(), created_at: new Date().toISOString() });
  return credential;
}

export function sendVerificationEmail() {
  const user = auth().currentUser;
  if (!user) throw new Error("You must be signed in to verify your email.");
  return sendEmailVerification(user);
}

export function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth(), email.trim());
}

export function firebaseSignOut() {
  return signOut(auth());
}
