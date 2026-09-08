import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pb-24 sm:px-12">
      <p className="font-[family-name:var(--font-display)] text-[2.4rem] leading-tight tracking-[-0.02em] text-ink sm:text-[3rem]">
        Paintings.
      </p>
      <div className="mt-10 space-y-6 text-[1.05rem] font-light leading-8 text-ink/85">
        <p>
          This site is the public gallery for Susan Nordlinger&apos;s work.
          Each painting is shown the way a studio wall would: the picture
          first, then the title, medium, size, and year.
        </p>
        <p>
          If you have a painting that belongs here, send a photograph to Heather.
          She will pass it along so it can be added to the site.
        </p>
        <p>
          <Link href="/submit" className="underline decoration-hairline">
            Send a painting
          </Link>
          <span className="text-stone"> — it goes to heather@lvpo.com.</span>
        </p>
      </div>
    </div>
  );
}
