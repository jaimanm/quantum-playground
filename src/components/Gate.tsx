import * as Tooltip from "@radix-ui/react-tooltip";
import { GATE_COLORS } from "../constants/circuit";
import type { GateType } from "../types";

const GATE_DESCRIPTIONS: Record<GateType, string> = {
  H: "Hadamard: Creates superposition",
  X: "Pauli-X: Bit flip (NOT gate)",
  Y: "Pauli-Y: Bit and phase flip",
  Z: "Pauli-Z: Phase flip",
};

interface GateProps {
  name: GateType;
}

/**
 * Gate Component in Library
 * Represents a draggable gate in the gate library
 */
const Gate: React.FC<GateProps> = ({ name }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("gateType", name);
  };
  const colors = GATE_COLORS[name] || GATE_COLORS.DEFAULT;
  const classNames = `w-14 h-14 rounded-md flex items-center justify-center text-gray-900 font-bold text-2xl cursor-grab active:cursor-grabbing shadow-lg transition-colors border-2 select-none ${colors.bg} ${colors.hoverBg} ${colors.border}`;

  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        <div
          draggable="true"
          onDragStart={handleDragStart}
          className={classNames}
        >
          {name}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-gray-900 text-white text-xs px-3 py-2 rounded border border-gray-700 shadow-lg z-50 max-w-xs"
          sideOffset={5}
        >
          {GATE_DESCRIPTIONS[name]}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export default Gate;
