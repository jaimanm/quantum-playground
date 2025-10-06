from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
from enum import Enum

app = FastAPI(title="Quantum Playground Backend", version="1.0.0")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GateType(str, Enum):
    H = "H"
    X = "X"
    Y = "Y"
    Z = "Z"
    S = "S"
    T = "T"
    RX = "RX"
    RY = "RY"
    RZ = "RZ"
    CNOT = "CNOT"
    CZ = "CZ"
    SWAP = "SWAP"
    TOFFOLI = "Toffoli"

class Gate(BaseModel):
    id: str
    type: GateType
    qubitIndices: List[int]
    position: int
    params: Optional[Dict[str, float]] = None

class CircuitState(BaseModel):
    numQubits: int
    gates: List[Gate]
    measurements: List[int]

class SimulationRequest(BaseModel):
    circuit: CircuitState
    shots: int = 1024
    backend: str = "qiskit"  # "qiskit" or "pennylane"

class SimulationResult(BaseModel):
    stateVector: Optional[Dict[str, Any]] = None
    probabilities: Dict[str, float]
    measurements: List[Dict[str, Any]]
    executionTime: float
    circuitDepth: int
    gateCount: int

@app.post("/simulate", response_model=SimulationResult)
async def simulate_circuit(request: SimulationRequest):
    try:
        if request.backend == "qiskit":
            return simulate_with_qiskit(request.circuit, request.shots)
        elif request.backend == "pennylane":
            return simulate_with_pennylane(request.circuit, request.shots)
        else:
            raise HTTPException(status_code=400, detail="Unsupported backend")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def simulate_with_qiskit(circuit: CircuitState, shots: int) -> SimulationResult:
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    import time

    start_time = time.time()

    # Create Qiskit circuit
    qc = QuantumCircuit(circuit.numQubits)

    # Sort gates by position
    sorted_gates = sorted(circuit.gates, key=lambda g: g.position)

    # Add gates to circuit
    for gate in sorted_gates:
        qubits = gate.qubitIndices
        if gate.type == GateType.H:
            qc.h(qubits[0])
        elif gate.type == GateType.X:
            qc.x(qubits[0])
        elif gate.type == GateType.Y:
            qc.y(qubits[0])
        elif gate.type == GateType.Z:
            qc.z(qubits[0])
        elif gate.type == GateType.S:
            qc.s(qubits[0])
        elif gate.type == GateType.T:
            qc.t(qubits[0])
        elif gate.type == GateType.RX:
            qc.rx(gate.params.get("angle", 0), qubits[0])
        elif gate.type == GateType.RY:
            qc.ry(gate.params.get("angle", 0), qubits[0])
        elif gate.type == GateType.RZ:
            qc.rz(gate.params.get("angle", 0), qubits[0])
        elif gate.type == GateType.CNOT:
            qc.cx(qubits[0], qubits[1])
        elif gate.type == GateType.CZ:
            qc.cz(qubits[0], qubits[1])
        elif gate.type == GateType.SWAP:
            qc.swap(qubits[0], qubits[1])
        elif gate.type == GateType.TOFFOLI:
            qc.ccx(qubits[0], qubits[1], qubits[2])

    # Add measurements
    qc.measure_all()

    # Simulate
    simulator = AerSimulator()
    job = simulator.run(qc, shots=shots)
    result = job.result()

    # Get state vector if no measurements
    statevector = None
    if not circuit.measurements:
        from qiskit.quantum_info import Statevector
        sv = Statevector.from_instruction(qc.remove_final_measurements())
        statevector = {
            "amplitudes": [{"real": float(amp.real), "imaginary": float(amp.imag)} for amp in sv.data],
            "probabilities": [float(p) for p in sv.probabilities()]
        }

    # Get measurement counts
    counts = result.get_counts(qc)
    measurements = [{"state": state, "count": count, "probability": count/shots}
                   for state, count in counts.items()]

    execution_time = time.time() - start_time

    return SimulationResult(
        stateVector=statevector,
        probabilities={state: count/shots for state, count in counts.items()},
        measurements=measurements,
        executionTime=execution_time,
        circuitDepth=qc.depth(),
        gateCount=len(qc.data)
    )

def simulate_with_pennylane(circuit: CircuitState, shots: int) -> SimulationResult:
    import pennylane as qml
    import time

    start_time = time.time()

    # Create PennyLane device
    dev = qml.device("default.qubit", wires=circuit.numQubits, shots=shots)

    # Define circuit function
    @qml.qnode(dev)
    def pennylane_circuit():
        # Sort gates by position
        sorted_gates = sorted(circuit.gates, key=lambda g: g.position)

        # Add gates
        for gate in sorted_gates:
            qubits = gate.qubitIndices
            if gate.type == GateType.H:
                qml.Hadamard(wires=qubits[0])
            elif gate.type == GateType.X:
                qml.PauliX(wires=qubits[0])
            elif gate.type == GateType.Y:
                qml.PauliY(wires=qubits[0])
            elif gate.type == GateType.Z:
                qml.PauliZ(wires=qubits[0])
            elif gate.type == GateType.S:
                qml.S(wires=qubits[0])
            elif gate.type == GateType.T:
                qml.T(wires=qubits[0])
            elif gate.type == GateType.RX:
                qml.RX(gate.params.get("angle", 0), wires=qubits[0])
            elif gate.type == GateType.RY:
                qml.RY(gate.params.get("angle", 0), wires=qubits[0])
            elif gate.type == GateType.RZ:
                qml.RZ(gate.params.get("angle", 0), wires=qubits[0])
            elif gate.type == GateType.CNOT:
                qml.CNOT(wires=[qubits[0], qubits[1]])
            elif gate.type == GateType.CZ:
                qml.CZ(wires=[qubits[0], qubits[1]])
            elif gate.type == GateType.SWAP:
                qml.SWAP(wires=[qubits[0], qubits[1]])
            elif gate.type == GateType.TOFFOLI:
                qml.Toffoli(wires=[qubits[0], qubits[1], qubits[2]])

        # Return probabilities
        return qml.probs(wires=range(circuit.numQubits))

    # Execute circuit
    probabilities = pennylane_circuit()

    # For measurements, sample from probabilities
    measurements = []
    if shots > 0:
        samples = np.random.choice(2**circuit.numQubits, size=shots, p=probabilities)
        unique, counts = np.unique(samples, return_counts=True)
        for state_idx, count in zip(unique, counts):
            state = format(state_idx, f'0{circuit.numQubits}b')
            measurements.append({
                "state": state,
                "count": int(count),
                "probability": float(count / shots)
            })

    execution_time = time.time() - start_time

    return SimulationResult(
        stateVector=None,  # PennyLane focuses on measurements
        probabilities={format(i, f'0{circuit.numQubits}b'): float(p) for i, p in enumerate(probabilities)},
        measurements=measurements,
        executionTime=execution_time,
        circuitDepth=0,  # PennyLane doesn't easily expose depth
        gateCount=len(circuit.gates)
    )

@app.get("/")
async def root():
    return {"message": "Quantum Playground Backend API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}