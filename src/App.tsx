import { useRef, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import QuantumCircuit from "./components/QuantumCircuit";
import QubitControls from "./components/QubitControls";
import GateLibrary from "./components/GateLibrary";
import DraggedGate from "./components/DraggedGate";
import RunPanel from "./components/RunPanel";
import {
  PADDING,
  QUBIT_SPACING,
  CIRCUIT_START_X,
  GATE_SIZE,
} from "./constants/circuit";
import {
  findInsertionColumn,
  buildVirtualGapDiff,
  buildGapCloseDiff,
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
  // Virtual layout shows where gates will be after drop (with gap for insertion)
  const [virtualLayout, setVirtualLayout] = useState<PlacedGate[] | null>(null);
  // Track previous placeholder to detect gap changes
  const prevPlaceholderRef = useRef<{ qubit: number; col: number } | null>(
    null
  );
  // Track last mouse position for minimum delta threshold (10px) before gap animation
  const lastGapMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const [gateAnimations, setGateAnimations] = useState<GateAnimation[]>([]);
  const [deletionAnimations, setDeletionAnimations] = useState<
    GateDeletionAnimation[]
  >([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const circuitContainerRef = useRef<HTMLDivElement>(null);
  const gateLibraryRef = useRef<HTMLDivElement>(null);

  // --- Shared helpers to centralize gap logic ---
  const setAnimationsFromMoved = (
    moved: Array<{ id: string; fromCol: number; toCol: number }>
  ) => {
    if (!moved || moved.length === 0) return;
    setGateAnimations(
      moved.map((m) => ({
        id: m.id,
        fromCol: m.fromCol,
        toCol: m.toCol,
        progress: 0,
      }))
    );
  };

  const applyGapAt = (
    qubit: number,
    col: number,
    dragged: { qubit: number; col: number } | null,
    mouseX: number,
    mouseY: number
  ) => {
    const prevPh = prevPlaceholderRef.current;
    const changed = !prevPh || prevPh.qubit !== qubit || prevPh.col !== col;
    if (!changed) return;

    // Minimum cursor movement threshold (10px) to avoid jitter
    const lastPos = lastGapMousePosRef.current;
    if (lastPos) {
      const deltaX = Math.abs(mouseX - lastPos.x);
      const deltaY = Math.abs(mouseY - lastPos.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < 10) return; // Skip if cursor moved less than 10px
    }
    lastGapMousePosRef.current = { x: mouseX, y: mouseY };

    const diff = buildVirtualGapDiff(
      placedGates,
      virtualLayout,
      qubit,
      col,
      dragged
    );
    setAnimationsFromMoved(diff.movedGates);
    setPlaceholder({ qubit, col });
    prevPlaceholderRef.current = { qubit, col };
    setVirtualLayout(diff.virtualGates);
  };

  const animateCloseGap = () => {
    const moved = buildGapCloseDiff(placedGates, virtualLayout);
    setAnimationsFromMoved(moved);
    prevPlaceholderRef.current = null;
    lastGapMousePosRef.current = null; // Reset mouse position tracking
    setPlaceholder(null);
    setVirtualLayout(null);
  };

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which qubit the cursor is over
    const closestQubit = Math.round((y - PADDING) / QUBIT_SPACING);
    const qubit = Math.max(0, Math.min(numQubits - 1, closestQubit));

    // Calculate insertion column based on cursor X position (smartphone-style)
    const col = findInsertionColumn(
      x,
      qubit,
      placedGates,
      CIRCUIT_START_X,
      GATE_SIZE
    );

    // Apply or move gap for library drag using shared helper
    applyGapAt(qubit, col, null, e.clientX, e.clientY);
  };

  /**
   * Handles dropping a new gate from the library onto the circuit.
   */
  const handleDropOnCircuit = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData("gateType");
    if (!gateType || draggedGate || !circuitContainerRef.current) return; // Only allow drops from library

    const rect = circuitContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find the closest qubit wire to the drop position
    const closestQubit = Math.round((y - PADDING) / QUBIT_SPACING);
    const qubit = Math.max(0, Math.min(numQubits - 1, closestQubit));

    setPlacedGates((prev) => {
      // Ensure all gates have IDs
      const gatesWithIds = ensureGateIds(prev);

      // Calculate insertion column based on cursor X position
      const insertionIndex = findInsertionColumn(
        x,
        qubit,
        gatesWithIds,
        CIRCUIT_START_X,
        GATE_SIZE
      );

      // Get gates on target qubit, sorted
      const gatesOnQubit = gatesWithIds
        .filter((g) => g.qubit === qubit)
        .sort((a, b) => a.col - b.col);
      const otherGates = gatesWithIds.filter((g) => g.qubit !== qubit);

      // Create the new gate
      const newGate: PlacedGate = {
        type: gateType as PlacedGate["type"],
        qubit,
        col: insertionIndex,
        id: generateGateId({
          type: gateType as PlacedGate["type"],
          qubit,
          col: insertionIndex,
        }),
      };

      // Rebuild gates on qubit with proper column indices
      const updatedGatesOnQubit = [
        ...gatesOnQubit
          .slice(0, insertionIndex)
          .map((g, i) => ({ ...g, col: i })),
        newGate,
        ...gatesOnQubit
          .slice(insertionIndex)
          .map((g, i) => ({ ...g, col: i + insertionIndex + 1 })),
      ];

      return [...otherGates, ...updatedGatesOnQubit];
    });

    // Clear placeholder and virtual layout
    prevPlaceholderRef.current = null;
    setPlaceholder(null);
    setVirtualLayout(null);
  };

  const handleDragLeave = () => {
    // If a gap exists (library drag), animate closing using shared helper
    if (!draggedGate && virtualLayout && virtualLayout.length > 0) {
      animateCloseGap();
    } else {
      prevPlaceholderRef.current = null;
      setPlaceholder(null);
      setVirtualLayout(null);
    }
  };

  /**
   * Handles starting a drag from a gate already on the circuit.
   */
  const handleGateMouseDown = (e: React.MouseEvent, gate: PlacedGate) => {
    setDraggedGate({ ...gate, x: e.clientX, y: e.clientY });

    // Immediately create virtual layout with the dragged gate removed and compacted
    // to prevent "black hole" effect
    const gatesWithIds = ensureGateIds(placedGates);
    const gatesWithoutDragged = gatesWithIds.filter(
      (g) => !(g.qubit === gate.qubit && g.col === gate.col)
    );

    // Compact the qubit to close the gap left by the dragged gate
    const compactResult = compactGatesOnQubit(gatesWithoutDragged, gate.qubit);
    setVirtualLayout(compactResult.gates);
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

        // Update placeholder position and virtual layout if over circuit
        if (circuitContainerRef.current) {
          const rect = circuitContainerRef.current.getBoundingClientRect();

          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const closestQubit = Math.round((y - PADDING) / QUBIT_SPACING);
            const qubit = Math.max(0, Math.min(numQubits - 1, closestQubit));

            // Calculate insertion column based on cursor X position (smartphone-style)
            const col = findInsertionColumn(
              x,
              qubit,
              placedGates,
              CIRCUIT_START_X,
              GATE_SIZE
            );

            // Apply or move gap for circuit drag using shared helper
            applyGapAt(qubit, col, draggedGate, e.clientX, e.clientY);
          } else {
            // When leaving circuit, animate closing the gap via shared helper
            if (virtualLayout && virtualLayout.length > 0) {
              animateCloseGap();
            } else {
              prevPlaceholderRef.current = null;
              setPlaceholder(null);
              setVirtualLayout(null);
            }
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
        const x = e.clientX - circuitRect.left;
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

          // Calculate insertion column based on cursor position
          const insertionIndex = findInsertionColumn(
            x,
            qubit,
            gatesWithoutDragged,
            CIRCUIT_START_X,
            GATE_SIZE
          );

          // Get gates on target qubit, sorted
          const gatesOnQubit = gatesWithoutDragged
            .filter((g) => g.qubit === qubit)
            .sort((a, b) => a.col - b.col);
          const otherGates = gatesWithoutDragged.filter(
            (g) => g.qubit !== qubit
          );

          // Insert the gate at the insertion point and reassign columns
          const newGate: PlacedGate = {
            type: draggedGate.type,
            qubit,
            col: insertionIndex, // Will be in sequence
            id:
              draggedGate.id ||
              generateGateId({
                type: draggedGate.type,
                qubit,
                col: insertionIndex,
              }),
          };

          // Rebuild gates on qubit with proper column indices
          const updatedGatesOnQubit = [
            ...gatesOnQubit
              .slice(0, insertionIndex)
              .map((g, i) => ({ ...g, col: i })),
            newGate,
            ...gatesOnQubit
              .slice(insertionIndex)
              .map((g, i) => ({ ...g, col: i + insertionIndex + 1 })),
          ];

          // If moving from a different qubit, compact the old qubit
          let finalGates = [...otherGates, ...updatedGatesOnQubit];
          if (qubit !== draggedGate.qubit) {
            const compactResult = compactGatesOnQubit(
              finalGates,
              draggedGate.qubit
            );
            finalGates = compactResult.gates;

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

          return finalGates;
        });
      }
      // If dropped anywhere else, it snaps back (by doing nothing and just stopping the drag)

      prevPlaceholderRef.current = null;
      setDraggedGate(null);
      setPlaceholder(null);
      setVirtualLayout(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedGate, placedGates, numQubits, placeholder]);

  // Animation loop for sliding gates
  useEffect(() => {
    if (gateAnimations.length === 0) return;

    const ANIMATION_DURATION = 200; // milliseconds
    const startTime = Date.now();
    let animationFrameId: number;

    // Ease-out cubic easing function for smooth deceleration
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const linearProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = easeOutCubic(linearProgress);

      if (linearProgress < 1) {
        // Update animation progress with easing
        setGateAnimations((prev) =>
          prev.map((anim) => ({ ...anim, progress: easedProgress }))
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
          placedGates={virtualLayout || placedGates}
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
