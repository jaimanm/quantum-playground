import { QuantumComputer } from '../types/circuit';

export const quantumComputers: QuantumComputer[] = [
  {
    id: 'simulator',
    name: 'Quantum Simulator',
    type: 'simulator',
    provider: 'Local',
    qubits: 32,
    description: 'Perfect quantum computer simulation without noise',
    characteristics: [
      'No noise or errors',
      'Instant results',
      'Great for learning',
      'Shows ideal quantum behavior',
    ],
    availability: true,
  },
  {
    id: 'ibm-superconducting',
    name: 'IBM Quantum (Superconducting)',
    type: 'superconducting',
    provider: 'IBM',
    qubits: 127,
    description: 'Real quantum computer using superconducting qubits cooled to near absolute zero',
    characteristics: [
      'Ultra-cold superconducting circuits',
      'Fast gate operations (~100 nanoseconds)',
      'Short coherence times',
      'Fixed qubit connectivity',
      'Subject to quantum noise',
    ],
    availability: true,
  },
  {
    id: 'ionq-ion-trap',
    name: 'IonQ (Ion Trap)',
    type: 'ion-trap',
    provider: 'IonQ',
    qubits: 32,
    description: 'Real quantum computer using trapped ions controlled by lasers',
    characteristics: [
      'Individual atoms trapped by electromagnetic fields',
      'All-to-all qubit connectivity',
      'Long coherence times',
      'Slower gate operations (~1 millisecond)',
      'High-fidelity operations',
    ],
    availability: true,
  },
];

export const getQuantumComputer = (id: string) =>
  quantumComputers.find((qc) => qc.id === id);
