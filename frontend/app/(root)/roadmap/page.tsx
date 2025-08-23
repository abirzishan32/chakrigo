import { RoadmapGenerator } from "@/components/roadmap/roadmap-generator";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="h-screen overflow-hidden">
        <RoadmapGenerator />
      </div>
    </div>
  );
}
