import {
  DEFAULT_GARDEN_THEME,
  GARDEN_THEME_TYPES,
  MAX_CAPTION_LENGTH,
  MAX_GARDEN_NAME_LENGTH,
  MAX_LOVE_PHRASE_LENGTH,
  MAX_LOVE_PHRASES,
  MAX_SPECIAL_DATE_TITLE_LENGTH,
  MAX_UPLOADER_NAME_LENGTH,
} from "../constants";
import type { GardenTheme, GardenThemeType } from "../types";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const trimToLength = (value: string, maxLength: number) => value.trim().slice(0, maxLength);

const sanitizeHttpsUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString().slice(0, 2048) : undefined;
  } catch {
    return undefined;
  }
};

export const sanitizeGardenName = (name: string) => {
  const sanitized = trimToLength(name, MAX_GARDEN_NAME_LENGTH);
  if (!sanitized) throw new Error("Garden name is required.");
  return sanitized;
};

export const sanitizeCaption = (caption: string) => trimToLength(caption, MAX_CAPTION_LENGTH);

export const sanitizeUploaderName = (name: string) =>
  trimToLength(name || "Pessoa especial", MAX_UPLOADER_NAME_LENGTH) || "Pessoa especial";

export const sanitizeSpecialDateTitle = (title: string) =>
  trimToLength(title || "Data Especial", MAX_SPECIAL_DATE_TITLE_LENGTH) || "Data Especial";

export const sanitizeLovePhrases = (phrases: string[]) =>
  phrases
    .filter((phrase): phrase is string => typeof phrase === "string")
    .map((phrase) => trimToLength(phrase, MAX_LOVE_PHRASE_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_LOVE_PHRASES);

export const isGardenThemeType = (value: string): value is GardenThemeType =>
  GARDEN_THEME_TYPES.includes(value as GardenThemeType);

export const sanitizeTheme = (theme?: Partial<GardenTheme>): GardenTheme => {
  if (!theme) return DEFAULT_GARDEN_THEME;

  const bgType =
    theme.bgType && isGardenThemeType(theme.bgType) ? theme.bgType : DEFAULT_GARDEN_THEME.bgType;
  const primaryColor =
    theme.primaryColor && HEX_COLOR_PATTERN.test(theme.primaryColor)
      ? theme.primaryColor
      : DEFAULT_GARDEN_THEME.primaryColor;
  const secondaryColor =
    theme.secondaryColor && HEX_COLOR_PATTERN.test(theme.secondaryColor)
      ? theme.secondaryColor
      : DEFAULT_GARDEN_THEME.secondaryColor;
  const customBgUrl = theme.customBgUrl ? sanitizeHttpsUrl(theme.customBgUrl) : undefined;

  return {
    primaryColor,
    secondaryColor,
    bgType,
    ...(customBgUrl ? { customBgUrl } : {}),
  };
};

export const sanitizeCollaboratorId = (collaboratorId: string) => {
  const sanitized = collaboratorId.trim();
  if (!sanitized) throw new Error("Collaborator ID is required.");
  return sanitized;
};
