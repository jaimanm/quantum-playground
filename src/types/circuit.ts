export type GateType =
  | 'H' | 'X' | 'Y' | 'Z'
  | 'S' | 'T' | 'Sdg' | 'Tdg'
  | 'RX' | 'RY' | 'RZ'
  | 'CNOT' | 'CZ' | 'SWAP'
  | 'Toffoli';

export type GateCategory = 'single' | 'controlled' | 'rotation';

export interface Gate {
  id: string;
  type: GateType;
  qubitIndices: number[];
  position: number;
  params?: { [key: string]: number };
}

export interface CircuitState {
  numQubits: number;
  gates: Gate[];
  measurements: number[];
}

export interface StateVector {
  amplitudes: Complex[];
  probabilities: number[];
}

export interface Complex {
  real: number;
  imaginary: number;
}

export interface MeasurementResult {
  state: string;
  count: number;
  probability: number;
}

export interface ExecutionResult {
  executionId: string;
  circuit: CircuitState;
  quantumComputer: QuantumComputerType;
  expectedResults: {
    stateVector: StateVector;
    probabilities: { [state: string]: number };
  };
  actualResults: {
    measurements: MeasurementResult[];
    shots: number;
  };
  metadata: {
    executionTime: number;
    circuitDepth: number;
    gateCount: number;
    timestamp: string;
  };
  summary?: string;
}

export type QuantumComputerType =
  | 'simulator'
  | 'ion-trap'
  | 'superconducting';

export interface QuantumComputer {
  id: string;
  name: string;
  type: QuantumComputerType;
  provider: string;
  qubits: number;
  description: string;
  characteristics: string[];
  availability: boolean;
}

export type CodeFramework =
  | 'qiskit'
  | 'pennylane'
  | 'cirq'
  | 'qsharp'
  | 'braket';

export interface GateDefinition {
  type: GateType;
  name: string;
  description: string;
  category: GateCategory;
  icon: string;
  color: string;
  numQubits: number;
  hasParams: boolean;
  tooltip: string;
}

export type ViewMode = 'interactive' | 'code';
