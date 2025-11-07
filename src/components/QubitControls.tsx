import { MAX_QUBITS, MIN_QUBITS } from "../constants/circuit";

interface QubitControlsProps {
  onIncrease: () => void;
  onDecrease: () => void;
  numQubits: number;
}

/**
 * Component for +/- Qubit Buttons
 * Positioned at the top-right of the circuit container
 */
const QubitControls: React.FC<QubitControlsProps> = ({
  onIncrease,
  onDecrease,
  numQubits,
}) => {
  return (
    <div className="absolute left-full top-4 ml-4 flex flex-col items-center gap-2">
      <button
        onClick={onIncrease}
        disabled={numQubits >= MAX_QUBITS}
        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold transition-colors"
      >
        +
      </button>
      <span className="text-lg font-bold text-gray-400 w-8 text-center">
        {numQubits}
      </span>
      <button
        onClick={onDecrease}
        disabled={numQubits <= MIN_QUBITS}
        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold transition-colors"
      >
        -
      </button>
    </div>
  );
};

export default QubitControls;
