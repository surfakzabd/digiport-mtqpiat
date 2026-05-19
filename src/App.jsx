import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, BookOpen, Calendar, Settings, LogOut, 
  Download, Printer, Plus, Minus, Check, X, ChevronDown, ChevronUp,
  Award, AlertCircle, UserPlus, Trash2, AlertTriangle, Filter, Edit, RotateCcw, Menu, Lock, User, ShieldCheck, Key, ArrowRight
} from 'lucide-react';

import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

// ==========================================
// 1. PENGATURAN FIREBASE (SISTEM INTI)
// ==========================================
let topLevelError = null;
let isConfigValid = false;
let app, auth, db;
let firebaseConfig = {};

try { 
  const envApiKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) || "";
  const envAuthDomain = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "";
  const envProjectId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_PROJECT_ID) || "";
  const envStorageBucket = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "";
  const envSenderId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "";
  const envAppId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_APP_ID) || "";
  const envMeasurementId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) || "";

  firebaseConfig = {
    apiKey: envApiKey,
    authDomain: envAuthDomain,
    projectId: envProjectId,
    storageBucket: envStorageBucket,
    messagingSenderId: envSenderId,
    appId: envAppId,
    measurementId: envMeasurementId
  };
  
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5) {
    isConfigValid = true;
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  topLevelError = e;
}

const currentAppId = typeof __app_id !== 'undefined' ? __app_id : (firebaseConfig.appId || 'markaz-app');
const getCollectionPath = (colName) => `artifacts/${currentAppId}/public/data/${colName}`;

// ==========================================
// 2. TEMA DAN DATA REFERENSI (CONSTANTS)
// ==========================================
const theme = {
  primary: '#26544d',
  secondary: '#54af48',
  accent: '#f9e653',
  bg: '#f4f7f6', 
  white: '#ffffff',
  danger: '#ef4444',
  warning: '#eab308'
};

// UI Classes: Hapus shadow sepenuhnya, ganti dengan BORDER TEGAS abu-abu/warna kontras
const glassCard = "bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl";
const glassInput = "bg-white/60 backdrop-blur-md border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#54af48]/30 focus:border-transparent transition-all rounded-xl outline-none";
const primaryBtn = "bg-[#26544d] border border-[#1a3a35] hover:bg-[#1f453f] text-white";
const outlineBtn = "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700";

const QURAN_SURAHS = [
  ["Al-Fatihah",7], ["Al-Baqarah",286], ["Ali 'Imran",200], ["An-Nisa'",176], ["Al-Ma'idah",120], ["Al-An'am",165], ["Al-A'raf",206], ["Al-Anfal",75], ["At-Taubah",129], ["Yunus",109],
  ["Hud",123], ["Yusuf",111], ["Ar-Ra'd",43], ["Ibrahim",52], ["Al-Hijr",99], ["An-Nahl",128], ["Al-Isra'",111], ["Al-Kahf",110], ["Maryam",98], ["Taha",135],
  ["Al-Anbiya'",112], ["Al-Hajj",78], ["Al-Mu'minun",118], ["An-Nur",64], ["Al-Furqan",77], ["Asy-Syu'ara'",227], ["An-Naml",93], ["Al-Qasas",88], ["Al-'Ankabut",69], ["Ar-Rum",60],
  ["Luqman",34], ["As-Sajdah",30], ["Al-Ahzab",73], ["Saba'",54], ["Fatir",45], ["Ya Sin",83], ["As-Saffat",182], ["Sad",88], ["Az-Zumar",75], ["Gafir",85],
  ["Fussilat",54], ["Asy-Syura",53], ["Az-Zukhruf",89], ["Ad-Dukhan",59], ["Al-Jasiyah",37], ["Al-Ahqaf",35], ["Muhammad",38], ["Al-Fath",29], ["Al-Hujurat",18], ["Qaf",45],
  ["Az-Zariyat",60], ["At-Tur",49], ["An-Najm",62], ["Al-Qamar",55], ["Ar-Rahman",78], ["Al-Waqi'ah",96], ["Al-Hadid",29], ["Al-Mujadilah",22], ["Al-Hasyr",24], ["Al-Mumtahanah",13],
  ["As-Saff",14], ["Al-Jumu'ah",11], ["Al-Munafiqun",11], ["At-Tagabun",18], ["At-Talaq",12], ["At-Tahrim",12], ["Al-Mulk",30], ["Al-Qalam",52], ["Al-Haqqah",52], ["Al-Ma'arij",44],
  ["Nuh",28], ["Al-Jinn",28], ["Al-Muzzammil",20], ["Al-Muddassir",56], ["Al-Qiyamah",40], ["Al-Insan",31], ["Al-Mursalat",50], ["An-Naba'",40], ["An-Nazi'at",46], ["'Abasa",42],
  ["At-Takwir",29], ["Al-Infitar",19], ["Al-Mutaffifin",36], ["Al-Insyiqaq",25], ["Al-Buruj",22], ["At-Tariq",17], ["Al-A'la",19], ["Al-Gasyiyah",26], ["Al-Fajr",30], ["Al-Balad",20],
  ["Asy-Syams",15], ["Al-Lail",21], ["Ad-Duha",11], ["Asy-Syarh",8], ["At-Tin",8], ["Al-'Alaq",19], ["Al-Qadr",5], ["Al-Bayyinah",8], ["Az-Zalzalah",8], ["Al-'Adiyat",11],
  ["Al-Qari'ah",11], ["At-Takasur",8], ["Al-'Asr",3], ["Al-Humazah",9], ["Al-Fil",5], ["Quraisy",4], ["Al-Ma'un",7], ["Al-Kausar",3], ["Al-Kafirun",6], ["An-Nasr",3],
  ["Al-Lahab",5], ["Al-Ikhlas",4], ["Al-Falaq",5], ["An-Nas",6]
];

const JUZ_LIST = Array.from({ length: 30 }, (_, i) => i + 1);
const TARGET_HAFALAN = { 1: 8, 2: 13, 3: 18, 4: 23, 5: 28, 6: 30 };
const SP_OPTIONS = ["SP-TS1", "SP-K1", "SP-TH1", "SP-TH2", "SP-P1", "SP-A1", "SP-A2"];

const calculateScore = (tajwid, lupa, lupaDiberitahu) => {
  let score = 100 - (tajwid * 1) - (lupa * 1) - (lupaDiberitahu * 2);
  return Math.max(0, score);
};

const getLocalYYYYMMDD = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatZiyadahSurahSafe = (z) => {
  if (!z || z.fromSurah == null || z.toSurah == null) return '-';
  const s1 = QURAN_SURAHS[z.fromSurah]?.[0] || 'Unknown';
  const s2 = QURAN_SURAHS[z.toSurah]?.[0] || 'Unknown';
  return z.fromSurah === z.toSurah 
    ? `${s1} ay ${z.fromAyah}-${z.toAyah}` 
    : `${s1} ay ${z.fromAyah} - ${s2} ay ${z.toAyah}`;
};

// ==========================================
// BACKGROUND GLASSMORPHISM (MINIMALIST)
// ==========================================
const GlassBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-[#f4f7f6]">
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#54af48]/10 to-transparent rounded-full blur-[100px]"></div>
    <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-gradient-to-tl from-[#26544d]/10 to-transparent rounded-full blur-[100px]"></div>
  </div>
);

// ==========================================
// 3. KOMPONEN MODAL (REUSABLE)
// ==========================================
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Hapus" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl w-full max-w-sm p-6 md:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
          <h3 className="text-lg font-bold text-gray-800 leading-tight">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${outlineBtn}`}>Batal</button>
          <button onClick={onConfirm} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500 border border-red-600 text-white hover:bg-red-600 transition-colors">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ isOpen, target, pengampus, onSave, onCancel }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => { if (target) setFormData(target.data); }, [target]);
  if (!isOpen || !target) return null;

  const isStudent = target.type === 'student';
  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, ...(isStudent && { semester: parseInt(formData.semester || 1), juzTercapai: parseInt(formData.juzTercapai || 0) }) });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl w-full max-w-md p-6 md:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
             <div className="p-2.5 bg-[#26544d]/10 border border-[#26544d]/20 rounded-xl"><Edit className="w-5 h-5 text-[#26544d]"/></div>
             Edit {isStudent ? 'Data Santri' : 'Pengampu'}
          </h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
            <input required type="text" name="name" value={formData.name || ''} onChange={handleChange} className={`w-full p-3 text-sm ${glassInput}`} />
          </div>
          
          {isStudent && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Kelas</label>
                  <select name="kelas" value={formData.kelas || '1'} onChange={handleChange} className={`w-full p-3 text-sm ${glassInput}`}>
                    <option value="IL">IL</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Semester</label>
                  <select name="semester" value={formData.semester || '1'} onChange={handleChange} className={`w-full p-3 text-sm ${glassInput}`}>
                    {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Halaqah</label>
                  <select name="pengampuId" value={formData.pengampuId || ''} onChange={handleChange} className={`w-full p-3 text-sm ${glassInput}`}>
                    {pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Target Tercapai</label>
                  <div className="flex">
                    <input type="number" min="0" max="30" name="juzTercapai" value={formData.juzTercapai || 0} onChange={handleChange} className={`w-full p-3 border-r-0 rounded-l-xl text-sm ${glassInput}`} />
                    <span className="bg-gray-50/50 p-3 border border-gray-200 border-l-0 rounded-r-xl text-xs text-gray-500 font-bold flex items-center">Juz</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Username <span className="lowercase font-medium">(Tetap)</span></label>
            <input type="text" name="username" value={formData.username || ''} disabled className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed outline-none font-medium" />
          </div>

          <div className="flex gap-3 justify-end pt-6 mt-2 border-t border-gray-200/50">
            <button type="button" onClick={onCancel} className={`px-5 py-3 rounded-xl font-bold text-sm w-full sm:w-auto transition-colors ${outlineBtn}`}>Batal</button>
            <button type="submit" className={`px-5 py-3 rounded-xl font-bold text-sm w-full sm:w-auto flex justify-center items-center gap-2 transition-all ${primaryBtn}`}>
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResetAccessModal = ({ isOpen, target, onSave, onCancel }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && target) { setNewUsername(target.data.username + '2'); setNewPassword(''); setError(''); }
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true); setError('');
    try { await onSave(newUsername.replace(/\s+/g, ''), newPassword); } 
    catch (err) { setError(err.message || 'Proses pemulihan akses dibatalkan oleh sistem.'); } 
    finally { setIsProcessing(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl w-full max-w-md p-6 md:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
             <div className="p-2.5 bg-[#eab308]/10 border border-[#eab308]/20 rounded-xl"><Key className="w-5 h-5 text-[#eab308]"/></div>
             Atur Ulang Akses
          </h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-6">
           <p className="text-xs text-yellow-800/90 font-medium leading-relaxed">
             Untuk menjaga privasi, sandi lama tidak dapat dilihat. Silakan buat <b>username baru</b> (atau tambah angka) dan sandi yang baru.
           </p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 flex items-start gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/> <span className="leading-relaxed">{error}</span></div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Username Baru</label>
            <input required type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className={`w-full p-3 text-sm ${glassInput}`} />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sandi Baru (Min. 6 Karakter)</label>
            <input required type="text" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full p-3 text-sm ${glassInput}`} />
          </div>

          <div className="flex gap-3 justify-end pt-6 mt-2 border-t border-gray-200/50">
            <button type="button" onClick={onCancel} className={`px-5 py-3 rounded-xl font-bold text-sm w-full sm:w-auto transition-colors ${outlineBtn}`}>Batal</button>
            <button type="submit" disabled={isProcessing} className="px-5 py-3 rounded-xl font-bold text-sm text-gray-800 bg-[#f9e653] border border-[#e0cf4a] hover:bg-[#e0cf4a] transition-colors w-full sm:w-auto flex justify-center items-center gap-2">
              {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div> : <Key className="w-4 h-4"/>} 
              {isProcessing ? 'Memproses...' : 'Terapkan Akses'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===============================
// 4. TAMPILAN LOGIN (AUTENTIKASI)
// ===============================
const LoginScreen = ({ onLogin, pengampus, students }) => {
  const [role, setRole] = useState('wali');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const getEnv = (key, fallback) => { try { return import.meta.env[key] || fallback; } catch(err) { return fallback; } };
    const adminUsername = getEnv('VITE_ADMIN_USERNAME');
    const adminPassword = getEnv('VITE_ADMIN_PASSWORD');

    try {
       if (role === 'admin') {
         if (username === adminUsername && password === adminPassword) {
           await signInAnonymously(auth); 
           onLogin({ role: 'admin', name: 'Admin Pusat', id: 'admin' });
         } else setError('Kredensial Admin tidak sesuai.');
       } else {
         const authEmail = `${username}@mtqpiat.app`.toLowerCase();
         await signInWithEmailAndPassword(auth, authEmail, password);
         
         if (role === 'pengampu') {
           const user = pengampus.find(p => p.username === username);
           if (user) onLogin({ role: 'pengampu', name: user.name, id: user.id });
           else throw new Error("Akun terdaftar, namun profil tidak ditemukan. Silakan hubungi Admin.");
         } else if (role === 'wali') {
           const user = students.find(s => s.username === username);
           if (user) onLogin({ role: 'wali', name: `Wali ${user.name}`, studentId: user.id });
           else throw new Error("Akun terdaftar, namun profil tidak ditemukan. Silakan hubungi Admin.");
         }
       }
    } catch (err) {
       if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') setError('Username atau sandi yang Anda masukkan salah.');
       else setError(err.message || 'Gagal memverifikasi akses masuk.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f4f7f6] relative overflow-hidden">
      <GlassBackground />
      
      {/* Dekorasi khusus halaman login agar lebih cantik */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-[#54af48]/15 rounded-full blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#26544d]/15 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-[360px] z-10 relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center border border-gray-200 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-sm">
             <BookOpen className="w-8 h-8 text-[#26544d]" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">MARKAZ</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">Sistem Mutaba'ah & Presensi</p>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl border border-gray-200/80 rounded-[2rem] p-6 md:p-8 shadow-sm">
          
          {/* Switcher Role ala iOS */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 border border-gray-200/50">
            <button type="button" onClick={() => {setRole('wali'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${role === 'wali' ? 'bg-white text-gray-800 border border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Wali</button>
            <button type="button" onClick={() => {setRole('pengampu'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${role === 'pengampu' ? 'bg-white text-gray-800 border border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pengampu</button>
            <button type="button" onClick={() => {setRole('admin'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${role === 'admin' ? 'bg-white text-gray-800 border border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Admin</button>
          </div>

          {error && (
             <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 flex items-start gap-2">
               <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/> <span className="leading-relaxed">{error}</span>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 ml-1">Username</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="w-4 h-4 text-gray-400" /></div>
                  <input required type="text" value={username} onChange={e => setUsername(e.target.value.replace(/\s+/g, ''))} className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#26544d] focus:ring-4 focus:ring-[#26544d]/10 transition-all outline-none text-gray-800 font-medium placeholder-gray-400" placeholder="Masukkan username" />
               </div>
            </div>
            <div>
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 ml-1">Kata Sandi</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="w-4 h-4 text-gray-400" /></div>
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#26544d] focus:ring-4 focus:ring-[#26544d]/10 transition-all outline-none text-gray-800 font-medium placeholder-gray-400" placeholder="Masukkan sandi" />
               </div>
            </div>
            
            <button type="submit" disabled={loading} className={`w-full mt-6 py-4 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${primaryBtn}`}>
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (
                <>Masuk Sistem <ArrowRight className="w-4 h-4 ml-1"/></>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8 font-medium">© {new Date().getFullYear()} Markaz Tahfidz. All rights reserved.</p>
      </div>
    </div>
  );
};

// ==========================================
// 5. TAMPILAN PENGATURAN (UBAH SANDI)
// ==========================================
const SettingsView = () => {
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault(); setStatus({ type: '', msg: '' });
    if (newPassword.length < 6) { setStatus({ type: 'error', msg: 'Kata sandi minimal terdiri dari 6 karakter.'}); return; }
    setLoading(true);
    try {
       await updatePassword(auth.currentUser, newPassword);
       setStatus({ type: 'success', msg: 'Kata sandi berhasil diperbarui! Silakan gunakan sandi baru ini untuk login berikutnya.' });
       setNewPassword('');
    } catch (err) {
       if (err.code === 'auth/requires-recent-login') setStatus({ type: 'error', msg: 'Sesi Anda terlalu lama. Demi keamanan, silakan Keluar (Logout) dan Masuk kembali sebelum memperbarui sandi.' });
       else setStatus({ type: 'error', msg: 'Terjadi kendala saat memperbarui sandi. Silakan coba beberapa saat lagi.' });
    }
    setLoading(false);
  };

  return (
     <div className="space-y-6 pb-10">
        <div className={`p-6 md:p-8 max-w-2xl ${glassCard}`}>
           <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
             <div className="p-2.5 bg-[#26544d]/10 border border-[#26544d]/20 rounded-xl"><Settings className="w-6 h-6 text-[#26544d]"/></div>
             Pengaturan Akun
           </h2>
           <p className="text-sm text-gray-500 mt-3">Kelola kata sandi Anda secara berkala untuk menjaga keamanan akun akses sistem.</p>
           
           <hr className="my-6 border-gray-200" />

           {status.msg && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                 {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0"/> : <Check className="w-5 h-5 shrink-0"/>}
                 <span className="leading-relaxed">{status.msg}</span>
              </div>
           )}

           <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                 <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Kata Sandi Baru</label>
                 <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-gray-400" /></div>
                    <input type="text" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm ${glassInput}`} placeholder="Masukkan minimal 6 karakter" />
                 </div>
              </div>
              <button type="submit" disabled={loading} className={`px-6 py-3.5 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 w-full sm:w-auto ${primaryBtn}`}>
                 {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Key className="w-4 h-4"/>}
                 Perbarui Kata Sandi
              </button>
           </form>
        </div>
     </div>
  );
};

// ==========================================
// 6. VIEW: DASHBOARD ADMIN
// ==========================================
const AdminView = ({ pengampus, students }) => {
  const [newPengampu, setNewPengampu] = useState({ name: '', username: '', password: '' });
  const [newStudent, setNewStudent] = useState({ name: '', kelas: '1', semester: '1', username: '', password: '', juzTercapai: 0 });
  const [expandedPengampuId, setExpandedPengampuId] = useState(null);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null); 
  const [resetTarget, setResetTarget] = useState(null);
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const createFirebaseAuthUser = async (username, password) => {
    const tempApp = initializeApp(firebaseConfig, 'TempApp_' + Date.now());
    const tempAuth = getAuth(tempApp);
    const email = `${username}@mtqpiat.app`.toLowerCase();
    try {
      const userCred = await createUserWithEmailAndPassword(tempAuth, email, password);
      const uid = userCred.user.uid;
      await signOut(tempAuth); await deleteApp(tempApp);
      return uid;
    } catch (error) { await deleteApp(tempApp); throw error; }
  };

  const handleAddPengampu = async (e) => {
    e.preventDefault();
    if (!newPengampu.name || !newPengampu.username || !newPengampu.password) return;
    setIsProcessing(true); setFormError('');
    try {
      const authUid = await createFirebaseAuthUser(newPengampu.username.replace(/\s+/g, ''), newPengampu.password);
      await setDoc(doc(db, getCollectionPath('pengampus'), authUid), { id: authUid, name: newPengampu.name, username: newPengampu.username.replace(/\s+/g, '') });
      setNewPengampu({ name: '', username: '', password: '' });
    } catch (err) { setFormError(err.code === 'auth/email-already-in-use' ? "Username tersebut sudah digunakan pengguna lain." : "Gagal mendaftarkan akun ke sistem keamanan."); } finally { setIsProcessing(false); }
  };

  const handleAddStudent = async (e, pengampuId) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.username || !newStudent.password) return;
    setIsProcessing(true); setFormError('');
    try {
      const authUid = await createFirebaseAuthUser(newStudent.username.replace(/\s+/g, ''), newStudent.password);
      await setDoc(doc(db, getCollectionPath('students'), authUid), { 
        id: authUid, pengampuId, name: newStudent.name, username: newStudent.username.replace(/\s+/g, ''),
        semester: parseInt(newStudent.semester), juzTercapai: parseInt(newStudent.juzTercapai), kelas: newStudent.kelas
      });
      setNewStudent({ name: '', kelas: '1', semester: '1', username: '', password: '', juzTercapai: 0 });
    } catch (err) { setFormError(err.code === 'auth/email-already-in-use' ? "Username tersebut sudah digunakan pengguna lain." : "Gagal mendaftarkan akun ke sistem keamanan."); } finally { setIsProcessing(false); }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'pengampu') await deleteDoc(doc(db, getCollectionPath('pengampus'), deleteTarget.id));
      else if (deleteTarget.type === 'student') await deleteDoc(doc(db, getCollectionPath('students'), deleteTarget.id));
    } catch (error) { setFormError("Terjadi kendala saat menghapus data profil."); } finally { setDeleteTarget(null); }
  };

  const executeEdit = async (updatedData) => {
    if (!editTarget) return;
    try {
      const collectionName = editTarget.type === 'pengampu' ? 'pengampus' : 'students';
      await updateDoc(doc(db, getCollectionPath(collectionName), editTarget.data.id), updatedData);
    } catch (error) { setFormError("Terjadi kendala saat menyimpan pembaruan profil."); } finally { setEditTarget(null); }
  };

  const executeResetAccess = async (newUsername, newPassword) => {
    try {
      await createFirebaseAuthUser(newUsername, newPassword);
      const collectionName = resetTarget.type === 'pengampu' ? 'pengampus' : 'students';
      await updateDoc(doc(db, getCollectionPath(collectionName), resetTarget.data.id), { username: newUsername });
      setResetTarget(null);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') throw new Error("Username sudah terpakai. Silakan coba kombinasi lain.");
      throw new Error("Sistem belum dapat memproses pengaturan ulang akses.");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <ConfirmModal isOpen={deleteTarget !== null} title={`Hapus Data ${deleteTarget?.type === 'pengampu' ? 'Pengampu' : 'Santri'}?`} message={`Apakah Anda yakin ingin menghapus profil "${deleteTarget?.name}" secara permanen?`} onConfirm={executeDelete} onCancel={() => setDeleteTarget(null)} />
      <EditModal isOpen={editTarget !== null} target={editTarget} pengampus={pengampus} onSave={executeEdit} onCancel={() => setEditTarget(null)} />
      <ResetAccessModal isOpen={resetTarget !== null} target={resetTarget} onSave={executeResetAccess} onCancel={() => setResetTarget(null)} />

      <div className={`p-6 md:p-8 ${glassCard}`}>
        <div className="flex items-center gap-4 mb-6">
           <div className="p-3 bg-white border border-gray-200 rounded-2xl">
             <UserPlus className="w-6 h-6 text-[#26544d]"/>
           </div>
           <div>
             <h2 className="text-lg md:text-xl font-bold text-gray-800">Tambah Pengampu</h2>
             <p className="text-xs text-gray-500 mt-1">Pendaftaran akun otomatis terhubung dengan sistem keamanan berenkripsi.</p>
           </div>
        </div>
        
        {formError && <div className="p-3.5 bg-red-50 text-red-600 rounded-xl mb-5 text-sm font-medium border border-red-200 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {formError}</div>}
        
        <form onSubmit={handleAddPengampu} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="w-full">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
            <input required type="text" value={newPengampu.name} onChange={e=>setNewPengampu({...newPengampu, name: e.target.value})} className={`w-full p-3 text-sm ${glassInput}`} placeholder="Misal: Ust. Fulan" />
          </div>
          <div className="w-full">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Username</label>
            <input required type="text" value={newPengampu.username} onChange={e=>setNewPengampu({...newPengampu, username: e.target.value})} className={`w-full p-3 text-sm ${glassInput}`} placeholder="tanpaspasi" />
          </div>
          <div className="w-full">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sandi (Min. 6 Karakter)</label>
            <input required type="text" value={newPengampu.password} onChange={e=>setNewPengampu({...newPengampu, password: e.target.value})} minLength={6} className={`w-full p-3 text-sm ${glassInput}`} placeholder="Minimal 6 karakter" />
          </div>
          <button type="submit" disabled={isProcessing} className={`w-full p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${primaryBtn}`} style={{ opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="w-4 h-4"/>} 
            {isProcessing ? 'Memproses...' : 'Tambahkan'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2 px-1">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#26544d]"/> Daftar Halaqah & Santri
          </h2>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#54af48] bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
             <ShieldCheck className="w-3.5 h-3.5"/> Keamanan Aktif
          </span>
        </div>
        
        {pengampus.map(pengampu => {
            const isExpanded = expandedPengampuId === pengampu.id;
            const pengampuStudents = students.filter(s => s.pengampuId === pengampu.id);
            return (
              <div key={pengampu.id} className={`transition-all duration-300 overflow-hidden ${glassCard} ${isExpanded ? 'border-[#54af48]/50' : 'hover:border-gray-300'}`}>
                <div className={`p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer gap-4 transition-colors ${isExpanded ? 'bg-white/60' : 'hover:bg-white/40'}`} onClick={() => setExpandedPengampuId(isExpanded ? null : pengampu.id)}>
                  <div className="flex items-center gap-4 flex-1 w-full">
                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold text-xl bg-[#26544d] border border-[#1a3a35] shrink-0">{pengampu.name.charAt(0)}</div>
                     <div>
                        <h3 className="text-base md:text-lg font-bold text-gray-800 leading-tight">{pengampu.name}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1.5">
                           <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">ID: <span className="font-bold text-gray-700">{pengampu.username}</span></span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-200 sm:border-none">
                     <div className="text-xs font-bold text-[#26544d] bg-white border border-gray-200 px-3.5 py-2 rounded-xl">{pengampuStudents.length} Santri</div>
                     <div className="flex items-center gap-1.5 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); setResetTarget({ type: 'pengampu', data: pengampu }); }} className="text-[#eab308] p-2 hover:bg-yellow-50 rounded-xl transition-colors bg-white border border-gray-200 hover:border-yellow-200" title="Atur Ulang Akses Sandi"><Key className="w-4 h-4"/></button>
                        <button onClick={(e) => { e.stopPropagation(); setEditTarget({ type: 'pengampu', data: pengampu }); }} className="text-[#54af48] p-2 hover:bg-green-50 rounded-xl transition-colors bg-white border border-gray-200 hover:border-green-200" title="Edit Profil"><Edit className="w-4 h-4"/></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'pengampu', id: pengampu.id, name: pengampu.name }); }} className="text-red-500 p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors bg-white border border-gray-200 hover:border-red-200" title="Hapus Data"><Trash2 className="w-4 h-4"/></button>
                        <div className={`p-2 transition-colors ml-1 bg-white rounded-xl border border-gray-200 ${isExpanded ? 'text-gray-800' : 'text-gray-400'}`}>{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                     </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-white/40 p-5 md:p-6 lg:p-8 animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={(e) => handleAddStudent(e, pengampu.id)} className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                      <div className="col-span-1 sm:col-span-2 lg:col-span-2"><label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Nama Santri Baru</label><input required type="text" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name: e.target.value})} className={`w-full p-2.5 rounded-xl text-sm ${glassInput}`} placeholder="Nama Lengkap" /></div>
                      <div className="col-span-1"><label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Kls/Smt</label><div className="flex gap-2"><select value={newStudent.kelas} onChange={e=>setNewStudent({...newStudent, kelas: e.target.value})} className={`w-1/2 p-2.5 rounded-xl text-sm ${glassInput}`}><option value="IL">IL</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select><select value={newStudent.semester} onChange={e=>setNewStudent({...newStudent, semester: e.target.value})} className={`w-1/2 p-2.5 rounded-xl text-sm ${glassInput}`}>{[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
                      <div className="col-span-1"><label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Tercapai</label><div className="flex items-center"><input type="number" min="0" max="30" value={newStudent.juzTercapai} onChange={e=>setNewStudent({...newStudent, juzTercapai: e.target.value})} className={`w-full p-2.5 border-r-0 rounded-l-xl text-sm ${glassInput}`} /><span className="bg-gray-50 p-2.5 border border-gray-200 border-l-0 rounded-r-xl text-[10px] text-gray-500 font-bold">Juz</span></div></div>
                      <div className="col-span-1"><label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Username</label><input required type="text" value={newStudent.username} onChange={e=>setNewStudent({...newStudent, username: e.target.value})} className={`w-full p-2.5 rounded-xl text-sm ${glassInput}`} placeholder="tanpaspasi" /></div>
                      <div className="col-span-1"><label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Sandi Akses</label><div className="flex gap-2"><input required type="text" value={newStudent.password} minLength={6} onChange={e=>setNewStudent({...newStudent, password: e.target.value})} className={`w-full p-2.5 rounded-xl text-sm ${glassInput}`} placeholder="Min. 6" /><button type="submit" disabled={isProcessing} className="p-2.5 rounded-xl text-white font-bold transition-all bg-[#54af48] border border-[#46933c] hover:bg-[#46933c] flex items-center justify-center shrink-0" style={{ opacity: isProcessing ? 0.7 : 1 }}>{isProcessing ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Plus className="w-5 h-5"/>}</button></div></div>
                    </form>
                    
                    <div className="overflow-x-auto bg-white/80 rounded-2xl border border-gray-200">
                       <table className="w-full text-left whitespace-nowrap min-w-[650px]">
                          <thead className="text-gray-500 border-b border-gray-200 text-[11px] uppercase tracking-wider bg-gray-50/50">
                             <tr>
                               <th className="p-4 font-bold">Nama Santri</th>
                               <th className="p-4 font-bold">Kls/Smt</th>
                               <th className="p-4 font-bold">Juz Tercapai</th>
                               <th className="p-4 font-bold">Status Keamanan</th>
                               <th className="p-4 font-bold text-center">Tindakan</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 text-sm">
                             {pengampuStudents.length === 0 ? <tr><td colSpan="5" className="p-6 md:p-8 text-center text-gray-400 italic">Belum ada data santri yang ditambahkan.</td></tr> : pengampuStudents.map(s => (
                                <tr key={s.id} className="hover:bg-white transition-colors">
                                   <td className="p-4 font-bold text-gray-800">{s.name}</td>
                                   <td className="p-4 text-gray-600 text-xs font-medium">{s.kelas} / {s.semester}</td>
                                   <td className="p-4 font-bold text-[#54af48] text-xs bg-[#54af48]/5">{s.juzTercapai} Juz</td>
                                   <td className="p-4">
                                     <div className="flex gap-2 text-[10px]">
                                       <span className="bg-white px-2.5 py-1 rounded-md text-gray-600 border border-gray-200">{s.username}</span>
                                     </div>
                                   </td>
                                   <td className="p-4 text-center">
                                      <button onClick={() => setResetTarget({ type: 'student', data: s })} className="text-[#eab308] p-2 hover:bg-yellow-50 rounded-xl transition-colors mr-1 bg-white border border-gray-200 hover:border-yellow-300" title="Atur Ulang Akses Sandi"><Key className="w-4 h-4"/></button>
                                      <button onClick={() => setEditTarget({ type: 'student', data: s })} className="text-[#54af48] p-2 hover:bg-green-50 rounded-xl transition-colors mr-1 bg-white border border-gray-200 hover:border-green-300" title="Edit Profil"><Edit className="w-4 h-4"/></button>
                                      <button onClick={() => setDeleteTarget({ type: 'student', id: s.id, name: s.name })} className="text-red-500 p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors bg-white border border-gray-200 hover:border-red-300" title="Hapus Data"><Trash2 className="w-4 h-4"/></button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                )}
              </div>
            );
        })}
      </div>
    </div>
  )
};

// ==========================================
// 7. VIEW: LAPORAN HARIAN (MANDIRI)
// ==========================================
const HarianView = ({ students, records, pengampus, user }) => {
  const [selectedDate, setSelectedDate] = useState(getLocalYYYYMMDD(new Date()));
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [selectedPengampuId, setSelectedPengampuId] = useState('semua');
  const [recordToDelete, setRecordToDelete] = useState(null);
  const sweepDoneRef = useRef(false);

  useEffect(() => {
    if (sweepDoneRef.current || students.length === 0 || user.role === 'wali') return;
    const runAutoAlphaSweeper = async () => {
       sweepDoneRef.current = true;
       const today = new Date();
       const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
       if (yesterday.getDay() === 0) return;

       const yesterdayStr = getLocalYYYYMMDD(yesterday);
       const relevantStudents = user.role === 'pengampu' ? students.filter(s => s.pengampuId === user.id) : students;
       const hasAnyRecordYesterday = records.some(r => r.date === yesterdayStr && relevantStudents.some(s => s.id === r.studentId));
       if (!hasAnyRecordYesterday) return;

       for (const student of relevantStudents) {
          const hasRecord = records.some(r => r.studentId === student.id && r.date === yesterdayStr);
          if (!hasRecord) {
             const recordId = `${student.id}_${yesterdayStr}`;
             const payload = { studentId: student.id, date: yesterdayStr, presensi: 'Alpha', keterangan: 'Tercatat otomatis oleh sistem (Laporan tidak diisi)', autoGenerated: true };
             try { await setDoc(doc(db, getCollectionPath('records'), recordId), payload); } catch (e) {}
          }
       }
    };
    setTimeout(() => { runAutoAlphaSweeper(); }, 1500);
  }, [students, records, user]);

  const filteredStudents = useMemo(() => {
    if (user.role !== 'admin' || selectedPengampuId === 'semua') return students;
    return students.filter(s => s.pengampuId === selectedPengampuId);
  }, [students, selectedPengampuId, user.role]);

  const groupedStudents = useMemo(() => {
    const groups = pengampus.map(p => ({ pengampu: p, students: filteredStudents.filter(s => s.pengampuId === p.id) })).filter(g => g.students.length > 0);
    const unassigned = filteredStudents.filter(s => !pengampus.find(p => p.id === s.pengampuId));
    if (unassigned.length > 0) groups.push({ pengampu: { id: 'unassigned', name: 'Tanpa Halaqah' }, students: unassigned });
    return groups;
  }, [filteredStudents, pengampus]);

  const executeDeleteRecord = async () => {
    if (!recordToDelete) return;
    try { await deleteDoc(doc(db, getCollectionPath('records'), recordToDelete)); } catch (error) {} finally { setRecordToDelete(null); }
  };

  return (
    <div className="space-y-6 pb-10">
      <ConfirmModal isOpen={recordToDelete !== null} title="Ulangi Laporan?" message="Tindakan ini akan mengosongkan kembali form setoran hari ini untuk santri tersebut." confirmText="Kosongkan Form" onConfirm={executeDeleteRecord} onCancel={() => setRecordToDelete(null)} />
      
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 md:p-8 ${glassCard}`}>
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Laporan Harian</h2>
          <p className="text-sm text-gray-500 mt-1">Isi presensi, setoran ziyadah, dan muraja'ah santri.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {user.role === 'admin' && (
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 w-full sm:w-auto">
              <Filter className="text-[#26544d] ml-2 w-5 h-5" />
              <select value={selectedPengampuId} onChange={(e) => setSelectedPengampuId(e.target.value)} className="border-none bg-transparent outline-none text-sm font-bold text-gray-700 p-1 cursor-pointer w-full"><option value="semua">Semua Halaqah</option>{pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 w-full sm:w-auto">
             <label className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wide">Tanggal:</label>
             <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`border-none bg-transparent rounded-lg px-2 text-sm outline-none font-bold text-gray-800 w-full cursor-pointer`}/>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {groupedStudents.length === 0 ? (
          <div className={`text-center p-8 md:p-12 rounded-3xl border border-dashed border-gray-300 text-gray-400 text-base font-medium ${glassCard}`}>Tidak ada data santri pada filter yang Anda pilih.</div>
        ) : (
          groupedStudents.map(group => (
            <div key={group.pengampu.id} className="space-y-3">
              {user.role === 'admin' && selectedPengampuId === 'semua' && (
                <div className="flex items-center gap-4 pt-4 pb-2 px-2">
                   <div className="h-px bg-gray-200 flex-1"></div>
                   <span className="font-bold text-gray-500 uppercase text-[11px] px-4 py-1.5 bg-white rounded-full border border-gray-200 flex items-center gap-2"><BookOpen className="w-4 h-4" style={{ color: theme.secondary }}/> Halaqah {group.pengampu.name}</span>
                   <div className="h-px bg-gray-200 flex-1"></div>
                </div>
              )}
              {group.students.map(student => {
                const todayRecord = records.find(r => r.studentId === student.id && r.date === selectedDate);
                const pastZiyadahs = records.filter(r => r.studentId === student.id && r.date < selectedDate && r.ziyadah && r.ziyadah.toSurah != null).sort((a,b) => b.date.localeCompare(a.date));
                const lastZiyadah = pastZiyadahs.length > 0 ? pastZiyadahs[0].ziyadah : null;
                const pastMurajaahs = records.filter(r => r.studentId === student.id && r.date < selectedDate && r.murajaah && r.murajaah.toJuz != null).sort((a,b) => b.date.localeCompare(a.date));
                const lastMurajaah = pastMurajaahs.length > 0 ? pastMurajaahs[0].murajaah : null;
                const isExpanded = expandedStudent === student.id;

                return (
                  // overflow-hidden ditambahkan agar ujung bagian bawah child element (yg di expand) mengikuti rounded-3xl parent-nya
                  <div key={student.id} className={`transition-all duration-300 overflow-hidden ${glassCard} ${isExpanded ? 'border-[#54af48]/50' : 'hover:border-gray-300'}`}>
                    <div className={`p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${!isExpanded ? 'hover:bg-white/50 cursor-pointer' : 'bg-white/60'}`} onClick={() => !todayRecord && setExpandedStudent(isExpanded ? null : student.id)}>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto" onClick={(e) => { if(todayRecord) { e.stopPropagation(); setExpandedStudent(isExpanded ? null : student.id); } }}>
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold text-xl bg-[#26544d] border border-[#1a3a35] shrink-0">{student.name ? student.name.charAt(0) : '?'}</div>
                        <div>
                           <h3 className="text-lg md:text-xl font-bold text-gray-800">{student.name || 'Unknown'}</h3>
                           <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Kelas {student.kelas} • Smt {student.semester}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3 sm:mt-0 w-full sm:w-auto justify-end flex-1">
                        {todayRecord ? (
                          <div className="flex items-center gap-3 w-full justify-between sm:justify-end">
                            <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
                              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1.5 border ${todayRecord.presensi === 'Hadir' ? 'bg-[#54af48]/10 text-[#54af48] border-[#54af48]/30' : todayRecord.presensi === 'Alpha' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{todayRecord.presensi}</span>
                              {todayRecord.presensi === 'Hadir' && (
                                <div className="text-[11px] font-medium text-gray-600 flex flex-col gap-0.5">
                                  {todayRecord.ziyadah && (<div><span className="font-bold text-[#54af48]">Ziyadah:</span> {formatZiyadahSurahSafe(todayRecord.ziyadah)} <span className="font-bold text-[#54af48] ml-1">[{todayRecord.ziyadah.finalScore}]</span></div>)}
                                  {todayRecord.murajaah && (<div><span className="font-bold text-yellow-600">Muraja'ah:</span> Juz {todayRecord.murajaah.fromJuz === todayRecord.murajaah.toJuz ? todayRecord.murajaah.fromJuz : `${todayRecord.murajaah.fromJuz}-${todayRecord.murajaah.toJuz}`} <span className="font-bold text-yellow-600 ml-1">[{todayRecord.murajaah.finalScore}]</span></div>)}
                                </div>
                              )}
                              {todayRecord.presensi !== 'Hadir' && (<div className="text-xs text-gray-500 truncate w-40"><span className="font-bold">Ket:</span> {todayRecord.keterangan || '-'}</div>)}
                            </div>
                            <div className="flex sm:flex-col gap-2 border-l-0 sm:border-l border-gray-200 pl-0 sm:pl-3 shrink-0">
                               <button onClick={(e) => { e.stopPropagation(); setExpandedStudent(isExpanded ? null : student.id); }} className={`p-2 rounded-xl transition-colors border ${isExpanded ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-400 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200'}`} title="Ubah Laporan"><Edit className="w-4 h-4"/></button>
                               <button onClick={(e) => { e.stopPropagation(); setRecordToDelete(todayRecord.id); }} className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" title="Ulangi (Kosongkan)"><RotateCcw className="w-4 h-4"/></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full gap-4">
                             <span className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-500 border border-gray-200">Menunggu Laporan</span>
                             <div className={`p-2 rounded-full transition-colors bg-white border border-gray-200 ${isExpanded ? 'bg-gray-50' : ''}`}>{isExpanded ? <ChevronUp className="w-5 h-5 text-gray-800" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {isExpanded && (<div className="p-4 md:p-6 lg:p-8 border-t border-gray-200 bg-white/40 animate-in slide-in-from-top-4 duration-300"><StudentDailyForm student={student} date={selectedDate} existingRecord={todayRecord} lastZiyadah={lastZiyadah} lastMurajaah={lastMurajaah} onSaveSuccess={() => setExpandedStudent(null)} /></div>)}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StudentDailyForm = ({ student, date, existingRecord, lastZiyadah, lastMurajaah, onSaveSuccess }) => {
  const getAyahCount = (surahIdx) => QURAN_SURAHS[surahIdx]?.[1] || 0;

  const calcNextZiyadah = () => {
     if (!lastZiyadah || lastZiyadah.toSurah == null || lastZiyadah.toAyah == null) return { surah: 0, ayah: 1 };
     let nextSurah = Number(lastZiyadah.toSurah);
     let nextAyah = Number(lastZiyadah.toAyah) + 1;
     if (nextAyah > getAyahCount(nextSurah)) { nextSurah += 1; nextAyah = 1; if (nextSurah >= QURAN_SURAHS.length) nextSurah = 0; }
     return { surah: nextSurah, ayah: nextAyah };
  };

  const calcNextMurajaah = () => {
     if (!lastMurajaah || lastMurajaah.toJuz == null) return 1;
     let nextJuz = Number(lastMurajaah.toJuz) + 1;
     if (nextJuz > 30) nextJuz = 1;
     return nextJuz;
  };

  const defZ = calcNextZiyadah();
  const defM = calcNextMurajaah();

  const [presensi, setPresensi] = useState(existingRecord?.presensi || '');
  const [keterangan, setKeterangan] = useState(existingRecord?.keterangan || '');
  
  const [ziyadah, setZiyadah] = useState(existingRecord?.ziyadah || { fromSurah: defZ.surah, fromAyah: defZ.ayah, toSurah: defZ.surah, toAyah: defZ.ayah, tajwid: 0, lupa: 0, lupaBimbingan: 0, manualScore: '' });
  const [murajaah, setMurajaah] = useState(existingRecord?.murajaah || { fromJuz: defM, toJuz: defM, tajwid: 0, lupa: 0, lupaBimbingan: 0, manualScore: '' });
  
  const [isZiyadahActive, setIsZiyadahActive] = useState(existingRecord ? !!existingRecord.ziyadah : true);
  const [isMurajaahActive, setIsMurajaahActive] = useState(existingRecord ? !!existingRecord.murajaah : true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleSave = async () => {
    if (!presensi) { setErrorMsg("Pilih status presensi terlebih dahulu."); return; }
    if (presensi === 'Izin/Sakit' && !keterangan.trim()) { setErrorMsg("Mohon lengkapi keterangan izin atau sakit."); return; }
    
    setErrorMsg(''); setSaving(true);
    
    const zScore = calculateScore(ziyadah.tajwid, ziyadah.lupa, ziyadah.lupaBimbingan);
    const mScore = calculateScore(murajaah.tajwid, murajaah.lupa, murajaah.lupaBimbingan);
    const recordId = existingRecord?.id || `${student.id}_${date}`;
    
    const payload = { 
      studentId: student.id, date, presensi, 
      ...(presensi === 'Hadir' && isZiyadahActive ? { ziyadah: { ...ziyadah, finalScore: ziyadah.manualScore !== '' ? parseInt(ziyadah.manualScore) : zScore } } : {}),
      ...(presensi === 'Hadir' && isMurajaahActive ? { murajaah: { ...murajaah, finalScore: murajaah.manualScore !== '' ? parseInt(murajaah.manualScore) : mScore } } : {}),
      ...(presensi === 'Izin/Sakit' ? { keterangan } : {})
    };

    try { await setDoc(doc(db, getCollectionPath('records'), recordId), payload); onSaveSuccess(); } 
    catch (error) { setErrorMsg("Terjadi kendala saat menyimpan laporan harian."); setSaving(false); }
  };

  const ErrorRow = ({ label, penalty, value, onChange, colorTheme }) => {
     const themes = { 
       green: { badge: 'bg-[#54af48]/10 text-[#54af48] border-[#54af48]/30', text: 'text-[#54af48]' }, 
       yellow: { badge: 'bg-yellow-100/50 text-yellow-700 border-yellow-300/50', text: 'text-yellow-700' }, 
       red: { badge: 'bg-red-50 text-red-600 border-red-200', text: 'text-red-600' } 
     };
     const t = themes[colorTheme];
     return (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-200 last:border-0">
           <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold text-gray-700">{label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${t.badge}`}>{penalty}</span>
           </div>
           <div className="flex items-center bg-white rounded-xl border border-gray-300 overflow-hidden h-9">
              <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="px-3 h-full hover:bg-gray-100 text-gray-500 border-r border-gray-200 transition-colors"><Minus className="w-4 h-4"/></button>
              <div className={`w-10 text-center text-sm font-bold bg-white h-full flex items-center justify-center ${t.text}`}>{value}</div>
              <button type="button" onClick={() => onChange(value + 1)} className="px-3 h-full hover:bg-gray-100 text-gray-500 border-l border-gray-200 transition-colors"><Plus className="w-4 h-4"/></button>
           </div>
        </div>
     );
  };

  return (
    <div className="space-y-5">
      {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200 flex items-center gap-3"><AlertCircle className="w-5 h-5"/> {errorMsg}</div>}
      
      <div className="p-5 md:p-6 rounded-3xl bg-white/80 border border-gray-200">
        <label className="block text-[11px] md:text-xs font-bold text-gray-500 mb-3 md:mb-4 uppercase tracking-widest text-center md:text-left">Status Presensi</label>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {['Hadir', 'Izin/Sakit', 'Alpha'].map(status => (
            <button key={status} onClick={() => {setPresensi(status); setErrorMsg('');}} className={`w-full py-3 md:py-4 px-2 rounded-2xl text-xs md:text-sm font-bold transition-all border ${presensi === status ? 'text-white border-transparent' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'}`} style={presensi === status ? { backgroundColor: status === 'Hadir' ? theme.secondary : status === 'Alpha' ? theme.danger : theme.warning, borderColor: status === 'Hadir' ? '#46933c' : status === 'Alpha' ? '#dc2626' : '#ca8a04' } : {}}>{status}</button>
          ))}
        </div>
      </div>

      {presensi === 'Hadir' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">
          <div className={`p-5 md:p-6 rounded-3xl transition-all ${!isZiyadahActive ? 'border border-dashed border-gray-300 bg-white/40' : 'border border-gray-200 bg-white'}`}>
             <div className="flex justify-between items-center mb-5 md:mb-6">
                <h4 className={`font-bold text-base md:text-lg flex items-center gap-3 ${!isZiyadahActive ? 'text-gray-400' : 'text-gray-800'}`}><BookOpen className="w-5 h-5" style={{ color: !isZiyadahActive ? '#9ca3af' : theme.primary }}/> Setoran Ziyadah</h4>
                <button type="button" onClick={() => setIsZiyadahActive(!isZiyadahActive)} className={`w-12 h-6 md:w-14 md:h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors border ${isZiyadahActive ? 'bg-[#54af48] border-[#46933c]' : 'bg-gray-200 border-gray-300'}`}><div className={`bg-white w-4 h-4 md:w-5 md:h-5 rounded-full border border-gray-200 transform transition-transform ${isZiyadahActive ? 'translate-x-6 md:translate-x-7' : 'translate-x-0'}`}></div></button>
             </div>
             {isZiyadahActive && (
                <div className="space-y-4 animate-in fade-in duration-200">
                   <div className="space-y-3 bg-gray-50/80 p-4 md:p-5 rounded-2xl border border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                         <div><label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Dari Surat</label><select value={ziyadah.fromSurah} onChange={(e) => setZiyadah({...ziyadah, fromSurah: parseInt(e.target.value), fromAyah: 1})} className={`w-full p-3 rounded-xl text-sm ${glassInput}`}>{QURAN_SURAHS.map((s, i) => <option key={i} value={i}>{s[0]}</option>)}</select></div>
                         <div><label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Ayat</label><select value={ziyadah.fromAyah} onChange={(e) => setZiyadah({...ziyadah, fromAyah: parseInt(e.target.value)})} className={`w-full p-3 rounded-xl text-sm ${glassInput}`}>{Array.from({length: getAyahCount(ziyadah.fromSurah)}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div><label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sampai Surat</label><select value={ziyadah.toSurah} onChange={(e) => setZiyadah({...ziyadah, toSurah: parseInt(e.target.value), toAyah: 1})} className={`w-full p-3 rounded-xl text-sm ${glassInput}`}>{QURAN_SURAHS.map((s, i) => <option key={i} value={i}>{s[0]}</option>)}</select></div>
                         <div><label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Ayat</label><select value={ziyadah.toAyah} onChange={(e) => setZiyadah({...ziyadah, toAyah: parseInt(e.target.value)})} className={`w-full p-3 rounded-xl text-sm ${glassInput}`}>{Array.from({length: getAyahCount(ziyadah.toSurah)}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
                      </div>
                   </div>
                   
                   <div className="bg-white rounded-2xl px-4 md:px-5 py-2 border border-gray-200">
                      <ErrorRow label="Kesalahan Tajwid" penalty="-1" value={ziyadah.tajwid} onChange={(v) => setZiyadah({...ziyadah, tajwid: v})} colorTheme="green" />
                      <ErrorRow label="Lupa / Tersendat" penalty="-1" value={ziyadah.lupa} onChange={(v) => setZiyadah({...ziyadah, lupa: v})} colorTheme="yellow" />
                      <ErrorRow label="Lupa (Dibimbing)" penalty="-2" value={ziyadah.lupaBimbingan} onChange={(v) => setZiyadah({...ziyadah, lupaBimbingan: v})} colorTheme="red" />
                   </div>
                   
                   <div className="mt-4 p-4 md:p-5 rounded-2xl bg-[#f4f8f7] border border-[#26544d]/30 flex flex-row items-center justify-between relative overflow-hidden">
                      <div className="relative z-10 flex-1">
                         <p className="text-[10px] font-bold text-[#26544d]/80 uppercase tracking-widest mb-1">Skor Akhir</p>
                         <div className="flex items-center gap-3">
                            <span className="text-3xl md:text-4xl font-black text-[#26544d]">
                               {ziyadah.manualScore !== '' ? ziyadah.manualScore : calculateScore(ziyadah.tajwid, ziyadah.lupa, ziyadah.lupaBimbingan)}
                            </span>
                            {ziyadah.manualScore !== '' && <span className="text-[9px] font-bold text-[#26544d] bg-white px-2 py-0.5 rounded-md border border-[#26544d]/30">Diubah Manual</span>}
                         </div>
                      </div>
                      <div className="relative z-10 text-right flex flex-col items-end">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Koreksi Manual</label>
                         <input type="number" value={ziyadah.manualScore} onChange={(e) => setZiyadah({...ziyadah, manualScore: e.target.value})} placeholder="Otomatis" className="w-24 px-3 py-2 text-sm font-bold text-center text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#26544d]/30 outline-none transition-all placeholder-gray-400" />
                      </div>
                   </div>

                </div>
             )}
          </div>
          
          <div className={`p-5 md:p-6 rounded-3xl transition-all ${!isMurajaahActive ? 'border border-dashed border-gray-300 bg-white/40' : 'border border-gray-200 bg-white'}`}>
             <div className="flex justify-between items-center mb-5 md:mb-6">
                <h4 className={`font-bold text-base md:text-lg flex items-center gap-3 ${!isMurajaahActive ? 'text-gray-400' : 'text-gray-800'}`}><RotateCcw className="w-5 h-5" style={{ color: !isMurajaahActive ? '#9ca3af' : theme.secondary }}/> Setoran Muraja'ah</h4>
                <button type="button" onClick={() => setIsMurajaahActive(!isMurajaahActive)} className={`w-12 h-6 md:w-14 md:h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors border ${isMurajaahActive ? 'bg-[#f9e653] border-[#e0cf4a]' : 'bg-gray-200 border-gray-300'}`}><div className={`bg-white w-4 h-4 md:w-5 md:h-5 rounded-full border border-gray-200 transform transition-transform ${isMurajaahActive ? 'translate-x-6 md:translate-x-7' : 'translate-x-0'}`}></div></button>
             </div>
             {isMurajaahActive && (
                <div className="space-y-4 animate-in fade-in duration-200">
                   <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-4 md:p-5 rounded-2xl border border-gray-200">
                      <div><label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Dari Juz</label><select value={murajaah.fromJuz} onChange={(e) => setMurajaah({...murajaah, fromJuz: parseInt(e.target.value)})} className={`w-full p-3 rounded-xl text-sm ${glassInput}`}>{JUZ_LIST.map(j => <option key={j} value={j}>Juz {j}</option>)}</select></div>
                      <div><label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sampai Juz</label><select value={murajaah.toJuz} onChange={(e) => setMurajaah({...murajaah, toJuz: parseInt(e.target.value)})} className={`w-full p-3 rounded-xl text-sm ${glassInput}`}>{JUZ_LIST.map(j => <option key={j} value={j}>Juz {j}</option>)}</select></div>
                   </div>
                   
                   <div className="bg-white rounded-2xl px-4 md:px-5 py-2 border border-gray-200">
                      <ErrorRow label="Kesalahan Tajwid" penalty="-1" value={murajaah.tajwid} onChange={(v) => setMurajaah({...murajaah, tajwid: v})} colorTheme="green" />
                      <ErrorRow label="Lupa / Tersendat" penalty="-1" value={murajaah.lupa} onChange={(v) => setMurajaah({...murajaah, lupa: v})} colorTheme="yellow" />
                      <ErrorRow label="Lupa (Dibimbing)" penalty="-2" value={murajaah.lupaBimbingan} onChange={(v) => setMurajaah({...murajaah, lupaBimbingan: v})} colorTheme="red" />
                   </div>
                   
                   <div className="mt-4 p-4 md:p-5 rounded-2xl bg-[#f7fbf6] border border-[#54af48]/30 flex flex-row items-center justify-between relative overflow-hidden">
                      <div className="relative z-10 flex-1">
                         <p className="text-[10px] font-bold text-[#54af48]/90 uppercase tracking-widest mb-1">Skor Akhir</p>
                         <div className="flex items-center gap-3">
                            <span className="text-3xl md:text-4xl font-black text-[#54af48]">
                               {murajaah.manualScore !== '' ? murajaah.manualScore : calculateScore(murajaah.tajwid, murajaah.lupa, murajaah.lupaBimbingan)}
                            </span>
                            {murajaah.manualScore !== '' && <span className="text-[9px] font-bold text-[#54af48] bg-white px-2 py-0.5 rounded-md border border-[#54af48]/30">Diubah Manual</span>}
                         </div>
                      </div>
                      <div className="relative z-10 text-right flex flex-col items-end">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Koreksi Manual</label>
                         <input type="number" value={murajaah.manualScore} onChange={(e) => setMurajaah({...murajaah, manualScore: e.target.value})} placeholder="Otomatis" className="w-24 px-3 py-2 text-sm font-bold text-center text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#54af48]/40 outline-none transition-all placeholder-gray-400" />
                      </div>
                   </div>

                </div>
             )}
          </div>
        </div>
      )}

      {presensi === 'Izin/Sakit' && (
        <div className="p-5 md:p-6 rounded-3xl bg-white border border-gray-200 animate-in fade-in duration-200">
           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-3">Keterangan Izin / Sakit</label>
           <textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Tulis keterangan Ananda di sini..." className={`w-full p-4 text-sm rounded-2xl resize-none h-32 ${glassInput}`} />
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} disabled={saving} className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-all ${primaryBtn}`}>
          {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Check className="w-5 h-5"/>}
          Simpan Laporan Harian
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 8. VIEW: REKAPITULASI (MANDIRI)
// ==========================================
const EditableSelectCell = ({ value, options, onSave }) => (
  <select value={value || ''} onChange={(e) => onSave(e.target.value)} className="w-20 p-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[#54af48]/40 transition-all">
    <option value="">- SP -</option>{options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);
const EditableInputCell = ({ value, onSave, placeholder }) => { 
  const [val, setVal] = useState(value || ''); 
  useEffect(() => setVal(value || ''), [value]); 
  return (
    <input type="text" value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val)} className="w-32 p-2 rounded-xl text-xs text-gray-700 bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[#54af48]/40 transition-all" placeholder={placeholder} />
  );
};

const RekapView = ({ students, records, pengampus, userRole, recapNotes }) => {
  const [selectedMonth, setSelectedMonth] = useState(getLocalYYYYMMDD(new Date()).slice(0, 7));
  const [selectedPengampuId, setSelectedPengampuId] = useState('semua');

  const filteredStudents = useMemo(() => { 
    if (userRole !== 'admin' || selectedPengampuId === 'semua') return students; 
    return students.filter(s => s.pengampuId === selectedPengampuId); 
  }, [students, selectedPengampuId, userRole]);

  const recapData = useMemo(() => {
    return filteredStudents.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.id && r.date.startsWith(selectedMonth));
      const kehadiran = studentRecords.filter(r => r.presensi === 'Hadir').length;
      const totalHari = studentRecords.length;
      
      const zRecs = studentRecords.filter(r => r.presensi === 'Hadir' && r.ziyadah);
      const mRecs = studentRecords.filter(r => r.presensi === 'Hadir' && r.murajaah);
      
      const sortedZRecsAsc = [...zRecs].sort((a,b)=>a.date.localeCompare(b.date));
      const sortedZRecsDesc = [...zRecs].sort((a,b)=>b.date.localeCompare(a.date));
      
      const sortedMRecsAsc = [...mRecs].sort((a,b)=>a.date.localeCompare(b.date));
      const sortedMRecsDesc = [...mRecs].sort((a,b)=>b.date.localeCompare(a.date));

      const zStart = sortedZRecsAsc.length > 0 ? sortedZRecsAsc[0].ziyadah : null;
      const zEnd = sortedZRecsDesc.length > 0 ? sortedZRecsDesc[0].ziyadah : null;
      const avgZiyadah = zRecs.length > 0 ? (zRecs.reduce((acc, r) => acc + (Number(r.ziyadah.finalScore) || 0), 0) / zRecs.length).toFixed(1) : 0;
      
      const mStart = sortedMRecsAsc.length > 0 ? sortedMRecsAsc[0].murajaah : null;
      const mEnd = sortedMRecsDesc.length > 0 ? sortedMRecsDesc[0].murajaah : null;
      const avgMurajaah = mRecs.length > 0 ? (mRecs.reduce((acc, r) => acc + (Number(r.murajaah.finalScore) || 0), 0) / mRecs.length).toFixed(1) : 0;
      
      const targetJuz = TARGET_HAFALAN[student.semester] || 30;
      const persentase = Math.min(100, Math.round(((Number(student.juzTercapai) || 0) / targetJuz) * 100));
      
      return { ...student, kehadiran, totalHari, zStart, zEnd, avgZiyadah, mStart, mEnd, avgMurajaah, persentase };
    });
  }, [filteredStudents, records, selectedMonth]);

  const groupedRecap = useMemo(() => {
    return pengampus.map(p => ({ pengampu: p, data: recapData.filter(r => r.pengampuId === p.id) })).filter(g => g.data.length > 0);
  }, [recapData, pengampus]);

  const handleSaveNote = async (studentId, field, value) => { 
    try { await setDoc(doc(db, getCollectionPath('recap_notes'), `${studentId}_${selectedMonth}`), { studentId, month: selectedMonth, [field]: value }, { merge: true }); } catch (err) {} 
  };

  const handleDownloadExcel = () => {
    const headers = ["Halaqah", "Nama Santri", "Kelas", "Semester", "Kehadiran", "Total Hari", "Persentase", "Awal Ziyadah", "Akhir Ziyadah", "Rata-rata Ziyadah", "Awal Muraja'ah", "Akhir Muraja'ah", "Rata-rata Muraja'ah", "Surat Peringatan", "Keterangan"];
    let csvLines = [headers.join(",")];
    groupedRecap.forEach(group => {
      group.data.forEach(row => {
        const sn = recapNotes.find(n => n.studentId === row.id && n.month === selectedMonth) || {};
        const zStartStr = row.zStart ? formatZiyadahSurahSafe(row.zStart) : '-';
        const zEndStr = row.zEnd ? formatZiyadahSurahSafe(row.zEnd) : '-';
        const mStartStr = row.mStart ? `Juz ${row.mStart.fromJuz}` : '-';
        const mEndStr = row.mEnd ? `Juz ${row.mEnd.toJuz}` : '-';
        const rowData = [
          `"${group.pengampu.name}"`, `"${row.name}"`, `"${row.kelas}"`, `"${row.semester}"`,
          row.kehadiran, row.totalHari, `"${row.persentase}%"`, `"${zStartStr}"`, `"${zEndStr}"`, row.avgZiyadah,
          `"${mStartStr}"`, `"${mEndStr}"`, row.avgMurajaah, `"${sn.sp || ''}"`, `"${sn.keterangan || ''}"`
        ];
        csvLines.push(rowData.join(","));
      });
    });
    const blob = new Blob([csvLines.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Rekap_Tahfidz_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-10">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 md:p-8 print:hidden ${glassCard}`}>
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-gray-800">Rekapitulasi</h2>
           <p className="text-sm text-gray-500 mt-1">Evaluasi bulanan laporan santri.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {userRole === 'admin' && (
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 w-full sm:w-auto">
              <Filter className="text-[#26544d] w-5 h-5 ml-2" />
              <select value={selectedPengampuId} onChange={(e) => setSelectedPengampuId(e.target.value)} className="border-none bg-transparent outline-none text-sm font-bold text-gray-700 p-1 w-full sm:w-40 cursor-pointer"><option value="semua">Semua Halaqah</option>{pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
          )}
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={`w-full sm:w-auto rounded-xl p-3 px-4 text-sm outline-none font-bold text-gray-700 ${glassInput}`} />
             <div className="flex gap-2">
                 <button onClick={handleDownloadExcel} className="p-3 bg-[#54af48] text-white rounded-xl border border-[#46933c] hover:bg-[#46933c] transition-all" title="Unduh Excel"><Download className="w-5 h-5"/></button>
                 <button onClick={() => window.print()} className="p-3 bg-gray-800 text-white rounded-xl border border-gray-900 hover:bg-gray-700 transition-all" title="Cetak"><Printer className="w-5 h-5"/></button>
             </div>
          </div>
        </div>
      </div>
      
      <div className={`${glassCard} overflow-hidden`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
            <thead className="bg-white border-b border-gray-200">
              <tr className="text-[11px] text-gray-500 uppercase tracking-wider">
                <th className="p-4 md:p-5 font-bold">Nama Santri</th>
                <th className="p-4 md:p-5 font-bold">Kls/Smt</th>
                <th className="p-4 md:p-5 font-bold">Kehadiran</th>
                <th className="p-4 md:p-5 font-bold">Target</th>
                <th className="p-4 md:p-5 font-bold border-l border-gray-200">Ziyadah</th>
                <th className="p-4 md:p-5 font-bold text-[#26544d]">Rata Z</th>
                <th className="p-4 md:p-5 font-bold border-l border-gray-200">Muraja'ah</th>
                <th className="p-4 md:p-5 font-bold text-[#54af48]">Rata M</th>
                <th className="p-4 md:p-5 font-bold border-l border-gray-200">SP</th>
                <th className="p-4 md:p-5 font-bold">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm bg-white/50">
              {groupedRecap.length === 0 ? (
                <tr><td colSpan="10" className="p-8 md:p-12 text-center text-gray-500 italic bg-white/80">Data belum tersedia.</td></tr>
              ) : (
                groupedRecap.map(group => (
                  <React.Fragment key={group.pengampu.id}>
                    {userRole === 'admin' && selectedPengampuId === 'semua' && (
                      <tr className="bg-gray-100/80 border-b border-gray-200">
                        <td colSpan="10" className="p-3 px-5 font-bold text-gray-700 text-[10px] uppercase tracking-widest"><Users className="w-3.5 h-3.5 inline mr-2 text-gray-400"/> Halaqah {group.pengampu.name}</td>
                      </tr>
                    )}
                    {group.data.map(row => {
                        const sn = recapNotes.find(n => n.studentId === row.id && n.month === selectedMonth) || {};
                        return (
                          <tr key={row.id} className="hover:bg-white transition-colors">
                            <td className="p-4 md:p-5 font-bold text-gray-800">{row.name || 'Unknown'}</td>
                            <td className="p-4 md:p-5 text-gray-600 text-xs font-medium">{row.kelas} / {row.semester}</td>
                            <td className="p-4 md:p-5"><span className="font-bold text-[#26544d] bg-[#26544d]/5 border border-[#26544d]/20 px-2 py-1 rounded-md">{row.kehadiran}</span><span className="text-xs text-gray-400 ml-1.5">/ {row.totalHari}</span></td>
                            <td className="p-4 md:p-5">
                               <div className="flex items-center gap-2.5 w-24">
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-gray-300"><div className="h-full" style={{ width: `${row.persentase}%`, backgroundColor: row.persentase >= 100 ? theme.secondary : theme.accent }}></div></div>
                                  <span className="font-bold text-[10px] text-gray-600">{row.persentase}%</span>
                               </div>
                            </td>
                            <td className="p-4 md:p-5 text-[10px] text-gray-600 space-y-1.5 border-l border-gray-200">
                               <div><span className="font-bold text-gray-400 inline-block w-8">Awl:</span> {row.zStart ? formatZiyadahSurahSafe(row.zStart) : '-'}</div>
                               <div><span className="font-bold text-gray-400 inline-block w-8">Akh:</span> {row.zEnd ? formatZiyadahSurahSafe(row.zEnd) : '-'}</div>
                            </td>
                            <td className="p-4 md:p-5 font-black text-lg text-[#26544d]">{row.avgZiyadah}</td>
                            <td className="p-4 md:p-5 text-[10px] text-gray-600 space-y-1.5 border-l border-gray-200">
                               <div><span className="font-bold text-gray-400 inline-block w-8">Awl:</span> {row.mStart ? `Juz ${row.mStart.fromJuz}` : '-'}</div>
                               <div><span className="font-bold text-gray-400 inline-block w-8">Akh:</span> {row.mEnd ? `Juz ${row.mEnd.toJuz}` : '-'}</div>
                            </td>
                            <td className="p-4 md:p-5 font-black text-lg text-[#54af48]">{row.avgMurajaah}</td>
                            <td className="p-3 border-l border-gray-200"><EditableSelectCell value={sn.sp} options={SP_OPTIONS} onSave={(val) => handleSaveNote(row.id, 'sp', val)} /></td>
                            <td className="p-3"><EditableInputCell value={sn.keterangan} placeholder="Catatan opsional..." onSave={(val) => handleSaveNote(row.id, 'keterangan', val)} /></td>
                          </tr>
                        )
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. DASHBOARD WALI (MANDIRI)
// ==========================================
const WaliDashboardView = ({ students, records, user }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  
  const student = students.find(s => s.id === user.studentId) || students[0];
  
  if (!student) return (
     <div className={`flex flex-col items-center justify-center p-8 md:p-12 mt-8 rounded-3xl text-center ${glassCard}`}>
        <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Profil Tidak Ditemukan</h3>
        <p className="text-sm text-gray-500 mt-2">Silakan hubungi pengurus Markaz untuk sinkronisasi data.</p>
     </div>
  );
  
  const targetJuz = TARGET_HAFALAN[student.semester] || 30;
  const persentase = Math.min(100, Math.round(((Number(student.juzTercapai) || 0) / targetJuz) * 100));
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const formatIndoDate = (dateString) => {
     return new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className={`p-5 md:p-8 rounded-3xl ${glassCard}`}>
         <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Dashboard Ananda</h2>
         <p className="text-sm text-gray-500 mt-1">Pantau perkembangan tahfidz harian.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
           <div className={`p-6 md:p-8 rounded-3xl ${glassCard}`}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-[#26544d] border border-[#1a3a35]">{student.name ? student.name.charAt(0) : '?'}</div>
                 <div>
                    <h3 className="font-bold text-xl text-gray-800 leading-tight">{student.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Kls {student.kelas} • Smt {student.semester}</p>
                 </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200">
                 <div className="flex justify-between items-end text-sm mb-3">
                    <span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Hafalan</span>
                    <span className="font-black text-xl text-[#26544d]">{persentase}%</span>
                 </div>
                 <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div className="h-full transition-all duration-1000" style={{ width: `${persentase}%`, backgroundColor: persentase >= 100 ? theme.secondary : theme.accent }}></div>
                 </div>
                 <p className="text-[11px] font-medium text-gray-400 mt-3 text-right">Tercapai {student.juzTercapai || 0} Juz dari target {targetJuz} Juz</p>
              </div>
           </div>
        </div>
        
        <div className="lg:col-span-8 h-full">
           <div className={`p-5 md:p-8 rounded-3xl h-full flex flex-col ${glassCard}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                 <h3 className="font-bold text-lg md:text-xl text-gray-800 flex items-center gap-3"><Calendar className="w-6 h-6 text-[#26544d]"/> Mutaba'ah</h3>
                 <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-gray-200 w-full sm:w-auto">
                    <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg transition-colors"><ChevronDown className="rotate-90 text-gray-500 w-5 h-5" /></button>
                    <span className="font-bold text-sm md:text-base w-32 md:w-36 text-center text-gray-700">{["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg transition-colors"><ChevronDown className="-rotate-90 text-gray-500 w-5 h-5" /></button>
                 </div>
              </div>
            
            <div className="grid grid-cols-7 gap-2 md:gap-3 flex-1 content-start">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d} className="text-center text-[10px] md:text-xs font-bold text-gray-400 py-2 uppercase tracking-widest">{d}</div>)}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1; 
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = records.find(r => r.studentId === student.id && r.date === dateStr);
                const isToday = dateStr === getLocalYYYYMMDD(new Date());
                
                let statusColor = "bg-white/40 border-gray-200 text-gray-400"; 
                if (record) { 
                   if (record.presensi === 'Hadir') statusColor = "bg-[#f4fbf4] border-[#54af48] text-[#26544d] font-bold"; 
                   else if (record.presensi === 'Alpha') statusColor = "bg-[#fef2f2] border-red-500 text-red-600 font-bold"; 
                   else statusColor = "bg-[#fefce8] border-yellow-400 text-yellow-700 font-bold"; 
                }

                return (
                  <div 
                     key={day} 
                     onClick={() => { if(record) { setSelectedRecord(record); setSelectedDateStr(dateStr); setDetailModalOpen(true); } }}
                     className={`relative flex items-center justify-center aspect-square w-full rounded-2xl border ${statusColor} ${isToday ? 'ring-2 ring-[#26544d]/30 font-black' : ''} ${record ? 'cursor-pointer hover:bg-white transition-all' : ''}`}
                  >
                    <span className="text-sm md:text-lg">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {detailModalOpen && selectedRecord && (
         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDetailModalOpen(false)}></div>
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl w-full max-w-sm p-6 md:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
               
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Mutaba'ah</p>
                     <h3 className="text-lg font-black text-gray-800">{formatIndoDate(selectedDateStr)}</h3>
                  </div>
                  <button onClick={() => setDetailModalOpen(false)} className="p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"><X className="w-5 h-5"/></button>
               </div>
               
               <div 
                 className="mb-6 w-full py-3.5 rounded-2xl text-sm font-bold text-center text-white border uppercase tracking-widest"
                 style={{ 
                   backgroundColor: selectedRecord.presensi === 'Hadir' ? theme.secondary : selectedRecord.presensi === 'Alpha' ? theme.danger : theme.warning, 
                   borderColor: selectedRecord.presensi === 'Hadir' ? '#46933c' : selectedRecord.presensi === 'Alpha' ? '#dc2626' : '#ca8a04' 
                 }}
               >
                 {selectedRecord.presensi}
               </div>

               {selectedRecord.presensi === 'Hadir' && (
                  <div className="space-y-4">
                     {selectedRecord.ziyadah ? (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between">
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ziyadah</p>
                              <p className="text-sm font-bold text-gray-800">{formatZiyadahSurahSafe(selectedRecord.ziyadah)}</p>
                           </div>
                           <span className="text-2xl font-black text-[#26544d]">{selectedRecord.ziyadah.finalScore}</span>
                        </div>
                     ) : (
                        <div className="bg-gray-50 p-4 rounded-2xl text-center text-xs font-medium text-gray-400 border border-gray-200">Ziyadah belum tercatat</div>
                     )}
                     
                     {selectedRecord.murajaah ? (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between">
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Muraja'ah</p>
                              <p className="text-sm font-bold text-gray-800">Juz {selectedRecord.murajaah.fromJuz} - Juz {selectedRecord.murajaah.toJuz}</p>
                           </div>
                           <span className="text-2xl font-black text-[#54af48]">{selectedRecord.murajaah.finalScore}</span>
                        </div>
                     ) : (
                        <div className="bg-gray-50 p-4 rounded-2xl text-center text-xs font-medium text-gray-400 border border-gray-200">Muraja'ah belum tercatat</div>
                     )}
                  </div>
               )}

               {selectedRecord.presensi === 'Izin/Sakit' && (
                  <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200 text-center">
                     <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1.5">Keterangan</p>
                     <p className="text-sm font-medium text-gray-800">{selectedRecord.keterangan || '-'}</p>
                  </div>
               )}

               {selectedRecord.presensi === 'Alpha' && (
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-200 text-center">
                     <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1.5">Sistem</p>
                     <p className="text-sm font-medium text-gray-800">{selectedRecord.keterangan || 'Tanpa keterangan'}</p>
                  </div>
               )}

               <button onClick={() => setDetailModalOpen(false)} className={`mt-8 w-full py-3 rounded-xl font-bold text-sm transition-colors ${outlineBtn}`}>Tutup Laporan</button>
            </div>
         </div>
      )}
    </div>
  );
};

// ==========================================
// 10. KERANGKA UTAMA & MENU SAMPING
// ==========================================
const MainApp = () => {
  const [user, setUser] = useState(null);
  const [pengampus, setPengampus] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [recapNotes, setRecapNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isConfigValid || !db) return;
    const unsubP = onSnapshot(collection(db, getCollectionPath('pengampus')), snap => setPengampus(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubS = onSnapshot(collection(db, getCollectionPath('students')), snap => setStudents(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubR = onSnapshot(collection(db, getCollectionPath('records')), snap => setRecords(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubN = onSnapshot(collection(db, getCollectionPath('recap_notes')), snap => setRecapNotes(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubP(); unsubS(); unsubR(); unsubN(); };
  }, []);

  useEffect(() => {
    if (user && !activeTab) {
      if (user.role === 'admin') setActiveTab('admin');
      else if (user.role === 'wali') setActiveTab('dashboard');
      else if (user.role === 'pengampu') setActiveTab('harian');
    }
  }, [user, activeTab]);

  if (!user) return <LoginScreen onLogin={setUser} pengampus={pengampus} students={students} />;

  const handleLogout = async () => {
    try { await signOut(auth); } catch(e) {}
    setUser(null); setActiveTab('');
  };

  const menuItems = [
    ...(user.role === 'admin' ? [{ id: 'admin', label: 'Dashboard Pusat', icon: Users }] : []),
    ...(user.role === 'wali' ? [{ id: 'dashboard', label: 'Dashboard Ananda', icon: BookOpen }] : []),
    ...(user.role === 'pengampu' || user.role === 'admin' ? [{ id: 'harian', label: 'Laporan Harian', icon: Calendar }] : []),
    ...(user.role === 'pengampu' || user.role === 'admin' ? [{ id: 'rekap', label: 'Rekapitulasi', icon: Award }] : []),
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans text-gray-800 relative overflow-hidden">
      <GlassBackground />

      {/* Header Mobile */}
      <div className="md:hidden bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200 fixed top-0 w-full z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            {isMobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
        <span className="font-bold text-sm text-[#26544d] uppercase tracking-widest">Markaz</span>
      </div>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar - Solid Sleek Dark Green */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out flex flex-col md:translate-x-0 md:static md:flex-shrink-0 bg-[#26544d] border-r border-[#1a3a35] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-white/10 p-2 border border-white/10 rounded-xl"><BookOpen className="w-6 h-6 text-[#f9e653]" /></div>
          <div>
            <h1 className="font-black text-lg text-white tracking-tight leading-none">MARKAZ</h1>
            <span className="text-[9px] font-bold text-[#54af48] tracking-widest uppercase">Digiport</span>
          </div>
        </div>
        
        <div className="px-4 py-6 flex-1 overflow-y-auto">
           <div className="bg-[#1f453f] p-3 rounded-2xl mb-6 flex items-center gap-3 border border-white/5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#26544d] font-bold bg-[#f9e653] border border-[#e0cf4a]">{user.name ? user.name.charAt(0) : 'U'}</div>
              <div className="overflow-hidden">
                 <p className="text-[9px] font-bold text-[#54af48] uppercase tracking-wider">{user.role}</p>
                 <p className="text-sm font-bold text-white truncate">{user.name}</p>
              </div>
           </div>

           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 mb-2">Navigasi</p>
           <nav className="space-y-1.5">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium border ${isActive ? 'bg-[#54af48] border-[#46933c] text-white' : 'border-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/50'}`}/> {item.label}
                  </button>
                );
              })}
           </nav>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-300 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-colors text-sm font-medium">
             <LogOut className="w-4 h-4"/> Keluar Aplikasi
          </button>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-hidden pt-[56px] md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 z-10">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'admin' && user.role === 'admin' && <AdminView pengampus={pengampus} students={students} />}
            {activeTab === 'dashboard' && user.role === 'wali' && <WaliDashboardView students={students} records={records} user={user} />}
            {activeTab === 'harian' && <HarianView students={students} records={records} pengampus={pengampus} user={user} />}
            {activeTab === 'rekap' && <RekapView students={students} records={records} pengampus={pengampus} userRole={user.role} recapNotes={recapNotes} />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 11. ERROR BOUNDARY & APP STARTER
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4f7f6] p-6 flex items-center justify-center font-sans">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center border border-gray-200">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-gray-800">Sistem Mengalami Kendala</h1>
            <p className="text-sm text-gray-500 mt-2 mb-6">Silakan segarkan halaman ini.</p>
            <button onClick={() => window.location.reload()} className={`px-5 py-3 rounded-xl font-bold text-sm w-full ${primaryBtn}`}>Muat Ulang</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppStarter() {
  if (topLevelError) { throw topLevelError; }
  
  if (!isConfigValid) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-6 font-sans">
         <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center border border-gray-200">
             <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
             <h1 className="text-lg font-bold text-gray-800 mb-2">Konfigurasi Tertunda</h1>
             <p className="text-sm text-gray-500 mb-6">Sistem sedang memuat kunci keamanan Firebase.</p>
             <button onClick={() => window.location.reload()} className={`px-5 py-3 rounded-xl font-bold text-sm w-full transition-colors ${outlineBtn}`}>Coba Lagi</button>
         </div>
      </div>
    );
  }

  return <MainApp />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppStarter />
    </ErrorBoundary>
  );
}