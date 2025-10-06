import { Book, Zap } from "lucide-react";
import { exampleCircuits, ExampleCircuit } from "../data/exampleCircuits";
import { CircuitState } from "../types/circuit";

interface ExampleCircuitsProps {
  onLoad: (circuit: CircuitState) => void;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  advanced: "bg-red-100 text-red-700 border-red-200",
};

export function ExampleCircuits({ onLoad }: ExampleCircuitsProps) {
  const handleLoad = (example: ExampleCircuit) => {
    onLoad(example.circuit);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Book className="w-4 h-4 text-cyan-200" />
        <h3 className="text-sm font-semibold text-white">Example Circuits</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {exampleCircuits.map((example) => (
          <button
            key={example.id}
            onClick={() => handleLoad(example)}
            className="text-left p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-all group border border-white/20"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white group-hover:text-cyan-200 transition-colors text-sm">
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
            <p className="text-xs text-cyan-100 mb-2 line-clamp-2">
              {example.description}
            </p>
            <div className="flex items-center space-x-2 text-xs text-cyan-200">
              <span>{example.circuit.numQubits}q</span>
              <span>•</span>
              <span>{example.circuit.gates.length}g</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 bg-cyan-500/20 rounded-lg p-2 flex items-start space-x-2">
        <Zap className="w-3 h-3 text-cyan-300 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-cyan-100">
          Click any example to load it into your circuit builder!
        </p>
      </div>
    </div>
  );
}
