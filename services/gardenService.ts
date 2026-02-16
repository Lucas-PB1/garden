import { db, storage } from "@/lib/firebase/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

/**
 * Interface representing a photo in the garden.
 */
export interface GardenPhoto {
  id: string;
  userId: string;
  url: string;
  path: string;
  caption: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number } | null;
  uploadedBy?: string;
  uploaderName?: string;
}

/**
 * Interface representing a garden photo with an assigned phrase.
 */
export interface GardenPhotoWithPhrase extends GardenPhoto {
  phrase: string;
}

/**
 * Interface representing the user's profile and garden settings.
 */
export interface UserProfile {
  displayName?: string;
  photoURL?: string;
  gardenName?: string;
  editKey?: string;
  specialDate?: Timestamp | Date | string | null;
  specialDateTitle?: string;
  lovePhrases?: string[];
}

/**
 * Uploads a photo to storage and saves metadata to Firestore.
 * @param file - The photo file to upload.
 * @param userId - ID of the garden owner.
 * @param caption - Photo caption/date.
 * @param uploaderName - Name of the person uploading.
 * @param editKey - Optional collaborative edit key.
 * @returns Promise with the download URL.
 */
export const uploadPhoto = async (
  file: File,
  userId: string,
  caption: string,
  uploaderName: string,
  editKey?: string,
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const storagePath = `gardens/${userId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, {
    customMetadata: editKey ? { editKey: editKey } : undefined,
  });
  const downloadURL = await getDownloadURL(storageRef);

  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();

  await addDoc(collection(db, "photos"), {
    userId,
    url: downloadURL,
    path: storagePath,
    caption,
    createdAt: serverTimestamp(),
    editKey: editKey || null,
    uploadedBy: auth.currentUser?.uid || userId,
    uploaderName: uploaderName,
  });

  return downloadURL;
};

/**
 * Fetches all photos for a specific garden.
 * @param userId - ID of the garden owner.
 * @returns Promise with array of GardenPhoto.
 */
export const getGardenPhotos = async (userId: string): Promise<GardenPhoto[]> => {
  const q = query(collection(db, "photos"), where("userId", "==", userId));

  const querySnapshot = await getDocs(q);
  const photos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GardenPhoto[];

  return photos.sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });
};

/**
 * Deletes a photo from both storage and Firestore.
 * @param photoId - Firestore document ID.
 * @param storagePath - Firebase Storage path.
 */
export const deletePhoto = async (photoId: string, storagePath: string): Promise<void> => {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
  await deleteDoc(doc(db, "photos", photoId));
};

/**
 * Updates the custom name of the garden.
 * @param userId - ID of the user.
 * @param name - New garden name.
 */
export const updateGardenName = async (userId: string, name: string): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { gardenName: name }, { merge: true });
};

/**
 * Updates the special countdown date for the garden.
 * @param userId - ID of the user.
 * @param date - The target date.
 * @param title - Title for the countdown.
 */
export const updateSpecialDate = async (
  userId: string,
  date: Date | null,
  title: string,
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      specialDate: date ? date : null,
      specialDateTitle: title,
    },
    { merge: true },
  );
};

/**
 * Updates the collection of love phrases for the garden.
 * @param userId - ID of the user.
 * @param phrases - Array of strings.
 */
export const updateLovePhrases = async (userId: string, phrases: string[]): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { lovePhrases: phrases }, { merge: true });
};

/**
 * Retrieves a user profile from Firestore.
 * @param userId - ID of the user.
 * @returns Promise with UserProfile or null.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (e) {
    console.error("Error fetching profile", e);
    return null;
  }
};

/**
 * Retrieves or generates the collaborative edit key for a garden.
 * @param userId - ID of the user.
 * @returns Promise with the edit key.
 */
export const getGardenKey = async (userId: string): Promise<string> => {
  const profile = await getUserProfile(userId);
  if (profile?.editKey) {
    return profile.editKey;
  }

  const newKey =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { editKey: newKey }, { merge: true });
  return newKey;
};

/**
 * Verifies if a provided key matches the garden's edit key.
 * @param userId - ID of the owner.
 * @param key - Provided key to verify.
 * @returns Promise with verification result.
 */
export const verifyGardenKey = async (userId: string, key: string): Promise<boolean> => {
  if (!key) return false;
  const profile = await getUserProfile(userId);
  return profile?.editKey === key;
};
