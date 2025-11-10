import React, { useState, useEffect } from "react";
import BlochSphere from "./BlochSphere";
import { getBlochVectorsFromStatevector } from "../utils/blochUtils";
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
  const [liveResult, setLiveResult] = useState<{
    statevector?: Array<{ re: number; im: number }>;
    probabilities: Array<{ bitstring: string; prob: number }>;
    duration: number;
  } | null>(null);
  const [measurementResult, setMeasurementResult] = useState<{
    samples: Array<{ bitstring: string; count: number }>;
    duration: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [shots, setShots] = useState<number>(() => {
    const saved = localStorage.getItem("quantum-shots");
    return saved ? parseInt(saved, 10) : 1024;
  });

  // Save shots to localStorage
  useEffect(() => {
    localStorage.setItem("quantum-shots", shots.toString());
  }, [shots]);

  // Helper to generate all bitstrings in binary order
  function getAllBitstrings(n: number): string[] {
    const total = 1 << n;
    return Array.from({ length: total }, (_, i) =>
      i.toString(2).padStart(n, "0")
    );
  }

  // Helper to create initial statevector for |00...0⟩ state
  function getInitialStatevector(n: number): Array<{ re: number; im: number }> {
    const stateSize = 1 << n;
    return Array.from({ length: stateSize }, (_, i) => ({
      re: i === 0 ? 1 : 0, // First state has amplitude 1, rest are 0
      im: 0,
    }));
  }

  // Auto-update live results when gates change (excluding measurement gates)
  // Debounced to avoid excessive re-renders during dragging
  useEffect(() => {
    const fetchLiveResults = async () => {
      // Filter out measurement gates
      const nonMeasurementGates = gates.filter((g) => g.type !== "M");
      const allBitstrings = getAllBitstrings(numQubits);

      if (nonMeasurementGates.length === 0) {
        // No gates, use initial state |00...0⟩
        setLiveResult({
          statevector: getInitialStatevector(numQubits),
          probabilities: allBitstrings.map((bs) => ({
            bitstring: bs,
            prob: bs === "0".repeat(numQubits) ? 1 : 0,
          })),
          duration: 0,
        });
        return;
      }

      try {
        const simRequest: SimRequest = {
          circuit: {
            numQubits,
            gates: nonMeasurementGates.map((g) => ({
              id: g.id || `${g.type}-${g.qubit}-${g.col}`,
              type: g.type as "H" | "X" | "Y" | "Z",
              targets: [g.qubit],
              column: g.col,
            })),
          },
        };

        const response = await simulateCircuit(simRequest);
        const allBitstrings = getAllBitstrings(response.numQubits);

        const probabilities = allBitstrings.map((bs) => ({
          bitstring: bs,
          prob: response.probabilities[bs] ?? 0,
        }));

        setLiveResult({
          statevector: response.statevector,
          probabilities,
          duration: response.metadata.durationMs,
        });
      } catch (err) {
        console.error("Live simulation error:", err);
      }
    };

    // Debounce: wait 150ms after last change before updating
    const timeoutId = setTimeout(fetchLiveResults, 150);
    return () => clearTimeout(timeoutId);
  }, [gates, numQubits]);

  // Check if circuit has measurement gates
  const hasMeasurementGates = gates.some((g) => g.type === "M");

  const handleRun = async () => {
    setLoading(true);
    setError(null);

    try {
      // Filter out measurement gates for simulation
      const nonMeasurementGates = gates.filter((g) => g.type !== "M");

      const simRequest: SimRequest = {
        circuit: {
          numQubits,
          gates: nonMeasurementGates.map((g) => ({
            id: g.id || `${g.type}-${g.qubit}-${g.col}`,
            type: g.type as "H" | "X" | "Y" | "Z",
            targets: [g.qubit],
            column: g.col,
          })),
        },
      };
      // Always use shots if measurement gates are present
      if (hasMeasurementGates) {
        simRequest.shots =
          typeof shots === "number" && shots > 0 ? shots : 1024;
      }

      const response = await simulateCircuit(simRequest);

      // Get all bitstrings in binary order
      const allBitstrings = getAllBitstrings(response.numQubits);

      // Samples (histogram) - only if measurement gates present
      if (response.samples) {
        const samples = allBitstrings.map((bs) => {
          const found = response.samples!.find((s) => s.bitstring === bs);
          return { bitstring: bs, count: found ? found.count : 0 };
        });

        setMeasurementResult({
          samples,
          duration: response.metadata.durationMs,
        });
      }
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
        {hasMeasurementGates && (
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {loading ? "Running..." : "Run Circuit"}
          </button>
        )}
      </div>

      <Collapsible.Content className="p-4 pt-0">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/20 border border-red-500/50 text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Shots input - only show if measurement gates present */}
        {hasMeasurementGates && (
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm text-gray-300 font-mono">Shots:</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={shots}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 1 && v <= 10000) setShots(v);
              }}
              className="w-24 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-cyan-400"
            />
            <span className="text-xs text-gray-500">(measurement samples)</span>
          </div>
        )}

        {/* Live Results - Always shown */}
        {liveResult && (
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span>{liveResult.probabilities.length} states</span>
              <span>•</span>
              <span>{liveResult.duration.toFixed(2)} ms</span>
            </div>

            {/* Bloch spheres for each qubit (only if statevector available) */}
            {liveResult.statevector && (
              <div className="mb-8">
                <h3 className="text-cyan-300 text-sm font-bold mb-2">
                  Bloch Spheres
                </h3>
                <div className="flex gap-6 flex-wrap">
                  {getBlochVectorsFromStatevector(
                    liveResult.statevector,
                    numQubits
                  ).map((bloch, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <BlochSphere
                        x={bloch.x}
                        y={bloch.y}
                        z={bloch.z}
                        label={`q${i}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Probability bar chart (binary order) */}
            <div className="mb-8">
              <h3 className="text-cyan-300 text-sm font-bold mb-2">
                Probabilities
              </h3>
              <div className="space-y-2">
                {liveResult.probabilities.map(({ bitstring, prob }) => (
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

            {/* Measurement histogram - only show after running with measurement gates */}
            {measurementResult && (
              <div className="mb-8">
                <h3 className="text-cyan-300 text-sm font-bold mb-2">
                  Measurement Histogram ({shots} shots)
                </h3>
                <div className="space-y-2">
                  {measurementResult.samples.map(({ bitstring, count }) => (
                    <div key={bitstring} className="flex items-center gap-3">
                      <code className="text-sm font-mono text-gray-300 w-20">
                        |{bitstring}⟩
                      </code>
                      <div className="flex-1 bg-gray-700 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-pink-400 rounded-full transition-all duration-300"
                          style={{ width: `${(count / shots) * 100}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

export default React.memo(RunPanel);
