"""
FastAPI application for quantum circuit simulation
"""
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import SimulationRequest, SimulationResponse
from .simulator import simulate, get_probabilities, sample_shots


app = FastAPI(
    title="Quantum Simulator API",
    description="Backend for quantum circuit simulation with support for single-qubit gates",
    version="0.1.0"
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Quantum Simulator API",
        "docs": "/docs"
    }


@app.post("/simulate", response_model=SimulationResponse)
def simulate_circuit(req: SimulationRequest):
    """
    Simulate a quantum circuit and return probabilities and optional samples.
    
    Args:
        req: SimulationRequest with circuit specification and optional shots
    
    Returns:
        SimulationResponse with probabilities, samples, and metadata
    """
    start_time = time.perf_counter()
    
    # Convert Pydantic models to dicts for simulator
    circuit_dict = {
        "numQubits": req.circuit.numQubits,
        "gates": [gate.model_dump() for gate in req.circuit.gates]
    }
    
    # Run simulation
    state = simulate(circuit_dict)
    probabilities = get_probabilities(state, req.circuit.numQubits)
    
    # Optional sampling
    samples = None
    if req.shots:
        samples = sample_shots(state, req.circuit.numQubits, req.shots)
    
    duration_ms = (time.perf_counter() - start_time) * 1000
    
    return SimulationResponse(
        numQubits=req.circuit.numQubits,
        probabilities=probabilities,
        samples=samples,
        metadata={"durationMs": duration_ms}
    )
