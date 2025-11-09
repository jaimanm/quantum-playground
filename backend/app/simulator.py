"""
Quantum circuit simulator using Qiskit
Provides statevector simulation and measurement sampling
"""
from typing import Dict, List, Tuple
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector


# Gate mapping from our API to Qiskit methods
GATE_MAP = {
    "H": "h",
    "X": "x",
    "Y": "y",
    "Z": "z",
}


def _build_circuit(circuit_data: Dict) -> Tuple[QuantumCircuit, int]:
    """
    Build a Qiskit QuantumCircuit from circuit data.
    
    Args:
        circuit_data: Dict with 'numQubits' and 'gates'
    
    Returns:
        Tuple of (circuit, num_qubits)
    """
    n = circuit_data["numQubits"]
    qc = QuantumCircuit(n)
    
    # Group gates by column
    by_col: Dict[int, List[tuple]] = {}
    max_col = 0
    for gate in circuit_data["gates"]:
        qubit = gate["targets"][0]
        col = gate["column"]
        gate_type = gate["type"]
        by_col.setdefault(col, []).append((qubit, gate_type))
        max_col = max(max_col, col)
    
    # Apply gates column by column
    for col in range(max_col + 1):
        if col in by_col:
            for qubit, gate_type in by_col[col]:
                gate_method = getattr(qc, GATE_MAP[gate_type])
                gate_method(qubit)
    
    # Reverse qubit ordering to match big-endian convention (q0 leftmost)
    qc = qc.reverse_bits()
    
    return qc, n


def simulate(circuit_data: Dict) -> List[complex]:
    """
    Simulate a quantum circuit and return the final statevector.
    
    Args:
        circuit_data: Dict with 'numQubits' and 'gates' (list of gate dicts)
    
    Returns:
        Statevector as list of complex amplitudes (length 2^n)
    """
    qc, n = _build_circuit(circuit_data)
    
    # Use Qiskit's Statevector to simulate
    statevector = Statevector.from_instruction(qc)
    
    # Convert to list of complex numbers
    return [complex(amp) for amp in statevector.data]


def get_probabilities(state: List[complex], n: int) -> Dict[str, float]:
    """
    Compute measurement probabilities from statevector using Qiskit.
    
    Args:
        state: Statevector as list of complex amplitudes
        n: Number of qubits
    
    Returns:
        Dict mapping bitstrings to probabilities (only non-zero entries)
        Bitstrings are in big-endian format (q0 is leftmost)
    """
    # Create Qiskit Statevector object
    statevector = Statevector(state)
    
    # Get probabilities dict using Qiskit's built-in method
    # probabilities_dict returns format like {'00': 0.5, '11': 0.5}
    probs_dict = statevector.probabilities_dict()
    
    # Filter out near-zero probabilities
    return {bs: p for bs, p in probs_dict.items() if p > 1e-12}


def sample_shots(state: List[complex], n: int, shots: int) -> List[Dict]:
    """
    Sample measurement outcomes from the statevector using Qiskit.
    
    Args:
        state: Statevector as list of complex amplitudes
        n: Number of qubits
        shots: Number of samples to take
    
    Returns:
        List of dicts with 'bitstring' and 'count'
    """
    # Create Qiskit Statevector object
    statevector = Statevector(state)
    
    # Use Qiskit's built-in sampling method
    # sample_counts returns a Counts object (dict-like) with measurement results
    counts = statevector.sample_counts(shots=shots)
    
    # Convert to list of dicts format
    return [{"bitstring": bs, "count": c} for bs, c in counts.items()]
