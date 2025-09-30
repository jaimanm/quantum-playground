import { Code, Sparkles } from 'lucide-react';
import { ViewMode } from '../types/circuit';

interface ModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm">
      <button
        onClick={() => onModeChange('interactive')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
          mode === 'interactive'
            ? 'bg-white text-cyan-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">Interactive</span>
      </button>
      <button
        onClick={() => onModeChange('code')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
          mode === 'code'
            ? 'bg-white text-cyan-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Code className="w-4 h-4" />
        <span className="font-medium">Code</span>
      </button>
    </div>
  );
}
