import { NextResponse } from "next/server";
import {
  buildIntakeEmail,
  SUBMIT_TO_EMAIL,
  validateSubmit,
} from "@/lib/submit";

export const runtime = "nodejs";

const FORM_KEYS = [
  "name",
  "email",
  "phone",
  "title",
  "medium",
  "dimensions",
  "year",
  "note",
] as const;

function readFields(form: FormData) {
  const fields = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
    title: String(form.get("title") ?? ""),
    medium: String(form.get("medium") ?? ""),
    dimensions: String(form.get("dimensions") ?? ""),
    year: String(form.get("year") ?? ""),
    note: String(form.get("note") ?? ""),
  };
  return fields;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Please attach a photo of the painting." },
      { status: 400 },
    );
  }
  const fields = readFields(form);
  if (String(form.get("website") ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }
  const photo = form.get("photo");

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json(
      { error: "Please attach a photo of the painting." },
      { status: 400 },
    );
  }

  const issues = validateSubmit(fields, {
    type: photo.type || "image/jpeg",
    size: photo.size,
  });
  if (issues.length) {
    return NextResponse.json({ error: issues[0].message }, { status: 400 });
  }

  const email = buildIntakeEmail(fields);
  const outbound = new FormData();
  outbound.append("_subject", email.subject);
  outbound.append("_template", "table");
  if (fields.email.trim()) outbound.append("_replyto", fields.email.trim());
  outbound.append("message", email.text);
  for (const key of FORM_KEYS) {
    const value = fields[key]?.trim();
    if (value) outbound.append(key, value);
  }
  outbound.append("attachment", photo, photo.name || "painting.jpg");

  // FormSubmit rejects requests without a browser-like Origin/Referer, and
  // ties form activation to the domain, so always present the production
  // origin regardless of where this server runs (localhost, previews).
  const origin = "https://susannordlinger.com";
  const response = await fetch(
    `https://formsubmit.co/ajax/${SUBMIT_TO_EMAIL}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Origin: origin,
        Referer: `${origin}/submit`,
      },
      body: outbound,
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { success?: string | boolean; message?: string }
    | null;

  const succeeded =
    response.ok && (payload?.success === true || payload?.success === "true");
  if (!succeeded) {
    return NextResponse.json(
      {
        error:
          payload?.message ||
          "Heather could not receive the painting just now. Please email her directly.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
