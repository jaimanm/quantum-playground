# Quantum Playground Backend

FastAPI server for quantum circuit simulation using Qiskit and PennyLane.

## Setup

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /simulate

Simulate a quantum circuit.

**Request Body:**

```json
{
  "circuit": {
    "numQubits": 2,
    "gates": [
      {
        "id": "gate-1",
        "type": "H",
        "qubitIndices": [0],
        "position": 0
      }
    ],
    "measurements": []
  },
  "shots": 1024,
  "backend": "qiskit"
}
```

**Response:**

```json
{
  "stateVector": {
    "amplitudes": [{ "real": 0.707, "imaginary": 0.0 }],
    "probabilities": [0.5, 0.5]
  },
  "probabilities": { "00": 0.5, "11": 0.5 },
  "measurements": [{ "state": "00", "count": 512, "probability": 0.5 }],
  "executionTime": 0.023,
  "circuitDepth": 1,
  "gateCount": 1
}
```

### GET /health

Health check endpoint.

## Supported Gates

- Single qubit: H, X, Y, Z, S, T, RX, RY, RZ
- Multi-qubit: CNOT, CZ, SWAP, Toffoli

## Backends

- `qiskit`: Uses Qiskit with Aer simulator
- `pennylane`: Uses PennyLane with default.qubit device
