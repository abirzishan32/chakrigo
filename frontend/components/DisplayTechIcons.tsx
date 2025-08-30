import Image from "next/image";

import { cn, getTechLogos } from "@/lib/utils";
import type { TechIconProps } from "@/types";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  const techIcons = await getTechLogos(techStack);

  return (
      <div className="flex flex-row">
        {techIcons.slice(0, 3).map(({ tech, url }, index) => (
            <div
                key={tech}
                className={cn(
                    "relative group bg-gray-800 rounded-full p-2 flex flex-center border border-gray-700 hover:border-primary-100 transition-all duration-200 shadow-md",
                    index >= 1 && "-ml-3"
                )}
            >
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-gray-700">{tech}</span>

              <Image
                  src={url}
                  alt={tech}
                  width={100}
                  height={100}
                  className="size-5"
              />
            </div>
        ))}
      </div>
  );
};

export default DisplayTechIcons;