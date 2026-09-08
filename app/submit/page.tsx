import type { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm";
import { SUBMIT_TO_EMAIL } from "@/lib/submit";

export const metadata: Metadata = {
  title: "Submit a painting",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto grid w-full max-w-[960px] gap-12 px-6 pb-24 sm:px-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[2.4rem] leading-tight tracking-[-0.02em] text-ink sm:text-[3rem]">
          Send a painting
        </h1>
        <p className="mt-6 max-w-sm text-[1.05rem] font-light leading-8 text-ink/85">
          Photographs go to Heather at {SUBMIT_TO_EMAIL}. She will forward them
          so they can be added to the gallery.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
