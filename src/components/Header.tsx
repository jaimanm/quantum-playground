import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Quantum Circuit Builder</h1>
              <p className="text-cyan-100 text-sm">Build, simulate, and explore quantum circuits</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
