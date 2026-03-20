import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';

interface CrashGameProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

// Crash multiplier at which the plane crashes (90% below 2x, some lucky ones)
function getCrashPoint(spinCount: number): number {
  if (spinCount < 3) return [2.5, 1.8, 3.2][spinCount] ?? 2;
  const r = Math.random();
  if (r < 0.80) return 1 + Math.random();         // Most crash before 2x
  if (r < 0.95) return 2 + Math.random() * 3;      // Crash 2-5x
  if (r < 0.99) return 5 + Math.random() * 10;     // Lucky 5-15x
  return 20 + Math.random() * 30;                   // Almost impossible 20-50x
}

export const CrashGame: React.FC<CrashGameProps> = ({ banner, user, onSpin, onClose }) => {
  const [bet, setBet] = useState(banner.minBet);
  const [phase, setPhase] = useState<'idle' | 'flying' | 'crashed' | 'cashedout'>('idle');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(1.0);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [lossAnim, setLossAnim] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const multRef = useRef(1.0);

  const adjustBet = (m: number) => {
    let n = Math.round(bet * m);
    if (n < banner.minBet) n = banner.minBet;
    if (n > banner.maxBet) n = banner.maxBet;
    setBet(n);
  };

  const handleStart = useCallback(() => {
    if (phase !== 'idle' || user.balance < bet) return;
    
    const cp = getCrashPoint(user.spinCount);
    setCrashPoint(cp);
    multRef.current = 1.0;
    setMultiplier(1.0);
    setCashedOutAt(null);
    setPhase('flying');
    
    setLossAnim(bet);
    setTimeout(() => setLossAnim(null), 1000);

    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 0.05;
      // Exponential growth simulation
      const m = Math.pow(Math.E, elapsed * 0.5);
      multRef.current = m;
      setMultiplier(Math.round(m * 100) / 100);

      if (m >= cp) {
        clearInterval(intervalRef.current!);
        setPhase('crashed');
        const result: SpinResult = { type: 'ZONK', multiplier: 0, winAmount: 0, message: 'Pesawat crash! Saldo melayang.' };
        onSpin(bet, result);
      }
    }, 50);
  }, [phase, user.balance, user.spinCount, bet, onSpin]);

  const handleCashOut = useCallback(() => {
    if (phase !== 'flying') return;
    clearInterval(intervalRef.current!);
    const at = multRef.current;
    setCashedOutAt(at);
    setPhase('cashedout');
    const win = Math.floor(bet * at);
    const result: SpinResult = {
      type: at >= 10 ? 'MEGA_WIN' : 'BIG_WIN',
      multiplier: at,
      winAmount: win,
      message: `CASHOUT ${at.toFixed(2)}x! Rp ${win.toLocaleString('id-ID')}`
    };
    onSpin(bet, result);
  }, [phase, bet, onSpin]);

  const reset = () => { setPhase('idle'); setMultiplier(1.00); };

  const multiplierColor = multiplier < 1.5 ? 'text-white' 
    : multiplier < 2 ? 'text-yellow-400' 
    : multiplier < 5 ? 'text-orange-400' 
    : 'text-red-400';

  const planeY = phase === 'flying' ? Math.min(60, (multiplier - 1) * 25) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-2 bg-black/95 backdrop-blur-md">
      <div className="bg-gradient-to-b from-[#0a0a1a] to-black border-0 md:border-2 border-blue-500 rounded-none md:rounded-2xl w-full h-full md:h-auto max-h-[100dvh] max-w-lg overflow-y-auto md:overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.4)] flex flex-col">
        
        <div className="px-5 py-3 flex justify-between items-center bg-[#06061a] border-b border-blue-900/50">
          <div>
            <h2 className="text-blue-300 font-black text-2xl italic uppercase tracking-widest">{banner.title}</h2>
            <span className="text-[10px] text-gray-600 font-mono">{banner.provider} | RTP {banner.rtp}%</span>
          </div>
          <TrendingUp className="text-blue-400 mr-2" size={28}/>
          <button onClick={onClose} className="text-gray-500 hover:text-white bg-gray-900 rounded-full p-2"><X size={18}/></button>
        </div>

        {/* Crash Display */}
        <div className="relative bg-[#050510] p-6 flex flex-col items-center" style={{minHeight: 220}}>
          {/* Grid background */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(59,130,246,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.5) 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
          
          {/* Plane */}
          <div className="absolute text-4xl transition-all duration-100" style={{bottom: `${30 + planeY}px`, left: `${40 + planeY * 2}px`}}>
            {phase === 'crashed' ? '💥' : '✈️'}
          </div>
          
          {/* Crash line animation */}
          {phase === 'flying' && (
            <div className="absolute bottom-8 left-10 h-0.5 bg-blue-500/50" style={{width: `${40 + planeY * 2}px`, transform: 'rotate(-15deg)', transformOrigin: 'left'}}></div>
          )}

          {/* Big multiplier */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`text-6xl md:text-8xl font-black italic ${multiplierColor} drop-shadow-[0_0_20px_currentColor] transition-colors`}>
              {phase === 'crashed' ? (
                <span className="text-red-500">CRASH!</span>
              ) : phase === 'cashedout' ? (
                <span className="text-green-400">{cashedOutAt?.toFixed(2)}x</span>
              ) : (
                `${multiplier.toFixed(2)}x`
              )}
            </div>
            {phase === 'crashed' && (
              <div className="text-red-400 font-bold mt-2 text-center text-sm animate-pulse">Meledak di {crashPoint.toFixed(2)}x! Saldo raib!</div>
            )}
            {phase === 'cashedout' && cashedOutAt && (
              <div className="text-green-400 font-black mt-2 text-xl">+Rp {Math.floor(bet * cashedOutAt).toLocaleString('id-ID')}</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-black border-t border-blue-900/30 space-y-3">
          <div className="flex justify-between items-center bg-gray-900/80 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-500 text-sm font-mono">SALDO</span>
            <span className="text-green-400 font-black font-mono text-xl relative">
                Rp {user.balance.toLocaleString('id-ID')}
                {lossAnim && (
                    <span className="absolute -top-6 right-0 text-red-500 text-sm font-black animate-[ping_1s_forwards] pointer-events-none drop-shadow-[0_0_5px_red]">
                       -Rp {lossAnim.toLocaleString('id-ID')}
                    </span>
                )}
            </span>
          </div>
          
          {(phase === 'idle') && (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 flex items-center">
                <button onClick={() => adjustBet(0.5)} className="px-4 py-3 text-blue-400 hover:text-white text-xl font-black">-</button>
                <div className="flex-1 text-center text-yellow-400 font-black font-mono">Rp {bet.toLocaleString('id-ID')}</div>
                <button onClick={() => adjustBet(2)} className="px-4 py-3 text-blue-400 hover:text-white text-xl font-black">+</button>
              </div>
              <button 
                onClick={() => setBet(user.balance)} 
                className="bg-red-600 text-[10px] text-white font-black px-2 py-5 rounded-lg border-b-2 border-red-900 leading-none">
                ALL <br/>IN
              </button>
              <button onClick={handleStart} disabled={user.balance < bet}
                className="w-28 h-16 rounded-xl font-black text-md uppercase tracking-widest bg-gradient-to-b from-blue-400 to-blue-600 text-white border-b-4 border-blue-900 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:brightness-110 active:scale-95 transition-all">
                PASANG BET
              </button>
            </div>
          )}
          
          {phase === 'flying' && (
            <button onClick={handleCashOut}
              className="w-full py-5 rounded-xl font-black text-2xl uppercase bg-gradient-to-b from-green-400 to-green-600 text-black border-b-4 border-green-900 shadow-[0_0_30px_rgba(34,197,94,0.7)] animate-pulse active:scale-95 transition-transform">
              💸 AMBIL SEKARANG! ({multiplier.toFixed(2)}x)
            </button>
          )}

          {(phase === 'crashed' || phase === 'cashedout') && (
            <button onClick={reset} className="w-full py-4 rounded-xl font-black text-lg uppercase bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors">
              MAIN LAGI
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
