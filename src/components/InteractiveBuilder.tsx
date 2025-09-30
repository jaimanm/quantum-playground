import { useState } from 'react';
import { CircuitState, GateType } from '../types/circuit';
import { GateLibrary } from './GateLibrary';
import { CircuitCanvas } from './CircuitCanvas';
import { getGateDefinition } from '../data/gateDefinitions';

interface InteractiveBuilderProps {
  circuit: CircuitState;
  onAddGate: (type: GateType, qubitIndices: number[], position: number, params?: { [key: string]: number }) => void;
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
  } | null>(null);

  const handleGateSelect = (gateType: GateType) => {
    setSelectedGate(gateType);
    setPendingMultiQubitGate(null);
  };

  const handleGatePlaced = (qubit: number, position: number) => {
    if (!selectedGate) return;

    const gateDef = getGateDefinition(selectedGate);
    if (!gateDef) return;

    if (gateDef.numQubits === 1) {
      const params = gateDef.hasParams ? { angle: Math.PI / 4 } : undefined;
      onAddGate(selectedGate, [qubit], position, params);
      setSelectedGate(null);
    } else if (gateDef.numQubits === 2) {
      if (!pendingMultiQubitGate) {
        setPendingMultiQubitGate({
          type: selectedGate,
          qubits: [qubit],
        });
      } else {
        if (qubit !== pendingMultiQubitGate.qubits[0]) {
          onAddGate(selectedGate, [pendingMultiQubitGate.qubits[0], qubit], position);
        }
        setPendingMultiQubitGate(null);
        setSelectedGate(null);
      }
    } else if (gateDef.numQubits === 3) {
      if (!pendingMultiQubitGate) {
        setPendingMultiQubitGate({
          type: selectedGate,
          qubits: [qubit],
        });
      } else if (pendingMultiQubitGate.qubits.length === 1) {
        if (qubit !== pendingMultiQubitGate.qubits[0]) {
          setPendingMultiQubitGate({
            type: selectedGate,
            qubits: [...pendingMultiQubitGate.qubits, qubit],
          });
        }
      } else if (pendingMultiQubitGate.qubits.length === 2) {
        if (!pendingMultiQubitGate.qubits.includes(qubit)) {
          onAddGate(
            selectedGate,
            [...pendingMultiQubitGate.qubits, qubit],
            position
          );
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
        {selectedGate && (
          <div className="mt-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-cyan-900 mb-2">
              Selected: {getGateDefinition(selectedGate)?.name}
            </p>
            {pendingMultiQubitGate && (
              <p className="text-xs text-cyan-700">
                Selected {pendingMultiQubitGate.qubits.length} qubit(s). Click{' '}
                {getGateDefinition(selectedGate)?.numQubits! - pendingMultiQubitGate.qubits.length}{' '}
                more.
              </p>
            )}
            {!pendingMultiQubitGate && (
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
          onGatePlaced={handleGatePlaced}
          onGateRemove={onRemoveGate}
          onQubitChange={onQubitChange}
        />
      </div>
    </div>
  );
}
