import { useCallback, useState } from "react";
import { CircuitState, GateType } from "../types/circuit";
import { GateLibrary } from "./GateLibrary";
import { CircuitCanvas } from "./CircuitCanvas";
import { getGateDefinition } from "../data/gateDefinitions";

interface InteractiveBuilderProps {
  circuit: CircuitState;
  onAddGate: (
    type: GateType,
    qubitIndices: number[],
    position: number,
    params?: { [key: string]: number }
  ) => void;
  onRemoveGate: (gateId: string) => void;
  onQubitChange: (delta: number) => void;
}

export function InteractiveBuilder({
  circuit,
  onAddGate,
  onRemoveGate,
  onQubitChange,
}: InteractiveBuilderProps) {
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null);
  const [pendingMultiQubitGate, setPendingMultiQubitGate] = useState<{
    type: GateType;
    qubits: number[];
    position: number;
  } | null>(null);

  const findOptimalPositionForQubits = useCallback(
    (qubitIndices: number[], droppedPosition: number) => {
      for (let pos = droppedPosition; pos >= 0; pos--) {
        const hasConflict = circuit.gates.some(
          (gate) =>
            gate.position === pos &&
            gate.qubitIndices.some((q) => qubitIndices.includes(q))
        );

        if (hasConflict) {
          return pos + 1;
        }
      }

      return 0;
    },
    [circuit.gates]
  );

  const handleGateSelect = (gateType: GateType) => {
    setSelectedGate(gateType);
    setPendingMultiQubitGate(null);
  };

  const handleGatePlaced = (qubit: number, position: number) => {
    if (!selectedGate) return;

    const gateDef = getGateDefinition(selectedGate);
    if (!gateDef) return;

    if (gateDef.numQubits === 1) {
      const optimalPosition = findOptimalPositionForQubits([qubit], position);
      const params = gateDef.hasParams ? { angle: Math.PI / 4 } : undefined;
      onAddGate(selectedGate, [qubit], optimalPosition, params);
      setSelectedGate(null);
    } else if (gateDef.numQubits === 2) {
      if (!pendingMultiQubitGate) {
        // First click: place target gate
        const basePosition = findOptimalPositionForQubits([qubit], position);
        setPendingMultiQubitGate({
          type: selectedGate,
          qubits: [qubit],
          position: basePosition,
        });
      } else {
        // Second click: add control qubit and complete gate
        if (qubit !== pendingMultiQubitGate.qubits[0]) {
          const qubits = [pendingMultiQubitGate.qubits[0], qubit];
          const optimalPosition = findOptimalPositionForQubits(
            qubits,
            pendingMultiQubitGate.position
          );
          onAddGate(selectedGate, qubits, optimalPosition);
        }
        setPendingMultiQubitGate(null);
        setSelectedGate(null);
      }
    } else if (gateDef.numQubits === 3) {
      if (!pendingMultiQubitGate) {
        // First click: place target gate
        const basePosition = findOptimalPositionForQubits([qubit], position);
        setPendingMultiQubitGate({
          type: selectedGate,
          qubits: [qubit],
          position: basePosition,
        });
      } else if (pendingMultiQubitGate.qubits.length === 1) {
        // Second click: add first control qubit
        if (qubit !== pendingMultiQubitGate.qubits[0]) {
          const newQubits = [...pendingMultiQubitGate.qubits, qubit];
          const optimalPosition = findOptimalPositionForQubits(
            newQubits,
            pendingMultiQubitGate.position
          );
          setPendingMultiQubitGate({
            type: selectedGate,
            qubits: newQubits,
            position: optimalPosition,
          });
        }
      } else if (pendingMultiQubitGate.qubits.length === 2) {
        // Third click: add second control qubit and complete gate
        if (!pendingMultiQubitGate.qubits.includes(qubit)) {
          const qubits = [...pendingMultiQubitGate.qubits, qubit];
          const optimalPosition = findOptimalPositionForQubits(
            qubits,
            pendingMultiQubitGate.position
          );
          onAddGate(selectedGate, qubits, optimalPosition);
        }
        setPendingMultiQubitGate(null);
        setSelectedGate(null);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <GateLibrary onGateSelect={handleGateSelect} />
        {(selectedGate || pendingMultiQubitGate) && (
          <div className="mt-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-cyan-900 mb-2">
              {pendingMultiQubitGate
                ? `Placing: ${
                    getGateDefinition(pendingMultiQubitGate.type)?.name
                  }`
                : `Selected: ${getGateDefinition(selectedGate!)?.name}`}
            </p>
            {pendingMultiQubitGate && (
              <p className="text-xs text-cyan-700">
                Placed on qubit {pendingMultiQubitGate.qubits.join(", ")}. Click{" "}
                {getGateDefinition(pendingMultiQubitGate.type)?.numQubits! -
                  pendingMultiQubitGate.qubits.length}{" "}
                more qubit(s) to complete this{" "}
                {getGateDefinition(pendingMultiQubitGate.type)?.name} gate.
              </p>
            )}
            {selectedGate && !pendingMultiQubitGate && (
              <p className="text-xs text-cyan-700">
                Click on the circuit to place this gate.
              </p>
            )}
            <button
              onClick={() => {
                setSelectedGate(null);
                setPendingMultiQubitGate(null);
              }}
              className="mt-2 text-xs text-cyan-600 hover:text-cyan-800 underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-3">
        <CircuitCanvas
          circuit={circuit}
          selectedGate={selectedGate}
          pendingMultiQubitGate={pendingMultiQubitGate}
          onGatePlaced={handleGatePlaced}
          onGateRemove={onRemoveGate}
          onQubitChange={onQubitChange}
        />
      </div>
    </div>
  );
}
