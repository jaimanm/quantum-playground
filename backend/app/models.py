"""
Pydantic models for API request/response schemas
"""
from pydantic import BaseModel, Field
from typing import List, Literal, Dict, Optional


GateType = Literal["H", "X", "Y", "Z"]


class Gate(BaseModel):
    """Single quantum gate"""
    id: str
    type: GateType
    targets: List[int]
    column: int = Field(ge=0, description="Time step / column index")


class Circuit(BaseModel):
    """Quantum circuit specification"""
    numQubits: int = Field(gt=0, le=12, description="Number of qubits (max 12 for performance)")
    gates: List[Gate]


class SimulationRequest(BaseModel):
    """Request to simulate a quantum circuit"""
    circuit: Circuit
    shots: Optional[int] = Field(
        default=None, 
        ge=1, 
        le=10000, 
        description="Number of measurement samples (omit for exact probabilities only)"
    )


class SimulationResponse(BaseModel):
    """Simulation results"""
    numQubits: int
    probabilities: Dict[str, float]
    samples: Optional[List[Dict[str, int | str]]] = None
    metadata: Dict[str, float]
