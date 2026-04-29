import type { GardenTheme } from "./types";

export const DEFAULT_GARDEN_THEME: GardenTheme = {
  primaryColor: "#ec4899",
  secondaryColor: "#f43f5e",
  bgType: "floral",
};

export const GARDEN_THEME_TYPES = ["floral", "stars", "minimalist", "custom"] as const;

export const MAX_GARDEN_NAME_LENGTH = 80;
export const MAX_SPECIAL_DATE_TITLE_LENGTH = 80;
export const MAX_LOVE_PHRASES = 80;
export const MAX_LOVE_PHRASE_LENGTH = 280;
export const MAX_PHRASES_IMPORT_BYTES = 256 * 1024;
export const MAX_UPLOADER_NAME_LENGTH = 80;
export const MAX_CAPTION_LENGTH = 80;
export const MAX_UPLOAD_SOURCE_BYTES = 15 * 1024 * 1024;
export const MAX_STORAGE_IMAGE_BYTES = 10 * 1024 * 1024;
