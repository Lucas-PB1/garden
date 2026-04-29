import { auth, db } from "@/lib/firebase/firebase";
import {
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

interface UpsertUserProfileOptions {
  displayName?: string;
}

const getProfileDisplayName = (user: User, displayName?: string) => {
  const fallbackName = user.email?.split("@")[0] || "Usuario Garden";
  return (displayName?.trim() || user.displayName?.trim() || fallbackName).slice(0, 80);
};

const getSafePhotoURL = (photoURL: string | null) => {
  if (!photoURL || photoURL.length > 2048) return null;
  return photoURL;
};

export const upsertUserProfile = async (user: User, options: UpsertUserProfileOptions = {}) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const photoURL = getSafePhotoURL(user.photoURL);
  const profileData = {
    displayName: getProfileDisplayName(user, options.displayName),
    updatedAt: serverTimestamp(),
    ...(photoURL ? { photoURL } : {}),
  };

  if (userSnap.exists()) {
    await updateDoc(userRef, profileData);
    return;
  }

  await setDoc(userRef, {
    ...profileData,
    createdAt: serverTimestamp(),
  });
};

export const isGoogleProviderLinked = (user: User | null | undefined) =>
  Boolean(
    user?.providerData.some((provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID),
  );

export const linkUserWithGoogle = async (user: User) => {
  if (isGoogleProviderLinked(user)) {
    await upsertUserProfile(user);
    return user;
  }

  const userCredential = await linkWithPopup(user, googleProvider);
  await upsertUserProfile(userCredential.user);
  return userCredential.user;
};

export const updateUserDisplayName = async (user: User, displayName: string) => {
  const sanitizedDisplayName = displayName.trim().slice(0, 80);

  await updateProfile(user, { displayName: sanitizedDisplayName });
  await upsertUserProfile(user, { displayName: sanitizedDisplayName });

  return sanitizedDisplayName;
};

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  await upsertUserProfile(userCredential.user);
  return userCredential.user;
};
