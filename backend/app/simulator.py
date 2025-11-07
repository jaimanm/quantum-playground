"""
Quantum circuit simulator using Qiskit
Provides statevector simulation and measurement sampling
"""
from typing import Dict, List
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


# Gate mapping from our API to Qiskit methods
GATE_MAP = {
    "H": "h",
    "X": "x",
    "Y": "y",
    "Z": "z",
}


def simulate(circuit_data: Dict) -> List[complex]:
    """
    Simulate a quantum circuit and return the final statevector.
    
    Args:
        circuit_data: Dict with 'numQubits' and 'gates' (list of gate dicts)
    
    Returns:
        Statevector as list of complex amplitudes (length 2^n)
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
    
    # Save statevector
    qc.save_statevector()
    
    # Run simulation
    simulator = AerSimulator(method='statevector')
    result = simulator.run(qc).result()
    statevector = result.get_statevector(qc)
    
    # Convert to list of complex numbers
    return [complex(amp) for amp in statevector.data]


def get_probabilities(state: List[complex], n: int) -> Dict[str, float]:
    """
    Compute measurement probabilities from statevector.
    
    Args:
        state: Statevector
        n: Number of qubits
    
    Returns:
        Dict mapping bitstrings to probabilities (only non-zero entries)
        Bitstrings are in big-endian format (q0 is leftmost)
    """
    probs = {}
    for i, amp in enumerate(state):
        p = abs(amp) ** 2
        if p > 1e-12:  # Filter near-zero probabilities
            # Circuit was reversed, so now direct format gives big-endian
            bitstring = format(i, f"0{n}b")
            probs[bitstring] = p
    return probs


def sample_shots(state: List[complex], n: int, shots: int) -> List[Dict]:
    """
    Sample measurement outcomes from the statevector.
    Uses Qiskit's measurement sampling for efficiency.
    
    Args:
        state: Statevector (not used directly - we'll resimulate with measurements)
        n: Number of qubits
        shots: Number of samples to take
    
    Returns:
        List of dicts with 'bitstring' and 'count'
    """
    # Note: For sampling, we need to reconstruct and measure the circuit
    # This is a limitation of the current API design
    # Alternative: Pass the circuit data through and create a separate sampling path
    
    # For now, sample from probabilities manually
    import random
    
    probs = [abs(amp) ** 2 for amp in state]
    total = sum(probs)
    
    # Build cumulative distribution
    cdf = []
    acc = 0.0
    for p in probs:
        acc += p
        cdf.append(acc)
    
    # Sample using inverse transform
    counts: Dict[str, int] = {}
    for _ in range(shots):
        r = random.random() * total
        for i, threshold in enumerate(cdf):
            if r <= threshold:
                # Circuit was reversed, so now direct format gives big-endian
                bitstring = format(i, f"0{n}b")
                counts[bitstring] = counts.get(bitstring, 0) + 1
                break
    
    return [{"bitstring": bs, "count": c} for bs, c in counts.items()]
