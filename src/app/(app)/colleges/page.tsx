import { PageHeader } from "@/components/page-header";
import { CollegeDirectory } from "@/components/college-search";
import { getCollegesWithStats } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Colleges" };

export default async function CollegesPage() {
  const colleges = await getCollegesWithStats();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The network"
        title="Colleges on univibe"
        description="Every campus posting to your feed. Open one to see its upcoming events, its archive, and its crew."
      />
      <CollegeDirectory
        colleges={colleges.map((c) => ({
          id: c.id,
          name: c.name,
          shortName: c.shortName,
          city: c.city,
          state: c.state,
          hue: c.hue,
          eventsCount: Number(c.eventsCount),
          studentsCount: Number(c.studentsCount),
        }))}
      />
    </div>
  );
}
