import { Copy, Check } from 'lucide-react';
import { CircuitState, CodeFramework } from '../types/circuit';
import { generateCode } from '../utils/codeGenerator';
import { useState } from 'react';

interface CodeEditorProps {
  circuit: CircuitState;
  framework: CodeFramework;
  onFrameworkChange: (framework: CodeFramework) => void;
}

const frameworks: { value: CodeFramework; label: string; color: string }[] = [
  { value: 'qiskit', label: 'Qiskit (IBM)', color: 'text-purple-600' },
  { value: 'pennylane', label: 'PennyLane', color: 'text-green-600' },
  { value: 'cirq', label: 'Cirq (Google)', color: 'text-blue-600' },
  { value: 'qsharp', label: 'Q# (Microsoft)', color: 'text-cyan-600' },
  { value: 'braket', label: 'Braket (AWS)', color: 'text-orange-600' },
];

export function CodeEditor({ circuit, framework, onFrameworkChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const code = generateCode(circuit, framework);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-300 text-sm font-medium">Framework:</span>
          <select
            value={framework}
            onChange={(e) => onFrameworkChange(e.target.value as CodeFramework)}
            className="bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {frameworks.map((fw) => (
              <option key={fw.value} value={fw.value}>
                {fw.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md transition-colors text-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-900 p-6 overflow-x-auto">
        <pre className="text-sm text-gray-100 font-mono leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This code is automatically generated from your visual circuit. Changes in the interactive mode will update the code in real-time.
        </p>
      </div>
    </div>
  );
}
