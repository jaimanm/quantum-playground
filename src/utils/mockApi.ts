import { CircuitState, ExecutionResult, QuantumComputerType } from '../types/circuit';
import { QuantumSimulator } from './quantumSimulator';

export async function executeCircuit(
  circuit: CircuitState,
  computerType: QuantumComputerType,
  onProgress?: (progress: number) => void
): Promise<ExecutionResult> {
  const shots = 1024;
  const simulator = new QuantumSimulator(circuit.numQubits);

  const totalDuration = computerType === 'simulator' ? 2000 : computerType === 'ion-trap' ? 4000 : 3000;

  for (let i = 0; i <= 100; i += 5) {
    await new Promise((resolve) => setTimeout(resolve, totalDuration / 20));
    onProgress?.(i);
  }

  const stateVector = simulator.simulate(circuit);
  const probabilities: { [state: string]: number } = {};

  stateVector.probabilities.forEach((prob, index) => {
    if (prob > 0.001) {
      const state = index.toString(2).padStart(circuit.numQubits, '0');
      probabilities[state] = prob;
    }
  });

  const noiseLevel = computerType === 'simulator' ? 0 : computerType === 'ion-trap' ? 0.02 : 0.05;
  const measurements =
    noiseLevel === 0
      ? simulator.measure(circuit, shots)
      : simulator.measureWithNoise(circuit, shots, noiseLevel);

  const circuitDepth = calculateCircuitDepth(circuit);

  const summary = generateSummary(circuit, computerType, measurements, probabilities);

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
      executionTime: Math.floor(Math.random() * 500) + 100,
      circuitDepth,
      gateCount: circuit.gates.length,
      timestamp: new Date().toISOString(),
    },
    summary,
  };
}

function calculateCircuitDepth(circuit: CircuitState): number {
  if (circuit.gates.length === 0) return 0;

  const positions = circuit.gates.map((gate) => gate.position);
  return Math.max(...positions) + 1;
}

function generateSummary(
  circuit: CircuitState,
  computerType: QuantumComputerType,
  measurements: { state: string; count: number; probability: number }[],
  expectedProbs: { [state: string]: number }
): string {
  const hasH = circuit.gates.some((g) => g.type === 'H');
  const hasCNOT = circuit.gates.some((g) => g.type === 'CNOT');
  const topState = measurements[0];

  let summary = 'Your quantum circuit ';

  if (hasH && hasCNOT) {
    summary +=
      'created an entangled state using superposition and entanglement! This means your qubits are now mysteriously connected. ';
  } else if (hasH) {
    summary +=
      'created superposition, putting your qubits into a state of being both 0 and 1 at the same time! ';
  } else if (hasCNOT) {
    summary += 'used entanglement to connect your qubits together. ';
  } else {
    summary += 'performed quantum operations on your qubits. ';
  }

  summary += `The most common measurement was |${topState.state}⟩, occurring in ${(
    topState.probability * 100
  ).toFixed(1)}% of shots. `;

  if (computerType !== 'simulator') {
    const fidelityEstimate = measurements[0].probability / (expectedProbs[topState.state] || 1);
    if (fidelityEstimate < 0.8) {
      summary +=
        'You can see quantum noise affecting the results - the actual measurements differ from theory due to environmental interference and imperfect gates. ';
    } else {
      summary +=
        'The results closely match theoretical predictions, showing high-quality quantum operations! ';
    }
  }

  return summary;
}
