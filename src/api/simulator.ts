/**
 * API client for quantum circuit simulation backend
 */

export interface SimGate {
  id: string;
  type: "H" | "X" | "Y" | "Z";
  targets: number[];
  column: number;
}

export interface SimCircuit {
  numQubits: number;
  gates: SimGate[];
}

export interface SimRequest {
  circuit: SimCircuit;
  shots?: number;
}

export interface SimSample {
  bitstring: string;
  count: number;
}

export interface SimResponse {
  numQubits: number;
  statevector: Array<{ re: number; im: number }>;
  probabilities: Record<string, number>;
  samples?: SimSample[];
  metadata: {
    durationMs: number;
  };
}

const BASE_URL = "http://localhost:8000";

export async function simulateCircuit(req: SimRequest): Promise<SimResponse> {
  const response = await fetch(`${BASE_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Simulation failed (${response.status})`);
  }

  return response.json();
}
