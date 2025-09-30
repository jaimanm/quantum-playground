import { CircuitState, StateVector, Complex, MeasurementResult } from '../types/circuit';

export class QuantumSimulator {
  private numQubits: number;
  private stateVector: Complex[];

  constructor(numQubits: number) {
    this.numQubits = numQubits;
    this.stateVector = this.initializeStateVector();
  }

  private initializeStateVector(): Complex[] {
    const size = Math.pow(2, this.numQubits);
    const state: Complex[] = new Array(size).fill(null).map(() => ({ real: 0, imaginary: 0 }));
    state[0] = { real: 1, imaginary: 0 };
    return state;
  }

  private applyGate(gate: string, qubitIndices: number[], params?: { [key: string]: number }) {
    switch (gate) {
      case 'H':
        this.hadamard(qubitIndices[0]);
        break;
      case 'X':
        this.pauliX(qubitIndices[0]);
        break;
      case 'Y':
        this.pauliY(qubitIndices[0]);
        break;
      case 'Z':
        this.pauliZ(qubitIndices[0]);
        break;
      case 'S':
        this.sGate(qubitIndices[0]);
        break;
      case 'T':
        this.tGate(qubitIndices[0]);
        break;
      case 'RX':
        this.rotationX(qubitIndices[0], params?.angle || 0);
        break;
      case 'RY':
        this.rotationY(qubitIndices[0], params?.angle || 0);
        break;
      case 'RZ':
        this.rotationZ(qubitIndices[0], params?.angle || 0);
        break;
      case 'CNOT':
        this.cnot(qubitIndices[0], qubitIndices[1]);
        break;
      case 'CZ':
        this.cz(qubitIndices[0], qubitIndices[1]);
        break;
      case 'SWAP':
        this.swap(qubitIndices[0], qubitIndices[1]);
        break;
      case 'Toffoli':
        this.toffoli(qubitIndices[0], qubitIndices[1], qubitIndices[2]);
        break;
    }
  }

  private hadamard(qubit: number) {
    const factor = 1 / Math.sqrt(2);
    this.applySingleQubitGate(qubit, [
      [{ real: factor, imaginary: 0 }, { real: factor, imaginary: 0 }],
      [{ real: factor, imaginary: 0 }, { real: -factor, imaginary: 0 }],
    ]);
  }

  private pauliX(qubit: number) {
    this.applySingleQubitGate(qubit, [
      [{ real: 0, imaginary: 0 }, { real: 1, imaginary: 0 }],
      [{ real: 1, imaginary: 0 }, { real: 0, imaginary: 0 }],
    ]);
  }

  private pauliY(qubit: number) {
    this.applySingleQubitGate(qubit, [
      [{ real: 0, imaginary: 0 }, { real: 0, imaginary: -1 }],
      [{ real: 0, imaginary: 1 }, { real: 0, imaginary: 0 }],
    ]);
  }

  private pauliZ(qubit: number) {
    this.applySingleQubitGate(qubit, [
      [{ real: 1, imaginary: 0 }, { real: 0, imaginary: 0 }],
      [{ real: 0, imaginary: 0 }, { real: -1, imaginary: 0 }],
    ]);
  }

  private sGate(qubit: number) {
    this.applySingleQubitGate(qubit, [
      [{ real: 1, imaginary: 0 }, { real: 0, imaginary: 0 }],
      [{ real: 0, imaginary: 0 }, { real: 0, imaginary: 1 }],
    ]);
  }

  private tGate(qubit: number) {
    const factor = 1 / Math.sqrt(2);
    this.applySingleQubitGate(qubit, [
      [{ real: 1, imaginary: 0 }, { real: 0, imaginary: 0 }],
      [{ real: 0, imaginary: 0 }, { real: factor, imaginary: factor }],
    ]);
  }

  private rotationX(qubit: number, angle: number) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    this.applySingleQubitGate(qubit, [
      [{ real: cos, imaginary: 0 }, { real: 0, imaginary: -sin }],
      [{ real: 0, imaginary: -sin }, { real: cos, imaginary: 0 }],
    ]);
  }

  private rotationY(qubit: number, angle: number) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    this.applySingleQubitGate(qubit, [
      [{ real: cos, imaginary: 0 }, { real: -sin, imaginary: 0 }],
      [{ real: sin, imaginary: 0 }, { real: cos, imaginary: 0 }],
    ]);
  }

  private rotationZ(qubit: number, angle: number) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    this.applySingleQubitGate(qubit, [
      [{ real: cos, imaginary: -sin }, { real: 0, imaginary: 0 }],
      [{ real: 0, imaginary: 0 }, { real: cos, imaginary: sin }],
    ]);
  }

  private cnot(control: number, target: number) {
    const newState = [...this.stateVector];
    const size = Math.pow(2, this.numQubits);

    for (let i = 0; i < size; i++) {
      const controlBit = (i >> (this.numQubits - 1 - control)) & 1;
      if (controlBit === 1) {
        const targetMask = 1 << (this.numQubits - 1 - target);
        const j = i ^ targetMask;
        newState[i] = this.stateVector[j];
      } else {
        newState[i] = this.stateVector[i];
      }
    }
    this.stateVector = newState;
  }

  private cz(control: number, target: number) {
    const size = Math.pow(2, this.numQubits);
    for (let i = 0; i < size; i++) {
      const controlBit = (i >> (this.numQubits - 1 - control)) & 1;
      const targetBit = (i >> (this.numQubits - 1 - target)) & 1;
      if (controlBit === 1 && targetBit === 1) {
        this.stateVector[i] = {
          real: -this.stateVector[i].real,
          imaginary: -this.stateVector[i].imaginary,
        };
      }
    }
  }

  private swap(qubit1: number, qubit2: number) {
    this.cnot(qubit1, qubit2);
    this.cnot(qubit2, qubit1);
    this.cnot(qubit1, qubit2);
  }

  private toffoli(control1: number, control2: number, target: number) {
    const newState = [...this.stateVector];
    const size = Math.pow(2, this.numQubits);

    for (let i = 0; i < size; i++) {
      const control1Bit = (i >> (this.numQubits - 1 - control1)) & 1;
      const control2Bit = (i >> (this.numQubits - 1 - control2)) & 1;
      if (control1Bit === 1 && control2Bit === 1) {
        const targetMask = 1 << (this.numQubits - 1 - target);
        const j = i ^ targetMask;
        newState[i] = this.stateVector[j];
      } else {
        newState[i] = this.stateVector[i];
      }
    }
    this.stateVector = newState;
  }

  private applySingleQubitGate(qubit: number, matrix: Complex[][]) {
    const newState = [...this.stateVector];
    const size = Math.pow(2, this.numQubits);

    for (let i = 0; i < size; i++) {
      const bit = (i >> (this.numQubits - 1 - qubit)) & 1;
      if (bit === 0) {
        const iFlipped = i | (1 << (this.numQubits - 1 - qubit));
        const state0 = this.stateVector[i];
        const state1 = this.stateVector[iFlipped];

        newState[i] = this.complexAdd(
          this.complexMul(matrix[0][0], state0),
          this.complexMul(matrix[0][1], state1)
        );
        newState[iFlipped] = this.complexAdd(
          this.complexMul(matrix[1][0], state0),
          this.complexMul(matrix[1][1], state1)
        );
      }
    }
    this.stateVector = newState;
  }

  private complexMul(a: Complex, b: Complex): Complex {
    return {
      real: a.real * b.real - a.imaginary * b.imaginary,
      imaginary: a.real * b.imaginary + a.imaginary * b.real,
    };
  }

  private complexAdd(a: Complex, b: Complex): Complex {
    return {
      real: a.real + b.real,
      imaginary: a.imaginary + b.imaginary,
    };
  }

  public simulate(circuit: CircuitState): StateVector {
    this.stateVector = this.initializeStateVector();

    const sortedGates = [...circuit.gates].sort((a, b) => a.position - b.position);
    for (const gate of sortedGates) {
      this.applyGate(gate.type, gate.qubitIndices, gate.params);
    }

    const probabilities = this.stateVector.map(
      (c) => c.real * c.real + c.imaginary * c.imaginary
    );

    return {
      amplitudes: this.stateVector,
      probabilities,
    };
  }

  public measure(circuit: CircuitState, shots: number = 1024): MeasurementResult[] {
    const stateVector = this.simulate(circuit);
    const results: { [state: string]: number } = {};

    for (let shot = 0; shot < shots; shot++) {
      const rand = Math.random();
      let cumulative = 0;
      let measuredState = 0;

      for (let i = 0; i < stateVector.probabilities.length; i++) {
        cumulative += stateVector.probabilities[i];
        if (rand < cumulative) {
          measuredState = i;
          break;
        }
      }

      const stateStr = measuredState.toString(2).padStart(this.numQubits, '0');
      results[stateStr] = (results[stateStr] || 0) + 1;
    }

    return Object.entries(results)
      .map(([state, count]) => ({
        state,
        count,
        probability: count / shots,
      }))
      .sort((a, b) => b.count - a.count);
  }

  public measureWithNoise(
    circuit: CircuitState,
    shots: number = 1024,
    noiseLevel: number = 0.01
  ): MeasurementResult[] {
    const idealResults = this.measure(circuit, shots);
    const noisyResults: { [state: string]: number } = {};

    for (const result of idealResults) {
      for (let i = 0; i < result.count; i++) {
        let state = result.state;

        for (let bit = 0; bit < state.length; bit++) {
          if (Math.random() < noiseLevel) {
            const bitArray = state.split('');
            bitArray[bit] = bitArray[bit] === '0' ? '1' : '0';
            state = bitArray.join('');
          }
        }

        noisyResults[state] = (noisyResults[state] || 0) + 1;
      }
    }

    return Object.entries(noisyResults)
      .map(([state, count]) => ({
        state,
        count,
        probability: count / shots,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
