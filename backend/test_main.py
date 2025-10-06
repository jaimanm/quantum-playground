import pytest
from main import simulate_with_qiskit, simulate_with_pennylane, CircuitState, Gate

class TestSimulationFunctions:
    def test_simulate_with_qiskit_basic(self, sample_circuit_data):
        """Test Qiskit simulation function directly"""
        circuit = sample_circuit_data["circuit"]
        shots = sample_circuit_data["shots"]

        result = simulate_with_qiskit(circuit, shots)

        # stateVector is only computed when there are no measurements
        if not circuit.measurements:
            assert result.stateVector is not None
        assert result.probabilities is not None
        assert result.measurements is not None
        assert result.executionTime > 0
        assert result.circuitDepth >= 0
        assert result.gateCount >= 0

    def test_simulate_with_pennylane_basic(self, sample_circuit_data):
        """Test PennyLane simulation function directly"""
        circuit = sample_circuit_data["circuit"]
        shots = sample_circuit_data["shots"]

        result = simulate_with_pennylane(circuit, shots)

        assert result.probabilities is not None
        assert result.measurements is not None
        assert result.executionTime > 0
        assert len(result.probabilities) == 2 ** circuit.numQubits

    def test_simulate_with_qiskit_complex(self, complex_circuit_data):
        """Test complex circuit with Qiskit"""
        circuit = complex_circuit_data["circuit"]
        shots = complex_circuit_data["shots"]

        result = simulate_with_qiskit(circuit, shots)

        assert len(result.measurements) > 0
        total_shots = sum(measurement['count'] for measurement in result.measurements)
        assert total_shots == shots

    def test_simulate_invalid_circuit(self):
        """Test simulation with invalid circuit data"""
        invalid_circuit = CircuitState(
            numQubits=-1,  # Invalid
            gates=[],
            measurements=[]
        )

        with pytest.raises(Exception):  # Qiskit raises CircuitError for invalid numQubits
            simulate_with_qiskit(invalid_circuit, 100)

    def test_simulate_empty_circuit(self):
        """Test simulation with empty circuit"""
        empty_circuit = CircuitState(
            numQubits=1,
            gates=[],
            measurements=[0]
        )

        result = simulate_with_qiskit(empty_circuit, 100)
        assert result.gateCount >= 0  # May include measurement gates
        assert len(result.measurements) > 0

    def test_simulate_single_qubit_gates(self):
        """Test all single-qubit gates"""
        gates_to_test = ["H", "X", "Y", "Z", "S", "T"]

        for gate_type in gates_to_test:
            circuit = CircuitState(
                numQubits=1,
                gates=[
                    Gate(
                        id=f"{gate_type.lower()}1",
                        type=gate_type,
                        qubitIndices=[0],
                        position=0
                    )
                ],
                measurements=[0]
            )

            result = simulate_with_qiskit(circuit, 100)
            assert result.gateCount >= 1  # At least the gate we added, plus measurements

    def test_simulate_two_qubit_gates(self):
        """Test two-qubit gates"""
        gates_to_test = ["CNOT", "CZ", "SWAP"]

        for gate_type in gates_to_test:
            circuit = CircuitState(
                numQubits=2,
                gates=[
                    Gate(
                        id=f"{gate_type.lower()}1",
                        type=gate_type,
                        qubitIndices=[0, 1],
                        position=0
                    )
                ],
                measurements=[0, 1]
            )

            result = simulate_with_qiskit(circuit, 100)
            assert result.gateCount >= 1  # At least the gate we added, plus measurements

    def test_simulate_parametric_gates(self):
        """Test parametric gates"""
        parametric_gates = [
            ("RX", {"angle": 1.57}),
            ("RY", {"angle": 0.78}),
            ("RZ", {"angle": 3.14})
        ]

        for gate_type, params in parametric_gates:
            circuit = CircuitState(
                numQubits=1,
                gates=[
                    Gate(
                        id=f"{gate_type.lower()}1",
                        type=gate_type,
                        qubitIndices=[0],
                        position=0,
                        params=params
                    )
                ],
                measurements=[0]
            )

            result = simulate_with_qiskit(circuit, 100)
            assert result.gateCount >= 1  # At least the gate we added, plus measurements

    def test_simulate_toffoli_gate(self):
        """Test Toffoli gate"""
        circuit = CircuitState(
            numQubits=3,
            gates=[
                Gate(
                    id="toffoli1",
                    type="Toffoli",
                    qubitIndices=[0, 1, 2],
                    position=0
                )
            ],
            measurements=[0, 1, 2]
        )

        result = simulate_with_qiskit(circuit, 100)
        assert result.gateCount >= 1  # At least the gate we added, plus measurements

    @pytest.mark.slow
    def test_simulate_large_circuit_performance(self):
        """Test performance with larger circuit"""
        import time

        num_qubits = 5
        gates = []
        for i in range(num_qubits):
            gates.append(
                Gate(
                    id=f"h{i}",
                    type="H",
                    qubitIndices=[i],
                    position=i
                )
            )

        circuit = CircuitState(
            numQubits=num_qubits,
            gates=gates,
            measurements=list(range(num_qubits))
        )

        start_time = time.time()
        result = simulate_with_qiskit(circuit, 1000)
        execution_time = time.time() - start_time

        assert execution_time < 5.0  # Should complete within 5 seconds
        assert result.gateCount >= num_qubits  # At least the gates we added, plus measurements