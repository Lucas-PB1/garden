import { db, storage } from "@/lib/firebase/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface GardenPhoto {
  id: string;
  userId: string;
  url: string;
  path: string;
  caption: string;
  createdAt: any;
}

export interface UserProfile {
    displayName: string;
    photoURL?: string;
}

export const uploadPhoto = async (
  file: File, 
  userId: string, 
  caption: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const storagePath = `gardens/${userId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  // Upload to Storage
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  // Save to Firestore
  await addDoc(collection(db, "photos"), {
    userId,
    url: downloadURL,
    path: storagePath,
    caption,
    createdAt: serverTimestamp(),
  });

  return downloadURL;
};

export const getGardenPhotos = async (userId: string): Promise<GardenPhoto[]> => {
  const q = query(
    collection(db, "photos"),
    where("userId", "==", userId)
    // Client-side sorting is sufficient for personal gardens
  );

  const querySnapshot = await getDocs(q);
  const photos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GardenPhoto[];

  // detailed sort that handles Timestamp objects or fallback
  return photos.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
  });
};

export const deletePhoto = async (photoId: string, storagePath: string): Promise<void> => {
    // Delete from Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    
    // Delete from Firestore
    await deleteDoc(doc(db, "photos", photoId));
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    return null; 
}
