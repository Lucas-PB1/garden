import { db, storage } from "@/lib/firebase/firebase";
import type { FirebaseError } from "firebase/app";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { Garden, GardenPhoto, GardenTheme, UserProfile } from "../types";
import {
  sanitizeCaption,
  sanitizeCollaboratorId,
  sanitizeGardenName,
  sanitizeLovePhrases,
  sanitizeSpecialDateTitle,
  sanitizeTheme,
  sanitizeUploaderName,
} from "../utils/gardenValidation";

export type {
  Garden,
  GardenPhoto,
  GardenPhotoWithPhrase,
  GardenTheme,
  UserProfile,
} from "../types";

interface UploadPhotoInput {
  file: File;
  gardenId: string;
  uploaderId: string;
  caption: string;
  uploaderName: string;
}

const getCreatedAtSeconds = (item: { createdAt?: { seconds?: number } | null }) =>
  item.createdAt?.seconds || 0;

const createStorageFileName = () => {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${Date.now()}-${randomId}.webp`;
};

const ignoreMissingStorageObject = (error: unknown) => {
  const firebaseError = error as FirebaseError;
  if (firebaseError.code !== "storage/object-not-found") {
    throw error;
  }
};

export const uploadPhoto = async ({
  file,
  gardenId,
  uploaderId,
  caption,
  uploaderName,
}: UploadPhotoInput): Promise<string> => {
  const fileName = createStorageFileName();
  const storagePath = `gardens/${gardenId}/photos/${uploaderId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      gardenId,
      uploadedBy: uploaderId,
    },
  });

  const downloadURL = await getDownloadURL(storageRef);

  await addDoc(collection(db, "photos"), {
    gardenId,
    userId: uploaderId,
    url: downloadURL,
    path: storagePath,
    caption: sanitizeCaption(caption),
    createdAt: serverTimestamp(),
    uploadedBy: uploaderId,
    uploaderName: sanitizeUploaderName(uploaderName),
  });

  return downloadURL;
};

export const getGardenPhotos = async (gardenId: string): Promise<GardenPhoto[]> => {
  if (!gardenId) return [];

  const photosQuery = query(collection(db, "photos"), where("gardenId", "==", gardenId));
  const querySnapshot = await getDocs(photosQuery);

  const photos = querySnapshot.docs.map((photoDoc) => ({
    id: photoDoc.id,
    ...photoDoc.data(),
  })) as GardenPhoto[];

  return photos.sort((a, b) => getCreatedAtSeconds(b) - getCreatedAtSeconds(a));
};

export const createGarden = async (
  ownerId: string,
  name: string,
  theme?: GardenTheme,
): Promise<string> => {
  const gardenRef = await addDoc(collection(db, "gardens"), {
    ownerId,
    name: sanitizeGardenName(name),
    theme: sanitizeTheme(theme),
    collaboratorIds: [],
    createdAt: serverTimestamp(),
  });

  return gardenRef.id;
};

export const getGarden = async (gardenId: string): Promise<Garden | null> => {
  const gardenSnap = await getDoc(doc(db, "gardens", gardenId));
  if (!gardenSnap.exists()) return null;

  return { id: gardenSnap.id, ...gardenSnap.data() } as Garden;
};

export const getUserGardens = async (userId: string): Promise<Garden[]> => {
  if (!userId) return [];

  const ownedQuery = query(collection(db, "gardens"), where("ownerId", "==", userId));
  const sharedQuery = query(
    collection(db, "gardens"),
    where("collaboratorIds", "array-contains", userId),
  );

  const [ownedSnapshot, sharedSnapshot] = await Promise.all([
    getDocs(ownedQuery),
    getDocs(sharedQuery),
  ]);
  const gardenMap = new Map<string, Garden>();

  [...ownedSnapshot.docs, ...sharedSnapshot.docs].forEach((gardenDoc) => {
    gardenMap.set(gardenDoc.id, { id: gardenDoc.id, ...gardenDoc.data() } as Garden);
  });

  return Array.from(gardenMap.values()).sort(
    (a, b) => getCreatedAtSeconds(b) - getCreatedAtSeconds(a),
  );
};

export const updateGarden = async (
  gardenId: string,
  data: Partial<
    Pick<Garden, "name" | "theme" | "specialDate" | "specialDateTitle" | "lovePhrases">
  >,
): Promise<void> => {
  const update: Record<string, unknown> = {};

  if (data.name !== undefined) update.name = sanitizeGardenName(data.name);
  if (data.theme !== undefined) update.theme = sanitizeTheme(data.theme);
  if (data.specialDate !== undefined) update.specialDate = data.specialDate;
  if (data.specialDateTitle !== undefined) {
    update.specialDateTitle = sanitizeSpecialDateTitle(data.specialDateTitle);
  }
  if (data.lovePhrases !== undefined) update.lovePhrases = sanitizeLovePhrases(data.lovePhrases);

  if (Object.keys(update).length === 0) return;
  await updateDoc(doc(db, "gardens", gardenId), update);
};

export const deletePhoto = async (photoId: string, storagePath: string): Promise<void> => {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    ignoreMissingStorageObject(error);
  }

  await deleteDoc(doc(db, "photos", photoId));
};

export const updateGardenName = async (gardenId: string, name: string): Promise<void> => {
  await updateGarden(gardenId, { name });
};

export const updateSpecialDate = async (
  gardenId: string,
  date: Date | null,
  title: string,
): Promise<void> => {
  await updateGarden(gardenId, {
    specialDate: date,
    specialDateTitle: title,
  });
};

export const updateLovePhrases = async (gardenId: string, phrases: string[]): Promise<void> => {
  await updateGarden(gardenId, { lovePhrases: phrases });
};

export const updateGardenTheme = async (gardenId: string, theme: GardenTheme): Promise<void> => {
  await updateGarden(gardenId, { theme });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return null;

    return docSnap.data() as UserProfile;
  } catch (error) {
    console.error("Error fetching profile", error);
    return null;
  }
};

export const addCollaborator = async (gardenId: string, collaboratorId: string): Promise<void> => {
  await updateDoc(doc(db, "gardens", gardenId), {
    collaboratorIds: arrayUnion(sanitizeCollaboratorId(collaboratorId)),
  });
};

export const removeCollaborator = async (
  gardenId: string,
  collaboratorId: string,
): Promise<void> => {
  await updateDoc(doc(db, "gardens", gardenId), {
    collaboratorIds: arrayRemove(sanitizeCollaboratorId(collaboratorId)),
  });
};

export const deleteGarden = async (gardenId: string): Promise<void> => {
  const photos = await getGardenPhotos(gardenId);
  await Promise.allSettled(photos.map((photo) => deletePhoto(photo.id, photo.path)));
  await deleteDoc(doc(db, "gardens", gardenId));
};
