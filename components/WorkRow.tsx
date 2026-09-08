import Image from "next/image";
import Link from "next/link";
import { type Work, workCaption } from "@/lib/works";

export function WorkRow({ work, index }: { work: Work; index: number }) {
  const caption = workCaption(work);

  return (
    <article
      className="work-row grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:gap-16"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <Link href={`/work/${work.slug}`} className="block">
        <Image
          src={work.image}
          alt={work.title}
          width={work.width}
          height={work.height}
          className="h-auto w-full bg-[#e4ddd2]"
          sizes="(min-width: 1024px) 52vw, 92vw"
          unoptimized={work.image.endsWith(".svg")}
          priority={index === 0}
        />
      </Link>
      <div className="max-w-md pt-1">
        <h2 className="font-[family-name:var(--font-display)] text-[2rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2.35rem]">
          <Link href={`/work/${work.slug}`} className="hover:opacity-70">
            {work.title}
          </Link>
        </h2>
        <p className="mt-3 text-[0.92rem] font-light tracking-wide text-stone">
          {caption || "Painting"}
        </p>
        {work.note ? (
          <p className="mt-5 max-w-sm text-[0.95rem] font-light leading-7 text-ink/80">
            {work.note}
          </p>
        ) : null}
      </div>
    </article>
  );
}
