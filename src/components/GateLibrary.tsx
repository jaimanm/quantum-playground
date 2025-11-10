import * as Tooltip from "@radix-ui/react-tooltip";
import Gate from "./Gate";
import type { GateType } from "../types";

interface GateLibraryProps {
  gateLibraryRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Gate Library Component
 * Displays available quantum gates that can be dragged onto the circuit
 */
const GateLibrary: React.FC<GateLibraryProps> = ({ gateLibraryRef }) => {
  const gates: (GateType | "M")[] = ["X", "Y", "Z", "H", "M"];
  return (
    <div
      ref={gateLibraryRef}
      className="w-full max-w-4xl mx-auto mt-8 p-4 bg-gray-800 rounded-lg shadow-2xl border border-gray-700"
    >
      <h2 className="text-xl font-bold text-gray-300 mb-4 text-center">
        Gate Library
      </h2>
      <Tooltip.Provider delayDuration={300}>
        <div className="flex justify-center items-center gap-4">
          {gates.map((gateName) => (
            <Gate key={gateName} name={gateName} />
          ))}
        </div>
      </Tooltip.Provider>
    </div>
  );
};

export default GateLibrary;
