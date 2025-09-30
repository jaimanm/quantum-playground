import { CircuitState, CodeFramework, Gate } from '../types/circuit';

export function generateCode(circuit: CircuitState, framework: CodeFramework): string {
  switch (framework) {
    case 'qiskit':
      return generateQiskitCode(circuit);
    case 'pennylane':
      return generatePennylaneCode(circuit);
    case 'cirq':
      return generateCirqCode(circuit);
    case 'qsharp':
      return generateQSharpCode(circuit);
    case 'braket':
      return generateBraketCode(circuit);
    default:
      return '';
  }
}

function generateQiskitCode(circuit: CircuitState): string {
  let code = '# IBM Qiskit\n';
  code += 'from qiskit import QuantumCircuit\n';
  code += 'from qiskit.visualization import plot_histogram\n\n';
  code += `# Create a quantum circuit with ${circuit.numQubits} qubit${circuit.numQubits > 1 ? 's' : ''}\n`;
  code += `qc = QuantumCircuit(${circuit.numQubits})\n\n`;

  if (circuit.gates.length === 0) {
    code += '# Add gates to your circuit\n';
  } else {
    code += '# Apply quantum gates\n';
    const sortedGates = [...circuit.gates].sort((a, b) => a.position - b.position);

    for (const gate of sortedGates) {
      code += generateQiskitGate(gate);
    }
  }

  code += '\n# Measure all qubits\n';
  code += `qc.measure_all()\n\n`;
  code += '# Display the circuit\n';
  code += 'print(qc.draw())\n';

  return code;
}

function generateQiskitGate(gate: Gate): string {
  const qubits = gate.qubitIndices.join(', ');

  switch (gate.type) {
    case 'H':
      return `qc.h(${qubits})\n`;
    case 'X':
      return `qc.x(${qubits})\n`;
    case 'Y':
      return `qc.y(${qubits})\n`;
    case 'Z':
      return `qc.z(${qubits})\n`;
    case 'S':
      return `qc.s(${qubits})\n`;
    case 'T':
      return `qc.t(${qubits})\n`;
    case 'Sdg':
      return `qc.sdg(${qubits})\n`;
    case 'Tdg':
      return `qc.tdg(${qubits})\n`;
    case 'RX':
      return `qc.rx(${gate.params?.angle || 0}, ${qubits})\n`;
    case 'RY':
      return `qc.ry(${gate.params?.angle || 0}, ${qubits})\n`;
    case 'RZ':
      return `qc.rz(${gate.params?.angle || 0}, ${qubits})\n`;
    case 'CNOT':
      return `qc.cx(${qubits})\n`;
    case 'CZ':
      return `qc.cz(${qubits})\n`;
    case 'SWAP':
      return `qc.swap(${qubits})\n`;
    case 'Toffoli':
      return `qc.ccx(${qubits})\n`;
    default:
      return '';
  }
}

function generatePennylaneCode(circuit: CircuitState): string {
  let code = '# PennyLane\n';
  code += 'import pennylane as qml\n';
  code += 'from pennylane import numpy as np\n\n';
  code += `# Create a quantum device with ${circuit.numQubits} qubit${circuit.numQubits > 1 ? 's' : ''}\n`;
  code += `dev = qml.device('default.qubit', wires=${circuit.numQubits})\n\n`;
  code += '@qml.qnode(dev)\n';
  code += 'def circuit():\n';

  if (circuit.gates.length === 0) {
    code += '    # Add gates to your circuit\n';
  } else {
    code += '    # Apply quantum gates\n';
    const sortedGates = [...circuit.gates].sort((a, b) => a.position - b.position);

    for (const gate of sortedGates) {
      code += '    ' + generatePennylaneGate(gate);
    }
  }

  code += '    \n    # Return measurement probabilities\n';
  code += '    return qml.probs(wires=range(' + circuit.numQubits + '))\n\n';
  code += '# Execute the circuit\n';
  code += 'result = circuit()\n';
  code += 'print(result)\n';

  return code;
}

function generatePennylaneGate(gate: Gate): string {
  const qubits = gate.qubitIndices;

  switch (gate.type) {
    case 'H':
      return `qml.Hadamard(wires=${qubits[0]})\n`;
    case 'X':
      return `qml.PauliX(wires=${qubits[0]})\n`;
    case 'Y':
      return `qml.PauliY(wires=${qubits[0]})\n`;
    case 'Z':
      return `qml.PauliZ(wires=${qubits[0]})\n`;
    case 'S':
      return `qml.S(wires=${qubits[0]})\n`;
    case 'T':
      return `qml.T(wires=${qubits[0]})\n`;
    case 'RX':
      return `qml.RX(${gate.params?.angle || 0}, wires=${qubits[0]})\n`;
    case 'RY':
      return `qml.RY(${gate.params?.angle || 0}, wires=${qubits[0]})\n`;
    case 'RZ':
      return `qml.RZ(${gate.params?.angle || 0}, wires=${qubits[0]})\n`;
    case 'CNOT':
      return `qml.CNOT(wires=[${qubits[0]}, ${qubits[1]}])\n`;
    case 'CZ':
      return `qml.CZ(wires=[${qubits[0]}, ${qubits[1]}])\n`;
    case 'SWAP':
      return `qml.SWAP(wires=[${qubits[0]}, ${qubits[1]}])\n`;
    case 'Toffoli':
      return `qml.Toffoli(wires=[${qubits[0]}, ${qubits[1]}, ${qubits[2]}])\n`;
    default:
      return '';
  }
}

function generateCirqCode(circuit: CircuitState): string {
  let code = '# Google Cirq\n';
  code += 'import cirq\n\n';
  code += `# Create qubits\n`;
  code += `qubits = [cirq.LineQubit(i) for i in range(${circuit.numQubits})]\n\n`;
  code += '# Create a circuit\n';
  code += 'circuit = cirq.Circuit()\n\n';

  if (circuit.gates.length === 0) {
    code += '# Add gates to your circuit\n';
  } else {
    code += '# Apply quantum gates\n';
    const sortedGates = [...circuit.gates].sort((a, b) => a.position - b.position);

    for (const gate of sortedGates) {
      code += generateCirqGate(gate);
    }
  }

  code += '\n# Add measurements\n';
  code += 'circuit.append(cirq.measure(*qubits, key="result"))\n\n';
  code += '# Display the circuit\n';
  code += 'print(circuit)\n';

  return code;
}

function generateCirqGate(gate: Gate): string {
  const qubits = gate.qubitIndices.map(i => `qubits[${i}]`).join(', ');

  switch (gate.type) {
    case 'H':
      return `circuit.append(cirq.H(${qubits}))\n`;
    case 'X':
      return `circuit.append(cirq.X(${qubits}))\n`;
    case 'Y':
      return `circuit.append(cirq.Y(${qubits}))\n`;
    case 'Z':
      return `circuit.append(cirq.Z(${qubits}))\n`;
    case 'S':
      return `circuit.append(cirq.S(${qubits}))\n`;
    case 'T':
      return `circuit.append(cirq.T(${qubits}))\n`;
    case 'RX':
      return `circuit.append(cirq.rx(${gate.params?.angle || 0})(${qubits}))\n`;
    case 'RY':
      return `circuit.append(cirq.ry(${gate.params?.angle || 0})(${qubits}))\n`;
    case 'RZ':
      return `circuit.append(cirq.rz(${gate.params?.angle || 0})(${qubits}))\n`;
    case 'CNOT':
      return `circuit.append(cirq.CNOT(${qubits}))\n`;
    case 'CZ':
      return `circuit.append(cirq.CZ(${qubits}))\n`;
    case 'SWAP':
      return `circuit.append(cirq.SWAP(${qubits}))\n`;
    case 'Toffoli':
      return `circuit.append(cirq.TOFFOLI(${qubits}))\n`;
    default:
      return '';
  }
}

function generateQSharpCode(circuit: CircuitState): string {
  let code = '// Microsoft Q#\n';
  code += 'namespace QuantumCircuit {\n';
  code += '    open Microsoft.Quantum.Intrinsic;\n';
  code += '    open Microsoft.Quantum.Canon;\n';
  code += '    open Microsoft.Quantum.Measurement;\n\n';
  code += '    @EntryPoint()\n';
  code += '    operation RunCircuit() : Result[] {\n';
  code += `        // Allocate ${circuit.numQubits} qubit${circuit.numQubits > 1 ? 's' : ''}\n`;
  code += `        use qubits = Qubit[${circuit.numQubits}];\n\n`;

  if (circuit.gates.length === 0) {
    code += '        // Add gates to your circuit\n\n';
  } else {
    code += '        // Apply quantum gates\n';
    const sortedGates = [...circuit.gates].sort((a, b) => a.position - b.position);

    for (const gate of sortedGates) {
      code += '        ' + generateQSharpGate(gate);
    }
    code += '\n';
  }

  code += '        // Measure all qubits\n';
  code += '        let results = MeasureEachZ(qubits);\n';
  code += '        ResetAll(qubits);\n';
  code += '        return results;\n';
  code += '    }\n';
  code += '}\n';

  return code;
}

function generateQSharpGate(gate: Gate): string {
  const qubits = gate.qubitIndices.map(i => `qubits[${i}]`).join(', ');

  switch (gate.type) {
    case 'H':
      return `H(${qubits});\n`;
    case 'X':
      return `X(${qubits});\n`;
    case 'Y':
      return `Y(${qubits});\n`;
    case 'Z':
      return `Z(${qubits});\n`;
    case 'S':
      return `S(${qubits});\n`;
    case 'T':
      return `T(${qubits});\n`;
    case 'RX':
      return `Rx(${gate.params?.angle || 0}, ${qubits});\n`;
    case 'RY':
      return `Ry(${gate.params?.angle || 0}, ${qubits});\n`;
    case 'RZ':
      return `Rz(${gate.params?.angle || 0}, ${qubits});\n`;
    case 'CNOT':
      return `CNOT(${qubits});\n`;
    case 'CZ':
      return `CZ(${qubits});\n`;
    case 'SWAP':
      return `SWAP(${qubits});\n`;
    case 'Toffoli':
      return `CCNOT(${qubits});\n`;
    default:
      return '';
  }
}

function generateBraketCode(circuit: CircuitState): string {
  let code = '# Amazon Braket\n';
  code += 'from braket.circuits import Circuit\n\n';
  code += `# Create a quantum circuit with ${circuit.numQubits} qubit${circuit.numQubits > 1 ? 's' : ''}\n`;
  code += `circuit = Circuit()\n\n`;

  if (circuit.gates.length === 0) {
    code += '# Add gates to your circuit\n';
  } else {
    code += '# Apply quantum gates\n';
    const sortedGates = [...circuit.gates].sort((a, b) => a.position - b.position);

    for (const gate of sortedGates) {
      code += generateBraketGate(gate);
    }
  }

  code += '\n# Display the circuit\n';
  code += 'print(circuit)\n';

  return code;
}

function generateBraketGate(gate: Gate): string {
  const qubits = gate.qubitIndices.join(', ');

  switch (gate.type) {
    case 'H':
      return `circuit.h(${qubits})\n`;
    case 'X':
      return `circuit.x(${qubits})\n`;
    case 'Y':
      return `circuit.y(${qubits})\n`;
    case 'Z':
      return `circuit.z(${qubits})\n`;
    case 'S':
      return `circuit.s(${qubits})\n`;
    case 'T':
      return `circuit.t(${qubits})\n`;
    case 'RX':
      return `circuit.rx(${qubits}, ${gate.params?.angle || 0})\n`;
    case 'RY':
      return `circuit.ry(${qubits}, ${gate.params?.angle || 0})\n`;
    case 'RZ':
      return `circuit.rz(${qubits}, ${gate.params?.angle || 0})\n`;
    case 'CNOT':
      return `circuit.cnot(${qubits})\n`;
    case 'CZ':
      return `circuit.cz(${qubits})\n`;
    case 'SWAP':
      return `circuit.swap(${qubits})\n`;
    case 'Toffoli':
      return `circuit.ccnot(${qubits})\n`;
    default:
      return '';
  }
}
