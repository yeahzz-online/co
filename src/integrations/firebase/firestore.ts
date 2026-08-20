import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type CollectionReference,
  type DocumentData,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

import { requireFirebaseApp } from "./client";

export const firestore = () => getFirestore(requireFirebaseApp());
export const collectionRef = <T extends DocumentData>(path: string) => collection(firestore(), path) as CollectionReference<T>;
export const documentRef = (path: string) => doc(firestore(), path);
export { addDoc, deleteDoc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch };

export type FirestoreUserProfile = {
  full_name?: string;
  phone?: string;
  roll_number?: string;
  employee_id?: string;
  department?: string;
  year?: string;
  section?: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  roles?: string[];
  role?: string;
  created_at?: string;
  updated_at?: string;
  institution?: string;
  branch?: string;
  skills?: string[];
  learning_interests?: string[];
  learning_goal?: string;
  profile_interests?: string[];
  member_id?: string;
  points?: number;
  credits?: number;
  referrals?: number;
  tasks_completed?: number;
  status?: "ACTIVE" | "SUSPENDED" | "PENDING";
  referral_access?: boolean;
  whatsapp_verified?: boolean;
  referral_code?: string;
  referred_by?: string;
};

export function userProfileRef(userId: string) {
  return documentRef(`users/${userId}`);
}

export async function saveUserProfile(userId: string, profile: FirestoreUserProfile) {
  const cleanProfile = Object.fromEntries(Object.entries(profile).filter(([, value]) => value !== undefined));
  await setDoc(userProfileRef(userId), { ...cleanProfile, updated_at: new Date().toISOString() }, { merge: true });
}
