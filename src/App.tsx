import { useRef, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
import type {
  PlacedGate,
  DraggedGateInfo,
  GateAnimation,
  GateDeletionAnimation,
} from "./types";

/**
 * Main App Component
 * Manages the quantum circuit builder state and interactions
 */
export default function App() {
  const [numQubits, setNumQubits] = useState<number>(() => {
    const saved = localStorage.getItem("quantum-numQubits");
    return saved ? parseInt(saved, 10) : 2;
  });
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>(() => {
    const saved = localStorage.getItem("quantum-placedGates");
    return saved ? JSON.parse(saved) : [];
  });
  const [draggedGate, setDraggedGate] = useState<DraggedGateInfo | null>(null);
  const [placeholder, setPlaceholder] = useState<{
    qubit: number;
    col: number;
  } | null>(null);
  const [gateAnimations, setGateAnimations] = useState<GateAnimation[]>([]);
  const [deletionAnimations, setDeletionAnimations] = useState<
    GateDeletionAnimation[]
  >([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const circuitContainerRef = useRef<HTMLDivElement>(null);
  const gateLibraryRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever circuit changes
  useEffect(() => {
    localStorage.setItem("quantum-numQubits", numQubits.toString());
  }, [numQubits]);

  useEffect(() => {
    localStorage.setItem("quantum-placedGates", JSON.stringify(placedGates));
  }, [placedGates]);

  const handleClearCircuit = () => {
    if (placedGates.length === 0) return;
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    setPlacedGates([]);
    setShowClearConfirm(false);
  };

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
  };

  const handleDragLeave = () => {
    setPlaceholder(null);
  };

  /**
   * Handles starting a drag from a gate already on the circuit.
   */
  const handleGateMouseDown = (e: React.MouseEvent, gate: PlacedGate) => {
    setDraggedGate({ ...gate, x: e.clientX, y: e.clientY });
  };

  /**
   * Handles right-click on a gate to delete it with animation
   */
  const handleGateContextMenu = (e: React.MouseEvent, gate: PlacedGate) => {
    e.preventDefault(); // Prevent browser context menu

    if (!gate.id) return;

    // Start deletion animation
    setDeletionAnimations((prev) => [...prev, { id: gate.id!, progress: 0 }]);

    // Wait for animation to complete before removing gate
    setTimeout(() => {
      setPlacedGates((prev) => {
        const gatesWithIds = ensureGateIds(prev);

        // Remove the gate
        const gatesAfterRemoval = gatesWithIds.filter((g) => g.id !== gate.id);

        // Compact gates on the same qubit to fill the gap
        const compactResult = compactGatesOnQubit(
          gatesAfterRemoval,
          gate.qubit
        );

        // Trigger slide animations for moved gates
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

      // Remove deletion animation
      setDeletionAnimations((prev) =>
        prev.filter((anim) => anim.id !== gate.id)
      );
    }, 300); // Match animation duration
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

            // Calculate column based on current placed gates
            const col = findNextAvailableColumn(qubit, placedGates);

            // Only update placeholder if position actually changed
            setPlaceholder((prev) => {
              if (prev && prev.qubit === qubit && prev.col === col) {
                return prev; // No change, avoid re-render
              }
              return { qubit, col };
            });
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

          // Find the next available column on the target qubit (before compaction)
          const col = findNextAvailableColumn(qubit, gatesWithoutDragged);

          // Add the gate to its new position - REUSE the existing ID
          const newGate: PlacedGate = {
            type: draggedGate.type,
            qubit,
            col,
            id:
              draggedGate.id ||
              generateGateId({ type: draggedGate.type, qubit, col }),
          };
          const gatesWithNew = [...gatesWithoutDragged, newGate];

          // Compact the qubit (only if moving on same qubit, otherwise skip)
          // This ensures the moved gate slides left with the others
          let updatedGates = gatesWithNew;
          if (qubit === draggedGate.qubit) {
            const compactResult = compactGatesOnQubit(gatesWithNew, qubit);
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
          } else {
            // If moving to a different qubit, compact the old qubit
            const compactResult = compactGatesOnQubit(
              gatesWithoutDragged,
              draggedGate.qubit
            );
            // compactResult.gates already contains:
            // 1. Gates NOT on the old qubit (includes gates on the new qubit)
            // 2. Compacted gates from the old qubit
            // So we just need to add the new gate
            updatedGates = [...compactResult.gates, newGate];

            // Trigger animations for moved gates on the old qubit
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

  // Animation loop for deletion animations
  useEffect(() => {
    if (deletionAnimations.length === 0) return;

    const ANIMATION_DURATION = 300; // milliseconds
    const startTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      setDeletionAnimations((prev) =>
        prev.map((anim) => ({ ...anim, progress }))
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [deletionAnimations.length > 0 ? deletionAnimations[0]?.id : null]);

  return (
    <div className="bg-gray-900 text-white flex flex-col items-center min-h-screen p-4 font-mono select-none">
      {/* Renders the "ghost" gate that follows the cursor */}
      <DraggedGate gateInfo={draggedGate} />

      {/* Clear Circuit Confirmation Modal */}
      <Dialog.Root open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 z-50">
            <Dialog.Title className="text-xl font-bold text-white mb-3">
              Clear Circuit
            </Dialog.Title>
            <Dialog.Description className="text-gray-300 mb-6">
              Are you sure you want to clear all gates from the circuit? This
              action cannot be undone.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">Quantum Playground</h1>
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
          onGateContextMenu={handleGateContextMenu}
          draggedGate={draggedGate}
          placeholder={placeholder}
          gateAnimations={gateAnimations}
          deletionAnimations={deletionAnimations}
        />
        <QubitControls
          numQubits={numQubits}
          onIncrease={handleIncreaseQubits}
          onDecrease={handleDecreaseQubits}
          onClear={handleClearCircuit}
          hasGates={placedGates.length > 0}
        />
      </div>

      <GateLibrary gateLibraryRef={gateLibraryRef} />

      <RunPanel numQubits={numQubits} gates={placedGates} />
    </div>
  );
}
