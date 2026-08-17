const AVATAR_MAX_DIMENSION = 200;
const AVATAR_JPEG_QUALITY = 0.85;
// Comfortably under the API's 1mb body limit (see main.ts) with room for the rest of the request.
export const AVATAR_MAX_DATA_URL_BYTES = 300_000;

/** Downscales/compresses a picked image client-side so the base64 payload we send stays small —
 * there's no external file storage here (see users.service.updateProfile), so keeping this tiny is
 * what makes storing avatars as a plain DB column workable at all. Shared by the Settings profile
 * form and ProfileSetupModal so the two never drift on compression behavior. */
export function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
