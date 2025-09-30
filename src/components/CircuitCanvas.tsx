import { Trash2, Plus, Minus } from 'lucide-react';
import { CircuitState, GateType } from '../types/circuit';
import { getGateDefinition } from '../data/gateDefinitions';
import { useState } from 'react';

interface CircuitCanvasProps {
  circuit: CircuitState;
  selectedGate: GateType | null;
  onGatePlaced: (qubit: number, position: number) => void;
  onGateRemove: (gateId: string) => void;
  onQubitChange: (delta: number) => void;
}

export function CircuitCanvas({
  circuit,
  selectedGate,
  onGatePlaced,
  onGateRemove,
  onQubitChange,
}: CircuitCanvasProps) {
  const [hoveredCell, setHoveredCell] = useState<{ qubit: number; position: number } | null>(null);
  const timeSteps = 20;

  const handleCellClick = (qubit: number, position: number) => {
    if (selectedGate) {
      onGatePlaced(qubit, position);
    }
  };

  const getGateAtPosition = (qubit: number, position: number) => {
    return circuit.gates.find(
      (gate) => gate.position === position && gate.qubitIndices.includes(qubit)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Circuit Canvas</h3>
          <p className="text-sm text-gray-600">Click cells to place gates</p>
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
                <span className="text-sm font-medium text-gray-700">
                  q{qubitIndex} |0⟩
                </span>
              </div>

              <div className="flex-1 flex items-center relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300"></div>
                </div>

                <div className="relative flex w-full">
                  {Array.from({ length: timeSteps }).map((_, position) => {
                    const gate = getGateAtPosition(qubitIndex, position);
                    const isHovered =
                      hoveredCell?.qubit === qubitIndex && hoveredCell?.position === position;
                    const gateDefinition = gate ? getGateDefinition(gate.type) : null;

                    return (
                      <div
                        key={position}
                        onMouseEnter={() => setHoveredCell({ qubit: qubitIndex, position })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => handleCellClick(qubitIndex, position)}
                        className={`flex-1 min-w-[60px] h-16 border-r border-gray-200 cursor-pointer transition-all ${
                          isHovered && selectedGate ? 'bg-cyan-50' : ''
                        } ${gate ? 'bg-opacity-90' : ''}`}
                      >
                        {gate && gateDefinition && (
                          <div className="relative h-full flex items-center justify-center group">
                            <div
                              className={`${gateDefinition.color} text-white font-bold rounded-lg shadow-md px-3 py-2 text-sm`}
                            >
                              {gateDefinition.icon}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGateRemove(gate.id);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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
            Your circuit is empty. Select a gate from the library and click on the canvas to place it!
          </p>
        </div>
      )}
    </div>
  );
}
