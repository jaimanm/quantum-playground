import { Check, Zap, Cpu, Atom } from 'lucide-react';
import { QuantumComputerType } from '../types/circuit';
import { quantumComputers } from '../data/quantumComputers';

interface QuantumComputerSelectorProps {
  selected: QuantumComputerType;
  onSelect: (type: QuantumComputerType) => void;
}

const icons = {
  simulator: Zap,
  'ion-trap': Atom,
  superconducting: Cpu,
};

export function QuantumComputerSelector({
  selected,
  onSelect,
}: QuantumComputerSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Select Quantum Computer</h3>
        <p className="text-sm text-gray-600 mt-1">
          Choose where to run your quantum circuit
        </p>
      </div>

      <div className="space-y-3">
        {quantumComputers.map((qc) => {
          const Icon = icons[qc.type];
          const isSelected = selected === qc.type;

          return (
            <button
              key={qc.id}
              onClick={() => onSelect(qc.type)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-cyan-500' : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? 'text-white' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{qc.name}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {qc.qubits} qubits
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{qc.description}</p>
                    <div className="mt-2 space-y-1">
                      {qc.characteristics.slice(0, 3).map((char, idx) => (
                        <p key={idx} className="text-xs text-gray-500 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {char}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="ml-2">
                    <div className="bg-cyan-500 text-white p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 bg-blue-50 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>New to quantum computing?</strong> Start with the simulator to see perfect quantum behavior, then try real quantum computers to see how noise affects results!
        </p>
      </div>
    </div>
  );
}
