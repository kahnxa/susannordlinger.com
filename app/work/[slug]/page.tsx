import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentWorks, getWork, workCaption, works } from "@/lib/works";

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return { title: "Painting" };
  return { title: work.title };
}

export default async function WorkPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  const { prev, next } = getAdjacentWorks(slug);
  const caption = workCaption(work);

  return (
    <div className="mx-auto grid w-full max-w-[1180px] items-start gap-10 px-6 pb-24 sm:px-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:gap-16 lg:px-16">
      <Image
        src={work.image}
        alt={work.title}
        width={work.width}
        height={work.height}
        className="h-auto w-full bg-[#e4ddd2]"
        sizes="(min-width: 1024px) 55vw, 92vw"
        unoptimized={work.image.endsWith(".svg")}
        priority
      />
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[2.4rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2.8rem]">
          {work.title}
        </h1>
        <p className="mt-3 text-[0.92rem] font-light tracking-wide text-stone">
          {caption || "Painting"}
        </p>
        {work.note ? (
          <p className="mt-6 text-[1rem] font-light leading-7 text-ink/80">
            {work.note}
          </p>
        ) : null}
        <div className="mt-12 flex gap-8 text-[0.72rem] font-light uppercase tracking-[0.2em] text-stone">
          {prev ? (
            <Link href={`/work/${prev.slug}`} className="hover:text-ink">
              Previous
            </Link>
          ) : (
            <span>Previous</span>
          )}
          {next ? (
            <Link href={`/work/${next.slug}`} className="hover:text-ink">
              Next
            </Link>
          ) : (
            <span>Next</span>
          )}
        </div>
      </div>
    </div>
  );
}
