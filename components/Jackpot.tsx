import React, { useEffect, useState } from 'react';

export const Jackpot: React.FC = () => {
  const [amount, setAmount] = useState(8829341022);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount(prev => prev + Math.floor(Math.random() * 500));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-red-900 via-black to-red-900 p-2 border-y-2 border-yellow-500 shadow-[0_0_20px_rgba(255,0,0,0.5)] mb-4">
      <div className="flex flex-col items-center">
        <h3 className="text-yellow-400 font-black text-sm uppercase tracking-[0.3em] animate-pulse">Progressive Jackpot</h3>
        <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-mono tracking-tighter">
          IDR {amount.toLocaleString().replace(/,/g, '.')}
        </div>
      </div>
    </div>
  );
};