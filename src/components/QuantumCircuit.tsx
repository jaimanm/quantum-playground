import { useRef, useEffect } from "react";
import type { PlacedGate, DraggedGateInfo, GateAnimation } from "../types";
import {
  PADDING,
  QUBIT_SPACING,
  GATE_SIZE,
  CIRCUIT_START_X,
  GATE_MARGIN,
  GATE_COLORS,
} from "../constants/circuit";

interface QuantumCircuitProps {
  numQubits: number;
  placedGates: PlacedGate[];
  onGateMouseDown: (e: React.MouseEvent, gate: PlacedGate) => void;
  draggedGate: DraggedGateInfo | null;
  placeholder: { qubit: number; col: number } | null;
  gateAnimations: GateAnimation[];
}

/**
 * Reusable Quantum Circuit Component
 * Renders the quantum circuit on a canvas element
 */
const QuantumCircuit: React.FC<QuantumCircuitProps> = ({
  numQubits,
  placedGates,
  onGateMouseDown,
  draggedGate,
  placeholder,
  gateAnimations,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const LINE_COLOR = "#9ca3af"; // gray-400
    const TEXT_COLOR = "#e5e7eb"; // gray-200
    const GATE_TEXT_COLOR = "#1f2937"; // gray-800
    const GATE_BORDER_WIDTH = 2;
    const GATE_CORNER_RADIUS = 6;
    const LINE_WIDTH = 2;

    /**
     * Helper function to draw a rounded rectangle path.
     */
    const roundedRectPath = (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const drawCircuit = () => {
      const width = parent.clientWidth;
      // Calculate height based on the number of qubits
      const height = (numQubits - 1) * QUBIT_SPACING + 2 * PADDING;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = LINE_WIDTH;
      ctx.font = "18px monospace";
      ctx.fillStyle = TEXT_COLOR;
      const endX = width - PADDING;

      // Draw variable number of qubit wires
      for (let i = 0; i < numQubits; i++) {
        const y = PADDING + i * QUBIT_SPACING;
        ctx.beginPath();
        ctx.moveTo(CIRCUIT_START_X, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
        // Adjust text position for multi-digit qubit labels
        ctx.fillText(`q${i}`, PADDING - 25, y + 6);
      }

      // Draw Placed Gates
      placedGates.forEach((gate) => {
        // Don't draw the gate being actively dragged from the circuit
        if (
          draggedGate &&
          draggedGate.qubit === gate.qubit &&
          draggedGate.col === gate.col
        )
          return;

        // Check if this gate is animating
        const animation = gateAnimations.find((anim) => anim.id === gate.id);
        let effectiveCol = gate.col;

        if (animation) {
          // Interpolate between fromCol and toCol based on progress
          // Use easeOutCubic for smooth deceleration
          const easeProgress = 1 - Math.pow(1 - animation.progress, 3);
          effectiveCol =
            animation.fromCol +
            (animation.toCol - animation.fromCol) * easeProgress;
        }

        const gateCellX = CIRCUIT_START_X + effectiveCol * GATE_SIZE;
        const gateCellY = PADDING + gate.qubit * QUBIT_SPACING - GATE_SIZE / 2;

        // Apply margin to get the gate's visual position
        const drawnGateX = gateCellX + GATE_MARGIN;
        const drawnGateY = gateCellY + GATE_MARGIN;
        const drawnGateSize = GATE_SIZE - GATE_MARGIN * 2;

        const colors = GATE_COLORS[gate.type] || GATE_COLORS.DEFAULT;

        // Draw the rounded rectangle
        roundedRectPath(
          drawnGateX,
          drawnGateY,
          drawnGateSize,
          drawnGateSize,
          GATE_CORNER_RADIUS
        );

        ctx.fillStyle = colors.canvasBg;
        ctx.fill();
        ctx.strokeStyle = colors.canvasBorder;
        ctx.lineWidth = GATE_BORDER_WIDTH;
        ctx.stroke();

        // Draw gate text
        ctx.fillStyle = GATE_TEXT_COLOR;
        ctx.font = "bold 24px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          gate.type,
          gateCellX + GATE_SIZE / 2,
          gateCellY + GATE_SIZE / 2
        );
      });

      // Draw Placeholder
      if (placeholder) {
        const placeholderCellX = CIRCUIT_START_X + placeholder.col * GATE_SIZE;
        const placeholderCellY =
          PADDING + placeholder.qubit * QUBIT_SPACING - GATE_SIZE / 2;

        const drawnPlaceholderX = placeholderCellX + GATE_MARGIN;
        const drawnPlaceholderY = placeholderCellY + GATE_MARGIN;
        const drawnPlaceholderSize = GATE_SIZE - GATE_MARGIN * 2;

        // Draw dashed outline for placeholder
        roundedRectPath(
          drawnPlaceholderX,
          drawnPlaceholderY,
          drawnPlaceholderSize,
          drawnPlaceholderSize,
          GATE_CORNER_RADIUS
        );

        ctx.fillStyle = "rgba(103, 232, 249, 0.2)"; // Very light cyan
        ctx.fill();
        ctx.strokeStyle = "#67e8f9"; // cyan-400
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line
        ctx.stroke();
        ctx.setLineDash([]); // Reset to solid line
      }
    };

    drawCircuit();
    // Redraw on window resize
    window.addEventListener("resize", drawCircuit);
    return () => window.removeEventListener("resize", drawCircuit);
  }, [placedGates, draggedGate, numQubits, placeholder, gateAnimations]); // Redraw when state changes

  /**
   * Handles mouse down on the canvas to check if a gate was clicked.
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if the click is on any placed gate
    for (const gate of placedGates) {
      const gateCellY = PADDING + gate.qubit * QUBIT_SPACING - GATE_SIZE / 2;
      const hitboxX = CIRCUIT_START_X + gate.col * GATE_SIZE + GATE_MARGIN;
      const hitboxY = gateCellY + GATE_MARGIN;
      const hitboxSize = GATE_SIZE - GATE_MARGIN * 2;
      if (
        x >= hitboxX &&
        x <= hitboxX + hitboxSize &&
        y >= hitboxY &&
        y <= hitboxY + hitboxSize
      ) {
        onGateMouseDown(e, gate);
        break;
      }
    }
  };

  /**
   * Handles mouse move on the canvas to update cursor style.
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if the mouse is over any placed gate
    let isOverGate = false;
    for (const gate of placedGates) {
      const gateCellY = PADDING + gate.qubit * QUBIT_SPACING - GATE_SIZE / 2;
      const hitboxX = CIRCUIT_START_X + gate.col * GATE_SIZE + GATE_MARGIN;
      const hitboxY = gateCellY + GATE_MARGIN;
      const hitboxSize = GATE_SIZE - GATE_MARGIN * 2;
      if (
        x >= hitboxX &&
        x <= hitboxX + hitboxSize &&
        y >= hitboxY &&
        y <= hitboxY + hitboxSize
      ) {
        isOverGate = true;
        break;
      }
    }

    // Update cursor style
    canvasRef.current.style.cursor = isOverGate ? "grab" : "default";
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    ></canvas>
  );
};

export default QuantumCircuit;
