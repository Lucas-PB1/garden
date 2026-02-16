/**
 * Compresses an image file, converts it to WebP format, and crops it to a 3:4 aspect ratio.
 * @param file - The original image file.
 * @param quality - Compression quality (0 to 1). Defaults to 0.8.
 * @returns Promise with the optimized WebP file.
 */
export const compressImageToWebP = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Invalid file type. Please upload an image."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const TARGET_ASPECT = 3 / 4;
        const MAX_WIDTH = 1200;

        let sourceX = 0,
          sourceY = 0,
          sourceWidth = img.width,
          sourceHeight = img.height;

        const currentAspect = img.width / img.height;

        if (currentAspect > TARGET_ASPECT) {
          sourceWidth = img.height * TARGET_ASPECT;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (currentAspect < TARGET_ASPECT) {
          sourceHeight = img.width / TARGET_ASPECT;
          sourceY = (img.height - sourceHeight) / 2;
        }

        const targetWidth = Math.min(MAX_WIDTH, sourceWidth);
        const targetHeight = targetWidth / TARGET_ASPECT;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          targetWidth,
          targetHeight,
        );

        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const newFile = new File([blob], newName, { type: "image/webp" });
              resolve(newFile);
            } else {
              reject(new Error("Canvas to Blob conversion failed"));
            }
          },
          "image/webp",
          quality,
        );
      };

      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
