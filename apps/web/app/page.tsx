'use client';
import "@jonelhatwell/arcade-games/styles"
import { SpaceDodger, MemoryGame, Snake } from "@jonelhatwell/arcade-games";

export default function Home() {
  return (
    <div className="relative h-full w-full overflow-hidden text-white">
      <Snake />
    </div>
  );
}
