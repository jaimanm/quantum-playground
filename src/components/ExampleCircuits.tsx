import { Book, Zap } from 'lucide-react';
import { exampleCircuits, ExampleCircuit } from '../data/exampleCircuits';
import { CircuitState } from '../types/circuit';

interface ExampleCircuitsProps {
  onLoad: (circuit: CircuitState) => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};

export function ExampleCircuits({ onLoad }: ExampleCircuitsProps) {
  const handleLoad = (example: ExampleCircuit) => {
    onLoad(example.circuit);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Book className="w-5 h-5 text-cyan-600" />
        <h3 className="text-lg font-semibold text-gray-800">Example Circuits</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Load a pre-built circuit to get started quickly
      </p>

      <div className="space-y-3">
        {exampleCircuits.map((example) => (
          <button
            key={example.id}
            onClick={() => handleLoad(example)}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                {example.name}
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded border ${
                  difficultyColors[example.difficulty]
                }`}
              >
                {example.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{example.description}</p>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span>{example.circuit.numQubits} qubit{example.circuit.numQubits > 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{example.circuit.gates.length} gate{example.circuit.gates.length > 1 ? 's' : ''}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 bg-cyan-50 rounded-lg p-3 flex items-start space-x-2">
        <Zap className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-cyan-800">
          Click any example to load it into your circuit builder. You can then modify it or run it as-is!
        </p>
      </div>
    </div>
  );
}
