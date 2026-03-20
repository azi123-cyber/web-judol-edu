import React, { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';
import { RUNGKAD_MESSAGES } from '../constants';

interface SpinWheelProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

const SEGMENTS = [
  { label: '1.5x', mult: 1.5, color: '#22c55e' },
  { label: 'ZONK', mult: 0, color: '#ef4444' },
  { label: '2x', mult: 2, color: '#3b82f6' },
  { label: 'ZONK', mult: 0, color: '#ef4444' },
  { label: '3x', mult: 3, color: '#f59e0b' },
  { label: 'ZONK', mult: 0, color: '#ef4444' },
  { label: '5x', mult: 5, color: '#8b5cf6' },
  { label: 'ZONK', mult: 0, color: '#ef4444' },
  { label: '1.2x', mult: 1.2, color: '#06b6d4' },
  { label: 'ZONK', mult: 0, color: '#ef4444' },
  { label: 'ZONK', mult: 0, color: '#6b7280' },
  { label: 'ZONK', mult: 0, color: '#ef4444' },
];

const N = SEGMENTS.length;
const SLICE_DEG = 360 / N;

const calcSegment = (spinCount: number): number => {
  if (spinCount < 3) {
    // First 3 spins land on a winning segment
    const winSegs = SEGMENTS.map((s,i) => ({s,i})).filter(x => x.s.mult > 0);
    return winSegs[spinCount % winSegs.length].i;
  }
  const r = Math.random();
  if (r < 0.92) {
    // Pick a ZONK segment at random
    const zones = SEGMENTS.map((s,i) => ({s,i})).filter(x => x.s.mult === 0);
    return zones[Math.floor(Math.random() * zones.length)].i;
  }
  // Win segment
  const winSegs = SEGMENTS.map((s,i) => ({s,i})).filter(x => x.s.mult > 0);
  return winSegs[Math.floor(Math.random() * winSegs.length)].i;
};

export const SpinWheel: React.FC<SpinWheelProps> = ({ banner, user, onSpin, onClose }) => {
  const [bet, setBet] = useState(banner.minBet);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [lossAnim, setLossAnim] = useState<number | null>(null);
  const rotRef = useRef(0);

  const adjustBet = (m: number) => {
    let n = Math.round(bet * m);
    if (n < banner.minBet) n = banner.minBet;
    if (n > banner.maxBet) n = banner.maxBet;
    setBet(n);
  };

  const handleSpin = useCallback(() => {
    if (spinning || user.balance < bet) return;
    setSpinning(true);
    setLastResult(null);
    setLossAnim(bet);
    setTimeout(() => setLossAnim(null), 1000);

    const segIdx = calcSegment(user.spinCount);
    // Target: pointer at top = 270deg offset. Segment center = segIdx * SLICE_DEG + SLICE_DEG/2
    const targetAngle = 360 - (segIdx * SLICE_DEG + SLICE_DEG / 2);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const finalRotation = rotRef.current + extraSpins * 360 + targetAngle;
    rotRef.current = finalRotation % 360;
    
    setRotation(finalRotation);

    setTimeout(() => {
      const seg = SEGMENTS[segIdx];
      const result: SpinResult = seg.mult > 0
        ? { type: seg.mult >= 5 ? 'MEGA_WIN' : 'BIG_WIN', multiplier: seg.mult, winAmount: Math.floor(bet * seg.mult), message: `+${seg.mult}x!` }
        : { type: 'ZONK', multiplier: 0, winAmount: 0, message: RUNGKAD_MESSAGES[Math.floor(Math.random() * RUNGKAD_MESSAGES.length)] };
      setLastResult(result);
      onSpin(bet, result);
      setSpinning(false);
    }, 4000);
  }, [spinning, user.balance, user.spinCount, bet, onSpin]);

  // Draw SVG wheel
  const cx = 150, cy = 150, r = 140;
  const polarToCartesian = (deg: number) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-2 bg-black/95 backdrop-blur-md">
      <div className="bg-gradient-to-b from-[#1a0a00] to-black border-0 md:border-2 border-yellow-500 rounded-none md:rounded-2xl w-full h-full md:h-auto max-h-[100dvh] max-w-md overflow-y-auto md:overflow-hidden shadow-[0_0_80px_rgba(234,179,8,0.4)] flex flex-col">
        
        <div className="px-5 py-3 flex justify-between items-center bg-[#120800] border-b border-yellow-900/50">
          <div>
            <h2 className="text-yellow-400 font-black text-2xl italic uppercase tracking-widest">{banner.title}</h2>
            <span className="text-[10px] text-gray-600 font-mono">{banner.provider} | RTP {banner.rtp}%</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white bg-gray-900 rounded-full p-2"><X size={18}/></button>
        </div>

        {/* Wheel */}
        <div className="flex justify-center items-center p-6 bg-[#0d0500] relative">
          {/* Pointer */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-3xl drop-shadow-[0_0_10px_rgba(234,179,8,1)]">▼</div>
          
          <div className="relative">
            <svg 
              width="300" height="300" viewBox="0 0 300 300"
              style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 1)' : 'none' }}>
              {SEGMENTS.map((seg, i) => {
                const startDeg = i * SLICE_DEG;
                const endDeg = startDeg + SLICE_DEG;
                const start = polarToCartesian(startDeg);
                const end = polarToCartesian(endDeg);
                const midDeg = startDeg + SLICE_DEG / 2;
                const mid = polarToCartesian(midDeg);
                const tr = r * 0.72;
                const tx = cx + tr * Math.cos((midDeg - 90) * Math.PI / 180);
                const ty = cy + tr * Math.sin((midDeg - 90) * Math.PI / 180);
                const largeArc = SLICE_DEG > 180 ? 1 : 0;
                const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
                return (
                  <g key={i}>
                    <path d={d} fill={seg.color} stroke="#000" strokeWidth="1.5"/>
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                      fontSize={SLICE_DEG < 40 ? 9 : 12} fontWeight="black" fill="white"
                      transform={`rotate(${midDeg}, ${tx}, ${ty})`}>
                      {seg.label}
                    </text>
                  </g>
                );
              })}
              <circle cx={cx} cy={cy} r={18} fill="#111" stroke="#888" strokeWidth="3"/>
            </svg>

            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full pointer-events-none border-4 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.3)]"></div>
          </div>
        </div>

        {lastResult && (
          <div className={`mx-4 mb-2 p-3 rounded-lg text-center font-black text-lg border ${lastResult.type === 'ZONK' ? 'bg-red-950 border-red-600 text-red-300' : 'bg-green-950 border-green-600 text-green-300'}`}>
            {lastResult.type === 'ZONK' ? '😭 ZONK! Coba Lagi!' : `🎉 WIN! +Rp ${lastResult.winAmount.toLocaleString('id-ID')}`}
          </div>
        )}

        {/* Controls */}
        <div className="p-4 bg-black border-t border-yellow-900/30 space-y-3">
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
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 flex items-center shrink-0">
              <button onClick={() => adjustBet(0.5)} disabled={spinning} className="px-4 py-3 text-yellow-600 hover:text-white text-xl font-black">-</button>
              <div className="flex-1 text-center text-yellow-400 font-black font-mono">Rp {bet.toLocaleString('id-ID')}</div>
              <button onClick={() => adjustBet(2)} disabled={spinning} className="px-4 py-3 text-yellow-600 hover:text-white text-xl font-black">+</button>
            </div>
            <button 
              onClick={() => setBet(user.balance)} disabled={spinning}
              className="bg-red-600 text-[10px] text-white font-black px-2 py-5 rounded-lg border-b-2 border-red-900 leading-none shrink-0">
              ALL <br/>IN
            </button>
            <button onClick={handleSpin} disabled={spinning || user.balance < bet}
              className={`w-24 h-16 rounded-xl font-black text-lg uppercase tracking-widest transition-all active:scale-95 border-b-4 ${
                spinning ? 'bg-gray-800 text-gray-600 border-gray-900' 
                : 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black border-yellow-900 shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:brightness-110'
              }`}>
              {spinning ? '...' : 'PUTAR!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
