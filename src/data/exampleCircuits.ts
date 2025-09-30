import { CircuitState } from '../types/circuit';

export interface ExampleCircuit {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  circuit: CircuitState;
}

export const exampleCircuits: ExampleCircuit[] = [
  {
    id: 'superposition',
    name: 'Quantum Superposition',
    description: 'Create a superposition state with a Hadamard gate. The qubit will be both 0 and 1 at the same time!',
    difficulty: 'beginner',
    circuit: {
      numQubits: 1,
      gates: [
        {
          id: 'gate-1',
          type: 'H',
          qubitIndices: [0],
          position: 0,
        },
      ],
      measurements: [0],
    },
  },
  {
    id: 'bell-state',
    name: 'Bell State (Entanglement)',
    description: 'Create an entangled pair of qubits. Measuring one instantly affects the other!',
    difficulty: 'beginner',
    circuit: {
      numQubits: 2,
      gates: [
        {
          id: 'gate-1',
          type: 'H',
          qubitIndices: [0],
          position: 0,
        },
        {
          id: 'gate-2',
          type: 'CNOT',
          qubitIndices: [0, 1],
          position: 1,
        },
      ],
      measurements: [0, 1],
    },
  },
  {
    id: 'ghz-state',
    name: 'GHZ State',
    description: 'Create a three-qubit entangled state. All qubits are correlated!',
    difficulty: 'intermediate',
    circuit: {
      numQubits: 3,
      gates: [
        {
          id: 'gate-1',
          type: 'H',
          qubitIndices: [0],
          position: 0,
        },
        {
          id: 'gate-2',
          type: 'CNOT',
          qubitIndices: [0, 1],
          position: 1,
        },
        {
          id: 'gate-3',
          type: 'CNOT',
          qubitIndices: [1, 2],
          position: 2,
        },
      ],
      measurements: [0, 1, 2],
    },
  },
  {
    id: 'x-gate',
    name: 'Quantum NOT Gate',
    description: 'Flip a qubit from |0⟩ to |1⟩ using the X gate (quantum NOT)',
    difficulty: 'beginner',
    circuit: {
      numQubits: 1,
      gates: [
        {
          id: 'gate-1',
          type: 'X',
          qubitIndices: [0],
          position: 0,
        },
      ],
      measurements: [0],
    },
  },
];
