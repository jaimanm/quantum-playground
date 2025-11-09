import * as Tooltip from "@radix-ui/react-tooltip";
import { MAX_QUBITS, MIN_QUBITS } from "../constants/circuit";

interface QubitControlsProps {
  onIncrease: () => void;
  onDecrease: () => void;
  numQubits: number;
  onClear: () => void;
  hasGates: boolean;
}

/**
 * Component for +/- Qubit Buttons
 * Positioned at the top-right of the circuit container
 */
const QubitControls: React.FC<QubitControlsProps> = ({
  onIncrease,
  onDecrease,
  numQubits,
  onClear,
  hasGates,
}) => {
  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="absolute left-full top-4 ml-4 flex flex-col items-center gap-2">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={onIncrease}
              disabled={numQubits >= MAX_QUBITS}
              className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold transition-colors"
            >
              +
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-700 shadow-lg z-50"
              sideOffset={5}
            >
              Add qubit
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <span className="text-lg font-bold text-gray-400 w-8 text-center">
          {numQubits}
        </span>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={onDecrease}
              disabled={numQubits <= MIN_QUBITS}
              className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold transition-colors"
            >
              -
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-700 shadow-lg z-50"
              sideOffset={5}
            >
              Remove qubit
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <div className="h-4"></div>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={onClear}
              disabled={!hasGates}
              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-700 shadow-lg z-50"
              sideOffset={5}
            >
              Clear circuit
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
};

export default QubitControls;
