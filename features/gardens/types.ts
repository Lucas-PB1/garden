import type { Timestamp } from "firebase/firestore";

export type GardenThemeType = "floral" | "stars" | "minimalist" | "custom";

export interface GardenTheme {
  primaryColor: string;
  secondaryColor: string;
  bgType: GardenThemeType;
  customBgUrl?: string;
}

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

export interface GardenPhotoWithPhrase extends GardenPhoto {
  phrase: string;
}

export interface UserProfile {
  displayName?: string;
  photoURL?: string;
}
