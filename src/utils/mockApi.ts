import {
  CircuitState,
  ExecutionResult,
  QuantumComputerType,
} from "../types/circuit";

const API_BASE_URL = "http://localhost:8000";

export async function executeCircuit(
  circuit: CircuitState,
  computerType: QuantumComputerType,
  onProgress?: (progress: number) => void
): Promise<ExecutionResult> {
  const shots = 1024;

  // Simulate progress for UI feedback
  const totalDuration =
    computerType === "simulator"
      ? 2000
      : computerType === "ion-trap"
      ? 4000
      : 3000;

  for (let i = 0; i <= 90; i += 10) {
    // Leave room for actual API call
    await new Promise((resolve) => setTimeout(resolve, totalDuration / 10));
    onProgress?.(i);
  }

  try {
    // Call FastAPI backend
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        circuit,
        shots,
        backend: "qiskit", // Default to Qiskit, could make this configurable
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const simulationResult = await response.json();

    onProgress?.(100);

    // Transform backend response to match ExecutionResult interface
    const measurements = simulationResult.measurements.map((m: any) => ({
      state: m.state,
      count: m.count,
      probability: m.probability,
    }));

    const probabilities: { [state: string]: number } = {};
    Object.entries(simulationResult.probabilities).forEach(([state, prob]) => {
      probabilities[state] = prob as number;
    });

    // Create state vector from backend response
    let stateVector;
    if (simulationResult.stateVector) {
      stateVector = {
        amplitudes: simulationResult.stateVector.amplitudes.map((amp: any) => ({
          real: amp.real,
          imaginary: amp.imaginary,
        })),
        probabilities: simulationResult.stateVector.probabilities,
      };
    } else {
      // Fallback for backends that don't provide state vector
      stateVector = {
        amplitudes: [],
        probabilities: [],
      };
    }

    const summary = generateSummary(
      circuit,
      computerType,
      measurements,
      probabilities
    );

    return {
      executionId: `exec-${Date.now()}`,
      circuit,
      quantumComputer: computerType,
      expectedResults: {
        stateVector,
        probabilities,
      },
      actualResults: {
        measurements,
        shots,
      },
      metadata: {
        executionTime: simulationResult.executionTime * 1000, // Convert to ms
        circuitDepth: simulationResult.circuitDepth,
        gateCount: simulationResult.gateCount,
        timestamp: new Date().toISOString(),
      },
      summary,
    };
  } catch (error) {
    console.error("Backend simulation failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Circuit execution failed: ${errorMessage}`);
  }
}

function generateSummary(
  circuit: CircuitState,
  computerType: QuantumComputerType,
  measurements: { state: string; count: number; probability: number }[],
  expectedProbs: { [state: string]: number }
): string {
  const hasH = circuit.gates.some((g) => g.type === "H");
  const hasCNOT = circuit.gates.some((g) => g.type === "CNOT");
  const topState = measurements[0];

  let summary = "Your quantum circuit ";

  if (hasH && hasCNOT) {
    summary +=
      "created an entangled state using superposition and entanglement! This means your qubits are now mysteriously connected. ";
  } else if (hasH) {
    summary +=
      "created superposition, putting your qubits into a state of being both 0 and 1 at the same time! ";
  } else if (hasCNOT) {
    summary += "used entanglement to connect your qubits together. ";
  } else {
    summary += "performed quantum operations on your qubits. ";
  }

  summary += `The most common measurement was |${
    topState.state
  }⟩, occurring in ${(topState.probability * 100).toFixed(1)}% of shots. `;

  if (computerType !== "simulator") {
    const fidelityEstimate =
      measurements[0].probability / (expectedProbs[topState.state] || 1);
    if (fidelityEstimate < 0.8) {
      summary +=
        "You can see quantum noise affecting the results - the actual measurements differ from theory due to environmental interference and imperfect gates. ";
    } else {
      summary +=
        "The results closely match theoretical predictions, showing high-quality quantum operations! ";
    }
  }

  return summary;
}
