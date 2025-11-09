import React, { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { simulateCircuit, SimRequest } from "../api/simulator";
import type { PlacedGate } from "../types";

interface RunPanelProps {
  numQubits: number;
  gates: PlacedGate[];
}

/**
 * Panel for running quantum circuit simulation and displaying results
 */
const RunPanel: React.FC<RunPanelProps> = ({ numQubits, gates }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    probs: [string, number][];
    duration: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleRun = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert frontend gates to API format
      const simRequest: SimRequest = {
        circuit: {
          numQubits,
          gates: gates.map((g) => ({
            id: g.id || `${g.type}-${g.qubit}-${g.col}`,
            type: g.type as "H" | "X" | "Y" | "Z",
            targets: [g.qubit],
            column: g.col,
          })),
        },
        // Optional: add shots for sampling
        // shots: 1000,
      };

      const response = await simulateCircuit(simRequest);

      // Sort probabilities by value (highest first) and take top results
      const sortedProbs = Object.entries(response.probabilities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 16); // Show top 16 states

      setResult({
        probs: sortedProbs,
        duration: response.metadata.durationMs,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run simulation");
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-6 w-full max-w-4xl mx-auto rounded-lg border border-gray-700 bg-gray-800 overflow-hidden"
    >
      {/* Header with Run button and collapse toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center gap-3">
          <Collapsible.Trigger asChild>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-5 h-5 transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Collapsible.Trigger>
          <h2 className="text-xl font-bold text-cyan-400">
            Simulation Results
          </h2>
        </div>
        <button
          onClick={handleRun}
          disabled={loading || gates.length === 0}
          className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {loading ? "Running..." : "Run Circuit"}
        </button>
      </div>

      <Collapsible.Content className="p-4 pt-0">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/20 border border-red-500/50 text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && gates.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Add gates to your circuit to run a simulation
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span>{result.probs.length} states</span>
              <span>•</span>
              <span>{result.duration.toFixed(2)} ms</span>
            </div>

            {/* Probability bars */}
            <div className="space-y-2">
              {result.probs.map(([bitstring, prob]) => (
                <div key={bitstring} className="flex items-center gap-3">
                  <code className="text-sm font-mono text-gray-300 w-20">
                    |{bitstring}⟩
                  </code>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${prob * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
                      {(prob * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center text-gray-400 py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="mt-2 text-sm">Simulating circuit...</p>
          </div>
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default RunPanel;
