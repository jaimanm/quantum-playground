import { Zap, Play, RotateCcw, Trash2 } from "lucide-react";
import { ExampleCircuits } from "./ExampleCircuits";
import { CircuitState, QuantumComputerType } from "../types/circuit";
import { getQuantumComputer } from "../data/quantumComputers";

interface HeaderProps {
  circuit: CircuitState;
  selectedComputer: QuantumComputerType;
  onLoadExample: (circuit: CircuitState) => void;
  onRun: () => void;
  onClear: () => void;
  isRunning: boolean;
}

export function Header({
  circuit,
  selectedComputer,
  onLoadExample,
  onRun,
  onClear,
  isRunning,
}: HeaderProps) {
  const computer = getQuantumComputer(
    selectedComputer === "simulator"
      ? "simulator"
      : selectedComputer === "ion-trap"
      ? "ionq-ion-trap"
      : "ibm-superconducting"
  );

  const canRun = circuit.gates.length > 0;

  return (
    <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Quantum Circuit Builder</h1>
              <p className="text-cyan-100 text-sm">
                Build, simulate, and explore quantum circuits
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-cyan-100">
              <div className="flex items-center space-x-4">
                <span>Gates: {circuit.gates.length}</span>
                <span>•</span>
                <span>Qubits: {circuit.numQubits}</span>
                <span>•</span>
                <span>{computer?.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onRun}
                disabled={!canRun || isRunning}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  canRun && !isRunning
                    ? "bg-white text-cyan-600 hover:bg-gray-100 shadow-md hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isRunning ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run</span>
                  </>
                )}
              </button>

              <button
                onClick={onClear}
                disabled={circuit.gates.length === 0 || isRunning}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ExampleCircuits onLoad={onLoadExample} />
        </div>
      </div>
    </header>
  );
}
