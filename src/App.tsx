import { useState } from "react";
import { Header } from "./components/Header";
import { ModeToggle } from "./components/ModeToggle";
import { InteractiveBuilder } from "./components/InteractiveBuilder";
import { CodeEditor } from "./components/CodeEditor";
import { QuantumComputerSelector } from "./components/QuantumComputerSelector";
import { ExecutionPanel } from "./components/ExecutionPanel";
import { LoadingScreen } from "./components/LoadingScreen";
import { ResultsVisualization } from "./components/ResultsVisualization";
import { useCircuit } from "./hooks/useCircuit";
import { executeCircuit } from "./utils/mockApi";
import { ExecutionResult } from "./types/circuit";

function App() {
  const {
    circuit,
    viewMode,
    setViewMode,
    codeFramework,
    setCodeFramework,
    selectedQuantumComputer,
    setSelectedQuantumComputer,
    addGate,
    removeGate,
    clearCircuit,
    setNumQubits,
    loadCircuit,
    compactCircuit,
  } = useCircuit();

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    try {
      const executionResult = await executeCircuit(
        circuit,
        selectedQuantumComputer,
        setProgress
      );
      setResult(executionResult);
    } catch (error) {
      console.error("Execution failed:", error);
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const handleQubitChange = (delta: number) => {
    const newNum = circuit.numQubits + delta;
    if (newNum >= 1 && newNum <= 5) {
      setNumQubits(newNum);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        circuit={circuit}
        selectedComputer={selectedQuantumComputer}
        onLoadExample={loadCircuit}
        onRun={handleRun}
        onClear={clearCircuit}
        isRunning={isRunning}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Build Your Circuit
            </h2>
            <p className="text-gray-600 mt-1">
              Create quantum circuits visually or with code
            </p>
          </div>
          <ModeToggle mode={viewMode} onModeChange={setViewMode} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            {viewMode === "interactive" ? (
              <InteractiveBuilder
                circuit={circuit}
                onAddGate={addGate}
                onRemoveGate={removeGate}
                onQubitChange={handleQubitChange}
              />
            ) : (
              <CodeEditor
                circuit={circuit}
                framework={codeFramework}
                onFrameworkChange={setCodeFramework}
              />
            )}
          </div>

          <div className="space-y-6">
            <QuantumComputerSelector
              selected={selectedQuantumComputer}
              onSelect={setSelectedQuantumComputer}
            />
            <ExecutionPanel
              circuit={circuit}
              selectedComputer={selectedQuantumComputer}
              onCompact={compactCircuit}
              isRunning={isRunning}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-cyan-100 text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Select Gates
                </h4>
                <p className="text-gray-600">
                  Choose from the gate library and click on the circuit to place
                  them
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-cyan-100 text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Pick a Computer
                </h4>
                <p className="text-gray-600">
                  Start with the simulator, then try real quantum hardware
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-cyan-100 text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Run & Explore
                </h4>
                <p className="text-gray-600">
                  Execute your circuit and compare expected vs actual results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isRunning && (
        <LoadingScreen
          computerType={selectedQuantumComputer}
          progress={progress}
        />
      )}

      {result && (
        <ResultsVisualization result={result} onClose={() => setResult(null)} />
      )}
    </div>
  );
}

export default App;
