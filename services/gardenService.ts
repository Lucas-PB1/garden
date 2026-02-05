import { db, storage } from "@/lib/firebase/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
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
    displayName?: string;
    photoURL?: string;
    gardenName?: string;
    editKey?: string;
    specialDate?: any; // Firestore Timestamp or string
    specialDateTitle?: string;
    lovePhrases?: string[];
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

export const updateGardenName = async (userId: string, name: string): Promise<void> => {
    const userRef = doc(db, "users", userId);
    // Use setDoc with merge: true to create if doesn't exist or update if it does
    await setDoc(userRef, { gardenName: name }, { merge: true });
};

export const updateSpecialDate = async (userId: string, date: Date | null, title: string): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { 
        specialDate: date ? date : null,
        specialDateTitle: title 
    }, { merge: true });
};

export const updateLovePhrases = async (userId: string, phrases: string[]): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { lovePhrases: phrases }, { merge: true });
};

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
}

export const getGardenKey = async (userId: string): Promise<string> => {
    const profile = await getUserProfile(userId);
    if (profile?.editKey) {
        return profile.editKey;
    }
    
    // Generate new key if doesn't exist
    const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { editKey: newKey }, { merge: true });
    return newKey;
}

export const verifyGardenKey = async (userId: string, key: string): Promise<boolean> => {
    if (!key) return false;
    const profile = await getUserProfile(userId);
    return profile?.editKey === key;
}
