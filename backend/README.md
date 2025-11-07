# Quantum Circuit Simulator Backend

FastAPI backend for quantum circuit simulation with single-qubit gates (H, X, Y, Z).

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Run Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── __init__.py      # Package marker
│   ├── main.py          # FastAPI app and endpoints
│   ├── models.py        # Pydantic request/response schemas
│   └── simulator.py     # Quantum simulation engine
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## API Endpoints

### POST /simulate

Simulate a quantum circuit and return probabilities.

**Request body:**

```json
{
  "circuit": {
    "numQubits": 2,
    "gates": [
      {
        "id": "gate-1",
        "type": "H",
        "targets": [0],
        "column": 0
      },
      {
        "id": "gate-2",
        "type": "X",
        "targets": [1],
        "column": 1
      }
    ]
  },
  "shots": 1000
}
```

**Response:**

```json
{
  "numQubits": 2,
  "probabilities": {
    "00": 0.5,
    "01": 0.0,
    "10": 0.5,
    "11": 0.0
  },
  "samples": [
    { "bitstring": "00", "count": 512 },
    { "bitstring": "10", "count": 488 }
  ],
  "metadata": {
    "durationMs": 1.234
  }
}
```

## Testing

Test the API using the interactive docs at http://localhost:8000/docs or with curl:

```bash
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "circuit": {
      "numQubits": 1,
      "gates": [
        {"id": "1", "type": "H", "targets": [0], "column": 0}
      ]
    }
  }'
```

## Future Extensions

- Two-qubit gates (CNOT, CZ, SWAP)
- Async job submission for hardware providers
- Provider abstraction (IonQ, IBM, Azure Quantum)
- API key management and authentication
