import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, BookOpen, Calendar, Settings, LogOut, 
  Download, Printer, Plus, Minus, Check, X, ChevronDown, ChevronUp,
  Award, AlertCircle, CheckCircle2, UserPlus, Trash2, AlertTriangle, Filter, Edit, RotateCcw, Menu, Lock, User
} from 'lucide-react';
import { 
  initializeApp, getApps 
} from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, updateDoc, getDoc
} from 'firebase/firestore';

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAOH9Ep7itgTz1RMmxMF2ko2KCl8tL73tw",
  authDomain: "digiport-mtqpiat.firebaseapp.com",
  projectId: "digiport-mtqpiat",
  storageBucket: "digiport-mtqpiat.firebasestorage.app",
  messagingSenderId: "913919068993",
  appId: "1:913919068993:web:418e76ba44641e0ec4afc0",
  measurementId: "G-2GG96J583V"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'tasmi-app';

// Tema Warna
const theme = {
  primary: '#26544d',
  secondary: '#54af48',
  accent: '#f9e653',
  bg: '#f8fafc',
  white: '#ffffff',
  danger: '#ef4444',
  warning: '#eab308'
};

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

const getCollectionPath = (colName) => `artifacts/${appId}/public/data/${colName}`;
const getSessionPath = (uid) => `artifacts/${appId}/users/${uid}/session`;

// --- CUSTOM MODALS ---
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Hapus Data" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-5 sm:p-6 lg:p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 text-red-600 mb-3 sm:mb-4">
          <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-5 sm:mb-6 lg:mb-8 leading-relaxed">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-end">
          <button onClick={onCancel} className="w-full sm:w-auto px-4 py-2.5 sm:py-3 lg:px-6 rounded-xl text-sm sm:text-base lg:text-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Batal</button>
          <button onClick={onConfirm} className="w-full sm:w-auto px-4 py-2.5 sm:py-3 lg:px-6 rounded-xl text-sm sm:text-base lg:text-lg font-semibold bg-red-500 text-white hover:bg-red-600 shadow-md transition">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ isOpen, target, pengampus, onSave, onCancel }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (target) setFormData(target.data);
  }, [target]);

  if (!isOpen || !target) return null;

  const isStudent = target.type === 'student';
  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(isStudent && {
        semester: parseInt(formData.semester),
        juzTercapai: parseInt(formData.juzTercapai)
      })
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[90%] sm:max-w-md lg:max-w-lg p-5 sm:p-6 lg:p-8 animate-in fade-in zoom-in duration-200 border-t-8 my-auto" style={{ borderColor: theme.primary }}>
        <div className="flex items-center justify-between mb-5 sm:mb-6 lg:mb-8">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2 lg:gap-3">
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: theme.primary }}/> 
            Edit {isStudent ? 'Data Santri' : 'Data Pengampu'}
          </h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 sm:p-1.5 bg-gray-100 rounded-full"><X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-5">
          <div><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Nama</label><input required type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2.5 sm:p-3 lg:p-4 border border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base lg:text-lg outline-none focus:ring-2 focus:bg-white transition-all" style={{ focusRingColor: theme.secondary }} /></div>
          
          {isStudent && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                <div><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Kelas</label><select name="kelas" value={formData.kelas || '1'} onChange={handleChange} className="w-full p-2.5 sm:p-3 lg:p-4 border border-gray-200 rounded-xl text-sm sm:text-base lg:text-lg bg-gray-50 outline-none focus:ring-2 focus:bg-white"><option value="IL">IL</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>
                <div><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Semester</label><select name="semester" value={formData.semester || '1'} onChange={handleChange} className="w-full p-2.5 sm:p-3 lg:p-4 border border-gray-200 rounded-xl text-sm sm:text-base lg:text-lg bg-gray-50 outline-none focus:ring-2 focus:bg-white">{[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                <div><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Halaqah</label>
                  <select name="pengampuId" value={formData.pengampuId || ''} onChange={handleChange} className="w-full p-2.5 sm:p-3 lg:p-4 border border-gray-200 rounded-xl text-sm sm:text-base lg:text-lg bg-gray-50 outline-none focus:ring-2 focus:bg-white">
                    {pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Target Tercapai</label><div className="flex"><input type="number" min="0" max="30" name="juzTercapai" value={formData.juzTercapai || 0} onChange={handleChange} className="w-full p-2.5 sm:p-3 lg:p-4 border border-gray-200 border-r-0 rounded-l-xl text-sm sm:text-base lg:text-lg bg-gray-50 outline-none focus:ring-2 focus:bg-white" /><span className="bg-gray-100 p-2.5 sm:p-3 lg:p-4 border border-gray-200 border-l-0 rounded-r-xl text-[10px] sm:text-sm lg:text-base text-gray-500 font-medium">Juz</span></div></div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <div><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Username</label><input required type="text" name="username" value={formData.username || ''} onChange={handleChange} className="w-full p-2.5 sm:p-3 lg:p-4 border border-gray-200 rounded-xl text-sm sm:text-base lg:text-lg bg-gray-50 outline-none focus:ring-2 focus:bg-white transition-all" /></div>
            <div><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Password</label><input required type="text" name="password" value={formData.password || ''} onChange={handleChange} className="w-full p-2.5 sm:p-3 lg:p-4 border border-gray-200 rounded-xl text-sm sm:text-base lg:text-lg bg-gray-50 outline-none focus:ring-2 focus:bg-white transition-all" /></div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-end pt-4 sm:pt-5 lg:pt-6 mt-5 sm:mt-6 lg:mt-8 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="px-5 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto">Batal</button>
            <button type="submit" className="px-5 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg text-white shadow-md hover:shadow-lg transition-transform w-full sm:w-auto flex justify-center items-center gap-2 lg:gap-3" style={{ backgroundColor: theme.primary }}><Check className="w-5 h-5 lg:w-6 lg:h-6"/> Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- REAL LOGIN SCREEN ---
const LoginScreen = ({ onLogin, pengampus, students }) => {
  const [role, setRole] = useState('wali');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (role === 'admin') {
      if (username === 'MinDigi' && password === 'J4diJar1yah') {
        onLogin({ role: 'admin', name: 'Admin Pusat' });
      } else {
        setError('Username atau password admin salah.');
      }
    } else if (role === 'pengampu') {
      const user = pengampus.find(p => p.username === username && p.password === password);
      if (user) {
        onLogin({ role: 'pengampu', name: user.name, id: user.id });
      } else {
        setError('Akun pengampu tidak ditemukan atau password salah.');
      }
    } else if (role === 'wali') {
      const user = students.find(s => s.username === username && s.password === password);
      if (user) {
        onLogin({ role: 'wali', name: `Wali ${user.name}`, studentId: user.id });
      } else {
        setError('Akun santri tidak ditemukan atau password salah.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8" style={{ backgroundColor: theme.bg }}>
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl w-full max-w-[90%] sm:max-w-md lg:max-w-lg border-t-8 transform transition-all" style={{ borderColor: theme.primary }}>
        <div className="text-center mb-6 sm:mb-8">
          <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 lg:mb-5" style={{ color: theme.primary }} />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">Markaz Tahfidz</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500 font-medium mt-1 lg:mt-2">Sistem Presensi & Mutaba'ah</p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
          <button type="button" onClick={() => {setRole('wali'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base font-bold rounded-lg sm:rounded-xl transition-all ${role === 'wali' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Wali</button>
          <button type="button" onClick={() => {setRole('pengampu'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base font-bold rounded-lg sm:rounded-xl transition-all ${role === 'pengampu' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pengampu</button>
          <button type="button" onClick={() => {setRole('admin'); setError(''); setUsername(''); setPassword('');}} className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base font-bold rounded-lg sm:rounded-xl transition-all ${role === 'admin' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Admin</button>
        </div>

        {error && (
           <div className="mb-4 sm:mb-5 p-3 lg:p-4 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-bold border border-red-100 flex items-center gap-2 animate-in fade-in"><AlertCircle size={18}/> {error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
          <div>
             <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1.5 lg:mb-2">Username</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"><User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /></div>
                <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 lg:py-3.5 border border-gray-200 rounded-xl lg:rounded-2xl bg-gray-50 text-sm sm:text-base lg:text-lg outline-none focus:ring-2 focus:bg-white transition-all" style={{ focusRingColor: role === 'pengampu' ? theme.secondary : role === 'admin' ? theme.primary : theme.accent }} placeholder="Masukkan username" />
             </div>
          </div>
          <div>
             <label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1.5 lg:mb-2">Password</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"><Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /></div>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 lg:py-3.5 border border-gray-200 rounded-xl lg:rounded-2xl bg-gray-50 text-sm sm:text-base lg:text-lg outline-none focus:ring-2 focus:bg-white transition-all" style={{ focusRingColor: role === 'pengampu' ? theme.secondary : role === 'admin' ? theme.primary : theme.accent }} placeholder="Masukkan password" />
             </div>
          </div>
          
          <button type="submit" className="w-full mt-2 sm:mt-4 p-3.5 sm:p-4 lg:p-4.5 rounded-xl lg:rounded-2xl text-gray-800 text-sm sm:text-base lg:text-lg font-bold transition-transform hover:scale-[1.02] shadow-md hover:shadow-lg text-white" style={{ backgroundColor: role === 'pengampu' ? theme.secondary : role === 'admin' ? theme.primary : '#d4c02c' }}>
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

// --- APP ROOT ---
const App = () => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [appUser, setAppUser] = useState(null); 
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  
  const [pengampus, setPengampus] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [recapNotes, setRecapNotes] = useState([]);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Inisialisasi Firebase Auth Anonim
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  // 2. Load Semua Data & Cek Sesi Tersimpan (Persistent Login via Firestore)
  useEffect(() => {
    if (!firebaseUser) return;

    // A. Cek Sesi Permanen
    const checkSession = async () => {
       try {
          const docSnap = await getDoc(doc(db, getSessionPath(firebaseUser.uid), 'current'));
          if (docSnap.exists()) {
             const savedData = docSnap.data();
             setAppUser(savedData);
             setActiveTab(savedData.role === 'admin' ? 'admin' : savedData.role === 'wali' ? 'dashboard' : 'harian');
          }
       } catch (error) {
          console.error("Gagal memeriksa sesi", error);
       } finally {
          setSessionChecked(true);
       }
    };
    checkSession();

    // B. Listener Data Secara Realtime
    const unsubPengampus = onSnapshot(collection(db, getCollectionPath('pengampus')), (snap) => {
      setPengampus(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));

    const unsubStudents = onSnapshot(collection(db, getCollectionPath('students')), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));

    const unsubRecords = onSnapshot(collection(db, getCollectionPath('records')), (snap) => {
      setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));

    const unsubRecapNotes = onSnapshot(collection(db, getCollectionPath('recap_notes')), (snap) => {
      setRecapNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));

    return () => { unsubPengampus(); unsubStudents(); unsubRecords(); unsubRecapNotes(); };
  }, [firebaseUser]);

  // Fungsi Login
  const handleLogin = async (userData) => {
    setAppUser(userData);
    setActiveTab(userData.role === 'admin' ? 'admin' : userData.role === 'wali' ? 'dashboard' : 'harian');
    if (firebaseUser) {
       try {
          await setDoc(doc(db, getSessionPath(firebaseUser.uid), 'current'), userData);
       } catch (err) { console.error("Gagal menyimpan sesi permanen", err); }
    }
  };

  // Fungsi Logout
  const handleLogout = async () => {
     if (firebaseUser) {
        try {
           await deleteDoc(doc(db, getSessionPath(firebaseUser.uid), 'current'));
        } catch (err) { console.error("Gagal menghapus sesi", err); }
     }
     setAppUser(null);
  };

  if (!sessionChecked) {
     return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
           <div className="animate-spin rounded-full h-12 w-12 border-b-4" style={{ borderColor: theme.primary }}></div>
        </div>
     );
  }

  if (!appUser) return <LoginScreen onLogin={handleLogin} pengampus={pengampus} students={students} />;

  const visibleStudents = appUser.role === 'pengampu' 
    ? students.filter(s => s.pengampuId === appUser.id)
    : students;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex bg-gray-50 font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-14 sm:h-16 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 text-white z-40 shadow-md" style={{ backgroundColor: theme.primary }}>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/10 rounded-lg active:scale-95 transition-transform">
          {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
        <span className="font-bold text-sm sm:text-base tracking-wide">Sistem Tahfidz</span>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-gray-900/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 sm:w-72 lg:w-64 xl:w-72 text-white flex flex-col shadow-2xl lg:shadow-xl z-50 shrink-0 transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ backgroundColor: theme.primary }}>
        <div className="hidden lg:flex p-6 xl:p-8 items-center gap-3 xl:gap-4 font-bold text-xl xl:text-2xl border-b border-white/10">
          <BookOpen className="w-6 h-6 xl:w-8 xl:h-8" style={{ color: theme.accent }} />
          <span>Sistem Tahfidz</span>
        </div>
        
        <div className="lg:hidden p-5 sm:p-6 flex items-center justify-between border-b border-white/10">
           <span className="font-bold text-lg sm:text-xl">Menu Utama</span>
           <button className="p-1.5 sm:p-2 rounded-lg bg-white/10 text-white/80 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
             <X className="w-5 h-5 sm:w-6 sm:h-6"/>
           </button>
        </div>
        
        <div className="p-4 sm:p-5 xl:p-6 flex-1 space-y-2 xl:space-y-3 overflow-y-auto">
          <div className="mb-5 sm:mb-6 xl:mb-8 p-4 sm:p-5 rounded-xl xl:rounded-2xl bg-white/10 text-xs sm:text-sm xl:text-base shadow-inner border border-white/5">
            <p className="opacity-70 mb-0.5 xl:mb-1 text-[10px] sm:text-xs xl:text-sm">Masuk sebagai:</p>
            <p className="font-bold text-base sm:text-lg xl:text-xl truncate" style={{ color: theme.accent }}>{appUser.name}</p>
            <p className="text-[10px] sm:text-xs xl:text-sm capitalize bg-white/20 inline-block px-2 sm:px-2.5 py-1 rounded-md mt-1.5 xl:mt-2 font-semibold tracking-wide">{appUser.role}</p>
          </div>

          {appUser.role === 'wali' ? (
             <button onClick={() => handleTabChange('dashboard')} className={`w-full flex items-center gap-3 xl:gap-4 p-3 sm:p-3.5 xl:p-4 rounded-xl xl:rounded-2xl text-sm sm:text-base xl:text-lg transition-all ${activeTab === 'dashboard' ? 'bg-white/20 font-bold shadow-sm' : 'hover:bg-white/10'}`}><Calendar className="w-5 h-5 xl:w-6 xl:h-6"/> <span>Dashboard Anak</span></button>
          ) : (
            <>
              {appUser.role === 'admin' && (
                <button onClick={() => handleTabChange('admin')} className={`w-full flex items-center gap-3 xl:gap-4 p-3 sm:p-3.5 xl:p-4 rounded-xl xl:rounded-2xl text-sm sm:text-base xl:text-lg transition-all ${activeTab === 'admin' ? 'bg-white/20 font-bold shadow-sm' : 'hover:bg-white/10'}`}><Settings className="w-5 h-5 xl:w-6 xl:h-6"/> <span>Kelola Data</span></button>
              )}
              <button onClick={() => handleTabChange('harian')} className={`w-full flex items-center gap-3 xl:gap-4 p-3 sm:p-3.5 xl:p-4 rounded-xl xl:rounded-2xl text-sm sm:text-base xl:text-lg transition-all ${activeTab === 'harian' ? 'bg-white/20 font-bold shadow-sm' : 'hover:bg-white/10'}`}><Calendar className="w-5 h-5 xl:w-6 xl:h-6"/> <span>Laporan Harian</span></button>
              <button onClick={() => handleTabChange('rekap')} className={`w-full flex items-center gap-3 xl:gap-4 p-3 sm:p-3.5 xl:p-4 rounded-xl xl:rounded-2xl text-sm sm:text-base xl:text-lg transition-all ${activeTab === 'rekap' ? 'bg-white/20 font-bold shadow-sm' : 'hover:bg-white/10'}`}><Download className="w-5 h-5 xl:w-6 xl:h-6"/> <span>Rekap Bulanan</span></button>
            </>
          )}
        </div>

        <div className="p-4 sm:p-5 xl:p-6 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 xl:gap-4 p-3 sm:p-3.5 xl:p-4 rounded-xl xl:rounded-2xl hover:bg-red-500/20 text-red-300 font-semibold text-sm sm:text-base xl:text-lg transition-colors"><LogOut className="w-5 h-5 xl:w-6 xl:h-6"/> <span>Keluar</span></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto pt-16 sm:pt-20 lg:pt-0 p-3 sm:p-5 lg:p-8 xl:p-10 relative bg-gray-100">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto w-full">
          {activeTab === 'admin' && <AdminView pengampus={pengampus} students={students} />}
          {activeTab === 'dashboard' && appUser.role === 'wali' && <WaliDashboardView students={students} records={records} user={appUser} />}
          {activeTab === 'harian' && <HarianView students={visibleStudents} records={records} pengampus={pengampus} userRole={appUser.role} />}
          {activeTab === 'rekap' && <RekapView students={visibleStudents} records={records} pengampus={pengampus} userRole={appUser.role} recapNotes={recapNotes} />}
        </div>
      </div>
    </div>
  );
};

// --- ADMIN VIEW ---
// [Isi AdminView tetap sama persis, tidak ada perubahan logika, hanya memastikan UI konsisten]
const AdminView = ({ pengampus, students }) => {
  const [newPengampu, setNewPengampu] = useState({ name: '', username: '', password: '' });
  const [newStudent, setNewStudent] = useState({ name: '', kelas: '1', semester: '1', username: '', password: '', juzTercapai: 0 });
  const [expandedPengampuId, setExpandedPengampuId] = useState(null);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null); 
  const [formError, setFormError] = useState('');

  const handleAddPengampu = async (e) => {
    e.preventDefault();
    if (!newPengampu.name || !newPengampu.username || !newPengampu.password) return;
    try {
      const id = "pengampu_" + Date.now();
      await setDoc(doc(db, getCollectionPath('pengampus'), id), { id, ...newPengampu });
      setNewPengampu({ name: '', username: '', password: '' });
      setFormError('');
    } catch (err) { setFormError("Gagal menyimpan Pengampu"); }
  };

  const handleAddStudent = async (e, pengampuId) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.username || !newStudent.password) return;
    try {
      const id = "santri_" + Date.now();
      await setDoc(doc(db, getCollectionPath('students'), id), { 
        id, pengampuId, ...newStudent,
        semester: parseInt(newStudent.semester), juzTercapai: parseInt(newStudent.juzTercapai) 
      });
      setNewStudent({ name: '', kelas: '1', semester: '1', username: '', password: '', juzTercapai: 0 });
      setFormError('');
    } catch (err) { setFormError("Gagal menyimpan Santri"); }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'pengampu') await deleteDoc(doc(db, getCollectionPath('pengampus'), deleteTarget.id));
      else if (deleteTarget.type === 'student') await deleteDoc(doc(db, getCollectionPath('students'), deleteTarget.id));
    } catch (error) { setFormError("Gagal menghapus data."); } 
    finally { setDeleteTarget(null); }
  };

  const executeEdit = async (updatedData) => {
    if (!editTarget) return;
    try {
      const collectionName = editTarget.type === 'pengampu' ? 'pengampus' : 'students';
      await updateDoc(doc(db, getCollectionPath(collectionName), editTarget.data.id), updatedData);
    } catch (error) { setFormError("Gagal memperbarui data."); }
    finally { setEditTarget(null); }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-10">
      <ConfirmModal isOpen={deleteTarget !== null} title={`Hapus ${deleteTarget?.type === 'pengampu' ? 'Pengampu' : 'Santri'}?`} message={`Apakah Anda yakin ingin menghapus data "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`} onConfirm={executeDelete} onCancel={() => setDeleteTarget(null)} />
      <EditModal isOpen={editTarget !== null} target={editTarget} pengampus={pengampus} onSave={executeEdit} onCancel={() => setEditTarget(null)} />

      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm border-t-4" style={{ borderColor: theme.primary }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6 lg:mb-8">
           <div className="p-2.5 sm:p-3 lg:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 shadow-inner"><UserPlus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" style={{ color: theme.primary }}/></div>
           <div><h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Tambah Pengampu (Halaqah)</h2><p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1">Buat akun untuk musyrif/pengampu baru.</p></div>
        </div>
        {formError && <div className="p-3 lg:p-4 bg-red-50 text-red-700 rounded-xl mb-4 text-xs sm:text-sm lg:text-base font-medium border border-red-100">{formError}</div>}
        <form onSubmit={handleAddPengampu} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-end">
          <div className="w-full"><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1.5 lg:mb-2">Nama Pengampu</label><input required type="text" value={newPengampu.name} onChange={e=>setNewPengampu({...newPengampu, name: e.target.value})} className="w-full p-2.5 sm:p-3 lg:p-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base lg:text-lg outline-none focus:ring-2 focus:bg-white transition-all" style={{ focusRingColor: theme.secondary }} placeholder="Ust. Fulan" /></div>
          <div className="w-full"><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1.5 lg:mb-2">Username (usn)</label><input required type="text" value={newPengampu.username} onChange={e=>setNewPengampu({...newPengampu, username: e.target.value})} className="w-full p-2.5 sm:p-3 lg:p-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base lg:text-lg outline-none focus:ring-2 focus:bg-white transition-all" placeholder="usn_pengampu" /></div>
          <div className="w-full"><label className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wide block mb-1.5 lg:mb-2">Password</label><input required type="text" value={newPengampu.password} onChange={e=>setNewPengampu({...newPengampu, password: e.target.value})} className="w-full p-2.5 sm:p-3 lg:p-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base lg:text-lg outline-none focus:ring-2 focus:bg-white transition-all" placeholder="***" /></div>
          <button type="submit" className="w-full p-2.5 sm:p-3 lg:p-3.5 px-4 rounded-xl text-white font-bold text-sm sm:text-base lg:text-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 lg:gap-3 shadow-md h-[42px] sm:h-[50px] lg:h-[54px]" style={{ backgroundColor: theme.primary }}><Plus className="w-5 h-5 lg:w-6 lg:h-6"/> Tambah</button>
        </form>
      </div>

      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 px-2 flex items-center gap-2 lg:gap-3"><Users className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: theme.primary }}/> Daftar Halaqah & Santri</h2>
        {pengampus.length === 0 ? (
           <div className="text-center p-6 sm:p-10 lg:p-14 bg-white rounded-2xl sm:rounded-3xl text-sm sm:text-base lg:text-lg text-gray-400 border border-dashed border-gray-300">Belum ada data pengampu.</div>
        ) : (
          pengampus.map(pengampu => {
            const isExpanded = expandedPengampuId === pengampu.id;
            const pengampuStudents = students.filter(s => s.pengampuId === pengampu.id);
            return (
              <div key={pengampu.id} className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-green-200 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}>
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white transition-colors cursor-pointer gap-4 sm:gap-6" onClick={() => setExpandedPengampuId(isExpanded ? null : pengampu.id)}>
                  <div className="flex items-center gap-3 sm:gap-5 lg:gap-6 flex-1 w-full">
                     <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-xl lg:text-2xl shadow-md shrink-0" style={{ backgroundColor: theme.primary }}>{pengampu.name.charAt(0)}</div>
                     <div>
                        <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">{pengampu.name}</h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3 text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-1.5 lg:mt-2">
                           <span className="bg-gray-100 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg border border-gray-200">USN: <span className="font-bold text-gray-700">{pengampu.username}</span></span>
                           <span className="bg-gray-100 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg border border-gray-200">Pass: <span className="font-bold text-gray-700">{pengampu.password}</span></span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-gray-100">
                     <div className="text-xs sm:text-sm lg:text-base font-bold text-gray-600 bg-gray-100 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl shadow-inner whitespace-nowrap">{pengampuStudents.length} Santri</div>
                     <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setEditTarget({ type: 'pengampu', data: pengampu }); }} className="text-blue-500 p-2 sm:p-2.5 hover:bg-blue-50 rounded-full transition-colors" title="Edit Pengampu"><Edit className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"/></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'pengampu', id: pengampu.id, name: pengampu.name }); }} className="text-red-400 p-2 sm:p-2.5 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors" title="Hapus Pengampu"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"/></button>
                        <div className={`p-1.5 sm:p-2.5 lg:p-3 rounded-full transition-colors ml-1 ${isExpanded ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-50'}`}>{isExpanded ? <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6" /> : <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6" />}</div>
                     </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-3 sm:p-6 lg:p-8 animate-in slide-in-from-top-4 duration-200">
                    <form onSubmit={(e) => handleAddStudent(e, pengampu.id)} className="bg-white p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-200 mb-4 sm:mb-6 lg:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 items-end relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: theme.secondary }}></div>
                      <div className="col-span-1 sm:col-span-2 lg:col-span-2"><label className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider font-bold text-gray-400 mb-1.5 block">Nama Santri Baru</label><input required type="text" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name: e.target.value})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base outline-none focus:ring-2 focus:border-transparent transition-all bg-gray-50 focus:bg-white" style={{ focusRingColor: theme.secondary }} placeholder="Nama..." /></div>
                      <div className="col-span-1 lg:col-span-1"><label className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider font-bold text-gray-400 mb-1.5 block">Kls/Smt</label><div className="flex gap-2"><select value={newStudent.kelas} onChange={e=>setNewStudent({...newStudent, kelas: e.target.value})} className="w-1/2 p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base outline-none bg-gray-50 focus:bg-white"><option value="IL">IL</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select><select value={newStudent.semester} onChange={e=>setNewStudent({...newStudent, semester: e.target.value})} className="w-1/2 p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base outline-none bg-gray-50 focus:bg-white">{[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
                      <div className="col-span-1 lg:col-span-1"><label className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider font-bold text-gray-400 mb-1.5 block">Tercapai</label><div className="flex items-center"><input type="number" min="0" max="30" value={newStudent.juzTercapai} onChange={e=>setNewStudent({...newStudent, juzTercapai: e.target.value})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 border-r-0 rounded-l-lg sm:rounded-l-xl text-xs sm:text-sm lg:text-base outline-none bg-gray-50 focus:bg-white" /><span className="bg-gray-100 p-2 sm:p-2.5 lg:p-3 border border-gray-200 border-l-0 rounded-r-lg sm:rounded-r-xl text-[10px] sm:text-sm lg:text-base text-gray-500 font-medium">Juz</span></div></div>
                      <div className="col-span-1 lg:col-span-1"><label className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider font-bold text-gray-400 mb-1.5 block">Username</label><input required type="text" value={newStudent.username} onChange={e=>setNewStudent({...newStudent, username: e.target.value})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base outline-none bg-gray-50 focus:bg-white" placeholder="usn..." /></div>
                      <div className="col-span-1 lg:col-span-1"><label className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider font-bold text-gray-400 mb-1.5 block">Password</label><div className="flex gap-2"><input required type="text" value={newStudent.password} onChange={e=>setNewStudent({...newStudent, password: e.target.value})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base outline-none bg-gray-50 focus:bg-white" placeholder="pass" /><button type="submit" className="p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center shrink-0" style={{ backgroundColor: theme.secondary }}><Plus className="w-5 h-5 lg:w-6 lg:h-6"/></button></div></div>
                    </form>
                    
                    <div className="overflow-x-auto bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl border border-gray-200 shadow-sm w-full max-w-full">
                       <table className="w-full text-left whitespace-nowrap min-w-[600px] lg:min-w-0">
                          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-[10px] sm:text-sm lg:text-base">
                             <tr>
                                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wide">Nama Santri</th>
                                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wide">Kls/Smt</th>
                                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wide">Juz</th>
                                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wide">Akun (USN / Pass)</th>
                                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wide text-center">Aksi</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm lg:text-base">
                             {pengampuStudents.length === 0 ? <tr><td colSpan="5" className="p-4 sm:p-6 lg:p-8 text-center text-gray-400 italic">Belum ada santri di halaqah ini.</td></tr> : pengampuStudents.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                   <td className="p-3 sm:p-4 lg:p-5 font-bold text-gray-800">{s.name}</td>
                                   <td className="p-3 sm:p-4 lg:p-5 text-gray-600 font-medium">{s.kelas} / {s.semester}</td>
                                   <td className="p-3 sm:p-4 lg:p-5 font-bold" style={{ color: theme.secondary }}>{s.juzTercapai} Juz</td>
                                   <td className="p-3 sm:p-4 lg:p-5">
                                      <div className="flex gap-1.5 sm:gap-2">
                                         <span className="bg-gray-100 px-2 lg:px-3 py-1 rounded text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-600 border border-gray-200">{s.username}</span>
                                         <span className="bg-gray-100 px-2 lg:px-3 py-1 rounded text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-600 border border-gray-200">{s.password}</span>
                                      </div>
                                   </td>
                                   <td className="p-3 sm:p-4 lg:p-5 text-center">
                                      <button onClick={() => setEditTarget({ type: 'student', data: s })} className="text-blue-500 hover:text-blue-600 p-1.5 sm:p-2 lg:p-2.5 hover:bg-blue-50 rounded-full transition-colors mr-1 sm:mr-2"><Edit className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                                      <button onClick={() => setDeleteTarget({ type: 'student', id: s.id, name: s.name })} className="text-red-400 hover:text-red-600 p-1.5 sm:p-2 lg:p-2.5 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5"/></button>
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
          })
        )}
      </div>
    </div>
  )
};

// --- HARIAN VIEW ---
const HarianView = ({ students, records, pengampus, userRole }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [selectedPengampuId, setSelectedPengampuId] = useState('semua');
  const [recordToDelete, setRecordToDelete] = useState(null);

  const filteredStudents = useMemo(() => {
    if (userRole !== 'admin' || selectedPengampuId === 'semua') return students;
    return students.filter(s => s.pengampuId === selectedPengampuId);
  }, [students, selectedPengampuId, userRole]);

  const groupedStudents = useMemo(() => {
    const groups = pengampus.map(p => ({
      pengampu: p,
      students: filteredStudents.filter(s => s.pengampuId === p.id)
    })).filter(g => g.students.length > 0);

    const unassigned = filteredStudents.filter(s => !pengampus.find(p => p.id === s.pengampuId));
    if (unassigned.length > 0) {
      groups.push({ pengampu: { id: 'unassigned', name: 'Tanpa Halaqah / Dihapus' }, students: unassigned });
    }
    return groups;
  }, [filteredStudents, pengampus]);

  const executeDeleteRecord = async () => {
    if (!recordToDelete) return;
    try { await deleteDoc(doc(db, getCollectionPath('records'), recordToDelete)); } 
    catch (error) { console.error("Error deleting record"); } 
    finally { setRecordToDelete(null); }
  };

  const formatZiyadahSurah = (z) => {
    if (!z) return null;
    const s1 = QURAN_SURAHS[z.fromSurah][0];
    const s2 = QURAN_SURAHS[z.toSurah][0];
    return z.fromSurah === z.toSurah 
      ? `${s1} ${z.fromAyah}-${z.toAyah}` 
      : `${s1} ${z.fromAyah} - ${s2} ${z.toAyah}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-10">
      <ConfirmModal isOpen={recordToDelete !== null} title="Ulang Laporan Hari Ini?" message="Anda akan menghapus laporan absen dan setoran santri di tanggal ini. Form akan dikosongkan kembali." confirmText="Ya, Kosongkan Form" onConfirm={executeDeleteRecord} onCancel={() => setRecordToDelete(null)} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm print:hidden">
        <div>
           <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Laporan Harian</h2>
           <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1">Isi presensi, ziyadah, dan muraja'ah santri.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
          {userRole === 'admin' && (
            <div className="flex items-center gap-2 lg:gap-3 bg-gray-50 p-2 lg:p-2.5 rounded-xl lg:rounded-2xl border border-gray-100 w-full sm:w-auto">
              <Filter className="text-gray-400 ml-2 w-4 h-4 lg:w-5 lg:h-5" />
              <select value={selectedPengampuId} onChange={(e) => setSelectedPengampuId(e.target.value)} className="border-none bg-transparent outline-none text-xs sm:text-sm lg:text-base font-bold text-gray-600 p-1 cursor-pointer w-full sm:w-48 lg:w-56 truncate"><option value="semua">Semua Halaqah</option>{pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
          )}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-gray-50 p-2 lg:p-2.5 rounded-xl lg:rounded-2xl border border-gray-100 w-full sm:w-auto">
             <label className="text-xs sm:text-sm lg:text-base font-bold text-gray-600 px-2 lg:px-3">Tanggal:</label>
             <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-none bg-white rounded-lg lg:rounded-xl p-2 lg:p-2.5 text-xs sm:text-sm lg:text-base focus:ring-2 outline-none font-medium shadow-sm w-full sm:w-auto" style={{ focusRingColor: theme.secondary }}/>
          </div>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {groupedStudents.length === 0 ? (
          <div className="text-center p-6 sm:p-10 lg:p-14 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-gray-300 text-sm sm:text-base lg:text-lg text-gray-400 font-medium">Tidak ada santri pada filter terpilih.</div>
        ) : (
          groupedStudents.map(group => (
            <div key={group.pengampu.id} className="space-y-3 sm:space-y-4 lg:space-y-5">
              {userRole === 'admin' && selectedPengampuId === 'semua' && (
                <div className="flex items-center gap-3 sm:gap-4 pt-2 sm:pt-4 pb-1 sm:pb-2">
                   <div className="h-px bg-gray-300 flex-1"></div>
                   <span className="font-bold text-gray-600 uppercase tracking-wider text-[10px] sm:text-xs lg:text-sm px-3 sm:px-4 lg:px-6 py-1 sm:py-1.5 lg:py-2 bg-white rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5 lg:gap-2.5"><BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: theme.primary }}/> Halaqah {group.pengampu.name}</span>
                   <div className="h-px bg-gray-300 flex-1"></div>
                </div>
              )}
              {group.students.map(student => {
                const todayRecord = records.find(r => r.studentId === student.id && r.date === selectedDate);
                const pastRecords = records.filter(r => r.studentId === student.id && r.date < selectedDate && r.ziyadah?.toSurah).sort((a,b) => b.date.localeCompare(a.date));
                const lastZiyadah = pastRecords.length > 0 ? pastRecords[0].ziyadah : null;
                const isExpanded = expandedStudent === student.id;

                return (
                  <div key={student.id} className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-green-200 shadow-md ring-1 ring-green-100' : 'border-gray-100'}`}>
                    <div className={`p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-colors gap-3 sm:gap-4 lg:gap-6 ${!isExpanded ? 'hover:bg-gray-50 cursor-pointer' : ''}`} onClick={() => !todayRecord && setExpandedStudent(isExpanded ? null : student.id)}>
                      
                      {/* Identitas Anak */}
                      <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 w-full sm:w-auto" onClick={(e) => { if(todayRecord) { e.stopPropagation(); setExpandedStudent(isExpanded ? null : student.id); } }}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-inner shrink-0" style={{ backgroundColor: theme.primary }}>{student.name.charAt(0)}</div>
                        <div>
                           <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">{student.name}</h3>
                           <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 mt-0.5 lg:mt-1">Kelas {student.kelas} • Smt {student.semester}</p>
                        </div>
                      </div>

                      {/* Status Kanan */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 lg:gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-end border-t sm:border-none border-gray-100 pt-3 sm:pt-0 flex-1">
                        {todayRecord ? (
                          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto justify-between sm:justify-end flex-1">
                            <div className="flex flex-col items-start sm:items-end text-left sm:text-right flex-1 sm:flex-none">
                              <span className={`px-2.5 sm:px-3 lg:px-4 py-1 lg:py-1.5 rounded-md sm:rounded-lg lg:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider mb-1 lg:mb-1.5 ${todayRecord.presensi === 'Hadir' ? 'bg-green-100 text-green-700' : todayRecord.presensi === 'Alpha' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{todayRecord.presensi}</span>
                              
                              {todayRecord.presensi === 'Hadir' && (
                                <div className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 flex flex-col items-start sm:items-end gap-0.5 lg:gap-1 w-full sm:w-auto leading-tight">
                                  {todayRecord.ziyadah && (<div className="truncate w-full text-left sm:text-right"><span className="font-bold text-green-600">Z:</span> {formatZiyadahSurah(todayRecord.ziyadah)} <span className="font-bold text-green-700 ml-0.5 lg:ml-1">[{todayRecord.ziyadah.finalScore}]</span></div>)}
                                  {todayRecord.murajaah && (<div className="truncate w-full text-left sm:text-right"><span className="font-bold text-yellow-600">M:</span> Juz {todayRecord.murajaah.fromJuz === todayRecord.murajaah.toJuz ? todayRecord.murajaah.fromJuz : `${todayRecord.murajaah.fromJuz}-${todayRecord.murajaah.toJuz}`} <span className="font-bold text-yellow-700 ml-0.5 lg:ml-1">[{todayRecord.murajaah.finalScore}]</span></div>)}
                                </div>
                              )}
                              
                              {todayRecord.presensi === 'Izin/Sakit' && (<div className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 w-full sm:max-w-[200px] lg:max-w-[250px] truncate text-left sm:text-right"><span className="font-bold text-gray-600">Ket:</span> {todayRecord.keterangan || '-'}</div>)}
                            </div>
                            <div className="flex sm:flex-col gap-1.5 sm:gap-2 border-l-0 sm:border-l border-gray-200 pl-0 sm:pl-3 lg:pl-4 ml-0 sm:ml-2 shrink-0">
                               <button onClick={(e) => { e.stopPropagation(); setExpandedStudent(isExpanded ? null : student.id); }} className={`p-1.5 sm:p-2 lg:p-2.5 rounded-lg lg:rounded-xl transition-colors ${isExpanded ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 sm:bg-transparent text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`} title="Edit Setoran">{isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"/> : <Edit className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"/>}</button>
                               <button onClick={(e) => { e.stopPropagation(); setRecordToDelete(todayRecord.id); }} className="p-1.5 sm:p-2 lg:p-2.5 rounded-lg lg:rounded-xl bg-gray-50 sm:bg-transparent text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Ulang Laporan Hari Ini"><RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"/></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between sm:justify-end w-full gap-3 sm:gap-4">
                             <span className="px-3 sm:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-bold bg-gray-50 text-gray-500 border border-gray-200">Belum diisi</span>
                             <div className={`p-1.5 sm:p-2 rounded-full transition-colors ${isExpanded ? 'bg-gray-100' : ''}`}>{isExpanded ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {isExpanded && (<div className="p-3 sm:p-5 lg:p-8 border-t border-gray-100 bg-gray-50/50 animate-in slide-in-from-top-2"><StudentDailyForm student={student} date={selectedDate} existingRecord={todayRecord} lastZiyadah={lastZiyadah} onSaveSuccess={() => setExpandedStudent(null)} /></div>)}
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

const StudentDailyForm = ({ student, date, existingRecord, lastZiyadah, onSaveSuccess }) => {
  const [presensi, setPresensi] = useState(existingRecord?.presensi || '');
  const [keterangan, setKeterangan] = useState(existingRecord?.keterangan || '');
  
  // State untuk Data Setoran
  const [ziyadah, setZiyadah] = useState(existingRecord?.ziyadah || { fromSurah: lastZiyadah?.toSurah || 0, fromAyah: lastZiyadah ? lastZiyadah.toAyah + 1 : 1, toSurah: lastZiyadah?.toSurah || 0, toAyah: lastZiyadah ? lastZiyadah.toAyah + 1 : 1, tajwid: 0, lupa: 0, lupaBimbingan: 0, manualScore: '' });
  const [murajaah, setMurajaah] = useState(existingRecord?.murajaah || { fromJuz: 1, toJuz: 1, tajwid: 0, lupa: 0, lupaBimbingan: 0, manualScore: '' });
  
  // State Baru: Toggle On/Off untuk masing-masing tipe setoran
  const [isZiyadahActive, setIsZiyadahActive] = useState(existingRecord ? !!existingRecord.ziyadah : true);
  const [isMurajaahActive, setIsMurajaahActive] = useState(existingRecord ? !!existingRecord.murajaah : true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const getAyahCount = (surahIdx) => QURAN_SURAHS[surahIdx]?.[1] || 0;

  const handleSave = async () => {
    if (!presensi) { setErrorMsg("Pilih status presensi terlebih dahulu."); return; }
    if (presensi === 'Izin/Sakit' && !keterangan.trim()) { setErrorMsg("Mohon isi keterangan izin atau sakit."); return; }
    
    setErrorMsg(''); setSaving(true);
    
    const zScore = calculateScore(ziyadah.tajwid, ziyadah.lupa, ziyadah.lupaBimbingan);
    const mScore = calculateScore(murajaah.tajwid, murajaah.lupa, murajaah.lupaBimbingan);
    const recordId = existingRecord?.id || `${student.id}_${date}`;
    
    // Payload cerdas: hanya menyimpan objek yang "Active"
    const payload = { 
      studentId: student.id, date, presensi, 
      ...(presensi === 'Hadir' && isZiyadahActive ? { ziyadah: { ...ziyadah, finalScore: ziyadah.manualScore !== '' ? parseInt(ziyadah.manualScore) : zScore } } : {}),
      ...(presensi === 'Hadir' && isMurajaahActive ? { murajaah: { ...murajaah, finalScore: murajaah.manualScore !== '' ? parseInt(murajaah.manualScore) : mScore } } : {}),
      ...(presensi === 'Izin/Sakit' ? { keterangan } : {})
    };

    try { 
       await setDoc(doc(db, getCollectionPath('records'), recordId), payload); 
       onSaveSuccess(); 
    } catch (error) { 
       setErrorMsg("Gagal menyimpan data."); setSaving(false); 
    }
  };

  const ErrorRow = ({ label, penalty, value, onChange, colorTheme }) => {
     const themes = {
        green: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', text: 'text-green-700' },
        yellow: { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', text: 'text-yellow-700' },
        red: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', text: 'text-red-700' }
     };
     const t = themes[colorTheme];
     return (
        <div className="flex items-center justify-between py-2 sm:py-2.5 lg:py-3 border-b border-gray-100 last:border-0">
           <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${t.dot}`}></div>
              <span className="text-xs sm:text-sm lg:text-base font-bold text-gray-700">{label}</span>
              <span className={`text-[9px] sm:text-[10px] lg:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg ${t.badge}`}>{penalty}</span>
           </div>
           <div className="flex items-center bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden h-7 sm:h-9 lg:h-10">
              <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="px-2 sm:px-3 lg:px-4 h-full hover:bg-gray-100 text-gray-500 transition-colors flex items-center justify-center"><Minus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"/></button>
              <div className={`w-8 sm:w-10 lg:w-12 text-center text-xs sm:text-sm lg:text-base font-bold bg-gray-50 h-full flex items-center justify-center border-x border-gray-100 ${t.text}`}>{value}</div>
              <button type="button" onClick={() => onChange(value + 1)} className="px-2 sm:px-3 lg:px-4 h-full hover:bg-gray-100 text-gray-500 transition-colors flex items-center justify-center"><Plus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"/></button>
           </div>
        </div>
     );
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {errorMsg && <div className="p-3 sm:p-4 lg:p-5 bg-red-50 text-red-700 rounded-xl lg:rounded-2xl text-xs sm:text-sm lg:text-base font-bold border border-red-100 flex items-center gap-2 lg:gap-3 animate-in fade-in"><AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"/> {errorMsg}</div>}
      
      <div className="bg-white p-4 sm:p-5 lg:p-6 xl:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100">
        <label className="block text-xs sm:text-sm lg:text-base font-bold text-gray-800 mb-2 sm:mb-4 lg:mb-5 uppercase tracking-wider">Status Presensi</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          {['Hadir', 'Izin/Sakit', 'Alpha'].map(status => (
            <button 
              key={status} 
              onClick={() => {setPresensi(status); setErrorMsg('');}} 
              className={`w-full py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-[10px] sm:text-sm lg:text-base font-bold border-2 transition-all shadow-sm flex items-center justify-center ${presensi === status ? 'text-white transform sm:scale-105' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 bg-white'}`} 
              style={presensi === status ? { backgroundColor: status === 'Hadir' ? theme.secondary : status === 'Alpha' ? theme.danger : theme.warning, borderColor: status === 'Hadir' ? theme.secondary : status === 'Alpha' ? theme.danger : theme.warning, color: '#fff' } : {}}
            >
              {status}
            </button>
          ))}
        </div>

        {presensi === 'Izin/Sakit' && (
          <div className="mt-4 sm:mt-5 lg:mt-6 animate-in slide-in-from-top-2">
             <label className="block text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500 mb-1.5 sm:mb-2 lg:mb-3 uppercase tracking-wider">Keterangan / Alasan</label>
             <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Contoh: Sakit demam..." className="w-full p-2.5 sm:p-3 lg:p-4 text-xs sm:text-sm lg:text-base border-2 border-yellow-200 rounded-lg sm:rounded-xl lg:rounded-2xl outline-none focus:border-yellow-400 bg-yellow-50/30 transition-colors" />
          </div>
        )}
      </div>

      {presensi === 'Hadir' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 animate-in slide-in-from-top-2">
          
          {/* ZIYADAH BLOCK */}
          <div className={`bg-white p-4 sm:p-5 lg:p-6 xl:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl border shadow-sm flex flex-col transition-all duration-300 ${!isZiyadahActive ? 'border-gray-200 bg-gray-50/50' : 'border-gray-100'}`}>
             <div className="flex justify-between items-center mb-3 sm:mb-5 lg:mb-6">
                <h4 className={`font-bold text-sm sm:text-base lg:text-xl flex items-center gap-2 lg:gap-3 transition-colors ${!isZiyadahActive ? 'text-gray-400' : 'text-gray-800'}`}>
                   <div className={`p-1.5 sm:p-2 rounded-lg transition-colors ${!isZiyadahActive ? 'bg-gray-100' : 'bg-green-50'}`}><BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" style={{ color: !isZiyadahActive ? '#9ca3af' : theme.primary }}/></div> 
                   Setoran Ziyadah
                </h4>
                <button type="button" onClick={() => setIsZiyadahActive(!isZiyadahActive)} className={`w-10 h-5 sm:w-12 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner ${isZiyadahActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                   <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow transform transition-transform ${isZiyadahActive ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>
             
             {isZiyadahActive ? (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6 flex-1 flex flex-col animate-in slide-in-from-top-2">
                   <div className="space-y-2 sm:space-y-3 lg:space-y-4 bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                         <div><label className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 lg:mb-1.5 block">Dari Surat</label><select value={ziyadah.fromSurah} onChange={(e) => setZiyadah({...ziyadah, fromSurah: parseInt(e.target.value), fromAyah: 1})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base bg-white outline-none font-medium">{QURAN_SURAHS.map((s, i) => <option key={i} value={i}>{s[0]}</option>)}</select></div>
                         <div><label className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 lg:mb-1.5 block">Ayat</label><select value={ziyadah.fromAyah} onChange={(e) => setZiyadah({...ziyadah, fromAyah: parseInt(e.target.value)})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base bg-white outline-none font-medium">{Array.from({length: getAyahCount(ziyadah.fromSurah)}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                         <div><label className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 lg:mb-1.5 block">Sampai Surat</label><select value={ziyadah.toSurah} onChange={(e) => setZiyadah({...ziyadah, toSurah: parseInt(e.target.value), toAyah: 1})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base bg-white outline-none font-medium">{QURAN_SURAHS.map((s, i) => <option key={i} value={i}>{s[0]}</option>)}</select></div>
                         <div><label className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 lg:mb-1.5 block">Ayat</label><select value={ziyadah.toAyah} onChange={(e) => setZiyadah({...ziyadah, toAyah: parseInt(e.target.value)})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base bg-white outline-none font-medium">{Array.from({length: getAyahCount(ziyadah.toSurah)}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
                      </div>
                   </div>
                   
                   <div className="flex-1 mt-2 sm:mt-0">
                      <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2 lg:mb-3 px-1 lg:px-2">Kesalahan Hafalan</p>
                      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl lg:rounded-3xl px-3 sm:px-4 lg:px-6 border border-gray-100 py-1 lg:py-2">
                         <ErrorRow label="Kesalahan Tajwid" penalty="-1" value={ziyadah.tajwid} onChange={(v) => setZiyadah({...ziyadah, tajwid: v})} colorTheme="green" />
                         <ErrorRow label="Lupa / Tersendat" penalty="-1" value={ziyadah.lupa} onChange={(v) => setZiyadah({...ziyadah, lupa: v})} colorTheme="yellow" />
                         <ErrorRow label="Lupa (Dibimbing)" penalty="-2" value={ziyadah.lupaBimbingan} onChange={(v) => setZiyadah({...ziyadah, lupaBimbingan: v})} colorTheme="red" />
                      </div>
                   </div>

                   <div className="mt-3 sm:mt-4 lg:mt-6 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-3xl border-2 transition-all flex items-center justify-between relative overflow-hidden bg-white shadow-sm hover:shadow-md" style={{ borderColor: theme.primary }}>
                      <div className="absolute top-0 right-0 w-24 sm:w-32 lg:w-40 h-24 sm:h-32 lg:h-40 opacity-5 rounded-bl-full pointer-events-none" style={{ backgroundColor: theme.primary }}></div>
                      <div className="z-10">
                         <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5 lg:mb-1">Skor Penilaian</p>
                         <div className="flex items-baseline gap-1.5 lg:gap-2">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter" style={{ color: theme.primary }}>{ziyadah.manualScore !== '' ? ziyadah.manualScore : calculateScore(ziyadah.tajwid, ziyadah.lupa, ziyadah.lupaBimbingan)}</span>
                            <span className="text-xs sm:text-sm lg:text-base font-bold text-gray-400">/ 100</span>
                         </div>
                      </div>
                      <div className="z-10 flex flex-col items-end">
                         <label className="text-[8px] sm:text-[9px] lg:text-xs font-bold text-gray-400 uppercase mb-1 lg:mb-2">Ubah Manual</label>
                         <input type="number" value={ziyadah.manualScore} onChange={(e) => setZiyadah({...ziyadah, manualScore: e.target.value})} placeholder="-" className="w-16 sm:w-20 lg:w-24 px-2 py-1.5 lg:py-2.5 text-sm sm:text-base lg:text-lg font-bold text-center border-2 border-gray-200 rounded-lg lg:rounded-xl outline-none focus:border-transparent transition-all bg-gray-50 focus:bg-white placeholder-gray-400" style={{ focusRingColor: theme.secondary, focusRingWidth: '2px' }} />
                      </div>
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex items-center justify-center py-6 sm:py-8 lg:py-10">
                   <p className="text-xs sm:text-sm lg:text-base text-gray-400 font-semibold italic">Pengisian Ziyadah Dinonaktifkan.</p>
                </div>
             )}
          </div>
          
          {/* MURAJAAH BLOCK */}
          <div className={`bg-white p-4 sm:p-5 lg:p-6 xl:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl border shadow-sm flex flex-col transition-all duration-300 ${!isMurajaahActive ? 'border-gray-200 bg-gray-50/50' : 'border-gray-100'}`}>
             <div className="flex justify-between items-center mb-3 sm:mb-5 lg:mb-6">
                <h4 className={`font-bold text-sm sm:text-base lg:text-xl flex items-center gap-2 lg:gap-3 transition-colors ${!isMurajaahActive ? 'text-gray-400' : 'text-gray-800'}`}>
                   <div className={`p-1.5 sm:p-2 rounded-lg transition-colors ${!isMurajaahActive ? 'bg-gray-100' : 'bg-green-50'}`}><RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" style={{ color: !isMurajaahActive ? '#9ca3af' : theme.secondary }}/></div> 
                   Setoran Muraja'ah
                </h4>
                <button type="button" onClick={() => setIsMurajaahActive(!isMurajaahActive)} className={`w-10 h-5 sm:w-12 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner ${isMurajaahActive ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                   <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow transform transition-transform ${isMurajaahActive ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>
             
             {isMurajaahActive ? (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6 flex-1 flex flex-col animate-in slide-in-from-top-2">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-gray-100">
                      <div><label className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 lg:mb-1.5 block">Dari Juz</label><select value={murajaah.fromJuz} onChange={(e) => setMurajaah({...murajaah, fromJuz: parseInt(e.target.value)})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base bg-white outline-none font-medium">{JUZ_LIST.map(j => <option key={j} value={j}>Juz {j}</option>)}</select></div>
                      <div><label className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 lg:mb-1.5 block">Sampai Juz</label><select value={murajaah.toJuz} onChange={(e) => setMurajaah({...murajaah, toJuz: parseInt(e.target.value)})} className="w-full p-2 sm:p-2.5 lg:p-3 border border-gray-200 rounded-lg lg:rounded-xl text-xs sm:text-sm lg:text-base bg-white outline-none font-medium">{JUZ_LIST.map(j => <option key={j} value={j}>Juz {j}</option>)}</select></div>
                   </div>
                   
                   <div className="flex-1 mt-2 sm:mt-0">
                      <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2 lg:mb-3 px-1 lg:px-2">Kesalahan Hafalan</p>
                      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl lg:rounded-3xl px-3 sm:px-4 lg:px-6 border border-gray-100 py-1 lg:py-2">
                         <ErrorRow label="Kesalahan Tajwid" penalty="-1" value={murajaah.tajwid} onChange={(v) => setMurajaah({...murajaah, tajwid: v})} colorTheme="green" />
                         <ErrorRow label="Lupa / Tersendat" penalty="-1" value={murajaah.lupa} onChange={(v) => setMurajaah({...murajaah, lupa: v})} colorTheme="yellow" />
                         <ErrorRow label="Lupa (Dibimbing)" penalty="-2" value={murajaah.lupaBimbingan} onChange={(v) => setMurajaah({...murajaah, lupaBimbingan: v})} colorTheme="red" />
                      </div>
                   </div>

                   <div className="mt-3 sm:mt-4 lg:mt-6 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-3xl border-2 transition-all flex items-center justify-between relative overflow-hidden bg-white shadow-sm hover:shadow-md" style={{ borderColor: theme.secondary }}>
                      <div className="absolute top-0 right-0 w-24 sm:w-32 lg:w-40 h-24 sm:h-32 lg:h-40 opacity-10 rounded-bl-full pointer-events-none" style={{ backgroundColor: theme.secondary }}></div>
                      <div className="z-10">
                         <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5 lg:mb-1">Skor Penilaian</p>
                         <div className="flex items-baseline gap-1.5 lg:gap-2">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter" style={{ color: theme.secondary }}>{murajaah.manualScore !== '' ? murajaah.manualScore : calculateScore(murajaah.tajwid, murajaah.lupa, murajaah.lupaBimbingan)}</span>
                            <span className="text-xs sm:text-sm lg:text-base font-bold text-gray-400">/ 100</span>
                         </div>
                      </div>
                      <div className="z-10 flex flex-col items-end">
                         <label className="text-[8px] sm:text-[9px] lg:text-xs font-bold text-gray-400 uppercase mb-1 lg:mb-2">Ubah Manual</label>
                         <input type="number" value={murajaah.manualScore} onChange={(e) => setMurajaah({...murajaah, manualScore: e.target.value})} placeholder="-" className="w-16 sm:w-20 lg:w-24 px-2 py-1.5 lg:py-2.5 text-sm sm:text-base lg:text-lg font-bold text-center border-2 border-gray-200 rounded-lg lg:rounded-xl outline-none focus:border-transparent transition-all bg-gray-50 focus:bg-white placeholder-gray-400" style={{ focusRingColor: theme.primary, focusRingWidth: '2px' }} />
                      </div>
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex items-center justify-center py-6 sm:py-8 lg:py-10">
                   <p className="text-xs sm:text-sm lg:text-base text-gray-400 font-semibold italic">Pengisian Muraja'ah Dinonaktifkan.</p>
                </div>
             )}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2 sm:pt-4 lg:pt-6">
         <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto flex items-center justify-center gap-2 lg:gap-3 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl lg:rounded-3xl text-sm sm:text-base lg:text-lg text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0" style={{ backgroundColor: theme.primary }}>
            {saving ? <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 border-b-2 sm:border-b-4 border-white"></div> : <Check className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7"/>}
            {saving ? 'Menyimpan...' : 'Simpan Laporan'}
         </button>
      </div>
    </div>
  );
};

// --- REKAP VIEW ---
const EditableSelectCell = ({ value, options, onSave }) => {
  return (
    <select 
      value={value || ''} 
      onChange={(e) => onSave(e.target.value)} 
      className="w-16 sm:w-20 lg:w-28 p-1.5 sm:p-2 lg:p-2.5 border border-gray-200 rounded-md sm:rounded-lg text-[10px] sm:text-xs lg:text-sm font-bold text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all print:appearance-none print:border-none print:bg-transparent print:p-0 print:font-semibold"
    >
      <option value="">- SP -</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
};

const EditableInputCell = ({ value, onSave, placeholder }) => {
  const [val, setVal] = useState(value || '');
  useEffect(() => setVal(value || ''), [value]);
  return (
    <input 
      type="text" 
      value={val} 
      onChange={(e) => setVal(e.target.value)} 
      onBlur={() => onSave(val)} 
      className="w-20 sm:w-28 lg:w-40 p-1.5 sm:p-2 lg:p-2.5 border border-gray-200 rounded-md sm:rounded-lg text-[10px] sm:text-xs lg:text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all print:border-none print:bg-transparent print:p-0 print:font-medium" 
      placeholder={placeholder} 
    />
  )
};

const RekapView = ({ students, records, pengampus, userRole, recapNotes }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
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
      const ziyadahRecords = studentRecords.filter(r => r.presensi === 'Hadir' && r.ziyadah);
      const murajaahRecords = studentRecords.filter(r => r.presensi === 'Hadir' && r.murajaah);
      const zStart = ziyadahRecords.length > 0 ? ziyadahRecords.sort((a,b)=>a.date.localeCompare(b.date))[0].ziyadah : null;
      const zEnd = ziyadahRecords.length > 0 ? ziyadahRecords.sort((a,b)=>b.date.localeCompare(a.date))[0].ziyadah : null;
      const avgZiyadah = ziyadahRecords.length > 0 ? (ziyadahRecords.reduce((acc, r) => acc + r.ziyadah.finalScore, 0) / ziyadahRecords.length).toFixed(1) : 0;
      const mStart = murajaahRecords.length > 0 ? murajaahRecords.sort((a,b)=>a.date.localeCompare(b.date))[0].murajaah : null;
      const mEnd = murajaahRecords.length > 0 ? murajaahRecords.sort((a,b)=>b.date.localeCompare(a.date))[0].murajaah : null;
      const avgMurajaah = murajaahRecords.length > 0 ? (murajaahRecords.reduce((acc, r) => acc + r.murajaah.finalScore, 0) / murajaahRecords.length).toFixed(1) : 0;
      const targetJuz = TARGET_HAFALAN[student.semester] || 30;
      const persentase = Math.min(100, Math.round(((student.juzTercapai || 0) / targetJuz) * 100));
      return { ...student, kehadiran, totalHari, zStart, zEnd, avgZiyadah, mStart, mEnd, avgMurajaah, persentase, targetJuz };
    });
  }, [filteredStudents, records, selectedMonth]);

  const groupedRecap = useMemo(() => {
    const groups = pengampus.map(p => ({
      pengampu: p,
      data: recapData.filter(r => r.pengampuId === p.id)
    })).filter(g => g.data.length > 0);

    const unassigned = recapData.filter(s => !pengampus.find(p => p.id === s.pengampuId));
    if (unassigned.length > 0) {
      groups.push({ pengampu: { id: 'unassigned', name: 'Tanpa Halaqah / Dihapus' }, data: unassigned });
    }
    return groups;
  }, [recapData, pengampus]);

  const handleSaveNote = async (studentId, field, value) => {
    const docId = `${studentId}_${selectedMonth}`;
    try {
      await setDoc(doc(db, getCollectionPath('recap_notes'), docId), { studentId, month: selectedMonth, [field]: value }, { merge: true });
    } catch (err) { console.error("Gagal menyimpan note:", err); }
  };

  const pengampuNameLabel = selectedPengampuId === 'semua' ? 'Semua Halaqah' : pengampus.find(p=>p.id === selectedPengampuId)?.name;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-6 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm print:hidden">
        <div><h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Rekapitulasi Bulanan</h2><p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1">Pilih bulan dan halaqah untuk melihat laporan.</p></div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
          {userRole === 'admin' && (
             <div className="flex items-center gap-2 lg:gap-3 bg-gray-50 p-2 lg:p-2.5 rounded-xl lg:rounded-2xl border border-gray-100 w-full sm:w-auto"><Filter className="text-gray-400 ml-2 w-4 h-4 lg:w-5 lg:h-5" /><select value={selectedPengampuId} onChange={(e) => setSelectedPengampuId(e.target.value)} className="border-none bg-transparent outline-none text-xs sm:text-sm lg:text-base font-bold text-gray-600 p-1 cursor-pointer w-full sm:w-40 lg:w-48 truncate"><option value="semua">Semua Halaqah</option>{pengampus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          )}
          <div className="flex gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
             <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="flex-1 sm:flex-none border border-gray-200 bg-gray-50 rounded-xl lg:rounded-2xl p-2.5 sm:p-2 lg:p-3 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm lg:text-base outline-none font-bold text-gray-700 focus:bg-white transition-colors" />
             <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-2 lg:py-3 bg-gray-800 text-white text-xs sm:text-sm lg:text-base font-bold rounded-xl lg:rounded-2xl hover:bg-gray-700 shadow-md transition-all whitespace-nowrap"><Printer className="w-4 h-4 lg:w-5 lg:h-5"/> Cetak / PDF</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="hidden print:block p-8 text-center border-b"><h1 className="text-3xl font-black mb-2">Laporan Pencapaian Tahfidz</h1><p className="text-lg font-semibold text-gray-600">Bulan: {selectedMonth} | {userRole === 'admin' ? pengampuNameLabel : pengampus.find(p=>p.id === filteredStudents[0]?.pengampuId)?.name }</p></div>
        
        {/* TABEL RESPONSIVE */}
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[800px] lg:min-w-full">
            <thead className="text-white" style={{ backgroundColor: theme.primary }}>
              <tr className="text-[10px] sm:text-xs lg:text-sm">
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider rounded-tl-xl sm:rounded-tl-2xl lg:rounded-tl-3xl">Nama Santri</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider">Kls/Smt</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider">Presensi</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider border-l border-white/20">Target %</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider border-l border-white/20">Ziyadah (Awal - Akhir)</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider">Rata Z</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider border-l border-white/20">Muraja'ah (Awal - Akhir)</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider">Rata M</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider border-l border-white/20">S.P</th>
                <th className="p-3 sm:p-4 lg:p-5 font-bold tracking-wider rounded-tr-xl sm:rounded-tr-2xl lg:rounded-tr-3xl">Ket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm lg:text-base">
              {groupedRecap.length === 0 ? (
                <tr><td colSpan="10" className="p-6 sm:p-10 lg:p-14 text-center text-gray-400 font-medium italic">Tidak ada data di bulan dan halaqah ini.</td></tr>
              ) : (
                groupedRecap.map(group => (
                  <React.Fragment key={group.pengampu.id}>
                    {userRole === 'admin' && selectedPengampuId === 'semua' && (
                      <tr className="bg-gray-100/80"><td colSpan="10" className="p-2 sm:p-3 lg:p-4 px-3 sm:px-4 lg:px-5 font-bold text-gray-700 text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider border-y border-gray-200"><div className="flex items-center gap-1.5 sm:gap-2"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" style={{color: theme.primary}}/> Halaqah {group.pengampu.name}</div></td></tr>
                    )}
                    {group.data.map(row => {
                      const studentNote = recapNotes.find(n => n.studentId === row.id && n.month === selectedMonth) || {};
                      
                      return (
                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3 sm:p-4 lg:p-5 font-bold text-gray-800 text-xs sm:text-sm lg:text-base">{row.name}</td>
                          <td className="p-3 sm:p-4 lg:p-5 text-gray-600 font-medium text-[10px] sm:text-xs lg:text-sm">{row.kelas} / {row.semester}</td>
                          <td className="p-3 sm:p-4 lg:p-5"><span className="bg-green-100 text-green-700 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 rounded-lg lg:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold border border-green-200">{row.kehadiran}</span> <span className="font-medium text-gray-500 text-[10px] sm:text-xs lg:text-sm ml-1">/ {row.totalHari}</span></td>
                          <td className="p-3 sm:p-4 lg:p-5 border-l border-gray-100"><div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 w-16 sm:w-20 lg:w-28"><div className="w-full h-1.5 sm:h-2 lg:h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner"><div className="h-full" style={{ width: `${row.persentase}%`, backgroundColor: row.persentase >= 100 ? theme.secondary : theme.accent }}></div></div><span className="text-[10px] sm:text-xs lg:text-sm font-black">{row.persentase}%</span></div></td>
                          <td className="p-3 sm:p-4 lg:p-5 border-l border-gray-100"><div className="flex flex-col text-[10px] sm:text-xs lg:text-sm text-gray-700 space-y-1 sm:space-y-1.5 lg:space-y-2"><span className="bg-gray-50 px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 rounded-md lg:rounded-lg"><span className="font-bold text-gray-400 mr-1 sm:mr-1.5 lg:mr-2">A:</span> {row.zStart ? `${QURAN_SURAHS[row.zStart.fromSurah][0]} ${row.zStart.fromAyah}` : '-'}</span><span className="bg-gray-50 px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 rounded-md lg:rounded-lg"><span className="font-bold text-gray-400 mr-1 sm:mr-1.5 lg:mr-2">Z:</span> {row.zEnd ? `${QURAN_SURAHS[row.zEnd.toSurah][0]} ${row.zEnd.toAyah}` : '-'}</span></div></td>
                          <td className="p-3 sm:p-4 lg:p-5 font-black text-sm sm:text-base lg:text-lg" style={{ color: theme.primary }}>{row.avgZiyadah}</td>
                          <td className="p-3 sm:p-4 lg:p-5 border-l border-gray-100"><div className="flex flex-col text-[10px] sm:text-xs lg:text-sm text-gray-700 space-y-1 sm:space-y-1.5 lg:space-y-2"><span className="bg-gray-50 px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 rounded-md lg:rounded-lg"><span className="font-bold text-gray-400 mr-1 sm:mr-1.5 lg:mr-2">A:</span> {row.mStart ? `Juz ${row.mStart.fromJuz}` : '-'}</span><span className="bg-gray-50 px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 rounded-md lg:rounded-lg"><span className="font-bold text-gray-400 mr-1 sm:mr-1.5 lg:mr-2">Z:</span> {row.mEnd ? `Juz ${row.mEnd.toJuz}` : '-'}</span></div></td>
                          <td className="p-3 sm:p-4 lg:p-5 font-black text-sm sm:text-base lg:text-lg" style={{ color: theme.primary }}>{row.avgMurajaah}</td>
                          
                          <td className="p-2 sm:p-3 lg:p-4 border-l border-gray-100">
                             <EditableSelectCell value={studentNote.sp} options={SP_OPTIONS} onSave={(val) => handleSaveNote(row.id, 'sp', val)} />
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4">
                             <EditableInputCell value={studentNote.keterangan} placeholder="Ket..." onSave={(val) => handleSaveNote(row.id, 'keterangan', val)} />
                          </td>
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

// --- WALI DASHBOARD VIEW ---
const WaliDashboardView = ({ students, records, user }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // State untuk Modal Detail
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  const student = students.find(s => s.id === user.studentId) || students[0];
  if (!student) return <div className="p-6 sm:p-8 lg:p-10 text-center bg-white rounded-2xl sm:rounded-3xl shadow-sm text-gray-500 text-sm sm:text-base lg:text-lg">Data anak tidak ditemukan.</div>;
  
  const targetJuz = TARGET_HAFALAN[student.semester] || 30;
  const persentase = Math.min(100, Math.round(((student.juzTercapai || 0) / targetJuz) * 100));
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Format Surat Ziyadah untuk Modal
  const formatZiyadahSurah = (z) => {
    if (!z) return null;
    const s1 = QURAN_SURAHS[z.fromSurah][0];
    const s2 = QURAN_SURAHS[z.toSurah][0];
    return z.fromSurah === z.toSurah 
      ? `${s1} ayat ${z.fromAyah}-${z.toAyah}` 
      : `${s1} ay ${z.fromAyah} - ${s2} ay ${z.toAyah}`;
  };

  const formatIndoDate = (dateString) => {
     return new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-10">
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
         <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Dashboard Ananda</h2>
         <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1">Pantau perkembangan tahfidz dan mutaba'ah harian.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Panel Kiri: Identitas & Target */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8 h-fit">
           <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm border-t-4" style={{ borderColor: theme.primary }}>
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6 lg:mb-8">
                 <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl lg:text-3xl shadow-md shrink-0" style={{ backgroundColor: theme.primary }}>{student.name.charAt(0)}</div>
                 <div>
                    <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-800 leading-tight">{student.name}</h3>
                    <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 mt-1 lg:mt-1.5">Kls {student.kelas} • Smt {student.semester}</p>
                 </div>
              </div>
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                 <div>
                    <div className="flex justify-between items-end text-xs sm:text-sm lg:text-base mb-2 lg:mb-3">
                       <span className="font-bold text-gray-600">Pencapaian Hafalan</span>
                       <span className="font-bold text-base sm:text-lg lg:text-xl" style={{ color: theme.primary }}>{persentase}%</span>
                    </div>
                    <div className="w-full h-3 sm:h-4 lg:h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full transition-all duration-1000" style={{ width: `${persentase}%`, backgroundColor: persentase >= 100 ? theme.secondary : theme.accent }}></div>
                    </div>
                    <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-500 mt-2 lg:mt-3 text-right">{student.juzTercapai || 0} Juz tercapai dari target {targetJuz} Juz</p>
                 </div>
                 <div className="bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
                    <h4 className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 lg:mb-3">Target Semester {student.semester}</h4>
                    <div className="flex items-center gap-2.5 lg:gap-3">
                       <Award className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${persentase >= 100 ? "text-green-500" : "text-gray-400"}`} />
                       <span className={`font-bold text-base sm:text-lg lg:text-xl ${persentase >= 100 ? 'text-green-600' : 'text-gray-600'}`}>Selesai {targetJuz} Juz</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Panel Kanan: Kalender Mutaba'ah */}
        <div className="lg:col-span-8 xl:col-span-9 h-full">
           <div className="bg-white p-4 sm:p-6 lg:p-8 xl:p-10 rounded-2xl sm:rounded-3xl shadow-sm h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-5 sm:mb-6 lg:mb-8">
                 <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-800 flex items-center gap-2 lg:gap-3"><Calendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" style={{ color: theme.primary }}/> Mutaba'ah Harian</h3>
                 <div className="flex items-center justify-between sm:justify-center gap-3 sm:gap-4 lg:gap-6 bg-gray-50 p-1.5 sm:p-2 lg:p-2.5 rounded-xl lg:rounded-2xl border border-gray-100 w-full sm:w-auto">
                    <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1.5 sm:p-2 hover:bg-white rounded-lg shadow-sm transition-all"><ChevronDown className="rotate-90 text-gray-600 w-5 h-5 sm:w-6 sm:h-6" /></button>
                    <span className="font-bold text-sm sm:text-base lg:text-lg w-28 sm:w-36 lg:w-44 text-center text-gray-700">{["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1.5 sm:p-2 hover:bg-white rounded-lg shadow-sm transition-all"><ChevronDown className="-rotate-90 text-gray-600 w-5 h-5 sm:w-6 sm:h-6" /></button>
                 </div>
              </div>
            
            {/* Grid Kalender yang Benar-benar Responsif dengan aspect-square */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 lg:gap-4 xl:gap-5 flex-1 content-start">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d} className="text-center text-xs sm:text-sm lg:text-base font-bold text-gray-400 py-1 sm:py-2 lg:py-3 uppercase">{d}</div>)}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="p-2 sm:p-3 lg:p-4"></div>)}
              
              {/* KALENDER BERSIH (Hanya Tanggal & Warna Blok) */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1; const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = records.find(r => r.studentId === student.id && r.date === dateStr);
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                
                let statusColor = "bg-gray-50 border-gray-100 text-gray-400"; 
                if (record) { 
                   if (record.presensi === 'Hadir') { statusColor = "bg-green-100 border-green-200 text-green-700 shadow-sm"; } 
                   else if (record.presensi === 'Alpha') { statusColor = "bg-red-100 border-red-200 text-red-700 shadow-sm"; } 
                   else { statusColor = "bg-yellow-100 border-yellow-200 text-yellow-700 shadow-sm"; } 
                }

                return (
                  <div 
                     key={day} 
                     onClick={() => {
                        if(record) { 
                           setSelectedRecord(record); 
                           setSelectedDateStr(dateStr); 
                           setDetailModalOpen(true); 
                        }
                     }}
                     className={`relative flex items-center justify-center aspect-square w-full rounded-xl sm:rounded-2xl border-2 ${statusColor} ${isToday ? 'border-blue-400 shadow-md ring-2 ring-blue-100' : ''} ${record ? 'cursor-pointer hover:scale-105 active:scale-95 hover:shadow-lg' : ''} transition-all duration-200`}
                  >
                    <span className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL HARIAN */}
      {detailModalOpen && selectedRecord && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg p-6 sm:p-8 lg:p-10 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-5 sm:mb-6 lg:mb-8 border-b border-gray-100 pb-4 sm:pb-5 lg:pb-6">
                  <div>
                     <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 lg:mb-1.5">Detail Mutaba'ah</p>
                     <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-800" style={{ color: theme.primary }}>{formatIndoDate(selectedDateStr)}</h3>
                  </div>
                  <button onClick={() => setDetailModalOpen(false)} className="p-2 sm:p-2.5 bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-colors"><X className="w-5 h-5 sm:w-6 sm:h-6"/></button>
               </div>
               
               <div className="mb-5 sm:mb-6 lg:mb-8 flex justify-center">
                  <span className={`inline-flex px-5 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg font-black uppercase tracking-widest border-2 ${selectedRecord.presensi === 'Hadir' ? 'bg-green-50 text-green-700 border-green-200' : selectedRecord.presensi === 'Alpha' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{selectedRecord.presensi}</span>
               </div>

               {selectedRecord.presensi === 'Hadir' && (
                  <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                     {selectedRecord.ziyadah ? (
                        <div className="bg-green-50 p-4 sm:p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-green-100 relative overflow-hidden">
                           <div className="absolute -right-4 -bottom-4 lg:-right-6 lg:-bottom-6 opacity-10"><BookOpen className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32" style={{ color: theme.primary }}/></div>
                           <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-green-600 uppercase tracking-wider mb-1 lg:mb-2">Setoran Ziyadah</p>
                           <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 lg:mb-5 relative z-10">{formatZiyadahSurah(selectedRecord.ziyadah)}</p>
                           <div className="flex justify-between items-end border-t border-green-200/50 pt-3 sm:pt-4 lg:pt-5 relative z-10">
                              <span className="text-xs sm:text-sm lg:text-base text-green-700 font-medium">Nilai Akhir:</span>
                              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-600">{selectedRecord.ziyadah.finalScore}</span>
                           </div>
                        </div>
                     ) : (
                        <div className="bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 text-center text-xs sm:text-sm lg:text-base font-semibold text-gray-400">Tidak ada setoran Ziyadah</div>
                     )}
                     
                     {selectedRecord.murajaah ? (
                        <div className="bg-yellow-50/50 p-4 sm:p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-yellow-100 relative overflow-hidden">
                           <div className="absolute -right-4 -bottom-4 lg:-right-6 lg:-bottom-6 opacity-10"><RotateCcw className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32" style={{ color: theme.secondary }}/></div>
                           <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-yellow-600 uppercase tracking-wider mb-1 lg:mb-2">Setoran Muraja'ah</p>
                           <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 lg:mb-5 relative z-10">Juz {selectedRecord.murajaah.fromJuz} - Juz {selectedRecord.murajaah.toJuz}</p>
                           <div className="flex justify-between items-end border-t border-yellow-200/50 pt-3 sm:pt-4 lg:pt-5 relative z-10">
                              <span className="text-xs sm:text-sm lg:text-base text-yellow-700 font-medium">Nilai Akhir:</span>
                              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-yellow-600">{selectedRecord.murajaah.finalScore}</span>
                           </div>
                        </div>
                     ) : (
                        <div className="bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 text-center text-xs sm:text-sm lg:text-base font-semibold text-gray-400">Tidak ada setoran Muraja'ah</div>
                     )}
                  </div>
               )}

               {selectedRecord.presensi === 'Izin/Sakit' && (
                  <div className="bg-yellow-50 p-5 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-yellow-100 text-center">
                     <p className="text-xs sm:text-sm lg:text-base font-bold text-yellow-600 uppercase tracking-wider mb-2 lg:mb-3">Keterangan Izin/Sakit</p>
                     <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">{selectedRecord.keterangan || '-'}</p>
                  </div>
               )}

               <button onClick={() => setDetailModalOpen(false)} className="mt-6 sm:mt-8 lg:mt-10 w-full py-3 sm:py-3.5 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Tutup Detail</button>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;