import { Info } from "lucide-react";
import { getGatesByCategory } from "../data/gateDefinitions";
import { GateType } from "../types/circuit";
import { useState } from "react";

interface GateLibraryProps {
  onGateSelect: (gateType: GateType) => void;
}

export function GateLibrary({ onGateSelect }: GateLibraryProps) {
  const [hoveredGate, setHoveredGate] = useState<string | null>(null);

  const singleQubitGates = getGatesByCategory("single");
  const rotationGates = getGatesByCategory("rotation");
  const controlledGates = getGatesByCategory("controlled");

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Gate Library
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Click on a gate to select it, then click on the circuit to place it.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Single Qubit Gates
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {singleQubitGates.map((gate) => (
              <div key={gate.type} className="relative">
                <button
                  onClick={() => onGateSelect(gate.type)}
                  onMouseEnter={() => setHoveredGate(gate.type)}
                  onMouseLeave={() => setHoveredGate(null)}
                  className={`w-full ${gate.color} hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md cursor-pointer`}
                >
                  <div className="text-lg">{gate.icon}</div>
                  <div className="text-xs mt-1">{gate.name}</div>
                </button>
                {hoveredGate === gate.type && (
                  <div className="absolute z-50 left-full ml-2 top-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">{gate.name}</div>
                        <div className="text-gray-300">{gate.tooltip}</div>
                      </div>
                    </div>
                    <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Rotation Gates
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {rotationGates.map((gate) => (
              <div key={gate.type} className="relative">
                <button
                  onClick={() => onGateSelect(gate.type)}
                  onMouseEnter={() => setHoveredGate(gate.type)}
                  onMouseLeave={() => setHoveredGate(null)}
                  className={`w-full ${gate.color} hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md cursor-pointer`}
                >
                  <div className="text-lg">{gate.icon}</div>
                  <div className="text-xs mt-1">{gate.name}</div>
                </button>
                {hoveredGate === gate.type && (
                  <div className="absolute z-50 left-full ml-2 top-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">{gate.name}</div>
                        <div className="text-gray-300">{gate.tooltip}</div>
                      </div>
                    </div>
                    <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Multi-Qubit Gates
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {controlledGates.map((gate) => (
              <div key={gate.type} className="relative">
                <button
                  onClick={() => onGateSelect(gate.type)}
                  onMouseEnter={() => setHoveredGate(gate.type)}
                  onMouseLeave={() => setHoveredGate(null)}
                  className={`w-full ${gate.color} hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md cursor-pointer`}
                >
                  <div className="text-lg">{gate.icon}</div>
                  <div className="text-xs mt-1">{gate.name}</div>
                </button>
                {hoveredGate === gate.type && (
                  <div className="absolute z-50 left-full ml-2 top-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">{gate.name}</div>
                        <div className="text-gray-300">{gate.tooltip}</div>
                      </div>
                    </div>
                    <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="bg-cyan-50 rounded-lg p-3">
          <p className="text-xs text-cyan-800">
            <strong>Tip:</strong> Hover over gates to learn what they do. Start
            with the Hadamard (H) gate to create superposition!
          </p>
        </div>
      </div>
    </div>
  );
}
