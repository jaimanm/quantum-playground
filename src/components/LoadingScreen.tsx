import { QuantumComputerType } from '../types/circuit';
import { Atom, Cpu, Zap } from 'lucide-react';

interface LoadingScreenProps {
  computerType: QuantumComputerType;
  progress: number;
}

const facts = [
  "Quantum computers use qubits that can be in superposition - both 0 and 1 at the same time!",
  "Entanglement allows qubits to be mysteriously connected across any distance.",
  "Quantum computers must be kept extremely cold - colder than outer space!",
  "A quantum computer with 300 qubits could represent more states than there are atoms in the universe.",
  "Quantum algorithms like Shor's can break traditional encryption methods.",
  "Ion trap quantum computers use individual atoms trapped by electromagnetic fields.",
  "Superconducting quantum computers operate at just 0.015 degrees above absolute zero.",
];

export function LoadingScreen({ computerType, progress }: LoadingScreenProps) {
  const fact = facts[Math.floor(Math.random() * facts.length)];

  const getIcon = () => {
    switch (computerType) {
      case 'ion-trap':
        return <Atom className="w-16 h-16" />;
      case 'superconducting':
        return <Cpu className="w-16 h-16" />;
      default:
        return <Zap className="w-16 h-16" />;
    }
  };

  const getTitle = () => {
    switch (computerType) {
      case 'ion-trap':
        return 'Preparing Ion Trap System';
      case 'superconducting':
        return 'Cooling Superconducting Qubits';
      default:
        return 'Simulating Quantum Circuit';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center">
            <div className="text-cyan-500 mb-6 animate-pulse">{getIcon()}</div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">{getTitle()}</h2>
            <p className="text-gray-600 text-center mb-8">
              Your quantum circuit is being executed...
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>

            <div className="w-full">
              <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
                <p className="text-sm text-cyan-900 flex items-start">
                  <span className="text-cyan-500 mr-2 text-lg">💡</span>
                  <span className="flex-1">{fact}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
