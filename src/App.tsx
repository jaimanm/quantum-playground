import { useRef, useEffect, useState } from "react";
import QuantumCircuit from "./components/QuantumCircuit";
import QubitControls from "./components/QubitControls";
import GateLibrary from "./components/GateLibrary";
import DraggedGate from "./components/DraggedGate";
import RunPanel from "./components/RunPanel";
import { PADDING, QUBIT_SPACING } from "./constants/circuit";
import {
  findNextAvailableColumn,
  compactGatesOnQubit,
  generateGateId,
  ensureGateIds,
} from "./utils/circuitUtils";
import type { PlacedGate, DraggedGateInfo, GateAnimation } from "./types";

/**
 * Main App Component
 * Manages the quantum circuit builder state and interactions
 */
export default function App() {
  const [numQubits, setNumQubits] = useState<number>(2);
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([]);
  const [draggedGate, setDraggedGate] = useState<DraggedGateInfo | null>(null);
  const [placeholder, setPlaceholder] = useState<{
    qubit: number;
    col: number;
  } | null>(null);
  const [gateAnimations, setGateAnimations] = useState<GateAnimation[]>([]);
  const circuitContainerRef = useRef<HTMLDivElement>(null);
  const gateLibraryRef = useRef<HTMLDivElement>(null);
  const [isDraggingFromLibrary, setIsDraggingFromLibrary] = useState(false);

  const handleIncreaseQubits = () => {
    if (numQubits < 8) setNumQubits(numQubits + 1);
  };

  const handleDecreaseQubits = () => {
    if (numQubits > 1) {
      const newNumQubits = numQubits - 1;
      // Remove gates that were on the deleted wire
      setPlacedGates((prev) =>
        prev.filter((gate) => gate.qubit < newNumQubits)
      );
      setNumQubits(newNumQubits);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!circuitContainerRef.current) return;

    const rect = circuitContainerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Calculate which qubit the cursor is over
    const closestQubit = Math.round((y - PADDING) / QUBIT_SPACING);
    const qubit = Math.max(0, Math.min(numQubits - 1, closestQubit));

    // Calculate the column where the gate would be placed
    const col = findNextAvailableColumn(qubit, placedGates);

    // Update placeholder
    setPlaceholder({ qubit, col });
  };

  /**
   * Handles dropping a new gate from the library onto the circuit.
   */
  const handleDropOnCircuit = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData("gateType");
    if (!gateType || draggedGate || !circuitContainerRef.current) return; // Only allow drops from library

    const rect = circuitContainerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Find the closest qubit wire to the drop position
    const closestQubit = Math.round((y - PADDING) / QUBIT_SPACING);
    const qubit = Math.max(0, Math.min(numQubits - 1, closestQubit));

    setPlacedGates((prev) => {
      // Ensure all gates have IDs
      const gatesWithIds = ensureGateIds(prev);

      // Find the first available column on this wire
      const col = findNextAvailableColumn(qubit, gatesWithIds);
      const newGates = [...gatesWithIds];
      const newGate: PlacedGate = {
        type: gateType as PlacedGate["type"],
        qubit,
        col,
        id: generateGateId({
          type: gateType as PlacedGate["type"],
          qubit,
          col,
        }),
      };
      newGates.push(newGate);
      return newGates;
    });

    // Clear placeholder
    setPlaceholder(null);
    setIsDraggingFromLibrary(false);
  };

  const handleDragLeave = () => {
    setPlaceholder(null);
  };

  const handleDragStart = () => {
    setIsDraggingFromLibrary(true);
  };

  /**
   * Handles starting a drag from a gate already on the circuit.
   */
  const handleGateMouseDown = (e: React.MouseEvent, gate: PlacedGate) => {
    setDraggedGate({ ...gate, x: e.clientX, y: e.clientY });
  };

  // Global listeners to handle mouse move and mouse up for dragging gates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedGate) {
        // Update the dragged gate's position to follow the cursor
        setDraggedGate((prev) =>
          prev ? { ...prev, x: e.clientX, y: e.clientY } : null
        );

        // Update placeholder position if over circuit
        if (circuitContainerRef.current) {
          const rect = circuitContainerRef.current.getBoundingClientRect();

          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            const y = e.clientY - rect.top;
            const closestQubit = Math.round((y - PADDING) / QUBIT_SPACING);
            const qubit = Math.max(0, Math.min(numQubits - 1, closestQubit));

            // Calculate where the gate would land (excluding the dragged gate itself)
            const gatesWithoutDragged = placedGates.filter(
              (g) =>
                !(g.qubit === draggedGate.qubit && g.col === draggedGate.col)
            );

            let tempGates = gatesWithoutDragged;
            if (qubit !== draggedGate.qubit) {
              const compactResult = compactGatesOnQubit(
                tempGates,
                draggedGate.qubit
              );
              tempGates = compactResult.gates;
            }

            const col = findNextAvailableColumn(qubit, tempGates);
            setPlaceholder({ qubit, col });
          } else {
            setPlaceholder(null);
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (
        !draggedGate ||
        !circuitContainerRef.current ||
        !gateLibraryRef.current
      )
        return;

      const circuitRect = circuitContainerRef.current.getBoundingClientRect();
      const libraryRect = gateLibraryRef.current.getBoundingClientRect();

      // Check if dropped on the library (to delete)
      if (
        e.clientX >= libraryRect.left &&
        e.clientX <= libraryRect.right &&
        e.clientY >= libraryRect.top &&
        e.clientY <= libraryRect.bottom
      ) {
        setPlacedGates((prev) => {
          // Ensure all gates have IDs
          const gatesWithIds = ensureGateIds(prev);

          // Remove the gate
          const gatesAfterRemoval = gatesWithIds.filter(
            (g) => !(g.qubit === draggedGate.qubit && g.col === draggedGate.col)
          );
          // Compact gates on the same qubit to fill the gap
          const compactResult = compactGatesOnQubit(
            gatesAfterRemoval,
            draggedGate.qubit
          );

          // Trigger animations for moved gates
          if (compactResult.movedGates.length > 0) {
            setGateAnimations(
              compactResult.movedGates.map((moved) => ({
                id: moved.id,
                fromCol: moved.fromCol,
                toCol: moved.toCol,
                progress: 0,
              }))
            );
          }

          return compactResult.gates;
        });
      }
      // Check if dropped on the circuit (to move)
      else if (
        e.clientX >= circuitRect.left &&
        e.clientX <= circuitRect.right &&
        e.clientY >= circuitRect.top &&
        e.clientY <= circuitRect.bottom
      ) {
        const y = e.clientY - circuitRect.top;

        const closestQubit = Math.round((y - PADDING) / QUBIT_SPACING);
        const qubit = Math.max(0, Math.min(numQubits - 1, closestQubit));

        setPlacedGates((prev) => {
          // Ensure all gates have IDs
          const gatesWithIds = ensureGateIds(prev);

          // Remove the gate from its current position
          const gatesWithoutDragged = gatesWithIds.filter(
            (g) => !(g.qubit === draggedGate.qubit && g.col === draggedGate.col)
          );

          // If moving to a different qubit, compact the old qubit
          let updatedGates = gatesWithoutDragged;
          if (qubit !== draggedGate.qubit) {
            const compactResult = compactGatesOnQubit(
              updatedGates,
              draggedGate.qubit
            );
            updatedGates = compactResult.gates;

            // Trigger animations for moved gates
            if (compactResult.movedGates.length > 0) {
              setGateAnimations(
                compactResult.movedGates.map((moved) => ({
                  id: moved.id,
                  fromCol: moved.fromCol,
                  toCol: moved.toCol,
                  progress: 0,
                }))
              );
            }
          }

          // Find the next available column on the target qubit
          const col = findNextAvailableColumn(qubit, updatedGates);

          // Add the gate to its new position with an ID
          const newGate: PlacedGate = {
            type: draggedGate.type,
            qubit,
            col,
            id: generateGateId({ type: draggedGate.type, qubit, col }),
          };
          updatedGates.push(newGate);

          return updatedGates;
        });
      }
      // If dropped anywhere else, it snaps back (by doing nothing and just stopping the drag)

      setDraggedGate(null);
      setPlaceholder(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedGate, placedGates, numQubits]);

  // Animation loop for sliding gates
  useEffect(() => {
    if (gateAnimations.length === 0) return;

    const ANIMATION_DURATION = 200; // milliseconds
    const startTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      if (progress < 1) {
        // Update animation progress
        setGateAnimations((prev) =>
          prev.map((anim) => ({ ...anim, progress }))
        );
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setGateAnimations([]);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gateAnimations.length > 0 ? gateAnimations[0]?.id : null]);

  return (
    <div className="bg-gray-900 text-white flex flex-col items-center min-h-screen p-4 font-mono select-none">
      {/* Renders the "ghost" gate that follows the cursor */}
      <DraggedGate gateInfo={draggedGate} />

      <div className="w-full max-w-4xl mx-auto text-center mb-6 mt-4">
        <h1 className="text-4xl font-bold text-cyan-400">Quantum Playground</h1>
        <p className="text-gray-400 mt-2">A visual quantum circuit builder</p>
      </div>

      <div
        ref={circuitContainerRef}
        onDragOver={handleDragOver}
        onDrop={handleDropOnCircuit}
        onDragLeave={handleDragLeave}
        className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-2xl border border-gray-700 relative px-4"
      >
        <QuantumCircuit
          numQubits={numQubits}
          placedGates={placedGates}
          onGateMouseDown={handleGateMouseDown}
          draggedGate={draggedGate}
          placeholder={placeholder}
          gateAnimations={gateAnimations}
        />
        <QubitControls
          numQubits={numQubits}
          onIncrease={handleIncreaseQubits}
          onDecrease={handleDecreaseQubits}
        />
      </div>

      <GateLibrary
        gateLibraryRef={gateLibraryRef}
        onDragStart={handleDragStart}
      />

      <RunPanel numQubits={numQubits} gates={placedGates} />
    </div>
  );
}
