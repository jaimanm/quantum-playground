import { Trash2, Plus, Minus } from "lucide-react";
import { CircuitState, GateType, Gate, GateDefinition } from "../types/circuit";
import { getGateDefinition } from "../data/gateDefinitions";
import { useState, useCallback, useMemo } from "react";

interface CircuitCanvasProps {
  circuit: CircuitState;
  selectedGate: GateType | null;
  pendingMultiQubitGate?: {
    type: GateType;
    qubits: number[];
    position: number;
  } | null;
  onGatePlaced: (qubit: number, position: number) => void;
  onGateRemove: (gateId: string) => void;
  onQubitChange: (delta: number) => void;
}

export function CircuitCanvas({
  circuit,
  selectedGate,
  pendingMultiQubitGate,
  onGatePlaced,
  onGateRemove,
  onQubitChange,
}: CircuitCanvasProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    qubit: number;
    position: number;
  } | null>(null);
  const [hoverPreview, setHoverPreview] = useState<{
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

  const handleCellHover = (qubit: number, position: number) => {
    setHoveredCell({ qubit, position });
    if (selectedGate) {
      // Find optimal position for preview
      let optimalPosition = position;
      for (let pos = position; pos >= 0; pos--) {
        const hasConflict = circuit.gates.some(
          (gate) => gate.position === pos && gate.qubitIndices.includes(qubit)
        );
        if (hasConflict) {
          optimalPosition = pos + 1;
          break;
        } else {
          optimalPosition = pos;
        }
      }
      setHoverPreview({
        qubit,
        position: optimalPosition,
        gateType: selectedGate,
      });
    } else {
      setHoverPreview(null);
    }
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
    setHoverPreview(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Circuit Canvas
          </h3>
          <p className="text-sm text-gray-600">
            {selectedGate
              ? "Click on a qubit row to place the selected gate"
              : "Select a gate from the library and click on the canvas to place it"}
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
                    const isHoverPreview =
                      hoverPreview?.qubit === qubitIndex &&
                      hoverPreview?.position === position;
                    const hoverPreviewGateDefinition = isHoverPreview
                      ? getGateDefinition(hoverPreview.gateType)
                      : null;
                    const isPendingQubit =
                      pendingMultiQubitGate?.qubits.includes(qubitIndex);
                    const showPendingConnector =
                      pendingMultiQubitGate &&
                      pendingMultiQubitGate.position === position &&
                      (() => {
                        const gateDef = getGateDefinition(
                          pendingMultiQubitGate.type
                        );
                        return (
                          gateDef &&
                          ((gateDef.controlCount ?? 0) > 0 ||
                            pendingMultiQubitGate.type === "SWAP")
                        );
                      })() &&
                      pendingMultiQubitGate.qubits.includes(qubitIndex);
                    const pendingConnectorColor = pendingMultiQubitGate
                      ? getGateDefinition(pendingMultiQubitGate.type)?.color ??
                        "bg-gray-400"
                      : "bg-gray-400";
                    const isControlPreview =
                      pendingMultiQubitGate &&
                      isHovered &&
                      !pendingMultiQubitGate.qubits.includes(qubitIndex) &&
                      hoveredCell?.qubit === qubitIndex;
                    const isControlCell = gateRole === "control";
                    const isTargetCell = gateRole === "target";
                    const isSwapCell = gateRole === "swap";
                    const isBodyCell = gateRole === "body";

                    return (
                      <div
                        key={position}
                        onMouseEnter={() =>
                          handleCellHover(qubitIndex, position)
                        }
                        onMouseLeave={handleCellLeave}
                        onClick={() => handleCellClick(qubitIndex, position)}
                        className={`flex-1 min-w-[60px] h-16 border-r border-gray-200 cursor-pointer transition-all ${
                          isHovered && selectedGate ? "bg-cyan-50" : ""
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

                          {showPendingConnector && (
                            <div
                              className={`absolute inset-y-2 left-1/2 w-[3px] -translate-x-1/2 rounded-full pointer-events-none ${pendingConnectorColor} opacity-70`}
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
                          isHoverPreview &&
                          hoverPreviewGateDefinition && (
                            <div className="relative h-full flex items-center justify-center">
                              <div
                                className={`${hoverPreviewGateDefinition.color} text-white font-bold rounded-lg shadow-lg px-3 py-2 text-sm opacity-70 animate-pulse border-2 border-cyan-400`}
                              >
                                {hoverPreviewGateDefinition.icon}
                              </div>
                              <div className="absolute -top-1 -right-1 text-cyan-600 text-xs font-bold">
                                ✓
                              </div>
                            </div>
                          )}

                        {!gateInCell &&
                          pendingMultiQubitGate &&
                          pendingMultiQubitGate.position === position &&
                          pendingMultiQubitGate.qubits.includes(qubitIndex) &&
                          (() => {
                            const gateDef = getGateDefinition(
                              pendingMultiQubitGate.type
                            );
                            if (!gateDef) return null;
                            const index =
                              pendingMultiQubitGate.qubits.indexOf(qubitIndex);
                            const controlCount = gateDef.controlCount ?? 0;
                            let role: string;
                            if (pendingMultiQubitGate.type === "SWAP") {
                              role = "swap";
                            } else if (controlCount > 0) {
                              if (index < controlCount) {
                                role = "control";
                              } else {
                                role = "target";
                              }
                            } else if (
                              pendingMultiQubitGate.qubits.length > 1
                            ) {
                              role = "body";
                            } else {
                              role = "single";
                            }
                            return (
                              <div className="relative h-full flex items-center justify-center">
                                {role === "control" && (
                                  <div className="w-4 h-4 rounded-full border-2 border-cyan-500 bg-white shadow-md opacity-70"></div>
                                )}
                                {role === "target" && (
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md ${gateDef.color} opacity-70`}
                                  >
                                    {gateDef.icon}
                                  </div>
                                )}
                                {role === "swap" && (
                                  <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-teal-500 bg-white text-teal-600 text-xl font-semibold shadow-md opacity-70">
                                    ×
                                  </div>
                                )}
                                {(role === "body" || role === "single") && (
                                  <div
                                    className={`${gateDef.color} text-white font-bold rounded-lg shadow-lg px-3 py-2 text-sm opacity-70 border-2 border-cyan-400`}
                                  >
                                    {gateDef.icon}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                        {!gateInCell && isControlPreview && (
                          <div className="relative h-full flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full border-2 border-cyan-500 bg-white shadow-md"></div>
                            <div className="absolute -top-1 -right-1 text-cyan-600 text-xs font-bold">
                              •
                            </div>
                            {/* Vertical line connecting to target gate */}
                            {(() => {
                              const targetQubit =
                                pendingMultiQubitGate!.qubits[0];
                              const targetPosition =
                                pendingMultiQubitGate!.position;
                              const currentPosition = position;
                              if (currentPosition === targetPosition) {
                                const distance = Math.abs(
                                  qubitIndex - targetQubit
                                );
                                const isAbove = qubitIndex < targetQubit;
                                return (
                                  <div
                                    className="absolute left-1/2 w-[3px] bg-cyan-500 -translate-x-1/2 pointer-events-none"
                                    style={{
                                      top: isAbove ? "100%" : "auto",
                                      bottom: isAbove ? "auto" : "100%",
                                      height: `${distance * 64 + 16}px`, // 64px per qubit row + 16px spacing
                                    }}
                                  ></div>
                                );
                              }
                              return null;
                            })()}
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
