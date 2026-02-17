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
  gardenId: string;
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
 * Interface for garden customization settings.
 */
export interface GardenTheme {
  primaryColor: string;
  secondaryColor: string;
  bgType: "floral" | "stars" | "minimalist" | "custom";
  customBgUrl?: string;
}

/**
 * Interface representing a garden entity.
 */
export interface Garden {
  id: string;
  ownerId: string;
  name: string;
  theme: GardenTheme;
  specialDate?: Timestamp | Date | string | null;
  specialDateTitle?: string;
  lovePhrases?: string[];
  collaboratorIds: string[];
  createdAt?: Timestamp;
}

/**
 * Interface representing the user's profile.
 */
export interface UserProfile {
  displayName?: string;
  photoURL?: string;
}

/**
 * Uploads a photo to storage and saves metadata to Firestore.
 * @param file - The photo file to upload.
 * @param gardenId - ID of the target garden.
 * @param userId - ID of the owner.
 * @param caption - Photo caption/date.
 * @param uploaderName - Name of the person uploading.
 * @returns Promise with the download URL.
 */
export const uploadPhoto = async (
  file: File,
  gardenId: string,
  userId: string,
  caption: string,
  uploaderName: string,
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const storagePath = `gardens/${userId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();

  await addDoc(collection(db, "photos"), {
    gardenId,
    userId,
    url: downloadURL,
    path: storagePath,
    caption,
    createdAt: serverTimestamp(),
    uploadedBy: auth.currentUser?.uid || userId,
    uploaderName: uploaderName,
  });

  return downloadURL;
};

/**
 * Fetches all photos for a specific garden.
 * @param gardenId - ID of the garden.
 * @returns Promise with array of GardenPhoto.
 */
export const getGardenPhotos = async (gardenId: string): Promise<GardenPhoto[]> => {
  const q = query(collection(db, "photos"), where("gardenId", "==", gardenId));

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
 * Creates a new garden for a user.
 */
export const createGarden = async (
  ownerId: string,
  name: string,
  theme?: GardenTheme,
): Promise<string> => {
  const gardenRef = await addDoc(collection(db, "gardens"), {
    ownerId,
    name,
    theme: theme || {
      primaryColor: "#ec4899",
      secondaryColor: "#f43f5e",
      bgType: "floral",
    },
    collaboratorIds: [],
    createdAt: serverTimestamp(),
  });
  return gardenRef.id;
};

/**
 * Fetches a specific garden by ID.
 */
export const getGarden = async (gardenId: string): Promise<Garden | null> => {
  const gardenSnap = await getDoc(doc(db, "gardens", gardenId));
  if (gardenSnap.exists()) {
    return { id: gardenSnap.id, ...gardenSnap.data() } as Garden;
  }
  return null;
};

/**
 * Fetches all gardens where user is owner or collaborator.
 */
export const getUserGardens = async (userId: string): Promise<Garden[]> => {
  const ownedQ = query(collection(db, "gardens"), where("ownerId", "==", userId));
  const sharedQ = query(collection(db, "gardens"), where("collaboratorIds", "array-contains", userId));

  const [ownedSnap, sharedSnap] = await Promise.all([getDocs(ownedQ), getDocs(sharedQ)]);

  const owned = ownedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Garden[];
  const shared = sharedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Garden[];

  return [...owned, ...shared].sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });
};

/**
 * Updates garden settings.
 */
export const updateGarden = async (gardenId: string, data: Partial<Garden>): Promise<void> => {
  const gardenRef = doc(db, "gardens", gardenId);
  await setDoc(gardenRef, data, { merge: true });
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
 * @param gardenId - ID of the garden.
 * @param name - New garden name.
 */
export const updateGardenName = async (gardenId: string, name: string): Promise<void> => {
  await updateGarden(gardenId, { name });
};

/**
 * Updates the special countdown date for the garden.
 * @param gardenId - ID of the garden.
 * @param date - The target date.
 * @param title - Title for the countdown.
 */
export const updateSpecialDate = async (
  gardenId: string,
  date: Date | null,
  title: string,
): Promise<void> => {
  await updateGarden(gardenId, {
    specialDate: date ? date : null,
    specialDateTitle: title,
  });
};

/**
 * Updates the collection of love phrases for the garden.
 * @param gardenId - ID of the garden.
 * @param phrases - Array of strings.
 */
export const updateLovePhrases = async (gardenId: string, phrases: string[]): Promise<void> => {
  await updateGarden(gardenId, { lovePhrases: phrases });
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
 * Adds a collaborator to the garden.
 */
export const addCollaborator = async (gardenId: string, collabId: string): Promise<void> => {
  const garden = await getGarden(gardenId);
  if (garden) {
    const updated = Array.from(new Set([...garden.collaboratorIds, collabId]));
    await updateGarden(gardenId, { collaboratorIds: updated });
  }
};

/**
 * Removes a collaborator from the garden.
 */
export const removeCollaborator = async (gardenId: string, collabId: string): Promise<void> => {
  const garden = await getGarden(gardenId);
  if (garden) {
    const updated = garden.collaboratorIds.filter((id) => id !== collabId);
    await updateGarden(gardenId, { collaboratorIds: updated });
  }
};

/**
 * Deletes a garden and all its associated photos.
 * @param gardenId - ID of the garden to delete.
 */
export const deleteGarden = async (gardenId: string): Promise<void> => {
  const photos = await getGardenPhotos(gardenId);

  const deletePhotoPromises = photos.map((photo) => deletePhoto(photo.id, photo.path));
  await Promise.allSettled(deletePhotoPromises);
  await deleteDoc(doc(db, "gardens", gardenId));
};
