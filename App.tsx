
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Truck, 
  Download, 
  FileText, 
  Calendar,
  CheckCircle2,
  XCircle,
  Plus,
  // Added MapPin and LayoutDashboard to fix the "Cannot find name" errors
  MapPin,
  LayoutDashboard
} from 'lucide-react';
import { 
  ICONS, 
  ACCESS_POINTS, 
  VEHICLE_TYPES, 
  TRANSLATIONS 
} from './constants';
import { 
  LogEntry, 
  EntryType, 
  Language, 
  VisitorEntry, 
  VehicleEntry 
} from './types';
import { exportToExcel, exportToPDF } from './services/exportService';

const isNative = () => {
  if (typeof window === 'undefined') return false;
  return (window as any).Capacitor?.isNativePlatform();
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [lang, setLang] = useState<Language>('FR');
  const [page, setPage] = useState<number>(1);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [currentDate] = useState(new Date().toLocaleDateString('fr-FR'));
  
  // Form States
  const [chefPoste, setChefPoste] = useState('');
  const [accessPoint, setAccessPoint] = useState(ACCESS_POINTS[0]);
  const [entryType, setEntryType] = useState<EntryType | null>(null);
  const [registration, setRegistration] = useState('');
  const [societe, setSociete] = useState('');
  const [heureEntree, setHeureEntree] = useState('');
  const [heureSortie, setHeureSortie] = useState('');
  const [destination, setDestination] = useState('');
  const [observation, setObservation] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [personVisited, setPersonVisited] = useState('');
  const [cin, setCin] = useState('');
  const [isAnnounced, setIsAnnounced] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState(VEHICLE_TYPES[0].id);
  const [driverName, setDriverName] = useState('');
  const [bonNumber, setBonNumber] = useState('');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const setupNativeUI = async () => {
      if (isNative()) {
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#1a2a44' });
        } catch (e) {}
      }
    };
    setupNativeUI();
    const timer = setTimeout(() => setShowSplash(false), 2500);
    const saved = localStorage.getItem('athena_logs');
    if (saved) setHistory(JSON.parse(saved));
    const now = new Date();
    setHeureEntree(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
    return () => clearTimeout(timer);
  }, []);

  const triggerFeedback = async () => {
    if (isNative()) {
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {}
    }
  };

  const handleSave = async () => {
    await triggerFeedback();
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    const vehicleTypeLabel = VEHICLE_TYPES.find(v => v.id === selectedVehicleId)?.label || 'Autre';

    const common = {
      id, timestamp, chefPoste, accessPoint, type: entryType!,
      heureEntree, heureSortie, destination, observation, registration, societe
    };

    let newEntry: LogEntry;
    if (entryType === 'VISITOR') {
      newEntry = { ...common, visitorName, personVisited, cin, isAnnounced } as VisitorEntry;
    } else {
      newEntry = { ...common, vehicleType: vehicleTypeLabel, driverName, bonNumber } as VehicleEntry;
    }

    const updated = [newEntry, ...history];
    localStorage.setItem('athena_logs', JSON.stringify(updated));
    setHistory(updated);
    resetForm();
    setPage(4); 
  };

  const resetForm = () => {
    setRegistration(''); setSociete(''); setHeureSortie(''); setDestination('');
    setObservation(''); setVisitorName(''); setPersonVisited(''); setCin('');
    setDriverName(''); setBonNumber('');
    const now = new Date();
    setHeureEntree(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
  };

  const navigateTo = async (p: number) => {
    await triggerFeedback();
    setPage(p);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#1a2a44] flex flex-col items-center justify-center text-white z-50">
        <div className="w-24 h-24 mb-6 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl animate-bounce">
          <ICONS.Shield.type className="w-14 h-14 text-[#1a2a44]" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter">ATHENA</h1>
        <p className="mt-2 text-blue-300 uppercase tracking-[0.3em] text-xs font-bold">Surveillance</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 flex flex-col bg-slate-50 ${lang === 'AR' ? 'text-right' : 'text-left'}`} dir={lang === 'AR' ? 'rtl' : 'ltr'}>
      <header className="bg-[#1a2a44] text-white pt-12 pb-8 px-6 shadow-2xl sticky top-0 z-40 rounded-b-[2.5rem]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black leading-tight">{t.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Calendar size={12} className="text-blue-400" />
              <p className="text-[10px] font-bold text-blue-300 opacity-90 uppercase">{currentDate}</p>
            </div>
          </div>
          <button 
            onClick={() => { triggerFeedback(); setLang(lang === 'FR' ? 'AR' : 'FR'); }}
            className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl text-sm font-black border border-white/20 active:scale-90 transition-transform"
          >
            {lang === 'FR' ? 'AR' : 'FR'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-lg mx-auto w-full -mt-4">
        {page === 1 && (
          <div className="space-y-6">
            <div className="bg-white p-7 rounded-[2.5rem] shadow-xl border border-white/50 space-y-8">
              <div className="relative">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-3 ml-1">
                  <User size={12} /> {t.chefPoste}
                </label>
                <input 
                  type="text" 
                  value={chefPoste}
                  onChange={(e) => setChefPoste(e.target.value)}
                  className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                  placeholder="..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-4 ml-1">
                  <MapPin size={12} /> {t.accessPoint}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ACCESS_POINTS.map(ap => (
                    <button
                      key={ap}
                      onClick={() => { triggerFeedback(); setAccessPoint(ap); }}
                      className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${accessPoint === ap ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30 scale-105' : 'bg-slate-50 text-slate-400 border-transparent'}`}
                    >
                      {ap}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button 
              disabled={!chefPoste}
              onClick={() => navigateTo(2)}
              className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-600/40 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
            >
              {t.next} <ICONS.Next.type className={lang === 'AR' ? 'rotate-180' : ''} />
            </button>
          </div>
        )}

        {page === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <button onClick={() => navigateTo(1)} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase px-2">
              {ICONS.Back} {t.back}
            </button>
            <h2 className="text-xl font-black text-slate-800 px-2">{t.typeSelection}</h2>
            <div className="grid grid-cols-1 gap-5">
              <button 
                onClick={() => { setEntryType('VISITOR'); navigateTo(3); }} 
                className="bg-white p-10 rounded-[2.5rem] shadow-xl flex flex-col items-center gap-5 border border-white hover:border-blue-200 active:scale-95 transition-all"
              >
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><User size={40}/></div>
                <span className="font-black text-2xl text-slate-800">{t.visitor}</span>
              </button>
              <button 
                onClick={() => { setEntryType('VEHICLE'); navigateTo(3); }} 
                className="bg-white p-10 rounded-[2.5rem] shadow-xl flex flex-col items-center gap-5 border border-white hover:border-green-200 active:scale-95 transition-all"
              >
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><Truck size={40}/></div>
                <span className="font-black text-2xl text-slate-800">{t.vehicle}</span>
              </button>
            </div>
          </div>
        )}

        {page === 3 && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <button onClick={() => navigateTo(2)} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase px-2">
              {ICONS.Back} {t.back}
            </button>
            
            <div className="bg-white p-7 rounded-[2.5rem] shadow-2xl border border-white space-y-5">
               <h2 className="text-lg font-black text-blue-600 mb-2">{entryType === 'VISITOR' ? t.visitorForm : t.vehicleForm}</h2>
               
               {entryType === 'VISITOR' ? (
                 <>
                  <input placeholder={t.name} value={visitorName} onChange={e => setVisitorName(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none transition-all font-medium" />
                  <input placeholder={t.personVisited} value={personVisited} onChange={e => setPersonVisited(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium" />
                  <input placeholder={t.cin} value={cin} onChange={e => setCin(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium" />
                  
                  <div className="pt-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1">{t.announcedStatus}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setIsAnnounced(true)}
                        className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border-2 transition-all ${isAnnounced ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                      >
                        <CheckCircle2 size={16} /> {t.announced}
                      </button>
                      <button 
                        onClick={() => setIsAnnounced(false)}
                        className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border-2 transition-all ${!isAnnounced ? 'bg-red-50 border-red-500 text-red-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                      >
                        <XCircle size={16} /> {t.notAnnounced}
                      </button>
                    </div>
                  </div>
                 </>
               ) : (
                 <>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1">{t.vehicleType}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {VEHICLE_TYPES.map(v => (
                        <button
                          key={v.id}
                          onClick={() => { triggerFeedback(); setSelectedVehicleId(v.id); }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${selectedVehicleId === v.id ? 'bg-blue-600 border-blue-600 text-white scale-105' : 'bg-slate-50 border-transparent text-slate-400'}`}
                        >
                          {v.icon}
                          <span className="text-[8px] font-bold uppercase truncate w-full text-center">{lang === 'AR' ? v.labelAr : v.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <input placeholder={t.driverName} value={driverName} onChange={e => setDriverName(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium" />
                  <input placeholder={t.bonNumber} value={bonNumber} onChange={e => setBonNumber(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium" />
                 </>
               )}
               
               <div className="grid grid-cols-2 gap-3">
                 <input placeholder={t.registration} value={registration} onChange={e => setRegistration(e.target.value)} className="p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium" />
                 <input placeholder={t.societe} value={societe} onChange={e => setSociete(e.target.value)} className="p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium" />
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <span className="text-[9px] font-black text-slate-400 uppercase ml-1">{t.entryTime}</span>
                   <input type="time" value={heureEntree} onChange={e => setHeureEntree(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500" />
                 </div>
                 <div className="space-y-1">
                   <span className="text-[9px] font-black text-slate-400 uppercase ml-1">{t.exitTime}</span>
                   <input type="time" value={heureSortie} onChange={e => setHeureSortie(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500" />
                 </div>
               </div>

               <input placeholder={t.destination} value={destination} onChange={e => setDestination(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-medium" />
               <textarea placeholder={t.observation} value={observation} onChange={e => setObservation(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none h-24 font-medium resize-none" />
            </div>

            <button onClick={handleSave} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-green-600/40 active:scale-95 transition-all flex items-center justify-center gap-3">
              <ICONS.Save.type /> {t.save}
            </button>
          </div>
        )}

        {page === 4 && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-4 px-2">
              <div>
                <h2 className="text-3xl font-black text-slate-800">{t.history}</h2>
                <p className="text-slate-400 font-bold text-xs uppercase">{history.length} {t.success}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportToExcel(history)} className="p-4 bg-green-100 text-green-700 rounded-2xl active:scale-90 transition-transform"><Download size={22}/></button>
                <button onClick={() => exportToPDF(history)} className="p-4 bg-red-100 text-red-700 rounded-2xl active:scale-90 transition-transform"><FileText size={22}/></button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
                <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="font-bold text-slate-400 uppercase text-sm tracking-widest">{t.noData}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-white hover:border-blue-100 transition-all flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'VISITOR' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {item.type === 'VISITOR' ? <User size={24}/> : <Truck size={24}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{item.accessPoint} • {item.heureEntree}</span>
                        {item.type === 'VISITOR' && (item as VisitorEntry).isAnnounced && <span className="text-[8px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">{t.announced}</span>}
                      </div>
                      <h3 className="font-black text-slate-800 truncate">{(item as any).visitorName || (item as any).driverName}</h3>
                      <p className="text-xs font-bold text-slate-400 truncate tracking-tight">{(item as any).societe} • {(item as any).registration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button onClick={() => navigateTo(2)} className="w-full p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] border-2 border-dashed border-blue-200 font-black flex items-center justify-center gap-2">
              <Plus size={20} /> {t.typeSelection}
            </button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 py-5 flex justify-around rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-40">
        <button onClick={() => navigateTo(1)} className={`relative flex flex-col items-center gap-1 transition-all ${page <= 3 ? 'text-blue-600 scale-110' : 'text-slate-300'}`}>
          <LayoutDashboard size={26} strokeWidth={page <= 3 ? 3 : 2} />
          {page <= 3 && <span className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
        </button>
        <button onClick={() => navigateTo(4)} className={`relative flex flex-col items-center gap-1 transition-all ${page === 4 ? 'text-blue-600 scale-110' : 'text-slate-300'}`}>
          <FileText size={26} strokeWidth={page === 4 ? 3 : 2} />
          {page === 4 && <span className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
        </button>
      </nav>
    </div>
  );
};

export default App;
