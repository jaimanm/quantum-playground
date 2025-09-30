import { Play, RotateCcw, Trash2, ArrowLeft } from "lucide-react";
import { CircuitState, QuantumComputerType } from "../types/circuit";
import { getQuantumComputer } from "../data/quantumComputers";

interface ExecutionPanelProps {
  circuit: CircuitState;
  selectedComputer: QuantumComputerType;
  onRun: () => void;
  onClear: () => void;
  onCompact?: () => void;
  isRunning: boolean;
}

export function ExecutionPanel({
  circuit,
  selectedComputer,
  onRun,
  onClear,
  onCompact,
  isRunning,
}: ExecutionPanelProps) {
  const computer = getQuantumComputer(
    selectedComputer === "simulator"
      ? "simulator"
      : selectedComputer === "ion-trap"
      ? "ionq-ion-trap"
      : "ibm-superconducting"
  );

  const canRun = circuit.gates.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Circuit Controls
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Gates:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {circuit.gates.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Qubits:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {circuit.numQubits}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Computer:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {computer?.name}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onRun}
            disabled={!canRun || isRunning}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              canRun && !isRunning
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Run Circuit</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            {onCompact && (
              <button
                onClick={onCompact}
                disabled={circuit.gates.length === 0 || isRunning}
                className="flex items-center justify-center space-x-1 px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Compact</span>
              </button>
            )}
            <button
              onClick={onClear}
              disabled={circuit.gates.length === 0 || isRunning}
              className={`flex items-center justify-center space-x-1 px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                !onCompact ? "col-span-2" : ""
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {!canRun && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              Add some gates to your circuit before running it!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
