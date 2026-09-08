"use client";

import { useMemo, useState } from "react";
import {
  preparePaintingPhoto,
  validateSubmit,
  type SubmitFields,
} from "@/lib/submit";

const emptyFields: SubmitFields = {
  name: "",
  email: "",
  phone: "",
  title: "",
  medium: "",
  dimensions: "",
  year: "",
  note: "",
};

const fieldClass =
  "w-full border-0 border-b border-hairline bg-transparent py-3 text-[1rem] font-light text-ink outline-none placeholder:text-stone/70 focus:border-ink";

export function SubmitForm() {
  const [fields, setFields] = useState<SubmitFields>(emptyFields);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const issues = useMemo(
    () =>
      validateSubmit(fields, photo && { type: photo.type, size: photo.size }),
    [fields, photo],
  );

  function update<K extends keyof SubmitFields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (issues.length) {
      setError(issues[0].message);
      return;
    }
    if (!photo) return;

    setStatus("sending");
    setError(null);

    try {
      const prepared = await preparePaintingPhoto(photo);
      const body = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value?.trim()) body.append(key, value.trim());
      });
      body.append("photo", prepared);

      const website = (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value;
      if (website) body.append("website", website);

      const response = await fetch("/api/submit", {
        method: "POST",
        body: body,
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "The painting could not be sent.");
      }

      setStatus("sent");
      setFields(emptyFields);
      setPhoto(null);
      setPreview(null);
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "The painting could not be sent.",
      );
    }
  }

  if (status === "sent") {
    return (
      <div className="border-t border-hairline pt-8">
        <p className="font-[family-name:var(--font-display)] text-[2rem] leading-tight text-ink">
          Sent to Heather.
        </p>
        <p className="mt-4 text-[1rem] font-light leading-7 text-ink/80">
          She will forward the painting so it can be uploaded to the site.
        </p>
        <button
          type="button"
          className="mt-8 text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone hover:text-ink"
          onClick={() => setStatus("idle")}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-7">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
      />
      <label className="block">
        <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
          Your name
        </span>
        <input
          required
          className={fieldClass}
          value={fields.name}
          onChange={(event) => update("name", event.target.value)}
          autoComplete="name"
        />
      </label>
      <label className="block">
        <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
          Your email
        </span>
        <input
          required
          type="email"
          className={fieldClass}
          value={fields.email}
          onChange={(event) => update("email", event.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
          Phone <span className="normal-case tracking-normal">(optional)</span>
        </span>
        <input
          type="tel"
          className={fieldClass}
          value={fields.phone}
          onChange={(event) => update("phone", event.target.value)}
          autoComplete="tel"
        />
      </label>
      <label className="block">
        <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
          Painting title
        </span>
        <input
          required
          className={fieldClass}
          value={fields.title}
          onChange={(event) => update("title", event.target.value)}
        />
      </label>
      <div className="grid gap-7 sm:grid-cols-3">
        <label className="block">
          <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
            Medium
          </span>
          <input
            className={fieldClass}
            placeholder="oil on canvas"
            value={fields.medium}
            onChange={(event) => update("medium", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
            Size
          </span>
          <input
            className={fieldClass}
            placeholder="24 × 30 in"
            value={fields.dimensions}
            onChange={(event) => update("dimensions", event.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
            Year
          </span>
          <input
            className={fieldClass}
            value={fields.year}
            onChange={(event) => update("year", event.target.value)}
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
          Photo of the painting
        </span>
        <input
          required
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-3 block w-full text-[0.95rem] font-light file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-[0.72rem] file:font-light file:uppercase file:tracking-[0.16em] file:text-plaster"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setPhoto(file);
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </label>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Selected painting"
          className="max-h-72 w-full object-contain bg-[#e4ddd2]"
        />
      ) : null}
      <label className="block">
        <span className="text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
          Note <span className="normal-case tracking-normal">(optional)</span>
        </span>
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          value={fields.note}
          onChange={(event) => update("note", event.target.value)}
        />
      </label>
      {error ? (
        <p className="text-[0.95rem] font-light text-[#8a3a2a]">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="self-start bg-ink px-8 py-3 text-[0.72rem] font-light uppercase tracking-[0.22em] text-plaster disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send to Heather"}
      </button>
    </form>
  );
}
