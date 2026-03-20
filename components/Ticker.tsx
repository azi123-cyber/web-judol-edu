import React from 'react';
import { Volume2 } from 'lucide-react';

interface TickerProps {
  items: string[];
}

export const Ticker: React.FC<TickerProps> = ({ items }) => {
  return (
    <div className="bg-gray-900 border-b border-yellow-600/30 flex items-center overflow-hidden h-10 text-sm text-white">
      <div className="px-3 text-yellow-500 animate-pulse">
        <Volume2 size={18} />
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] absolute top-0 pt-2.5">
          {items.map((item, index) => (
            <span key={index} className="mx-8">
              <span className="text-yellow-400 font-bold">[WINNER]</span> {item}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {items.map((item, index) => (
            <span key={`dup-${index}`} className="mx-8">
              <span className="text-yellow-400 font-bold">[WINNER]</span> {item}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
