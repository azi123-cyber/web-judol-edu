import React, { useState, useEffect } from 'react';
import { X, Play, AlertTriangle } from 'lucide-react';
import { Banner, SpinResult, UserState } from '../types';
import { RUNGKAD_MESSAGES } from '../constants';

interface SlotModalProps {
  banner: Banner;
  user: UserState;
  onSpin: (cost: number, result: SpinResult) => void;
  onClose: () => void;
}

const SYMBOLS = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🎰', '🍊', '🍉', '🍇', '🎱'];

export const SlotModal: React.FC<SlotModalProps> = ({ banner, user, onSpin, onClose }) => {
  const [betAmount, setBetAmount] = useState<number>(banner.minBet);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['🎰', '🎰', '🎰'],
    ['🎰', '🎰', '🎰'],
    ['🎰', '🎰', '🎰'],
    ['🎰', '🎰', '🎰'],
    ['🎰', '🎰', '🎰']
  ]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [showRungkad, setShowRungkad] = useState<string | null>(null);
  const [showSaldoHabis, setShowSaldoHabis] = useState(false);

  useEffect(() => {
    setBetAmount(banner.minBet);
  }, [banner]);

  const calculateSpin = (): SpinResult => {
     const rand = Math.random();
     if(rand > 0.999) {
        return { type: 'MAXWIN', multiplier: 500, winAmount: betAmount * 500, message: "ANJAY MAXWIN! (MUSTAHIL TERJADI DI REALITA)" };
     } else if (rand > 0.98) {
        return { type: 'MEGA_WIN', multiplier: 10, winAmount: betAmount * 10, message: "MEGA WIN BANH! TAPI BOONG." };
     } else if (rand > 0.95) {
        return { type: 'BIG_WIN', multiplier: 2, winAmount: betAmount * 2, message: "BALIK MODAL DOANG." };
     } else {
        return { type: 'ZONK', multiplier: 0, winAmount: 0, message: RUNGKAD_MESSAGES[Math.floor(Math.random() * RUNGKAD_MESSAGES.length)] };
     }
  };

  const spinReels = () => {
    if (user.balance < betAmount) {
        setShowSaldoHabis(true);
        return;
    }
    
    setIsSpinning(true);
    setLastWin(null);
    setShowRungkad(null);

    let spins = 0;
    const interval = setInterval(() => {
        setReels(prev => prev.map(col => col.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])));
        spins++;
        if(spins > 20) {
            clearInterval(interval);
            const res = calculateSpin();
            
            if(res.type === 'MAXWIN') {
               setReels(prev => prev.map(col => col.map(() => '💎')));
            } else if (res.type === 'ZONK') {
               setReels(prev => prev.map((col, i) => col.map((_, j) => SYMBOLS[(i+j) % SYMBOLS.length])));
            }

            if(res.type === 'ZONK') {
                setShowRungkad(res.message);
            } else {
                setLastWin(res.winAmount);
            }

            onSpin(betAmount, res);
            setIsSpinning(false);
        }
    }, 50);
  };

  const adjustBet = (multiplier: number) => {
      let newBet = betAmount * multiplier;
      if (newBet < banner.minBet) newBet = banner.minBet;
      if (newBet > banner.maxBet) newBet = banner.maxBet;
      setBetAmount(newBet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/90 backdrop-blur-sm animate-in zoom-in duration-300">
      
      {showSaldoHabis && (
         <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95">
            <div className="bg-red-950 p-8 rounded-xl border-2 border-red-500 max-w-md text-center shadow-[0_0_50px_rgba(220,38,38,0.4)]">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter">SALDO HABIS MASBRO!</h2>
                <div className="bg-black/50 p-4 rounded text-left my-4 border border-red-900">
                   <p className="text-red-400 font-bold mb-2">🚨 FAKTA LAPANGAN:</p>
                   <p className="text-gray-300 text-sm leading-relaxed mb-2">Saat saldo habis, sistem mengkondisikan otak untuk penasaran dan mencari pinjaman (Pinjol) agar bisa depo lagi.</p>
                   <p className="text-gray-300 text-sm leading-relaxed">Sistem slot dirancang agar selalu menyedot uang bandar tidak mungkin rugi. Sadarlah dan hapus niat main.</p>
                </div>
                <button onClick={() => setShowSaldoHabis(false)} className="bg-white text-black font-black px-8 py-3 rounded-full hover:scale-105 transition-transform w-full">
                    SAYA MENGERTI
                </button>
            </div>
         </div>
      )}

      {showRungkad && (
          <div className="absolute inset-0 z-[45] flex items-center justify-center pointer-events-none">
              <div className="bg-black/90 border-2 border-red-500 p-8 rounded-2xl animate-out fade-out zoom-out duration-1000 delay-2000 text-center shadow-[0_0_100px_rgba(255,0,0,0.5)]">
                  <h1 className="text-5xl font-black text-red-500 uppercase italic drop-shadow-[0_5px_5px_rgba(0,0,0,1)] tracking-tighter stroke-black">RUNGKAD!</h1>
                  <p className="text-white mt-4 font-bold text-xl px-4">{showRungkad}</p>
              </div>
          </div>
      )}

      <div className="bg-[#0f172a] border-2 border-yellow-600 rounded-2xl shadow-[0_0_50px_rgba(202,138,4,0.3)] w-full max-w-2xl overflow-hidden relative flex flex-col z-40">
        <div className="bg-[#020617] p-4 flex justify-between items-center border-b border-yellow-600/30">
            <div className="flex items-center gap-3">
                <img src={banner.image} alt={banner.title} className="w-12 h-12 rounded object-cover border border-yellow-500" />
                <div>
                   <h2 className="text-yellow-400 font-black text-xl italic uppercase tracking-wider leading-none">{banner.title}</h2>
                   <span className="text-xs text-gray-400 font-mono">PROVIDER: {banner.provider} | RTP: {banner.rtp}%</span>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-black/50 p-2 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-4 md:p-8 bg-gradient-to-b from-[#0f172a] to-black relative">
            <div className="bg-[#020617] border-4 border-[#1e293b] rounded-xl p-4 flex justify-center gap-2 md:gap-4 shadow-[inset_0_0_30px_rgba(0,0,0,1)] relative overflow-hidden">
                {reels.map((col, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        {col.map((symbol, j) => (
                            <div key={j} className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-3xl md:text-5xl border border-gray-600 shadow-inner">
                                {symbol}
                            </div>
                        ))}
                    </div>
                ))}

                {lastWin !== null && lastWin > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-none animate-in fade-in zoom-in">
                        <span className="text-4xl md:text-6xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]">+Rp {lastWin.toLocaleString('id-ID')}</span>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-[#020617] p-6 border-t border-gray-800 flex flex-col gap-4">
            
            <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                <div className="text-gray-400 font-mono text-sm">SALDO AKTIF</div>
                <div className="text-green-400 font-black text-xl font-mono">Rp {user.balance.toLocaleString('id-ID')}</div>
            </div>

            <div className="flex justify-between items-end gap-4">
                <div className="flex-1 space-y-2">
                    <div className="text-gray-400 font-mono text-xs">TOTAL TARUHAN (BET)</div>
                    <div className="flex items-center gap-2 bg-black py-2 px-3 rounded-lg border border-gray-700">
                        <button disabled={isSpinning} onClick={() => adjustBet(0.5)} className="text-gray-400 hover:text-white px-2">-</button>
                        <div className="flex-1 text-center font-black text-yellow-500 font-mono text-lg">Rp {betAmount.toLocaleString('id-ID')}</div>
                        <button disabled={isSpinning} onClick={() => adjustBet(2)} className="text-gray-400 hover:text-white px-2">+</button>
                    </div>
                </div>

                <button 
                  onClick={spinReels}
                  disabled={isSpinning || user.balance < betAmount}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center flex-col transition-all active:scale-95 border-4 ${isSpinning ? 'bg-gray-800 border-gray-600 text-gray-500' : 'bg-gradient-to-br from-green-400 to-green-700 border-green-300 text-black shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:brightness-125 hover:scale-105'}`}
                >
                  <Play fill="currentColor" size={32} className={`mb-1 ${isSpinning ? 'opacity-50' : ''}`} />
                  <span className="font-black text-sm tracking-widest">SPIN</span>
                </button>
            </div>
            
            <div className="flex justify-center gap-4 mt-2">
                <button className="text-[10px] md:text-xs font-bold text-gray-500 border border-gray-700 rounded-full px-4 py-1 hover:text-gray-300">AUTO SPIN (LOCKED)</button>
                <button className="text-[10px] md:text-xs font-bold text-gray-500 border border-gray-700 rounded-full px-4 py-1 hover:text-gray-300">TURBO SPIN</button>
            </div>
        </div>
      </div>
    </div>
  );
}
