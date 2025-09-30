import { Trash2, Plus, Minus } from "lucide-react";
import { CircuitState, GateType, Gate, GateDefinition } from "../types/circuit";
import { getGateDefinition } from "../data/gateDefinitions";
import { useState, useCallback, useMemo } from "react";

interface CircuitCanvasProps {
  circuit: CircuitState;
  selectedGate: GateType | null;
  draggedGate?: GateType | null;
  pendingMultiQubitGate?: {
    type: GateType;
    qubits: number[];
    position: number;
  } | null;
  onGatePlaced: (qubit: number, position: number) => void;
  onGateDropped?: (
    gateType: GateType,
    qubit: number,
    position: number,
    params?: { [key: string]: number }
  ) => void;
  onGateRemove: (gateId: string) => void;
  onQubitChange: (delta: number) => void;
}

export function CircuitCanvas({
  circuit,
  selectedGate,
  draggedGate,
  pendingMultiQubitGate,
  onGatePlaced,
  onGateDropped,
  onGateRemove,
  onQubitChange,
}: CircuitCanvasProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    qubit: number;
    position: number;
  } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{
    qubit: number;
    position: number;
  } | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    qubit: number;
    position: number;
    gateType: GateType;
  } | null>(null);
  const timeSteps = 20;

  const gatesByPosition = useMemo(() => {
    const map = new Map<number, Gate[]>();
    circuit.gates.forEach((gate) => {
      const existing = map.get(gate.position) ?? [];
      existing.push(gate);
      map.set(gate.position, existing);
    });
    return map;
  }, [circuit.gates]);

  const getGateSpan = (gate: Gate) => {
    const minQubit = Math.min(...gate.qubitIndices);
    const maxQubit = Math.max(...gate.qubitIndices);
    return { minQubit, maxQubit };
  };

  const resolveGateRole = (
    gate: Gate,
    definition: GateDefinition,
    qubitIndex: number
  ): "control" | "target" | "swap" | "body" | "single" | null => {
    const index = gate.qubitIndices.indexOf(qubitIndex);
    if (index === -1) return null;

    if (gate.type === "SWAP") {
      return "swap";
    }

    const controlCount = definition.controlCount ?? 0;

    if (controlCount > 0) {
      if (index < controlCount) {
        return "control";
      }
      return "target";
    }

    if (gate.qubitIndices.length > 1) {
      return "body";
    }

    return "single";
  };

  const gateHasConnectors = (gate: Gate, definition: GateDefinition) =>
    (definition.controlCount ?? 0) > 0 || gate.type === "SWAP";

  const findConnectorInfo = (qubitIndex: number, position: number) => {
    const columnGates = gatesByPosition.get(position) ?? [];
    for (const gate of columnGates) {
      const definition = getGateDefinition(gate.type);
      if (!definition) continue;
      if (!gateHasConnectors(gate, definition)) continue;
      const { minQubit, maxQubit } = getGateSpan(gate);
      if (qubitIndex >= minQubit && qubitIndex <= maxQubit) {
        return { gate, definition };
      }
    }
    return null;
  };

  const handleCellClick = (qubit: number, position: number) => {
    if (selectedGate) {
      onGatePlaced(qubit, position);
    }
  };

  // Find the optimal position by shifting left from hover position until hitting a gate
  const findOptimalPosition = useCallback(
    (qubitIndices: number[], droppedPosition: number) => {
      // Start from dropped position and shift left until we hit an existing gate or reach position 0
      for (let pos = droppedPosition; pos >= 0; pos--) {
        const hasConflict = circuit.gates.some(
          (gate) =>
            gate.position === pos &&
            gate.qubitIndices.some((q) => qubitIndices.includes(q))
        );

        if (hasConflict) {
          // Found a gate, so place at the position right after it
          return pos + 1;
        }
      }

      // No gates found to the left, place at position 0
      return 0;
    },
    [circuit.gates]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, qubit: number, position: number) => {
      e.preventDefault();
      const droppedGateType =
        (e.dataTransfer.getData("gate-type") as GateType) || draggedGate;

      if (droppedGateType && onGateDropped) {
        const gateDef = getGateDefinition(droppedGateType);
        if (!gateDef) return;

        const optimalPosition = findOptimalPosition([qubit], position);

        if (gateDef.numQubits === 1) {
          const params = gateDef.hasParams ? { angle: Math.PI / 4 } : undefined;
          onGateDropped(droppedGateType, qubit, optimalPosition, params);
        } else {
          // For multi-qubit gates, pass to InteractiveBuilder to handle the workflow
          onGateDropped(droppedGateType, qubit, optimalPosition);
        }
      }

      setDragOverCell(null);
      setDragPreview(null);
    },
    [onGateDropped, findOptimalPosition, draggedGate]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, qubit: number, position: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setDragOverCell({ qubit, position });

      // Use the draggedGate prop instead of trying to get from dataTransfer during dragover
      if (draggedGate) {
        const optimalPosition = findOptimalPosition([qubit], position);

        // Show preview for all gate types (single and multi-qubit)
        // For multi-qubit gates, this shows where the first qubit will be placed
        setDragPreview({
          qubit,
          position: optimalPosition,
          gateType: draggedGate,
        });
      }
    },
    [draggedGate, findOptimalPosition]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverCell(null);
    setDragPreview(null);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Circuit Canvas
          </h3>
          <p className="text-sm text-gray-600">
            {dragOverCell
              ? "Drop here to place gate"
              : "Drag gates from library or click to place"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Qubits:</span>
          <button
            onClick={() => onQubitChange(-1)}
            disabled={circuit.numQubits <= 1}
            className="p-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-800 min-w-[2rem] text-center">
            {circuit.numQubits}
          </span>
          <button
            onClick={() => onQubitChange(1)}
            disabled={circuit.numQubits >= 5}
            className="p-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {Array.from({ length: circuit.numQubits }).map((_, qubitIndex) => (
            <div key={qubitIndex} className="flex items-center mb-2">
              <div className="w-16 flex-shrink-0 text-center">
                <span
                  className={`text-sm font-medium ${
                    pendingMultiQubitGate?.qubits.includes(qubitIndex)
                      ? "text-purple-700 font-bold"
                      : "text-gray-700"
                  }`}
                >
                  q{qubitIndex} |0⟩
                  {pendingMultiQubitGate?.qubits.includes(qubitIndex) && (
                    <span className="text-xs text-purple-600 block">•</span>
                  )}
                </span>
              </div>

              <div className="flex-1 flex items-center relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300"></div>
                </div>

                <div className="relative flex w-full">
                  {Array.from({ length: timeSteps }).map((_, position) => {
                    const columnGates = gatesByPosition.get(position) ?? [];
                    const gateInCell = columnGates.find((candidate) =>
                      candidate.qubitIndices.includes(qubitIndex)
                    );
                    const gateDefinition = gateInCell
                      ? getGateDefinition(gateInCell.type)
                      : null;
                    const gateRole =
                      gateInCell && gateDefinition
                        ? resolveGateRole(
                            gateInCell,
                            gateDefinition,
                            qubitIndex
                          )
                        : null;
                    const primaryConnectorInfo =
                      gateInCell &&
                      gateDefinition &&
                      gateHasConnectors(gateInCell, gateDefinition)
                        ? { gate: gateInCell, definition: gateDefinition }
                        : findConnectorInfo(qubitIndex, position);
                    const connectorSpan =
                      primaryConnectorInfo &&
                      gateHasConnectors(
                        primaryConnectorInfo.gate,
                        primaryConnectorInfo.definition
                      )
                        ? getGateSpan(primaryConnectorInfo.gate)
                        : null;
                    const showConnector =
                      connectorSpan !== null &&
                      qubitIndex >= connectorSpan.minQubit &&
                      qubitIndex <= connectorSpan.maxQubit;
                    const connectorColorClass =
                      primaryConnectorInfo?.definition.color ?? "bg-gray-400";
                    const isHovered =
                      hoveredCell?.qubit === qubitIndex &&
                      hoveredCell?.position === position;
                    const isDragPreview =
                      dragPreview?.qubit === qubitIndex &&
                      dragPreview?.position === position;
                    const previewGateDefinition = isDragPreview
                      ? getGateDefinition(dragPreview.gateType)
                      : null;
                    const isPendingQubit =
                      pendingMultiQubitGate?.qubits.includes(qubitIndex);
                    const isControlCell = gateRole === "control";
                    const isTargetCell = gateRole === "target";
                    const isSwapCell = gateRole === "swap";
                    const isBodyCell = gateRole === "body";

                    return (
                      <div
                        key={position}
                        onMouseEnter={() =>
                          setHoveredCell({ qubit: qubitIndex, position })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => handleCellClick(qubitIndex, position)}
                        onDragOver={(e) =>
                          handleDragOver(e, qubitIndex, position)
                        }
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, qubitIndex, position)}
                        className={`flex-1 min-w-[60px] h-16 border-r border-gray-200 cursor-pointer transition-all ${
                          isHovered && selectedGate ? "bg-cyan-50" : ""
                        } ${
                          dragOverCell?.qubit === qubitIndex &&
                          dragOverCell?.position === position
                            ? "bg-yellow-100 border-yellow-300"
                            : ""
                        } ${
                          isDragPreview
                            ? "bg-green-100 border-green-400 border-2"
                            : ""
                        } ${
                          isPendingQubit
                            ? "bg-purple-100 border-purple-300"
                            : ""
                        } ${isControlCell ? "bg-emerald-50" : ""} ${
                          isTargetCell ? "bg-green-50" : ""
                        } ${isSwapCell ? "bg-teal-50" : ""} ${
                          isBodyCell ? "bg-sky-50" : ""
                        } ${
                          showConnector && !gateInCell ? "bg-emerald-50" : ""
                        } ${gateInCell ? "bg-opacity-90" : ""}`}
                      >
                        <div
                          className={`relative h-full flex items-center justify-center ${
                            gateInCell ? "group" : ""
                          }`}
                        >
                          {showConnector && (
                            <div
                              className={`absolute inset-y-2 left-1/2 w-[3px] -translate-x-1/2 rounded-full pointer-events-none ${connectorColorClass}`}
                            ></div>
                          )}

                          {gateInCell && gateDefinition && (
                            <>
                              {gateRole === "control" && (
                                <div className="relative flex items-center justify-center">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${gateDefinition.color}`}
                                  ></div>
                                </div>
                              )}

                              {gateRole === "target" && (
                                <div className="relative flex items-center justify-center">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md ${gateDefinition.color}`}
                                  >
                                    {gateDefinition.icon}
                                  </div>
                                </div>
                              )}

                              {gateRole === "swap" && (
                                <div className="relative flex items-center justify-center">
                                  <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-teal-500 bg-white text-teal-600 text-xl font-semibold shadow-md">
                                    ×
                                  </div>
                                </div>
                              )}

                              {(gateRole === null ||
                                gateRole === "body" ||
                                gateRole === "single") && (
                                <div className="relative flex items-center justify-center">
                                  <div
                                    className={`${gateDefinition.color} text-white font-bold rounded-lg shadow-md px-3 py-2 text-sm`}
                                  >
                                    {gateDefinition.icon}
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onGateRemove(gateInCell.id);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>

                        {!gateInCell &&
                          isDragPreview &&
                          previewGateDefinition && (
                            <div className="relative h-full flex items-center justify-center">
                              <div
                                className={`${previewGateDefinition.color} text-white font-bold rounded-lg shadow-lg px-3 py-2 text-sm opacity-70 animate-pulse border-2 border-green-400`}
                              >
                                {previewGateDefinition.icon}
                              </div>
                              <div className="absolute -top-1 -right-1 text-green-600 text-xs font-bold">
                                ✓
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>

                <div className="w-16 flex-shrink-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-400 rounded flex items-center justify-center text-xs font-medium text-gray-600">
                    M
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {circuit.gates.length === 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Your circuit is empty. Select a gate from the library and click on
            the canvas to place it!
          </p>
        </div>
      )}
    </div>
  );
}
