export const SUBMIT_TO_EMAIL = "heather@lvpo.com";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
export const PREPARE_MAX_EDGE = 2400;
export const PREPARE_JPEG_QUALITY = 0.88;

export type SubmitFields = {
  name: string;
  email: string;
  phone?: string;
  title: string;
  medium?: string;
  dimensions?: string;
  year?: string;
  note?: string;
};

export type SubmitIssue = { field: keyof SubmitFields | "photo"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSubmit(
  fields: SubmitFields,
  photo: { type: string; size: number } | null,
): SubmitIssue[] {
  const issues: SubmitIssue[] = [];
  const name = fields.name.trim();
  const email = fields.email.trim();
  const title = fields.title.trim();

  if (!name) issues.push({ field: "name", message: "Please include your name." });
  if (!email) issues.push({ field: "email", message: "Please include your email." });
  else if (!EMAIL_PATTERN.test(email)) {
    issues.push({ field: "email", message: "That email does not look valid." });
  }
  if (!title) issues.push({ field: "title", message: "Please include a painting title." });

  if (!photo) {
    issues.push({ field: "photo", message: "Please attach a photo of the painting." });
  } else if (
    !ALLOWED_IMAGE_TYPES.includes(photo.type as (typeof ALLOWED_IMAGE_TYPES)[number])
  ) {
    issues.push({
      field: "photo",
      message: "Please send a JPEG, PNG, or WebP photo.",
    });
  } else if (photo.size > MAX_ORIGINAL_BYTES) {
    issues.push({
      field: "photo",
      message: "Please send a photo under 25 MB.",
    });
  }

  return issues;
}

export function buildIntakeEmail(fields: SubmitFields) {
  const lines = [
    "A painting was submitted for susannordlinger.com.",
    "Please forward it to be uploaded to the site.",
    "",
    `From: ${fields.name.trim()}`,
    `Email: ${fields.email.trim()}`,
    fields.phone?.trim() ? `Phone: ${fields.phone.trim()}` : null,
    "",
    `Title: ${fields.title.trim()}`,
    fields.medium?.trim() ? `Medium: ${fields.medium.trim()}` : null,
    fields.dimensions?.trim() ? `Dimensions: ${fields.dimensions.trim()}` : null,
    fields.year?.trim() ? `Year: ${fields.year.trim()}` : null,
    fields.note?.trim() ? `Note: ${fields.note.trim()}` : null,
  ].filter((line): line is string => line !== null);

  return {
    subject: `New painting for the website: ${fields.title.trim()}`,
    text: lines.join("\n"),
  };
}

export async function preparePaintingPhoto(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    PREPARE_MAX_EDGE / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", PREPARE_JPEG_QUALITY);
  });
  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "painting";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
