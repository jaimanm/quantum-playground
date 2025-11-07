import { GATE_COLORS } from "../constants/circuit";
import type { GateType } from "../types";

interface GateProps {
  name: GateType;
  onDragStart?: () => void;
}

/**
 * Gate Component in Library
 * Represents a draggable gate in the gate library
 */
const Gate: React.FC<GateProps> = ({ name, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("gateType", name);
    onDragStart?.();
  };
  const colors = GATE_COLORS[name] || GATE_COLORS.DEFAULT;
  const classNames = `w-14 h-14 rounded-md flex items-center justify-center text-gray-900 font-bold text-2xl cursor-grab active:cursor-grabbing shadow-lg transition-colors border-2 select-none ${colors.bg} ${colors.hoverBg} ${colors.border}`;

  return (
    <div draggable="true" onDragStart={handleDragStart} className={classNames}>
      {name}
    </div>
  );
};

export default Gate;
