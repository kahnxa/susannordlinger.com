import { WorkRow } from "@/components/WorkRow";
import { works } from "@/lib/works";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-24 px-6 pb-24 sm:px-12 lg:px-16">
      {works.map((work, index) => (
        <WorkRow key={work.slug} work={work} index={index} />
      ))}
    </div>
  );
}
