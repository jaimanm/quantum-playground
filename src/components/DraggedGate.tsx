import { GATE_COLORS } from "../constants/circuit";
import type { DraggedGateInfo } from "../types";

interface DraggedGateProps {
  gateInfo: DraggedGateInfo | null;
}

/**
 * Component to render the gate being dragged
 * Shows a "ghost" gate that follows the cursor
 */
const DraggedGate: React.FC<DraggedGateProps> = ({ gateInfo }) => {
  if (!gateInfo) return null;
  const colors = GATE_COLORS[gateInfo.type] || GATE_COLORS.DEFAULT;
  const classNames = `w-14 h-14 rounded-md flex items-center justify-center text-gray-900 font-bold text-2xl shadow-2xl border-2 select-none z-50 ${colors.bg} ${colors.border}`;
  // Renders the gate at the cursor's position
  const style: React.CSSProperties = {
    position: "absolute",
    top: gateInfo.y,
    left: gateInfo.x,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  };

  return (
    <div style={style} className={classNames}>
      {gateInfo.type}
    </div>
  );
};

export default DraggedGate;
