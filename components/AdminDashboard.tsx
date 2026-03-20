import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllTopUps, approveTopUp } from '../firebase';
import { User, DollarSign, RefreshCw, Check, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const usersData = await getAllUsers();
        const topupsData = await getAllTopUps();
        
        const userList = usersData ? Object.keys(usersData).map(key => ({ id: key, ...usersData[key] })) : [];
        const topupList = topupsData ? Object.keys(topupsData).map(key => ({ id: key, ...topupsData[key] })) : [];
        
        setUsers(userList);
        setTopups(topupList.reverse()); 
    } catch (error) {
        console.error("Fetch error admin", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (topUpId: string, userId: string, amount: number) => {
    if(!window.confirm(`Terima deposit Rp ${amount.toLocaleString()} dari user ini?`)) return;
    
    setProcessingId(topUpId);
    const success = await approveTopUp(topUpId, userId, amount);
    
    if(success) {
      // Optimistic Update: Langsung ubah status di state lokal biar UI responsif
      setTopups(prev => prev.map(t => 
        t.id === topUpId ? { ...t, status: 'success' } : t
      ));
      
      // Update juga user gem di list user kalau ada
      setUsers(prev => prev.map(u => 
         u.id === userId ? { ...u, gems: (u.gems || 0) + amount } : u
      ));

      alert("Deposit Berhasil Diterima!");
    } else {
      alert("Gagal memproses. Cek koneksi.");
    }
    setProcessingId(null);
  }

  return (
    <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-xs md:text-sm animate-in fade-in">
      <div className="flex justify-between items-center mb-8 border-b-2 border-red-600 pb-4 bg-gray-900 sticky top-0 z-20 py-4">
        <div>
           <h2 className="text-3xl font-black text-red-500 uppercase italic tracking-tighter drop-shadow-[0_2px_0_rgba(255,255,255,0.2)]">Admin Pusat</h2>
           <p className="text-gray-400 font-mono">Control Panel V.2.0</p>
        </div>
        <button onClick={fetchData} className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-full hover:rotate-180 transition-transform shadow-[0_0_15px_cyan] active:scale-95">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} color="white" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between">
          <h3 className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-2"><User size={12}/> Total Member</h3>
          <p className="text-3xl font-black text-white">{users.length}</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-yellow-900 shadow-lg flex flex-col justify-between">
          <h3 className="text-yellow-500 text-[10px] uppercase font-bold flex items-center gap-2"><AlertCircle size={12}/> Pending Depo</h3>
          <p className="text-3xl font-black text-yellow-500 animate-pulse">{topups.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-green-900 shadow-lg flex flex-col justify-between">
          <h3 className="text-green-500 text-[10px] uppercase font-bold flex items-center gap-2"><TrendingUp size={12}/> Total Transaksi</h3>
          <p className="text-3xl font-black text-green-500">{topups.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
          
          {/* DEPOSIT LIST */}
          <div className="bg-black/40 p-6 rounded-xl border border-yellow-600/30 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-yellow-500 mb-6 flex items-center gap-2 uppercase tracking-wider border-b border-yellow-500/30 pb-2">
                <DollarSign /> Request Deposit
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
               {topups.map((t) => (
                 <div key={t.id} className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between items-center transition-all ${t.status === 'pending' ? 'bg-gray-800 border-yellow-600/50 hover:bg-gray-700' : 'bg-gray-900/50 border-gray-800 opacity-70'}`}>
                    <div className="w-full md:w-auto mb-2 md:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-lg">{t.username}</span>
                            <span className="text-[10px] bg-gray-900 px-2 py-0.5 rounded text-gray-400 border border-gray-700">{new Date(t.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-green-400 font-mono font-black text-xl">
                                Rp {t.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase">{t.method}</span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-end">
                        {t.status === 'pending' ? (
                            <button 
                                onClick={() => handleApprove(t.id, t.userId, t.amount)}
                                disabled={processingId === t.id}
                                className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold px-6 py-2 rounded shadow-[0_0_15px_lime] flex items-center justify-center gap-2 transform transition-transform hover:scale-105 active:scale-95"
                            >
                                {processingId === t.id ? 'Loading...' : <><Check size={18} strokeWidth={3} /> TERIMA</>}
                            </button>
                        ) : (
                            <span className="text-green-500 font-black border-2 border-green-800 bg-green-900/20 px-4 py-1 rounded rotate-[-3deg] inline-block shadow-lg">
                                LUNAS
                            </span>
                        )}
                    </div>
                 </div>
               ))}
               {topups.length === 0 && <p className="text-gray-500 text-center py-10 italic">Belum ada request masuk bos.</p>}
            </div>
          </div>

          {/* USER LIST */}
          <div className="bg-black/40 p-6 rounded-xl border border-blue-600/30 backdrop-blur-sm">
             <h3 className="text-xl font-bold text-blue-500 mb-6 flex items-center gap-2 uppercase tracking-wider border-b border-blue-500/30 pb-2">
                <User /> Data Member
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {users.map(u => (
                  <div key={u.id} className="bg-gray-900 p-3 rounded-lg flex justify-between items-center text-xs border border-gray-800 hover:border-blue-500/50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full shadow-[0_0_5px] ${u.role === 'admin' ? 'bg-red-500 shadow-red-500' : 'bg-green-500 shadow-green-500'}`}></div>
                       <div>
                           <p className="text-white font-bold text-sm">{u.username}</p>
                           <p className="text-gray-500 text-[10px] font-mono">{u.id.substring(0, 15)}...</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-yellow-500 font-mono font-bold text-sm">{u.gems ? u.gems.toLocaleString() : 0}</p>
                       <p className="text-gray-600 text-[9px]">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}</p>
                     </div>
                  </div>
                ))}
            </div>
          </div>

      </div>
    </div>
  );
};