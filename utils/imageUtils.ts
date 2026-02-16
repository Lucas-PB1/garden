export const compressImageToWebP = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please upload an image.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Standards for "garden" photos: 3:4 aspect ratio (portrait)
        const TARGET_ASPECT = 3 / 4;
        const MAX_WIDTH = 1200; // Sufficient for high quality on web

        let targetWidth, targetHeight;
        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

        // Calculate source cropping coordinates (Center Crop)
        const currentAspect = img.width / img.height;

        if (currentAspect > TARGET_ASPECT) {
          // Wider than target: crop sides
          sourceWidth = img.height * TARGET_ASPECT;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (currentAspect < TARGET_ASPECT) {
          // Taller than target: crop top/bottom
          sourceHeight = img.width / TARGET_ASPECT;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // Final dimensions limited by MAX_WIDTH
        targetWidth = Math.min(MAX_WIDTH, sourceWidth);
        targetHeight = targetWidth / TARGET_ASPECT;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw cropped image
        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);

        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            // Create a new File object from the Blob
            // Change extension to .webp
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const newFile = new File([blob], newName, { type: "image/webp" });
            resolve(newFile);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        }, 'image/webp', quality);
      };

      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
