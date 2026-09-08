import Image from "next/image";
import Link from "next/link";
import { galleryLabel } from "@/lib/galleryCanvas";
import { works } from "@/lib/works";

export function GalleryCanvas() {
  return (
    <section aria-label="Paintings" className="gallery-canvas">
      {works.map((work, index) => (
        <Link
          key={work.slug}
          href={`/work/${work.slug}`}
          className="gallery-piece"
          style={{ animationDelay: `${index * 45}ms` }}
        >
          <span className="gallery-frame">
            <Image
              src={work.image}
              alt={work.title}
              width={work.width}
              height={work.height}
              sizes="(min-width: 1320px) 18vw, (min-width: 900px) 22vw, (min-width: 640px) 30vw, 92vw"
              priority={index < 4}
              className="gallery-image"
            />
          </span>
          <span className="gallery-label">{galleryLabel(work)}</span>
        </Link>
      ))}
    </section>
  );
}
