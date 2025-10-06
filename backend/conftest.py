import pytest
from fastapi.testclient import TestClient
from main import app, CircuitState

@pytest.fixture
def client():
    """FastAPI test client fixture"""
    return TestClient(app)

@pytest.fixture
def sample_circuit_data():
    """Sample circuit data for testing"""
    return {
        "circuit": CircuitState(
            numQubits=2,
            gates=[
                {
                    "id": "h1",
                    "type": "H",
                    "qubitIndices": [0],
                    "position": 0
                }
            ],
            measurements=[0, 1]
        ),
        "shots": 100,
        "backend": "qiskit"
    }

@pytest.fixture
def complex_circuit_data():
    """Complex circuit data for testing"""
    return {
        "circuit": CircuitState(
            numQubits=3,
            gates=[
                {
                    "id": "h1",
                    "type": "H",
                    "qubitIndices": [0],
                    "position": 0
                },
                {
                    "id": "x1",
                    "type": "X",
                    "qubitIndices": [1],
                    "position": 1
                },
                {
                    "id": "cnot1",
                    "type": "CNOT",
                    "qubitIndices": [0, 1],
                    "position": 2
                }
            ],
            measurements=[0, 1, 2]
        ),
        "shots": 1000,
        "backend": "qiskit"
    }