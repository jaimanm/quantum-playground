import { BarChart3, Info, TrendingUp, Sparkles } from 'lucide-react';
import { ExecutionResult } from '../types/circuit';
import { getQuantumComputer } from '../data/quantumComputers';

interface ResultsVisualizationProps {
  result: ExecutionResult;
  onClose: () => void;
}

export function ResultsVisualization({ result, onClose }: ResultsVisualizationProps) {
  const computer = getQuantumComputer(
    result.quantumComputer === 'simulator'
      ? 'simulator'
      : result.quantumComputer === 'ion-trap'
      ? 'ionq-ion-trap'
      : 'ibm-superconducting'
  );

  const expectedStates = Object.entries(result.expectedResults.probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const actualStates = result.actualResults.measurements.slice(0, 8);

  const maxExpected = Math.max(...expectedStates.map(([, prob]) => prob));
  const maxActual = Math.max(...actualStates.map((m) => m.probability));

  const fidelity = calculateFidelity(
    result.expectedResults.probabilities,
    result.actualResults.measurements
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-6xl w-full my-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Circuit Results</h2>
                <p className="text-cyan-100">
                  Executed on {computer?.name} with {result.actualResults.shots} shots
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-cyan-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-medium text-gray-700">Total Shots</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {result.actualResults.shots}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Fidelity</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{(fidelity * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Circuit Depth</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {result.metadata.circuitDepth}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-100">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Understanding Your Results</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {result.summary ||
                      `Your circuit created a quantum state and measured it ${result.actualResults.shots} times.
                      The "Expected" shows what a perfect quantum computer would produce, while "Actual" shows
                      what really happened. Differences are caused by quantum noise and imperfections in real hardware.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></span>
                  Expected Results (Theory)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  What a perfect quantum computer would measure:
                </p>
                <div className="space-y-3">
                  {expectedStates.map(([state, probability]) => (
                    <div key={state}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-semibold text-gray-700">
                          |{state}⟩
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {(probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-full rounded-full flex items-center justify-center text-xs text-white font-medium transition-all duration-500"
                          style={{ width: `${(probability / maxExpected) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Actual Results (Measured)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  What {computer?.name} actually measured:
                </p>
                <div className="space-y-3">
                  {actualStates.map((measurement) => (
                    <div key={measurement.state}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-semibold text-gray-700">
                          |{measurement.state}⟩
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {measurement.count} shots
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {(measurement.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full flex items-center justify-center text-xs text-white font-medium transition-all duration-500"
                          style={{
                            width: `${(measurement.probability / maxActual) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="text-yellow-600 mr-2">🤔</span>
                Why aren't they exactly the same?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.quantumComputer === 'simulator'
                  ? 'Even in simulation, quantum measurements are probabilistic! Running the circuit multiple times gives us a statistical picture of the quantum state.'
                  : 'Real quantum computers experience noise from their environment, imperfect gates, and decoherence. This is why quantum error correction is so important!'}
              </p>
            </div>

            <details className="bg-gray-50 rounded-lg overflow-hidden">
              <summary className="cursor-pointer p-4 font-semibold text-gray-800 hover:bg-gray-100 transition-colors">
                Advanced Details
              </summary>
              <div className="p-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Execution Time:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {result.metadata.executionTime}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gate Count:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {result.metadata.gateCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Circuit Depth:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {result.metadata.circuitDepth}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Timestamp:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {new Date(result.metadata.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </details>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateFidelity(
  expected: { [state: string]: number },
  actual: { state: string; probability: number }[]
): number {
  let fidelity = 0;
  const actualMap = Object.fromEntries(actual.map((m) => [m.state, m.probability]));

  for (const [state, prob] of Object.entries(expected)) {
    const actualProb = actualMap[state] || 0;
    fidelity += Math.sqrt(prob * actualProb);
  }

  return Math.pow(fidelity, 2);
}
