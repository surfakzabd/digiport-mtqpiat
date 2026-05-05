import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, BookOpen, Calendar, Settings, LogOut, 
  Download, Printer, Plus, Minus, Check, X, ChevronDown, ChevronUp,
  Award, AlertCircle, UserPlus, Trash2, AlertTriangle, Filter, Edit, RotateCcw, Menu, Lock, User, ShieldCheck, Key
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
const getSessionPath = (uid) => `artifacts/${currentAppId}/users/${uid}/session/current`;


// ==========================================
// 2. TEMA DAN DATA REFERENSI (CONSTANTS)
// ==========================================
const theme = {
  primary: '#26544d',
  secondary: '#54af48',
  accent: '#f9e653',
  bg: '#f0f4f3',
  white: '#ffffff',
  danger: '#ef4444',
  warning: '#eab308'
};

const glassCard = "bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";
const glassInput = "bg-white/50 backdrop-blur-sm border border-white/50 focus:bg-white focus:ring-2 focus:ring-[#54af48]/50 transition-all";

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
// BACKGROUND GLASSMORPHISM BLOBS (REUSABLE)
// ==========================================
const GlassBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#54af48] rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
    <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[#26544d] rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
    <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-[#f9e653] rounded-full mix-blend-multiply filter blur-[128px] opacity-15"></div>
  </div>
);

// ==========================================
// 3. KOMPONEN MODAL (REUSABLE)
// ==========================================
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Hapus Data" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="flex min-h-full p-4 sm:p-6 relative z-10">
        <div className="m-auto bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl w-full max-w-sm p-5 md:p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 text-red-600 mb-3 md:mb-4">
            <AlertTriangle className="w-6 h-6 md:w-7 md:h-7" />
            <h3 className="text-lg md:text-xl font-bold text-gray-800">{title}</h3>
          </div>
          <p className="text-sm md:text-base text-gray-600 mb-5 md:mb-6 leading-relaxed">{message}</p>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
            <button onClick={onCancel} className="w-full sm:w-auto px-4 py-2 md:py-2.5 rounded-xl font-semibold text-sm md:text-base text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm">Batal</button>
            <button onClick={onConfirm} className="w-full sm:w-auto px-4 py-2 md:py-2.5 rounded-xl font-semibold text-sm md:text-base bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">{confirmText}</button>
          </div>
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
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="flex min-h-full p-4 sm:p-6 relative z-10">
        <div className="m-auto bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl w-full max-w-[90%] md:max-w-md p-5 md:p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Edit className="w-5 h-5 md:w-6 md:h-6" style={{ color: theme.primary }}/> 
              Edit {isStudent ? 'Data Santri' : 'Data Pengampu'}
            </h3>
            <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1.5 bg-gray-100/50 rounded-full transition-colors"><X className="w-4 h-4 md:w-5 md:h-5"/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Nama Lengkap</label>
              <input required type="text" name="name" value={formData.name || ''} onChange={handleChange} className={`w-full p-2.5 md:p-3 rounded-xl text-sm md:text-base outline-none ${glassInput}`} />
            </div>
            
            {isStudent && (
              <>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Kelas</label>
                    <select name="kelas" value={formData.kelas || '1'} onChange={handleChange} className={`w-full p-2.5 md:p-3 rounded-xl text-sm md:text-base outline-none ${glassInput}`}>
                      <option value="IL">IL</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Semester</label>
                    <select name="semester" value={formData.semester || '1'} onChange={handleChange} className={`w-full p-2.5 md:p-3 rounded-xl text-sm md:text-base outline-none ${glassInput}`}>
                      {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Halaqah</label>
                    <select name="pengampuId" value={formData.pengampuId || ''} onChange={handleChange} className={`w-full p-2.5 md:p-3 rounded-xl text-sm md:text-base outline-none ${glassInput}`}>
                      {pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Target Tercapai</label>
                    <div className="flex">
                      <input type="number" min="0" max="30" name="juzTercapai" value={formData.juzTercapai || 0} onChange={handleChange} className={`w-full p-2.5 md:p-3 border-r-0 rounded-l-xl text-sm md:text-base outline-none ${glassInput}`} />
                      <span className="bg-white/50 backdrop-blur-sm p-2.5 md:p-3 border border-white/50 border-l-0 rounded-r-xl text-[10px] md:text-sm text-gray-500 font-medium">Juz</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Username <span className="lowercase font-medium">(Tetap)</span></label>
              <input type="text" name="username" value={formData.username || ''} disabled className="w-full p-2.5 md:p-3 border border-gray-200 rounded-xl text-sm md:text-base bg-gray-100/50 text-gray-500 cursor-not-allowed outline-none" />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 md:gap-3 justify-end pt-4 md:pt-6 mt-4 md:mt-6 border-t border-gray-200/50">
              <button type="button" onClick={onCancel} className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base text-gray-600 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto shadow-sm border border-gray-200">Batal</button>
              <button type="submit" className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base text-white shadow-lg transition-transform w-full sm:w-auto flex justify-center items-center gap-2 hover:opacity-90" style={{ backgroundColor: theme.primary, shadowColor: `${theme.primary}50` }}>
                <Check className="w-4 h-4 md:w-5 md:h-5"/> Simpan
              </button>
            </div>
          </form>
        </div>
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
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="flex min-h-full p-4 sm:p-6 relative z-10">
        <div className="m-auto bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl w-full max-w-[90%] md:max-w-md p-5 md:p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Key className="w-5 h-5 md:w-6 md:h-6 text-yellow-500"/> Atur Ulang Akses
            </h3>
            <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 md:p-1.5 bg-gray-100/50 rounded-full transition-colors"><X className="w-4 h-4 md:w-5 md:h-5"/></button>
          </div>
          
          <div className="bg-yellow-50/80 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-yellow-200/50 mb-4 md:mb-6 shadow-inner">
             <p className="text-xs md:text-sm text-yellow-800 font-medium leading-relaxed">
               Untuk menjaga privasi, sandi lama tidak dapat dilihat oleh Admin. Silakan buat <b>username baru</b> (atau tambahkan angka) dan sandi yang baru. Data riwayat santri akan tetap tersambung dengan aman.
             </p>
          </div>

          {error && <div className="p-3 bg-red-50/80 backdrop-blur-sm text-red-600 rounded-xl text-xs md:text-sm font-bold border border-red-200/50 flex items-start gap-2 mb-4 shadow-inner"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/> {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Username Baru</label>
              <input required type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className={`w-full p-2.5 md:p-3 rounded-xl text-sm md:text-base outline-none ${glassInput} focus:ring-yellow-400/50`} />
            </div>
            <div>
              <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Sandi Baru (Min. 6 Karakter)</label>
              <input required type="text" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full p-2.5 md:p-3 rounded-xl text-sm md:text-base outline-none ${glassInput} focus:ring-yellow-400/50`} />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 md:gap-3 justify-end pt-4 md:pt-6 mt-4 md:mt-6 border-t border-gray-200/50">
              <button type="button" onClick={onCancel} className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors w-full sm:w-auto shadow-sm">Batal</button>
              <button type="submit" disabled={isProcessing} className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base text-gray-800 bg-[#f9e653] hover:bg-[#e0cf4a] shadow-lg shadow-[#f9e653]/30 transition-transform w-full sm:w-auto flex justify-center items-center gap-2">
                {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div> : <Key className="w-4 h-4 md:w-5 md:h-5"/>} 
                {isProcessing ? 'Memproses...' : 'Terapkan Akses'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. TAMPILAN LOGIN (AUTENTIKASI)
// ==========================================
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
           else throw new Error("Profil tidak ditemukan. Silakan hubungi Admin.");
         } else if (role === 'wali') {
           const user = students.find(s => s.username === username);
           if (user) onLogin({ role: 'wali', name: `Wali ${user.name}`, studentId: user.id });
           else throw new Error("Profil tidak ditemukan. Silakan hubungi Admin.");
         }
       }
    } catch (err) {
       if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') setError('Username atau sandi yang Anda masukkan salah.');
       else setError(err.message || 'Gagal memverifikasi akses masuk.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[#f0f4f3] relative overflow-hidden">
      <GlassBackground />
      <div className={`relative z-10 p-6 md:p-8 rounded-3xl w-full max-w-[90%] sm:max-w-md ${glassCard} border-t-[6px]`} style={{ borderTopColor: theme.primary }}>
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100">
             <BookOpen className="w-8 h-8 md:w-10 md:h-10" style={{ color: theme.primary }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Markaz Digiport</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Sistem Presensi & Mutaba'ah Santri</p>
        </div>

        <div className="flex bg-gray-100/50 backdrop-blur-sm p-1.5 rounded-xl mb-6 md:mb-8 border border-white/50 shadow-inner">
          <button type="button" onClick={() => {setRole('wali'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all ${role === 'wali' ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Wali</button>
          <button type="button" onClick={() => {setRole('pengampu'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all ${role === 'pengampu' ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Pengampu</button>
          <button type="button" onClick={() => {setRole('admin'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all ${role === 'admin' ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Admin</button>
        </div>

        {error && (
           <div className="mb-4 md:mb-5 p-3 md:p-3.5 bg-red-50/80 backdrop-blur-sm text-red-600 rounded-xl text-xs md:text-sm font-bold border border-red-200/50 flex items-start gap-2 shadow-inner">
             <AlertCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5"/> <span className="leading-tight">{error}</span>
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
             <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5 md:mb-2">Username</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none"><User className="w-4 h-4 md:w-5 md:h-5 text-gray-400" /></div>
                <input required type="text" value={username} onChange={e => setUsername(e.target.value.replace(/\s+/g, ''))} className={`w-full pl-9 md:pl-11 pr-4 py-2.5 md:py-3 rounded-xl text-sm md:text-base outline-none ${glassInput}`} style={{ focusRingColor: role === 'pengampu' ? theme.secondary : role === 'admin' ? theme.primary : theme.accent }} placeholder="Masukkan username" />
             </div>
          </div>
          <div>
             <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5 md:mb-2">Kata Sandi</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none"><Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" /></div>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full pl-9 md:pl-11 pr-4 py-2.5 md:py-3 rounded-xl text-sm md:text-base outline-none ${glassInput}`} style={{ focusRingColor: role === 'pengampu' ? theme.secondary : role === 'admin' ? theme.primary : theme.accent }} placeholder="Masukkan kata sandi" />
             </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full mt-3 md:mt-4 p-3 md:p-4 rounded-xl text-white text-sm md:text-base font-bold shadow-xl hover:opacity-90 transition-all flex justify-center items-center" style={{ backgroundColor: role === 'pengampu' ? theme.secondary : role === 'admin' ? theme.primary : '#d4c02c', shadowColor: `${role === 'pengampu' ? theme.secondary : role === 'admin' ? theme.primary : '#d4c02c'}50`, opacity: loading ? 0.7 : 1 }}>
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Masuk'}
          </button>
        </form>
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
       setStatus({ type: 'success', msg: 'Kata sandi berhasil diperbarui! Silakan gunakan untuk login berikutnya.' });
       setNewPassword('');
    } catch (err) {
       if (err.code === 'auth/requires-recent-login') setStatus({ type: 'error', msg: 'Sesi Anda terlalu lama. Demi keamanan, silakan Keluar (Logout) dan Masuk kembali sebelum memperbarui sandi.' });
       else setStatus({ type: 'error', msg: 'Terjadi kendala saat memperbarui sandi. Silakan coba beberapa saat lagi.' });
    }
    setLoading(false);
  };

  return (
     <div className="space-y-4 md:space-y-6 pb-10">
        <div className={`p-4 md:p-6 lg:p-8 rounded-3xl max-w-2xl ${glassCard}`}>
           <h2 className="text-lg md:text-xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
             <Key className="w-6 h-6 md:w-8 md:h-8" style={{ color: theme.primary }}/> Pengaturan Akun
           </h2>
           <p className="text-xs md:text-sm text-gray-500 mt-1.5 md:mt-2">Kelola kata sandi Anda secara berkala demi keamanan akun.</p>
           
           <hr className="my-6 border-gray-200/50" />

           {status.msg && (
              <div className={`p-3 md:p-4 rounded-xl mb-6 text-xs md:text-sm font-bold flex items-start gap-2 shadow-inner ${status.type === 'error' ? 'bg-red-50/80 backdrop-blur-sm text-red-600 border border-red-200/50' : 'bg-green-50/80 backdrop-blur-sm text-green-600 border border-green-200/50'}`}>
                 {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0"/> : <Check className="w-5 h-5 shrink-0"/>}
                 <span className="leading-relaxed">{status.msg}</span>
              </div>
           )}

           <form onSubmit={handleUpdate} className="space-y-4 md:space-y-5">
              <div>
                 <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5 md:mb-2">Kata Sandi Baru</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none"><Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" /></div>
                    <input type="text" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={`w-full pl-9 md:pl-11 pr-4 py-2.5 md:py-3 rounded-xl text-sm md:text-base outline-none ${glassInput}`} placeholder="Masukkan minimal 6 karakter" />
                 </div>
              </div>
              <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 md:py-3 rounded-xl text-white text-sm md:text-base font-bold shadow-lg transition-transform flex justify-center items-center gap-2 hover:opacity-90" style={{ backgroundColor: theme.primary, shadowColor: `${theme.primary}50`, opacity: loading ? 0.7 : 1 }}>
                 {loading ? <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div> : <Key className="w-4 h-4 md:w-5 md:h-5"/>}
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
    } catch (err) { setFormError(err.code === 'auth/email-already-in-use' ? "Username sudah digunakan." : "Gagal mendaftarkan akun ke sistem."); } finally { setIsProcessing(false); }
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
    } catch (err) { setFormError(err.code === 'auth/email-already-in-use' ? "Username sudah digunakan." : "Gagal mendaftarkan akun ke sistem."); } finally { setIsProcessing(false); }
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
      if (err.code === 'auth/email-already-in-use') throw new Error("Username sudah digunakan. Silakan coba kombinasi lain.");
      throw new Error("Sistem belum dapat memproses pengaturan ulang akses.");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-10">
      <ConfirmModal isOpen={deleteTarget !== null} title={`Hapus Data ${deleteTarget?.type === 'pengampu' ? 'Pengampu' : 'Santri'}?`} message={`Apakah Anda yakin ingin menghapus profil "${deleteTarget?.name}" secara permanen?`} onConfirm={executeDelete} onCancel={() => setDeleteTarget(null)} />
      <EditModal isOpen={editTarget !== null} target={editTarget} pengampus={pengampus} onSave={executeEdit} onCancel={() => setEditTarget(null)} />
      <ResetAccessModal isOpen={resetTarget !== null} target={resetTarget} onSave={executeResetAccess} onCancel={() => setResetTarget(null)} />

      <div className={`p-4 md:p-6 lg:p-8 rounded-3xl ${glassCard}`}>
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
           <div className="p-2 md:p-3 lg:p-4 bg-white rounded-xl shadow-md border border-gray-100">
             <UserPlus className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" style={{ color: theme.primary }}/>
           </div>
           <div>
             <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Tambah Pengampu</h2>
             <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Pendaftaran akun secara otomatis terhubung dengan sistem keamanan berenkripsi.</p>
           </div>
        </div>
        
        {formError && <div className="p-3 md:p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-xl mb-4 md:mb-5 text-xs md:text-sm font-medium border border-red-200/50 flex items-center gap-2 shadow-inner"><AlertCircle className="w-4 h-4"/> {formError}</div>}
        
        <form onSubmit={handleAddPengampu} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-end">
          <div className="w-full">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1 md:mb-2">Nama Lengkap</label>
            <input required type="text" value={newPengampu.name} onChange={e=>setNewPengampu({...newPengampu, name: e.target.value})} className={`w-full p-2.5 md:p-3 lg:p-3.5 rounded-xl text-sm md:text-base outline-none ${glassInput}`} placeholder="Misal: Ust. Fulan" />
          </div>
          <div className="w-full">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1 md:mb-2">Username</label>
            <input required type="text" value={newPengampu.username} onChange={e=>setNewPengampu({...newPengampu, username: e.target.value})} className={`w-full p-2.5 md:p-3 lg:p-3.5 rounded-xl text-sm md:text-base outline-none ${glassInput}`} placeholder="tanpaspasi" />
          </div>
          <div className="w-full">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1 md:mb-2">Sandi (Min. 6 Karakter)</label>
            <input required type="text" value={newPengampu.password} onChange={e=>setNewPengampu({...newPengampu, password: e.target.value})} minLength={6} className={`w-full p-2.5 md:p-3 lg:p-3.5 rounded-xl text-sm md:text-base outline-none ${glassInput}`} placeholder="Minimal 6 karakter" />
          </div>
          <button type="submit" disabled={isProcessing} className="w-full p-2.5 md:p-3 lg:p-3.5 rounded-xl text-white font-bold transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg text-sm md:text-base" style={{ backgroundColor: theme.primary, shadowColor: `${theme.primary}50`, opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="w-4 h-4 md:w-5 md:h-5"/>} 
            {isProcessing ? 'Memproses...' : 'Tambahkan'}
          </button>
        </form>
      </div>

      <div className="space-y-3 md:space-y-4 lg:space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-1 md:px-2 gap-3">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
            <Users className="w-5 h-5 md:w-6 md:h-6" style={{ color: theme.primary }}/> Daftar Halaqah & Santri
          </h2>
          <span className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-green-700 bg-green-100/80 backdrop-blur-sm border border-green-200/50 px-3 py-1.5 rounded-lg shadow-sm">
             <ShieldCheck className="w-4 h-4"/> Keamanan Aktif (Sandi Terenkripsi)
          </span>
        </div>
        
        {pengampus.map(pengampu => {
            const isExpanded = expandedPengampuId === pengampu.id;
            const pengampuStudents = students.filter(s => s.pengampuId === pengampu.id);
            return (
              <div key={pengampu.id} className={`rounded-3xl transition-all duration-300 overflow-hidden ${glassCard} ${isExpanded ? 'border-[#54af48]/50 shadow-lg' : 'hover:border-white'}`}>
                <div className="p-3 md:p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer gap-3 md:gap-4" onClick={() => setExpandedPengampuId(isExpanded ? null : pengampu.id)}>
                  <div className="flex items-center gap-3 md:gap-4 flex-1 w-full">
                     <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl lg:text-2xl shadow-lg shrink-0" style={{ backgroundColor: theme.primary }}>{pengampu.name.charAt(0)}</div>
                     <div>
                        <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-800 leading-tight">{pengampu.name}</h3>
                        <div className="flex flex-wrap gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500 mt-1 md:mt-1.5">
                           <span className="bg-white/60 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg border border-white">ID: <span className="font-bold text-gray-700">{pengampu.username}</span></span>
                           <span className="bg-[#54af48]/10 text-[#54af48] px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg border border-[#54af48]/20 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3 h-3"/> Sandi Terenkripsi
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4 w-full sm:w-auto mt-1 md:mt-0 pt-2 sm:pt-0 border-t border-gray-200/50 sm:border-none">
                     <div className="text-xs md:text-sm font-bold text-gray-600 bg-white/60 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl shadow-inner border border-white">{pengampuStudents.length} Santri</div>
                     <div className="flex items-center gap-1 md:gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); setResetTarget({ type: 'pengampu', data: pengampu }); }} className="text-[#f9e653] p-1.5 md:p-2 lg:p-2.5 hover:bg-[#f9e653]/10 rounded-full transition-colors drop-shadow-sm" title="Atur Ulang Akses Sandi"><Key className="w-4 h-4 md:w-5 md:h-5"/></button>
                        <button onClick={(e) => { e.stopPropagation(); setEditTarget({ type: 'pengampu', data: pengampu }); }} className="text-[#54af48] p-1.5 md:p-2 lg:p-2.5 hover:bg-[#54af48]/10 rounded-full transition-colors drop-shadow-sm" title="Edit Profil"><Edit className="w-4 h-4 md:w-5 md:h-5"/></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'pengampu', id: pengampu.id, name: pengampu.name }); }} className="text-red-400 p-1.5 md:p-2 lg:p-2.5 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors drop-shadow-sm" title="Hapus Data"><Trash2 className="w-4 h-4 md:w-5 md:h-5"/></button>
                        <div className={`p-1 md:p-2 rounded-full transition-colors ml-1 md:ml-2 bg-white/50 shadow-sm border border-white ${isExpanded ? 'text-gray-700' : 'text-gray-400'}`}>{isExpanded ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />}</div>
                     </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-white/40 bg-white/30 p-3 md:p-5 lg:p-6 animate-in slide-in-from-top-4 duration-200">
                    <form onSubmit={(e) => handleAddStudent(e, pengampu.id)} className="bg-white/60 backdrop-blur-md p-3 md:p-4 lg:p-5 rounded-2xl shadow-sm border border-white mb-4 md:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 items-end relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: theme.secondary }}></div>
                      <div className="col-span-1 sm:col-span-2 lg:col-span-2"><label className="text-[10px] md:text-xs uppercase font-bold text-gray-500 mb-1 md:mb-1.5 block">Nama Santri Baru</label><input required type="text" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name: e.target.value})} className={`w-full p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-xs md:text-sm outline-none ${glassInput}`} placeholder="Nama Lengkap" /></div>
                      <div className="col-span-1"><label className="text-[10px] md:text-xs uppercase font-bold text-gray-500 mb-1 md:mb-1.5 block">Kls/Smt</label><div className="flex gap-1.5 md:gap-2"><select value={newStudent.kelas} onChange={e=>setNewStudent({...newStudent, kelas: e.target.value})} className={`w-1/2 p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-xs md:text-sm outline-none ${glassInput}`}><option value="IL">IL</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select><select value={newStudent.semester} onChange={e=>setNewStudent({...newStudent, semester: e.target.value})} className={`w-1/2 p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-xs md:text-sm outline-none ${glassInput}`}>{[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
                      <div className="col-span-1"><label className="text-[10px] md:text-xs uppercase font-bold text-gray-500 mb-1 md:mb-1.5 block">Tercapai</label><div className="flex items-center"><input type="number" min="0" max="30" value={newStudent.juzTercapai} onChange={e=>setNewStudent({...newStudent, juzTercapai: e.target.value})} className={`w-full p-2 md:p-2.5 lg:p-3 border-r-0 rounded-l-lg md:rounded-l-xl text-xs md:text-sm outline-none ${glassInput}`} /><span className="bg-white/50 p-2 md:p-2.5 lg:p-3 border border-white/50 border-l-0 rounded-r-lg md:rounded-r-xl text-[10px] md:text-xs text-gray-500 font-medium">Juz</span></div></div>
                      <div className="col-span-1"><label className="text-[10px] md:text-xs uppercase font-bold text-gray-500 mb-1 md:mb-1.5 block">Username</label><input required type="text" value={newStudent.username} onChange={e=>setNewStudent({...newStudent, username: e.target.value})} className={`w-full p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-xs md:text-sm outline-none ${glassInput}`} placeholder="tanpaspasi" /></div>
                      <div className="col-span-1"><label className="text-[10px] md:text-xs uppercase font-bold text-gray-500 mb-1 md:mb-1.5 block">Sandi Akses</label><div className="flex gap-1.5 md:gap-2"><input required type="text" value={newStudent.password} minLength={6} onChange={e=>setNewStudent({...newStudent, password: e.target.value})} className={`w-full p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-xs md:text-sm outline-none ${glassInput}`} placeholder="Minimal 6" /><button type="submit" disabled={isProcessing} className="p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center shrink-0" style={{ backgroundColor: theme.secondary, opacity: isProcessing ? 0.7 : 1 }}>{isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="w-4 h-4 md:w-5 md:h-5"/>}</button></div></div>
                    </form>
                    
                    <div className="overflow-x-auto bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-sm w-full">
                       <table className="w-full text-left whitespace-nowrap min-w-[600px] md:min-w-[700px]">
                          <thead className="bg-white/50 text-gray-500 border-b border-white/60 text-[10px] md:text-xs uppercase tracking-wide">
                             <tr>
                               <th className="p-3 md:p-4 lg:p-5 font-bold">Nama Santri</th>
                               <th className="p-3 md:p-4 lg:p-5 font-bold">Kls/Smt</th>
                               <th className="p-3 md:p-4 lg:p-5 font-bold">Juz</th>
                               <th className="p-3 md:p-4 lg:p-5 font-bold">Status Keamanan</th>
                               <th className="p-3 md:p-4 lg:p-5 font-bold text-center">Tindakan</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/40 text-xs md:text-sm">
                             {pengampuStudents.length === 0 ? <tr><td colSpan="5" className="p-4 md:p-6 text-center text-gray-400 italic">Belum ada data santri yang ditambahkan.</td></tr> : pengampuStudents.map(s => (
                                <tr key={s.id} className="hover:bg-white/50 transition-colors">
                                   <td className="p-3 md:p-4 lg:p-5 font-bold text-gray-800">{s.name}</td>
                                   <td className="p-3 md:p-4 lg:p-5 text-gray-600 font-medium">{s.kelas} / {s.semester}</td>
                                   <td className="p-3 md:p-4 lg:p-5 font-bold" style={{ color: theme.secondary }}>{s.juzTercapai} Juz</td>
                                   <td className="p-3 md:p-4 lg:p-5">
                                     <div className="flex gap-1.5 md:gap-2">
                                       <span className="bg-white/60 px-2 md:px-2.5 py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold text-gray-600 border border-white">{s.username}</span>
                                       <span className="bg-[#54af48]/10 text-[#54af48] px-2 md:px-2.5 py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold border border-[#54af48]/20 flex items-center gap-1">
                                          <ShieldCheck className="w-3.5 h-3.5"/> Sandi Terenkripsi
                                       </span>
                                     </div>
                                   </td>
                                   <td className="p-3 md:p-4 lg:p-5 text-center">
                                      <button onClick={() => setResetTarget({ type: 'student', data: s })} className="text-[#eab308] hover:text-[#ca9a04] p-1.5 md:p-2 hover:bg-yellow-50 rounded-full transition-colors mr-1 drop-shadow-sm" title="Atur Ulang Akses Sandi"><Key className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5"/></button>
                                      <button onClick={() => setEditTarget({ type: 'student', data: s })} className="text-[#54af48] hover:text-[#46933c] p-1.5 md:p-2 hover:bg-green-50 rounded-full transition-colors mr-1 drop-shadow-sm" title="Edit Profil"><Edit className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5"/></button>
                                      <button onClick={() => setDeleteTarget({ type: 'student', id: s.id, name: s.name })} className="text-red-400 hover:text-red-600 p-1.5 md:p-2 hover:bg-red-50 rounded-full transition-colors drop-shadow-sm" title="Hapus Data"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5"/></button>
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
    <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-10">
      <ConfirmModal isOpen={recordToDelete !== null} title="Ulangi Laporan?" message="Tindakan ini akan mengosongkan kembali form setoran hari ini untuk santri tersebut." confirmText="Kosongkan Form" onConfirm={executeDeleteRecord} onCancel={() => setRecordToDelete(null)} />
      
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 p-4 md:p-6 lg:p-8 rounded-3xl ${glassCard}`}>
        <div>
          <h2 className="text-lg md:text-xl lg:text-3xl font-bold text-gray-800">Laporan Harian</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Isi presensi, ziyadah, dan muraja'ah santri Anda.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full sm:w-auto">
          {user.role === 'admin' && (
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/60 backdrop-blur-sm p-2 md:p-2.5 rounded-xl border border-white/50 w-full sm:w-auto shadow-sm">
              <Filter className="text-gray-400 ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
              <select value={selectedPengampuId} onChange={(e) => setSelectedPengampuId(e.target.value)} className="border-none bg-transparent outline-none text-xs md:text-sm font-bold text-gray-600 p-1 cursor-pointer w-full"><option value="semua">Semua Halaqah</option>{pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
          )}
          <div className="flex items-center gap-1.5 md:gap-2 bg-white/60 backdrop-blur-sm p-2 md:p-2.5 rounded-xl border border-white/50 w-full sm:w-auto shadow-sm">
             <label className="text-xs md:text-sm font-bold text-gray-600 px-1 md:px-2">Tanggal Laporan:</label>
             <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`border-none bg-white rounded-lg p-1.5 md:p-2 text-xs md:text-sm outline-none font-medium shadow-sm w-full ${glassInput}`}/>
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6 lg:space-y-8">
        {groupedStudents.length === 0 ? (
          <div className={`text-center p-6 md:p-8 rounded-3xl border border-dashed border-gray-300 text-gray-400 font-medium text-sm md:text-base ${glassCard}`}>Tidak ada data santri pada filter yang Anda pilih.</div>
        ) : (
          groupedStudents.map(group => (
            <div key={group.pengampu.id} className="space-y-3 md:space-y-4">
              {user.role === 'admin' && selectedPengampuId === 'semua' && (
                <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4 pb-1 md:pb-2">
                   <div className="h-px bg-gray-300 flex-1"></div>
                   <span className="font-bold text-gray-600 uppercase text-[10px] md:text-xs px-3 md:px-4 py-1 md:py-1.5 bg-white/70 backdrop-blur-md rounded-full border border-white shadow-sm flex items-center gap-1.5 md:gap-2"><BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: theme.primary }}/> Halaqah {group.pengampu.name}</span>
                   <div className="h-px bg-gray-300 flex-1"></div>
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
                  <div key={student.id} className={`rounded-3xl transition-all duration-300 ${glassCard} ${isExpanded ? 'border-[#54af48]/50 shadow-lg ring-1 ring-[#54af48]/20' : 'hover:border-white'}`}>
                    <div className={`p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 ${!isExpanded ? 'hover:bg-white/40 cursor-pointer' : ''}`} onClick={() => !todayRecord && setExpandedStudent(isExpanded ? null : student.id)}>
                      
                      <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto" onClick={(e) => { if(todayRecord) { e.stopPropagation(); setExpandedStudent(isExpanded ? null : student.id); } }}>
                        <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl lg:text-2xl shadow-lg shrink-0" style={{ backgroundColor: theme.primary }}>{student.name ? student.name.charAt(0) : '?'}</div>
                        <div>
                           <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-800">{student.name || 'Unknown'}</h3>
                           <p className="text-[10px] md:text-xs font-medium text-gray-500 mt-0.5 md:mt-1">Kelas {student.kelas} • Smt {student.semester}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3 mt-2 sm:mt-0 w-full sm:w-auto justify-end flex-1">
                        {todayRecord ? (
                          <div className="flex items-center gap-2 md:gap-3 w-full justify-between sm:justify-end">
                            <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
                              <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide mb-1 md:mb-1.5 shadow-sm border ${todayRecord.presensi === 'Hadir' ? 'bg-[#54af48]/10 text-[#54af48] border-[#54af48]/20' : todayRecord.presensi === 'Alpha' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-[#f9e653]/20 text-yellow-700 border-[#f9e653]/40'}`}>{todayRecord.presensi}</span>
                              {todayRecord.presensi === 'Hadir' && (
                                <div className="text-[10px] md:text-xs font-medium text-gray-600 flex flex-col gap-0.5 md:gap-1">
                                  {todayRecord.ziyadah && (<div><span className="font-bold text-[#54af48]">Ziyadah:</span> {formatZiyadahSurahSafe(todayRecord.ziyadah)} <span className="font-bold text-[#54af48] ml-1">[{todayRecord.ziyadah.finalScore}]</span></div>)}
                                  {todayRecord.murajaah && (<div><span className="font-bold text-yellow-600">Muraja'ah:</span> Juz {todayRecord.murajaah.fromJuz === todayRecord.murajaah.toJuz ? todayRecord.murajaah.fromJuz : `${todayRecord.murajaah.fromJuz}-${todayRecord.murajaah.toJuz}`} <span className="font-bold text-yellow-700 ml-1">[{todayRecord.murajaah.finalScore}]</span></div>)}
                                </div>
                              )}
                              {todayRecord.presensi !== 'Hadir' && (<div className="text-[10px] md:text-xs text-gray-500 truncate w-32 md:w-48"><span className="font-bold">Ket:</span> {todayRecord.keterangan || '-'}</div>)}
                            </div>
                            <div className="flex sm:flex-col gap-1 md:gap-1.5 border-l-0 sm:border-l border-gray-200/50 pl-0 sm:pl-2 md:pl-3 shrink-0">
                               <button onClick={(e) => { e.stopPropagation(); setExpandedStudent(isExpanded ? null : student.id); }} className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors drop-shadow-sm ${isExpanded ? 'bg-blue-100 text-blue-700' : 'text-gray-500 bg-white/60 hover:bg-white border border-white hover:text-blue-600'}`} title="Ubah Laporan"><Edit className="w-4 h-4 md:w-5 md:h-5"/></button>
                               <button onClick={(e) => { e.stopPropagation(); setRecordToDelete(todayRecord.id); }} className="p-1.5 md:p-2 rounded-lg md:rounded-xl text-gray-500 bg-white/60 hover:bg-white border border-white hover:text-red-600 transition-colors drop-shadow-sm" title="Ulangi (Kosongkan)"><RotateCcw className="w-4 h-4 md:w-5 md:h-5"/></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full gap-3 md:gap-4">
                             <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold bg-white/50 border border-white text-gray-500 shadow-sm">Menunggu Laporan</span>
                             <div className={`p-1.5 md:p-2 rounded-full transition-colors bg-white/50 shadow-sm border border-white ${isExpanded ? 'bg-white/80' : ''}`}>{isExpanded ? <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-gray-600" /> : <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {isExpanded && (<div className="p-3 md:p-4 lg:p-8 border-t border-white/50 bg-white/30 animate-in slide-in-from-top-2"><StudentDailyForm student={student} date={selectedDate} existingRecord={todayRecord} lastZiyadah={lastZiyadah} lastMurajaah={lastMurajaah} onSaveSuccess={() => setExpandedStudent(null)} /></div>)}
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
       green: { dot: 'bg-green-500', badge: 'bg-[#54af48]/20 text-[#54af48] border border-[#54af48]/30', text: 'text-[#54af48]' }, 
       yellow: { dot: 'bg-[#f9e653]', badge: 'bg-[#f9e653]/20 text-yellow-700 border border-[#f9e653]/40', text: 'text-yellow-700' }, 
       red: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 border border-red-200', text: 'text-red-700' } 
     };
     const t = themes[colorTheme];
     return (
        <div className="flex items-center justify-between py-2 md:py-2.5 border-b border-white/40 last:border-0">
           <div className="flex items-center gap-2 md:gap-3">
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${t.dot}`}></div>
              <span className="text-[10px] md:text-sm font-bold text-gray-700">{label}</span>
              <span className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md shadow-sm ${t.badge}`}>{penalty}</span>
           </div>
           <div className="flex items-center bg-white/70 backdrop-blur-md rounded-lg md:rounded-xl border border-white overflow-hidden h-7 md:h-9 shadow-sm">
              <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="px-2 md:px-3 h-full hover:bg-white text-gray-500 transition-colors"><Minus className="w-3 h-3 md:w-4 md:h-4"/></button>
              <div className={`w-8 md:w-10 text-center text-xs md:text-sm font-bold bg-white/40 h-full flex items-center justify-center border-x border-white/50 ${t.text}`}>{value}</div>
              <button type="button" onClick={() => onChange(value + 1)} className="px-2 md:px-3 h-full hover:bg-white text-gray-500 transition-colors"><Plus className="w-3 h-3 md:w-4 md:h-4"/></button>
           </div>
        </div>
     );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {errorMsg && <div className="p-3 md:p-4 bg-red-50 text-red-700 rounded-xl text-xs md:text-sm font-bold border border-red-100 flex items-center gap-2 md:gap-3 shadow-inner"><AlertCircle className="w-4 h-4 md:w-5 md:h-5"/> {errorMsg}</div>}
      
      <div className={`p-4 md:p-5 lg:p-6 rounded-2xl border border-white shadow-sm bg-white/50 backdrop-blur-sm`}>
        <label className="block text-xs md:text-sm font-bold text-gray-800 mb-2 md:mb-4 uppercase tracking-wider">Status Presensi</label>
        <div className="grid grid-cols-3 gap-1.5 md:gap-3">
          {['Hadir', 'Izin/Sakit', 'Alpha'].map(status => (
            <button key={status} onClick={() => {setPresensi(status); setErrorMsg('');}} className={`w-full py-2.5 md:py-3.5 px-1 rounded-lg md:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold border-2 transition-all shadow-sm ${presensi === status ? 'text-white scale-[1.02] md:scale-105 border-transparent' : 'border-white bg-white/60 text-gray-500 hover:bg-white'}`} style={presensi === status ? { backgroundColor: status === 'Hadir' ? theme.secondary : status === 'Alpha' ? theme.danger : theme.warning, color: '#fff' } : {}}>{status}</button>
          ))}
        </div>
      </div>

      {presensi === 'Hadir' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <div className={`p-4 md:p-5 lg:p-6 rounded-2xl border shadow-sm flex flex-col transition-all ${!isZiyadahActive ? 'border-white/50 bg-white/30' : 'border-white bg-white/60 backdrop-blur-sm'}`}>
             <div className="flex justify-between items-center mb-3 md:mb-5">
                <h4 className={`font-bold text-sm md:text-base lg:text-lg flex items-center gap-2 md:gap-3 ${!isZiyadahActive ? 'text-gray-400' : 'text-gray-800'}`}><div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl ${!isZiyadahActive ? 'bg-white/50' : 'bg-[#54af48]/10 border border-[#54af48]/20'}`}><BookOpen className="w-4 h-4 md:w-5 md:h-5" style={{ color: !isZiyadahActive ? '#9ca3af' : theme.primary }}/></div> Setoran Ziyadah</h4>
                <button type="button" onClick={() => setIsZiyadahActive(!isZiyadahActive)} className={`w-10 h-5 md:w-12 md:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner border border-white/50 ${isZiyadahActive ? 'bg-[#54af48]' : 'bg-gray-300'}`}><div className={`bg-white w-3 h-3 md:w-4 md:h-4 rounded-full shadow transform transition-transform ${isZiyadahActive ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`}></div></button>
             </div>
             {isZiyadahActive ? (
                <div className="space-y-3 md:space-y-4 flex-1 flex flex-col animate-in slide-in-from-top-2">
                   <div className="space-y-2 md:space-y-3 bg-white/40 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white shadow-inner">
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                         <div><label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 md:mb-1.5">Dari Surat</label><select value={ziyadah.fromSurah} onChange={(e) => setZiyadah({...ziyadah, fromSurah: parseInt(e.target.value), fromAyah: 1})} className={`w-full p-2 md:p-2.5 rounded-lg text-xs md:text-sm outline-none ${glassInput}`}>{QURAN_SURAHS.map((s, i) => <option key={i} value={i}>{s[0]}</option>)}</select></div>
                         <div><label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 md:mb-1.5">Ayat</label><select value={ziyadah.fromAyah} onChange={(e) => setZiyadah({...ziyadah, fromAyah: parseInt(e.target.value)})} className={`w-full p-2 md:p-2.5 rounded-lg text-xs md:text-sm outline-none ${glassInput}`}>{Array.from({length: getAyahCount(ziyadah.fromSurah)}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                         <div><label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 md:mb-1.5">Sampai Surat</label><select value={ziyadah.toSurah} onChange={(e) => setZiyadah({...ziyadah, toSurah: parseInt(e.target.value), toAyah: 1})} className={`w-full p-2 md:p-2.5 rounded-lg text-xs md:text-sm outline-none ${glassInput}`}>{QURAN_SURAHS.map((s, i) => <option key={i} value={i}>{s[0]}</option>)}</select></div>
                         <div><label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 md:mb-1.5">Ayat</label><select value={ziyadah.toAyah} onChange={(e) => setZiyadah({...ziyadah, toAyah: parseInt(e.target.value)})} className={`w-full p-2 md:p-2.5 rounded-lg text-xs md:text-sm outline-none ${glassInput}`}>{Array.from({length: getAyahCount(ziyadah.toSurah)}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
                      </div>
                   </div>
                   <div className="flex-1">
                      <div className="bg-white/40 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-4 border py-1.5 md:py-2 border-white shadow-sm">
                         <ErrorRow label="Kesalahan Tajwid" penalty="-1" value={ziyadah.tajwid} onChange={(v) => setZiyadah({...ziyadah, tajwid: v})} colorTheme="green" />
                         <ErrorRow label="Lupa / Tersendat" penalty="-1" value={ziyadah.lupa} onChange={(v) => setZiyadah({...ziyadah, lupa: v})} colorTheme="yellow" />
                         <ErrorRow label="Lupa (Dibimbing)" penalty="-2" value={ziyadah.lupaBimbingan} onChange={(v) => setZiyadah({...ziyadah, lupaBimbingan: v})} colorTheme="red" />
                      </div>
                   </div>
                   <div className="mt-3 md:mt-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 flex items-center justify-between bg-white/80 backdrop-blur-md shadow-md transition-all" style={{ borderColor: theme.primary }}>
                      <div><p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1">Skor Akhir</p><div className="flex items-baseline gap-1.5 md:gap-2"><span className="text-2xl md:text-3xl lg:text-4xl font-black" style={{ color: theme.primary }}>{ziyadah.manualScore !== '' ? ziyadah.manualScore : calculateScore(ziyadah.tajwid, ziyadah.lupa, ziyadah.lupaBimbingan)}</span></div></div>
                      <div className="flex flex-col items-end"><label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 md:mb-2">Koreksi Manual</label><input type="number" value={ziyadah.manualScore} onChange={(e) => setZiyadah({...ziyadah, manualScore: e.target.value})} placeholder="Otomatis" className={`w-16 md:w-20 px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base font-bold text-center rounded-lg md:rounded-xl ${glassInput}`} style={{ focusRingColor: theme.secondary, focusRingWidth: '2px' }} /></div>
                   </div>
                </div>
             ) : (<div className="flex-1 flex items-center justify-center py-6 md:py-8"><p className="text-xs md:text-sm text-gray-400 italic font-medium">Borang Ziyadah ditutup sementara.</p></div>)}
          </div>
          
          <div className={`p-4 md:p-5 lg:p-6 rounded-2xl border shadow-sm flex flex-col transition-all ${!isMurajaahActive ? 'border-white/50 bg-white/30' : 'border-white bg-white/60 backdrop-blur-sm'}`}>
             <div className="flex justify-between items-center mb-3 md:mb-5">
                <h4 className={`font-bold text-sm md:text-base lg:text-lg flex items-center gap-2 md:gap-3 ${!isMurajaahActive ? 'text-gray-400' : 'text-gray-800'}`}><div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl ${!isMurajaahActive ? 'bg-white/50' : 'bg-[#f9e653]/20 border border-[#f9e653]/30'}`}><RotateCcw className="w-4 h-4 md:w-5 h-5" style={{ color: !isMurajaahActive ? '#9ca3af' : theme.secondary }}/></div> Setoran Muraja'ah</h4>
                <button type="button" onClick={() => setIsMurajaahActive(!isMurajaahActive)} className={`w-10 h-5 md:w-12 md:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner border border-white/50 ${isMurajaahActive ? 'bg-[#f9e653]' : 'bg-gray-300'}`}><div className={`bg-white w-3 h-3 md:w-4 md:h-4 rounded-full shadow transform transition-transform ${isMurajaahActive ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`}></div></button>
             </div>
             {isMurajaahActive ? (
                <div className="space-y-3 md:space-y-4 flex-1 flex flex-col animate-in slide-in-from-top-2">
                   <div className="grid grid-cols-2 gap-2 md:gap-3 bg-white/40 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white shadow-inner">
                      <div><label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 md:mb-1.5">Dari Juz</label><select value={murajaah.fromJuz} onChange={(e) => setMurajaah({...murajaah, fromJuz: parseInt(e.target.value)})} className={`w-full p-2 md:p-2.5 rounded-lg text-xs md:text-sm outline-none ${glassInput}`}>{JUZ_LIST.map(j => <option key={j} value={j}>Juz {j}</option>)}</select></div>
                      <div><label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 md:mb-1.5">Sampai Juz</label><select value={murajaah.toJuz} onChange={(e) => setMurajaah({...murajaah, toJuz: parseInt(e.target.value)})} className={`w-full p-2 md:p-2.5 rounded-lg text-xs md:text-sm outline-none ${glassInput}`}>{JUZ_LIST.map(j => <option key={j} value={j}>Juz {j}</option>)}</select></div>
                   </div>
                   <div className="flex-1">
                      <div className="bg-white/40 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-4 border py-1.5 md:py-2 border-white shadow-sm">
                         <ErrorRow label="Kesalahan Tajwid" penalty="-1" value={murajaah.tajwid} onChange={(v) => setMurajaah({...murajaah, tajwid: v})} colorTheme="green" />
                         <ErrorRow label="Lupa / Tersendat" penalty="-1" value={murajaah.lupa} onChange={(v) => setMurajaah({...murajaah, lupa: v})} colorTheme="yellow" />
                         <ErrorRow label="Lupa (Dibimbing)" penalty="-2" value={murajaah.lupaBimbingan} onChange={(v) => setMurajaah({...murajaah, lupaBimbingan: v})} colorTheme="red" />
                      </div>
                   </div>
                   <div className="mt-3 md:mt-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 flex items-center justify-between bg-white/80 backdrop-blur-md shadow-md transition-all" style={{ borderColor: theme.secondary }}>
                      <div><p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1">Skor Akhir</p><div className="flex items-baseline gap-1.5 md:gap-2"><span className="text-2xl md:text-3xl lg:text-4xl font-black" style={{ color: theme.secondary }}>{murajaah.manualScore !== '' ? murajaah.manualScore : calculateScore(murajaah.tajwid, murajaah.lupa, murajaah.lupaBimbingan)}</span></div></div>
                      <div className="flex flex-col items-end"><label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 md:mb-2">Koreksi Manual</label><input type="number" value={murajaah.manualScore} onChange={(e) => setMurajaah({...murajaah, manualScore: e.target.value})} placeholder="Otomatis" className={`w-16 md:w-20 px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base font-bold text-center rounded-lg md:rounded-xl outline-none ${glassInput}`} style={{ focusRingColor: theme.primary, focusRingWidth: '2px' }} /></div>
                   </div>
                </div>
             ) : (<div className="flex-1 flex items-center justify-center py-6 md:py-8"><p className="text-xs md:text-sm text-gray-400 italic font-medium">Borang Muraja'ah ditutup sementara.</p></div>)}
          </div>
        </div>
      )}

      {presensi === 'Izin/Sakit' && (
        <div className="p-4 md:p-5 lg:p-6 rounded-2xl border shadow-sm flex flex-col transition-all border-white bg-white/60 backdrop-blur-sm animate-in slide-in-from-top-2">
           <div className="flex justify-between items-center mb-3 md:mb-5">
              <h4 className="font-bold text-sm md:text-base lg:text-lg flex items-center gap-2 md:gap-3 text-gray-800">
                 <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-[#f9e653]/20 border border-[#f9e653]/30">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600"/>
                 </div> 
                 Keterangan Izin / Sakit
              </h4>
           </div>
           <div className="space-y-3 md:space-y-4 flex-1 flex flex-col">
              <div className="bg-white/40 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white shadow-inner">
                 <textarea 
                    value={keterangan} 
                    onChange={(e) => setKeterangan(e.target.value)} 
                    placeholder="Contoh: Ananda sedang sakit demam dan membutuhkan istirahat..." 
                    className={`w-full p-3 md:p-4 text-xs md:text-sm rounded-lg md:rounded-xl resize-none h-24 md:h-28 font-medium text-gray-700 ${glassInput}`} 
                 />
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-end pt-3 md:pt-4 relative z-10">
        <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base text-white font-bold shadow-lg transition-transform hover:scale-[1.02]" style={{ backgroundColor: theme.primary, shadowColor: `${theme.primary}60` }}>
          {saving ? <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white"></div> : <Check className="w-5 h-5 md:w-6 md:h-6"/>}
          {saving ? 'Menyimpan...' : 'Simpan Laporan Harian'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 8. VIEW: REKAPITULASI (MANDIRI)
// ==========================================
const EditableSelectCell = ({ value, options, onSave }) => (
  <select value={value || ''} onChange={(e) => onSave(e.target.value)} className={`w-20 md:w-24 p-1.5 md:p-2 rounded-md md:rounded-lg text-xs md:text-sm font-semibold text-gray-700 outline-none ${glassInput}`}>
    <option value="">- SP -</option>{options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);
const EditableInputCell = ({ value, onSave, placeholder }) => { 
  const [val, setVal] = useState(value || ''); 
  useEffect(() => setVal(value || ''), [value]); 
  return (
    <input type="text" value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onSave(val)} className={`w-24 md:w-32 p-1.5 md:p-2 rounded-md md:rounded-lg text-xs md:text-sm text-gray-700 outline-none ${glassInput}`} placeholder={placeholder} />
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
    <div className="space-y-4 md:space-y-6 pb-10 relative z-10">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 p-4 md:p-6 lg:p-8 rounded-3xl print:hidden ${glassCard}`}>
        <div>
           <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Rekapitulasi Bulanan</h2>
           <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Pilih periode bulan dan halaqah untuk melihat hasil evaluasi.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto">
          {userRole === 'admin' && (
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/60 p-2 md:p-2.5 rounded-xl border border-white w-full sm:w-auto shadow-sm">
              <Filter className="text-gray-400 w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 shrink-0" />
              <select value={selectedPengampuId} onChange={(e) => setSelectedPengampuId(e.target.value)} className="border-none bg-transparent outline-none text-xs md:text-sm font-bold text-gray-600 p-1 w-full sm:w-40 md:w-48 cursor-pointer"><option value="semua">Semua Halaqah</option>{pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
          )}
          <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
             <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={`w-full sm:w-auto rounded-xl p-2 md:p-2.5 px-3 md:px-4 text-xs md:text-sm outline-none font-bold text-gray-700 min-w-[120px] shadow-sm ${glassInput}`} />
             <div className="flex gap-2 w-auto">
                 <button onClick={handleDownloadExcel} className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-[#54af48] text-white text-xs md:text-sm font-bold rounded-xl shadow-lg hover:bg-[#46933c] transition-colors"><Download className="w-4 h-4 md:w-5 md:h-5"/> <span className="hidden sm:inline">Unduh Excel</span></button>
                 <button onClick={() => window.print()} className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-gray-800 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg hover:bg-gray-700 transition-colors"><Printer className="w-4 h-4 md:w-5 md:h-5"/> <span className="hidden sm:inline">Cetak Rekap</span></button>
             </div>
          </div>
        </div>
      </div>
      
      <div className={`${glassCard} rounded-3xl overflow-hidden`}>
        <div className="overflow-x-auto w-full pb-4">
          <table className="w-full text-left whitespace-nowrap min-w-[900px] md:min-w-[1000px]">
            <thead className="text-white bg-[#26544d]">
              <tr className="text-[10px] md:text-xs lg:text-sm">
                <th className="p-2 md:p-3 lg:p-4 font-bold">Nama Santri</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold">Kls/Smt</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold">Kehadiran</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold border-l border-white/20">Target %</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold border-l border-white/20">Ziyadah (Awal - Akhir)</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold">Rata Z</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold border-l border-white/20">Muraja'ah (Awal - Akhir)</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold">Rata M</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold border-l border-white/20">S.P</th>
                <th className="p-2 md:p-3 lg:p-4 font-bold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 text-xs md:text-sm bg-white/40 backdrop-blur-sm">
              {groupedRecap.length === 0 ? (
                <tr><td colSpan="10" className="p-6 md:p-10 text-center text-gray-500 font-medium italic bg-white/50">Data rekapitulasi belum tersedia.</td></tr>
              ) : (
                groupedRecap.map(group => (
                  <React.Fragment key={group.pengampu.id}>
                    {userRole === 'admin' && selectedPengampuId === 'semua' && (
                      <tr className="bg-white/80 border-b border-white">
                        <td colSpan="10" className="p-2.5 md:p-3 px-3 md:px-4 font-bold text-[#26544d] text-[10px] md:text-xs uppercase tracking-widest"><Users className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1 md:mr-2 text-[#54af48]"/> Halaqah {group.pengampu.name}</td>
                      </tr>
                    )}
                    {group.data.map(row => {
                        const sn = recapNotes.find(n => n.studentId === row.id && n.month === selectedMonth) || {};
                        return (
                          <tr key={row.id} className="hover:bg-white/70 transition-colors">
                            <td className="p-2 md:p-3 lg:p-4 font-bold text-gray-800">{row.name || 'Unknown'}</td>
                            <td className="p-2 md:p-3 lg:p-4 text-gray-600 font-medium">{row.kelas} / {row.semester}</td>
                            <td className="p-2 md:p-3 lg:p-4"><span className="bg-[#54af48]/10 text-[#54af48] px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg font-bold border border-[#54af48]/20">{row.kehadiran}</span> <span className="font-medium text-gray-500 ml-1">/ {row.totalHari}</span></td>
                            <td className="p-2 md:p-3 lg:p-4 border-l border-white/50">
                               <div className="flex items-center gap-2 md:gap-3 w-24 md:w-28">
                                  <div className="w-full h-1.5 md:h-2 bg-white/60 rounded-full overflow-hidden shadow-inner border border-gray-200/50"><div className="h-full" style={{ width: `${row.persentase}%`, backgroundColor: row.persentase >= 100 ? theme.secondary : theme.accent }}></div></div>
                                  <span className="font-black text-[10px] md:text-xs">{row.persentase}%</span>
                               </div>
                            </td>
                            <td className="p-2 md:p-3 lg:p-4 text-[10px] md:text-xs border-l border-white/50">
                              <div className="flex flex-col gap-1 md:gap-1.5">
                                <span className="bg-white/60 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md shadow-sm border border-white"><span className="font-bold text-gray-400 mr-1 md:mr-2">Awl:</span> {row.zStart ? formatZiyadahSurahSafe(row.zStart) : '-'}</span>
                                <span className="bg-white/60 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md shadow-sm border border-white"><span className="font-bold text-gray-400 mr-1 md:mr-2">Akh:</span> {row.zEnd ? formatZiyadahSurahSafe(row.zEnd) : '-'}</span>
                              </div>
                            </td>
                            <td className="p-2 md:p-3 lg:p-4 font-black text-base md:text-lg" style={{ color: theme.primary }}>{row.avgZiyadah}</td>
                            <td className="p-2 md:p-3 lg:p-4 text-[10px] md:text-xs border-l border-white/50">
                              <div className="flex flex-col gap-1 md:gap-1.5">
                                <span className="bg-white/60 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md shadow-sm border border-white"><span className="font-bold text-gray-400 mr-1 md:mr-2">Awl:</span> {row.mStart ? `Juz ${row.mStart.fromJuz}` : '-'}</span>
                                <span className="bg-white/60 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md shadow-sm border border-white"><span className="font-bold text-gray-400 mr-1 md:mr-2">Akh:</span> {row.mEnd ? `Juz ${row.mEnd.toJuz}` : '-'}</span>
                              </div>
                            </td>
                            <td className="p-2 md:p-3 lg:p-4 font-black text-base md:text-lg" style={{ color: theme.primary }}>{row.avgMurajaah}</td>
                            <td className="p-2 md:p-3 border-l border-white/50"><EditableSelectCell value={sn.sp} options={SP_OPTIONS} onSave={(val) => handleSaveNote(row.id, 'sp', val)} /></td>
                            <td className="p-2 md:p-3"><EditableInputCell value={sn.keterangan} placeholder="Catatan..." onSave={(val) => handleSaveNote(row.id, 'keterangan', val)} /></td>
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
     <div className={`flex flex-col items-center justify-center p-6 md:p-10 mt-6 md:mt-10 rounded-3xl text-center relative z-10 ${glassCard}`}>
        <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mb-3 md:mb-4" />
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Profil Ananda Tidak Ditemukan</h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Data profil Ananda mungkin telah diperbarui. Silakan hubungi admin.</p>
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
    <div className="space-y-4 md:space-y-6 pb-10 relative z-10">
      <div className={`p-4 md:p-5 lg:p-8 rounded-3xl ${glassCard}`}>
         <h2 className="text-lg md:text-xl lg:text-3xl font-bold text-gray-800">Dashboard Ananda</h2>
         <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Pantau perkembangan tahfidz ananda secara real-time.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
           <div className={`p-4 md:p-6 lg:p-8 rounded-3xl border-t-[6px] ${glassCard}`} style={{ borderTopColor: theme.primary }}>
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                 <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl lg:text-3xl shadow-lg shrink-0" style={{ backgroundColor: theme.primary }}>{student.name ? student.name.charAt(0) : '?'}</div>
                 <div>
                    <h3 className="font-bold text-base md:text-xl lg:text-2xl text-gray-800 leading-tight">{student.name || 'Unknown'}</h3>
                    <p className="text-[10px] md:text-sm font-medium text-gray-500 mt-1 md:mt-1.5">Kls {student.kelas} • Smt {student.semester}</p>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between items-end text-xs md:text-sm mb-2 md:mb-3">
                    <span className="font-bold text-gray-600">Pencapaian Hafalan</span>
                    <span className="font-bold text-lg md:text-xl" style={{ color: theme.primary }}>{persentase}%</span>
                 </div>
                 <div className="w-full h-3 md:h-4 bg-white/60 rounded-full overflow-hidden shadow-inner border border-gray-200/50">
                    <div className="h-full transition-all duration-1000" style={{ width: `${persentase}%`, backgroundColor: persentase >= 100 ? theme.secondary : theme.accent }}></div>
                 </div>
                 <p className="text-[10px] md:text-xs font-semibold text-gray-500 mt-2 md:mt-3 text-right">Tercapai {student.juzTercapai || 0} Juz dari target {targetJuz} Juz</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-4 md:p-5 mt-4 md:mt-6 rounded-2xl border border-white shadow-sm">
                 <h4 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 md:mb-3">Target Semester Ini</h4>
                 <div className="flex items-center gap-2 md:gap-3">
                    <Award className={`w-5 h-5 md:w-7 md:h-7 ${persentase >= 100 ? "text-[#54af48]" : "text-gray-400"}`} />
                    <span className={`font-bold text-sm md:text-lg lg:text-xl ${persentase >= 100 ? 'text-[#54af48]' : 'text-gray-600'}`}>Selesai {targetJuz} Juz</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="lg:col-span-8 h-full">
           <div className={`p-4 md:p-6 lg:p-8 rounded-3xl h-full flex flex-col ${glassCard}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6 lg:mb-8">
                 <h3 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-800 flex items-center gap-2 md:gap-3"><Calendar className="w-5 h-5 md:w-7 md:h-7" style={{ color: theme.primary }}/> Mutaba'ah Harian</h3>
                 <div className="flex items-center justify-between gap-3 md:gap-4 bg-white/60 backdrop-blur-sm p-1.5 md:p-2 lg:p-2.5 rounded-xl border border-white shadow-sm w-full sm:w-auto">
                    <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1.5 md:p-2 hover:bg-white rounded-lg shadow-sm transition-colors"><ChevronDown className="rotate-90 text-gray-600 w-4 h-4 md:w-5 md:h-5" /></button>
                    <span className="font-bold text-sm md:text-base lg:text-lg w-28 md:w-32 lg:w-40 text-center text-gray-700">{["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1.5 md:p-2 hover:bg-white rounded-lg shadow-sm transition-colors"><ChevronDown className="-rotate-90 text-gray-600 w-4 h-4 md:w-5 md:h-5" /></button>
                 </div>
              </div>
            
            <div className="grid grid-cols-7 gap-2 md:gap-3 lg:gap-4 flex-1 content-start">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d} className="text-center text-[10px] md:text-sm font-bold text-gray-500 py-1 md:py-2 uppercase tracking-widest">{d}</div>)}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="p-2 md:p-3"></div>)}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1; 
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = records.find(r => r.studentId === student.id && r.date === dateStr);
                const isToday = dateStr === getLocalYYYYMMDD(new Date());
                
                let statusColor = "bg-white/40 border-white/50 text-gray-500 shadow-sm"; 
                if (record) { 
                   if (record.presensi === 'Hadir') statusColor = "bg-[#54af48]/20 border-[#54af48]/30 text-[#26544d] shadow-md backdrop-blur-sm"; 
                   else if (record.presensi === 'Alpha') statusColor = "bg-red-100/80 border-red-200 text-red-700 shadow-md backdrop-blur-sm"; 
                   else statusColor = "bg-[#f9e653]/30 border-[#f9e653]/50 text-yellow-800 shadow-md backdrop-blur-sm"; 
                }

                return (
                  <div 
                     key={day} 
                     onClick={() => { if(record) { setSelectedRecord(record); setSelectedDateStr(dateStr); setDetailModalOpen(true); } }}
                     className={`relative flex items-center justify-center aspect-square w-full rounded-xl md:rounded-2xl border-2 ${statusColor} ${isToday ? 'border-blue-400 ring-2 ring-blue-200/50' : ''} ${record ? 'cursor-pointer hover:scale-105 active:scale-95 hover:shadow-lg' : ''} transition-all duration-200`}
                  >
                    <span className="text-sm md:text-lg lg:text-xl font-bold">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {detailModalOpen && selectedRecord && (
         <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDetailModalOpen(false)}></div>
            <div className="flex min-h-full p-4 sm:p-6 relative z-10">
               <div className="m-auto bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl w-full max-w-sm md:max-w-md p-6 sm:p-8 animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 left-0 w-full h-2 md:h-3" style={{ backgroundColor: selectedRecord.presensi === 'Hadir' ? theme.secondary : selectedRecord.presensi === 'Alpha' ? theme.danger : theme.warning }}></div>

                  <div className="flex justify-between items-start mb-6 pt-2">
                     <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Mutaba'ah</p>
                        <h3 className="text-base sm:text-lg font-black text-gray-800">{formatIndoDate(selectedDateStr)}</h3>
                     </div>
                     <button onClick={() => setDetailModalOpen(false)} className="p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="mb-6 flex flex-col items-center bg-white/60 shadow-inner py-4 md:py-5 rounded-2xl border border-white">
                     <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Status Kehadiran</p>
                     <span className="inline-flex px-6 md:px-8 py-2 md:py-2.5 rounded-full text-sm md:text-base font-black uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: selectedRecord.presensi === 'Hadir' ? theme.secondary : selectedRecord.presensi === 'Alpha' ? theme.danger : theme.warning }}>
                        {selectedRecord.presensi}
                     </span>
                  </div>

                  {selectedRecord.presensi === 'Hadir' && (
                     <div className="space-y-4">
                        {selectedRecord.ziyadah ? (
                           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden flex flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-3 md:gap-4">
                                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: theme.primary + '15' }}>
                                    <BookOpen className="w-5 h-5 md:w-6 md:h-6" style={{ color: theme.primary }}/>
                                 </div>
                                 <div>
                                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">Ziyadah</p>
                                    <p className="text-sm md:text-base font-bold text-gray-800">{formatZiyadahSurahSafe(selectedRecord.ziyadah)}</p>
                                 </div>
                              </div>
                              <div className="text-right shrink-0 border-l border-gray-100 pl-4">
                                 <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">Nilai Evaluasi</p>
                                 <span className="text-xl md:text-2xl font-black" style={{ color: theme.primary }}>{selectedRecord.ziyadah.finalScore}</span>
                              </div>
                           </div>
                        ) : (
                           <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center text-xs font-semibold text-gray-400 shadow-inner">Setoran Ziyadah belum tercatat</div>
                        )}
                        
                        {selectedRecord.murajaah ? (
                           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden flex flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-3 md:gap-4">
                                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: theme.secondary + '15' }}>
                                    <RotateCcw className="w-5 h-5 md:w-6 md:h-6" style={{ color: theme.secondary }}/>
                                 </div>
                                 <div>
                                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">Muraja'ah</p>
                                    <p className="text-sm md:text-base font-bold text-gray-800">Juz {selectedRecord.murajaah.fromJuz} - Juz {selectedRecord.murajaah.toJuz}</p>
                                 </div>
                              </div>
                              <div className="text-right shrink-0 border-l border-gray-100 pl-4">
                                 <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1">Nilai Evaluasi</p>
                                 <span className="text-xl md:text-2xl font-black" style={{ color: theme.secondary }}>{selectedRecord.murajaah.finalScore}</span>
                              </div>
                           </div>
                        ) : (
                           <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center text-xs font-semibold text-gray-400 shadow-inner">Setoran Muraja'ah belum tercatat</div>
                        )}
                     </div>
                  )}

                  {selectedRecord.presensi === 'Izin/Sakit' && (
                     <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 flex flex-col items-center text-center mt-2 shadow-inner">
                        <AlertCircle className="w-6 h-6 text-yellow-500 mb-2"/>
                        <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1.5 md:mb-2">Keterangan Pengampu</p>
                        <p className="text-sm md:text-base font-bold text-gray-800">{selectedRecord.keterangan || '-'}</p>
                     </div>
                  )}

                  {selectedRecord.presensi === 'Alpha' && (
                     <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex flex-col items-center text-center mt-2 shadow-inner">
                        <AlertTriangle className="w-6 h-6 text-red-500 mb-2"/>
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1.5 md:mb-2">Catatan Sistem</p>
                        <p className="text-sm md:text-base font-bold text-gray-800">{selectedRecord.keterangan || 'Tanpa keterangan lebih lanjut'}</p>
                     </div>
                  )}

                  <button onClick={() => setDetailModalOpen(false)} className="mt-8 w-full py-3 md:py-3.5 rounded-xl font-bold text-sm md:text-base text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors">Tutup Detail Laporan</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// ==========================================
// 10. KERANGKA UTAMA & MENU SAMPING (SIDEBAR KIRI)
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
    <div className="min-h-screen bg-[#f0f4f3] flex font-sans text-gray-800 relative overflow-hidden">
      <GlassBackground />

      {/* Header Mobile (Glassy) */}
      <div className="md:hidden bg-white/70 backdrop-blur-md p-4 flex items-center justify-between shadow-sm fixed top-0 w-full z-40 border-b border-white">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" style={{ color: theme.primary }}/>
          <span className="font-black text-lg text-gray-800 tracking-tight">Markaz Digiport</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[#26544d] bg-white/50 rounded-xl border border-white shadow-sm">
          {isMobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Desktop & Mobile (Dikembalikan ke Kiri dengan Warna Primary Solid & Aksen Glass) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:translate-x-0 md:static md:flex-shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: theme.primary }}>
        
        {/* Hiasan Bias Cahaya di dalam Sidebar */}
        <div className="absolute top-0 left-0 w-full h-64 bg-[#54af48] mix-blend-screen opacity-10 blur-3xl pointer-events-none"></div>

        <div className="p-6 hidden md:block relative z-10">
          <div className="flex items-center gap-3 mb-1">
             <BookOpen className="w-8 h-8 text-[#f9e653]" />
             <span className="font-black text-2xl text-white tracking-tight">Markaz Digiport</span>
          </div>
        </div>
        
        <div className="px-4 py-4 md:py-2 flex-1 overflow-y-auto relative z-10">
           {/* Profil Pengguna */}
           <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 mb-6 flex items-center gap-3 shadow-inner">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#26544d] font-bold text-lg bg-[#f9e653] shadow-sm">{user.name ? user.name.charAt(0) : 'U'}</div>
              <div className="overflow-hidden">
                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-0.5">{user.role}</p>
                 <p className="text-sm font-bold text-white truncate">{user.name}</p>
              </div>
           </div>

           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-4 mb-3">Menu Navigasi</p>
           <nav className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-white/20 backdrop-blur-md text-white shadow-lg border border-white/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#f9e653]' : 'text-white/50'}`}/> {item.label}
                  </button>
                );
              })}
           </nav>
        </div>
        
        {/* Tombol Logout */}
        <div className="p-4 border-t border-white/10 relative z-10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 transition-colors font-bold text-sm border border-transparent hover:border-red-500/30">
             <LogOut className="w-5 h-5"/> Keluar Aplikasi
          </button>
        </div>
      </div>

      {/* Konten Menu Utama (Area Kanan) */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 w-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
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
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Crash tertangkap oleh ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f0f4f3] p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
          <GlassBackground />
          <div className={`relative z-10 p-6 md:p-8 rounded-3xl max-w-lg w-full text-center border-t-8 border-gray-400 ${glassCard}`}>
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl md:text-2xl font-black text-gray-800">Mohon Maaf, Terjadi Kendala Sistem</h1>
            <p className="text-gray-500 mt-3 text-sm md:text-base leading-relaxed">
              Sistem kami sedang mengalami sedikit gangguan. Jangan khawatir, data Anda tetap aman. Silakan segarkan (muat ulang) halaman ini untuk mencoba kembali.
            </p>
            <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-gray-800 text-white font-bold rounded-xl shadow-xl hover:bg-gray-700 transition-colors w-full sm:w-auto">
               Muat Ulang Halaman
            </button>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
               <button onClick={() => this.setState({ showDetails: !this.state.showDetails })} className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
                  {this.state.showDetails ? 'Tutup Detail Teknis' : 'Tampilkan Pesan Log (Admin)'}
               </button>
               {this.state.showDetails && (
                  <div className="mt-4 p-4 bg-gray-900/90 backdrop-blur-md text-green-400 text-left text-xs md:text-sm font-mono rounded-xl overflow-auto max-h-48 shadow-inner border border-gray-800">
                     {this.state.error && this.state.error.toString()}
                  </div>
               )}
            </div>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f0f4f3] font-sans relative overflow-hidden">
         <GlassBackground />
         <div className={`relative z-10 p-6 md:p-8 rounded-3xl max-w-lg text-center border-t-8 border-yellow-500 ${glassCard}`}>
             <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce drop-shadow-md" />
             <h1 className="text-xl md:text-2xl font-black text-gray-800 mb-3">Mohon Perhatian</h1>
             <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
               Sistem belum dapat memuat karena pengaturan keamanan (Konfigurasi Firebase) belum terbaca secara utuh.
             </p>
             <p className="text-gray-500 text-xs md:text-sm bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-white font-medium shadow-inner">
               Silakan periksa kembali berkas pengaturan (.env) dan pastikan Anda memuat ulang (Refresh) halaman ini.
             </p>
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