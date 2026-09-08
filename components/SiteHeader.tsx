import Link from "next/link";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/submit", label: "Submit" },
];

export function SiteHeader() {
  return (
    <header className="flex items-baseline justify-between gap-8 px-6 pt-8 pb-10 sm:px-12 lg:px-16">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-[1.65rem] leading-none tracking-[0.01em] text-ink sm:text-[1.85rem]"
      >
        Susan Nordlinger
      </Link>
      <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-[0.72rem] font-light uppercase tracking-[0.22em] text-stone">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
