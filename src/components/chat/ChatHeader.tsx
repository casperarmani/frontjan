
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ChatHeader({ onSwitchMode }: { onSwitchMode?: (mode: 'normal' | 'custom') => void }) {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = React.useState<'normal' | 'custom'>('normal');

  const handleClose = () => {
    navigate('/');
  };

  const handleModeSwitch = (mode: 'normal' | 'custom') => {
    setActiveMode(mode);
    if (onSwitchMode) {
      onSwitchMode(mode);
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
      <div className="flex space-x-2 relative z-50">
        <button
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
        />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => handleModeSwitch('normal')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeMode === 'normal' 
              ? 'bg-white/20 text-white' 
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          AI Agent
        </button>
        <button
          onClick={() => handleModeSwitch('custom')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeMode === 'custom' 
              ? 'bg-white/20 text-white' 
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          TikTok Trends Analysis
        </button>
      </div>
    </div>
  );
}
