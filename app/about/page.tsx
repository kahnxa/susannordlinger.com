import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { titlesAreWorkingTitles } from "@/lib/works";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1180px] items-start gap-10 px-6 pb-24 sm:px-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(16rem,1fr)] lg:gap-16 lg:px-16">
      <Image
        src="/about/susan.jpg"
        alt="Susan Nordlinger"
        width={1001}
        height={1252}
        className="h-auto w-full bg-[#e4ddd2]"
        sizes="(min-width: 1024px) 42vw, 92vw"
        priority
      />
      <div>
        <p className="font-[family-name:var(--font-display)] text-[2.4rem] leading-tight tracking-[-0.02em] text-ink sm:text-[3rem]">
          Paintings.
        </p>
        <div className="mt-8 space-y-6 text-[1.05rem] font-light leading-8 text-ink/85">
          <p>
            This site is the public gallery for Susan Nordlinger&apos;s work.
            The pictures hang together on one wall. Hover a painting to see
            its title; open it for medium, size, and year.
          </p>
          {titlesAreWorkingTitles ? (
            <p className="text-stone">
              Titles here are working titles until Susan&apos;s own names are
              confirmed.
            </p>
          ) : null}
          <p>
            If you have a painting that belongs here, send a photograph to
            Heather. She will pass it along so it can be added to the site.
          </p>
          <p>
            <Link href="/submit" className="underline decoration-hairline">
              Send a painting
            </Link>
            <span className="text-stone"> — it goes to heather@lvpo.com.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
