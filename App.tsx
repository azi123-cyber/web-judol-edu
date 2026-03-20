import React, { useState, useEffect } from 'react';
import { User, Wallet, AlertOctagon, TrendingUp, Skull, Zap, Coins, X } from 'lucide-react';
import { UserState, Banner, SpinResult } from './types';
import { BANNERS, WINNERS_TICKER } from './constants';
import { LoginModal } from './components/LoginModal';
import { MahjongGame } from './components/MahjongGame';
import { OlympusSlotGame } from './components/OlympusSlotGame';
import { CrashGame } from './components/CrashGame';
import { SpinWheel } from './components/SpinWheelGame';
import { MinesGame } from './components/MinesGame';
import { getUserData, addBalanceDirectly } from './firebase';

const INITIAL_DEMO_BALANCE = 1_000_000;

function App() {
  const [user, setUser] = useState<UserState>({
      isLoggedIn: false, username: '', userId: '', balance: 0, role: 'user', spinCount: 0
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState(0);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  useEffect(() => {
     const storedId = localStorage.getItem('rg_userId');
     if (storedId) {
        getUserData(storedId).then(data => {
            if (data) setUser({ isLoggedIn: true, userId: storedId, username: data.username, role: data.role || 'user', balance: data.balance || 0, spinCount: 0 });
            else initDemo();
            setAuthLoading(false);
        }).catch(() => { initDemo(); setAuthLoading(false); });
     } else {
         initDemo();
         setAuthLoading(false);
     }
  }, []);

  const initDemo = () => {
    const raw = localStorage.getItem('rg_demoData');
    if (raw) { setUser(JSON.parse(raw)); return; }
    const nd: UserState = { isLoggedIn: true, userId: 'demo-' + Date.now(), username: 'GacorMaster_88', role: 'demo', balance: INITIAL_DEMO_BALANCE, spinCount: 0 };
    localStorage.setItem('rg_demoData', JSON.stringify(nd));
    setUser(nd);
  };

  const handleLoginSuccess = (userData: any, userId: string) => {
    setUser({ isLoggedIn: true, username: userData.username, userId, role: userData.role || 'user', balance: userData.balance || 0, spinCount: 0 });
    localStorage.setItem('rg_userId', userId);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('rg_userId');
    initDemo();
  };

  const handleSpin = async (cost: number, result: SpinResult) => {
    setUser(prev => {
      const newBalance = Math.max(0, prev.balance - cost + result.winAmount);
      const newSpinCount = prev.spinCount + 1;
      const newState = { ...prev, balance: newBalance, spinCount: newSpinCount };
      if (prev.role === 'demo') localStorage.setItem('rg_demoData', JSON.stringify(newState));
      return newState;
    });
    if (user.role !== 'demo') await addBalanceDirectly(user.userId, result.winAmount - cost);
    
    // Close the game modal if balance hits zero
    if (user.balance - cost + result.winAmount <= 0) {
      setSelectedBanner(null);
    }
  };

  const handlePaymentSimulation = async () => {
    setPaymentStep(2);
    const amount = parseInt(depositAmount.replace(/\D/g, ''));
    setTimeout(async () => {
      setPaymentStep(3);
      setUser(prev => {
        const ns = { ...prev, balance: prev.balance + amount };
        if (prev.role === 'demo') localStorage.setItem('rg_demoData', JSON.stringify(ns));
        return ns;
      });
      if (user.role !== 'demo') await addBalanceDirectly(user.userId, amount);
    }, 2500);
  };

  const renderGameModal = () => {
    if (!selectedBanner) return null;
    const commonProps = { banner: selectedBanner, user, onSpin: handleSpin, onClose: () => setSelectedBanner(null) };
    switch(selectedBanner.gameType) {
      case 'MAHJONG': return <MahjongGame {...commonProps} />;
      case 'SLOT': return <OlympusSlotGame {...commonProps} />;
      case 'CRASH': return <CrashGame {...commonProps} />;
      case 'WHEEL': return <SpinWheel {...commonProps} />;
      case 'MINES': return <MinesGame {...commonProps} />;
    }
  };

  if (authLoading) return <div className="h-screen bg-black text-white flex items-center justify-center font-mono">Loading Slot Server...</div>;

  return (
    <div className="min-h-screen bg-[#070114] text-gray-200 overflow-x-hidden font-sans">
      
      {/* Global Alay Styles */}
      <style>{`
        @keyframes scroll-fast { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes rainbow-border {
          0% { border-color: #ff0000; box-shadow: 0 0 20px #ff0000; }
          33% { border-color: #00ff00; box-shadow: 0 0 20px #00ff00; }
          66% { border-color: #0000ff; box-shadow: 0 0 20px #0000ff; }
          100% { border-color: #ff0000; box-shadow: 0 0 20px #ff0000; }
        }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .alay-border { animation: rainbow-border 1.5s linear infinite; }
        .alay-blink { animation: blink 0.5s infinite; }
        .text-fire { background: -webkit-linear-gradient(#ffe600, #ff0000); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      {/* Extreme Ticker */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-1.5 overflow-hidden flex text-white font-black uppercase tracking-widest text-[11px] md:text-xs">
        <div className="flex whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" style={{animation: 'scroll-fast 15s linear infinite'}}>
          {[...WINNERS_TICKER, ...WINNERS_TICKER].map((msg, i) => (
            <span key={i} className="mx-10 whitespace-nowrap">🔥 {msg} 🔥</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0d0121] border-b-4 border-yellow-500 shadow-[0_5px_30px_rgba(234,179,8,0.4)]">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center font-black text-black text-3xl shadow-[0_0_15px_rgba(234,179,8,1)] border-2 border-white rotate-[-5deg]">R</div>
            <div className="leading-none">
              <h1 className="text-3xl font-black italic tracking-tighter text-fire drop-shadow-[0_2px_1px_#000]">RAJA<span className="text-white">GACOR</span></h1>
              <span className="bg-green-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-sm alay-blink inline-block mt-0.5">SITUS RESMI TERPERCAYA</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block text-right mr-2 bg-black/50 p-1.5 rounded-lg border border-yellow-600/50">
              <div className="text-[10px] text-gray-400 font-bold uppercase">{user.username}</div>
              <div className="text-green-400 font-black font-mono text-sm">Rp {user.balance.toLocaleString('id-ID')}</div>
            </div>
            <button onClick={() => setShowDeposit(true)} className="bg-gradient-to-b from-green-400 to-green-600 text-black px-4 md:px-6 py-2 md:py-2.5 flex items-center gap-2 rounded-lg font-black shadow-[0_0_20px_rgba(34,197,94,0.6)] border-b-4 border-green-800 text-sm uppercase">
              <Wallet size={18}/> DEPOSIT
            </button>
            {user.role === 'demo'
              ? <button onClick={() => setShowLogin(true)} className="border-2 border-yellow-500 text-yellow-500 px-4 py-2 rounded-lg font-black bg-yellow-900/20 text-sm hover:bg-yellow-500 hover:text-black transition-colors">LOGIN</button>
              : <button onClick={handleLogout} className="text-gray-400 hover:text-white bg-gray-900 p-2 rounded-lg"><Skull size={20}/></button>
            }
          </div>
        </div>
      </header>

      {/* Hero Spam Section */}
      <div className="relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1596450514735-ff5bf2987aef?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070114]/90 via-[#070114]/60 to-[#070114]"></div>
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10 text-center">
          <div className="inline-block bg-red-600 text-white font-black text-xl px-4 py-1 rounded-sm transform -skew-x-12 alay-blink shadow-[0_0_20px_red] border-2 border-yellow-400 mb-2">HOT PROMO JACKPOT</div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-none text-fire drop-shadow-[0_5px_5px_#000] mb-2" style={{WebkitTextStroke: '2px #000'}}>
            BONUS NEW MEMBER 100%
          </h2>
          <h3 className="text-3xl md:text-5xl font-black text-white italic drop-shadow-[0_4px_4px_#000] mb-6">ANTI RUNGKAD! DIJAMIN WD!</h3>
          <button onClick={() => setShowDeposit(true)} className="bg-gradient-to-b from-yellow-300 to-orange-500 text-black font-black text-2xl px-12 py-4 rounded-full border-4 border-white shadow-[0_0_40px_rgba(234,179,8,0.8)] uppercase transition-transform hover:scale-105">
            DAFTAR SEKARANG
          </button>
          
          <div className="mt-8 flex justify-center gap-4 text-white opacity-80">
            <span className="bg-black/80 px-4 py-2 rounded-lg border border-gray-700 font-mono text-xs flex items-center gap-2"><Zap className="text-yellow-400"/> LISENSI RESMI PAGCOR</span>
            <span className="bg-black/80 px-4 py-2 rounded-lg border border-gray-700 font-mono text-xs flex items-center gap-2"><TrendingUp className="text-yellow-400"/> TERBAIK 2026</span>
          </div>
        </div>
      </div>

      {/* Games List */}
      <main className="container mx-auto px-4 py-10 relative z-10 -mt-10">
        
        {/* Fake Jackpot Box */}
        <div className="bg-[#120524] p-4 rounded-xl border border-yellow-500/50 flex flex-col items-center mb-8 shadow-[inset_0_0_30px_rgba(0,0,0,1)] relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent animate-[pulse_2s_ease-in-out_infinite]"></div>
           <span className="text-yellow-500 font-black text-xs uppercase tracking-widest mb-1 drop-shadow-[0_0_5px_rgba(234,179,8,1)]">Grand Progressive Jackpot</span>
           <div className="text-4xl md:text-6xl font-black text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
             Rp. 18.943.425.991
           </div>
        </div>

        <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-red-600/20 to-transparent p-2 rounded-lg border-l-4 border-red-600">
          <h3 className="text-2xl font-black text-white italic uppercase text-fire">🎰 POLA GACOR HARI INI</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5">
          {BANNERS.map(b => (
            <div key={b.id} onClick={() => setSelectedBanner(b)} 
              className="bg-[#11051f] hover:scale-[1.02] cursor-pointer rounded-xl overflow-hidden border-2 border-[#2a1145] hover:border-yellow-400 transition-all shadow-lg group relative">
              
              <div className="relative h-40 md:h-48 overflow-hidden bg-black">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 opacity-70 group-hover:opacity-100 transition-all duration-300"/>
                
                {/* Heavy Title Overlay for fake images */}
                <div className="absolute inset-0 flex items-center justify-center p-2 bg-black/30">
                  <span className="text-white font-black text-xl md:text-2xl text-center uppercase italic drop-shadow-[0_4px_4px_rgba(0,0,0,1)]" style={{WebkitTextStroke: '1px #000'}}>
                    {b.title}
                  </span>
                </div>

                <div className="absolute top-2 left-2 bg-red-600 border border-white text-white text-[10px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_red] animate-pulse">
                  HOT DEPAN
                </div>
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-gradient-to-b from-yellow-400 to-orange-500 text-black font-black border-2 border-white px-6 py-2 rounded-full text-sm uppercase shadow-[0_0_20px_rgba(234,179,8,1)] animate-bounce">▶ MAIN</div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-b from-[#1c0836] to-[#0a0214] border-t-2 border-yellow-500">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-yellow-500 bg-yellow-900/30 px-1.5 rounded">{b.provider}</span>
                  <span className="text-[10px] text-green-400 font-black animate-pulse">RTP {Math.random() > 0.5 ? '99.9%' : '98.5%'}</span>
                </div>
                {/* Fake Live RTP Bar */}
                <div className="h-4 bg-[#0a0214] rounded-full overflow-hidden border border-[#2a1145] relative">
                  <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" style={{width: `${80 + Math.random()*15}%`}}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow-[0_1px_1px_#000]">RTP LIVE</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} />}
      {renderGameModal()}
      
      {/* Modal Peringatan (Rungkad) - Edukatif Sarkas */}
      {user.balance <= 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="bg-[#1a0505] border-t-8 border-red-700 rounded-2xl p-6 md:p-8 max-w-xl w-full text-center shadow-[0_0_100px_rgba(220,38,38,0.4)] animate-in zoom-in duration-300">
            <AlertOctagon className="text-red-600 w-20 h-20 mx-auto mb-4 animate-[bounce_1s_infinite]" />
            <h3 className="text-4xl md:text-5xl font-black text-red-500 italic mb-2 drop-shadow-[0_2px_2px_#000]">RUNGKAD TOTAL!</h3>
            <p className="text-xl md:text-2xl text-yellow-400 font-black mb-6 border-b border-red-900 pb-6 uppercase">Yaelah Saldo 0 doang nangis. Gada duit lagi? Bandar butuh bayar cicilan Rubicon nih!</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setUser(prev => ({ ...prev, balance: 10000000, spinCount: 0 }))} 
                className="bg-red-800 text-white font-black px-4 py-4 rounded-xl border-2 border-red-500 hover:bg-red-600 transition-colors"
              >
                GABUNG PINJOL ILEGAL (+Rp 10.000.000)
              </button>
              <button 
                onClick={() => setUser(prev => ({ ...prev, balance: 5000000, spinCount: 0 }))} 
                className="bg-orange-800 text-white font-black px-4 py-4 rounded-xl border-2 border-orange-500 hover:bg-orange-600 transition-colors"
              >
                GADAI BPKB MOTOR BAPAK (+Rp 5.000.000)
              </button>
              <button 
                onClick={() => setUser(prev => ({ ...prev, balance: 2000000, spinCount: 0 }))} 
                className="bg-yellow-800 text-white font-black px-4 py-4 rounded-xl border-2 border-yellow-500 hover:bg-yellow-600 transition-colors"
              >
                BONGKAR UANG SPP ANAK (+Rp 2.000.000)
              </button>
            </div>
            
            <p className="text-gray-500 text-[10px] sm:text-xs mt-8">
              *PERINGATAN KERAS: Inilah realita siklus judi online. Anda akan selalu dipaksa kehabisan uang dan mencari hutang baru karena algoritmanya dirancang matematis untuk membuat Anda KALAH.
            </p>
          </div>
        </div>
      )}
      
      {/* Deposit */}
      {showDeposit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95">
          <div className="bg-[#0f021c] w-full max-w-md rounded-2xl border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)] overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 flex justify-between items-center">
              <h2 className="text-xl font-black text-black italic uppercase">DEPOSIT OTOMATIS</h2>
              <button onClick={() => {setShowDeposit(false); setPaymentStep(0); setDepositAmount('');}}><User size={26} className="text-black hover:text-white"/></button>
            </div>
            <div className="p-6">
              {paymentStep === 0 && (
                <div className="space-y-4">
                  <div className="bg-red-900/30 border border-red-500 p-3 rounded-lg text-red-400 text-xs font-bold text-center alay-blink">
                    INFO: INI HANYA SIMULASI UANG PALSU
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[20000,50000,100000,500000].map(amt => (
                      <button key={amt} onClick={() => setDepositAmount(amt.toString())}
                        className={`py-3 rounded-xl border-2 font-black text-sm transition-all shadow-md ${depositAmount === amt.toString() ? 'bg-yellow-500 border-white text-black' : 'bg-[#1a0530] border-[#3d1366] text-yellow-500 hover:border-yellow-500'}`}>
                        Rp {amt.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Nominal Lain (Min 10.000)" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                    className="w-full bg-black border-2 border-[#3d1366] rounded-xl p-4 text-white font-black text-xl focus:border-yellow-500 outline-none text-center mt-2" />
                  <button onClick={() => { if(depositAmount) setPaymentStep(1); }}
                    className="w-full bg-gradient-to-b from-green-400 to-green-600 text-black font-black text-xl py-4 rounded-xl uppercase border-b-4 border-green-800 active:translate-y-1 shadow-[0_0_20px_rgba(34,197,94,0.4)] mt-4">
                    PROSES DEPO
                  </button>
                </div>
              )}
              {paymentStep === 1 && (
                <div className="text-center space-y-4">
                  <h3 className="font-black text-white text-lg">SCAN QRIS UNTUK BAYAR</h3>
                  <div className="w-48 h-48 bg-white mx-auto rounded-xl p-2 border-4 border-yellow-500 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR" className="w-full h-full opacity-80" />
                  </div>
                  <div className="text-4xl font-black text-green-400 font-mono drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">Rp {parseInt(depositAmount||'0').toLocaleString('id-ID')}</div>
                  <button onClick={handlePaymentSimulation} className="w-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-black py-4 rounded-xl shadow-lg border-b-4 border-blue-900 uppercase">SAYA SUDAH BAYAR</button>
                </div>
              )}
              {paymentStep === 2 && (
                <div className="flex flex-col items-center py-12 gap-4">
                  <div className="w-16 h-16 border-8 border-yellow-400 border-t-transparent rounded-full animate-spin shadow-lg"></div>
                  <p className="text-yellow-500 font-black text-xl uppercase alay-blink">MENGECEK MUTASI...</p>
                </div>
              )}
              {paymentStep === 3 && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-[0_0_40px_rgba(34,197,94,0.8)]">
                     <Coins className="w-12 h-12 text-black"/>
                  </div>
                  <h3 className="text-3xl font-black text-green-400 italic drop-shadow-[0_2px_2px_#000]">DEPOSIT SUKSES!</h3>
                  <button onClick={() => {setShowDeposit(false); setPaymentStep(0); setDepositAmount('');}} className="w-full bg-gray-800 text-white py-4 rounded-xl hover:bg-gray-700 uppercase font-black text-lg border border-gray-600 mt-6">TUTUP</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Powered By Arthea */}
      <footer className="bg-[#05000a] text-center pt-10 pb-6 border-t border-purple-900/30 mt-12 relative overflow-hidden">
        <div className="container mx-auto px-4 z-10 relative">
          <h2 className="text-3xl font-black italic text-gray-800 mb-6">RAJA<span className="text-gray-700">GACOR</span></h2>
          <p className="text-gray-600 text-xs mb-6 max-w-2xl mx-auto leading-relaxed">
            SITUS INI ADALAH SIMULASI EDUKASI. Tidak menggunakan uang nyata dan didesain murni untuk mengedukasi masyarakat mengenai bahaya kecanduan judi online serta kebohongan algoritma sistem slot. Dilarang keras melakukan praktek perjudian di dunia nyata.
          </p>
          <div className="text-yellow-500 font-black text-sm tracking-widest uppercase">
            POWERED BY ARTHEA
          </div>
          <div className="text-[#3d1366] font-mono text-[9px] mt-2">v2.0.0 © 2026</div>
        </div>
      </footer>
    </div>
  );
}

export default App;