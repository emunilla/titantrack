import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppData, SportType, Workout, WeightEntry, UserProfile, UserAccount } from './types';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import AICoach from './components/AICoach';
import ProfileSetup from './components/ProfileSetup';
import Login from './components/Login';
import { LayoutDashboard, PlusCircle, Sparkles, User, History, Filter, X, Pencil, Ruler, Activity, Target, LogOut, Download, Upload, ShieldCheck } from 'lucide-react';

const ACCOUNTS_STORAGE_KEY = 'titan_track_accounts';
const DATA_PREFIX = 'titan_track_data_';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'ai' | 'profile' | 'history'>('dashboard');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  
  const [filterType, setFilterType] = useState<SportType | 'all'>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (savedAccounts) {
      setUsers(JSON.parse(savedAccounts));
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const savedData = localStorage.getItem(`${DATA_PREFIX}${currentUserId}`);
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    } else {
      setData(null);
    }
  }, [currentUserId]);

  const saveData = (newData: AppData) => {
    setData(newData);
    localStorage.setItem(`${DATA_PREFIX}${newData.profile.id}`, JSON.stringify(newData));
    
    const accountExists = users.some(u => u.id === newData.profile.id);
    if (!accountExists) {
      const newAccount = { id: newData.profile.id, name: newData.profile.name, avatarColor: newData.profile.avatarColor };
      const updatedUsers = [...users, newAccount];
      setUsers(updatedUsers);
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedUsers));
    }
  };

  const handleProfileSubmit = (profile: UserProfile) => {
    const initialData: AppData = {
      profile,
      workouts: [],
      weightHistory: [{ date: new Date().toISOString().split('T')[0], weight: profile.initialWeight }]
    };
    saveData(initialData);
    setCurrentUserId(profile.id);
    setIsCreatingNew(false);
  };

  const handleSaveWorkout = (workout: Workout) => {
    if (!data) return;
    let newWorkouts;
    const exists = data.workouts.some(w => w.id === workout.id);
    
    if (exists) {
      newWorkouts = data.workouts.map(w => w.id === workout.id ? workout : w);
    } else {
      newWorkouts = [workout, ...data.workouts];
    }
    
    const newData = { ...data, workouts: newWorkouts };
    saveData(newData);
    setEditingWorkout(null);
    setActiveTab('dashboard');
  };

  const addWeight = (entry: WeightEntry) => {
    if (!data) return;
    const newData = { ...data, weightHistory: [...data.weightHistory, entry] };
    saveData(newData);
  };

  const startEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setActiveTab('log');
  };

  const logout = () => {
    setCurrentUserId(null);
    setData(null);
    setActiveTab('dashboard');
  };

  const handleExportData = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titantrack_backup_${data.profile.name.toLowerCase().replace(/\s/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string) as AppData;
        if (importedData.profile && importedData.workouts) {
          saveData(importedData);
          alert('Datos importados correctamente. Tu historial ha sido actualizado.');
        } else {
          alert('El archivo no tiene el formato correcto de TitanTrack.');
        }
      } catch (err) {
        alert('Error al leer el archivo. Asegúrate de que es un archivo JSON válido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredWorkouts = useMemo(() => {
    if (!data) return [];
    return data.workouts.filter(w => {
      const matchesType = filterType === 'all' || w.type === filterType;
      const matchesDate = !filterDate || w.date.startsWith(filterDate);
      return matchesType && matchesDate;
    });
  }, [data, filterType, filterDate]);

  if (!currentUserId) {
    if (isCreatingNew || users.length === 0) {
      return (
        <ProfileSetup 
          onSubmit={handleProfileSubmit} 
          showCancel={users.length > 0} 
          onCancel={() => setIsCreatingNew(false)} 
        />
      );
    }
    return (
      <Login 
        users={users} 
        onSelectUser={(id) => setCurrentUserId(id)} 
        onCreateNew={() => setIsCreatingNew(true)} 
      />
    );
  }

  if (!data) return <div className="p-10 text-center">Cargando datos del Titán...</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 bg-slate-50">
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6 z-50">
        <div className="flex items-center gap-2 mb-10">
          <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: data.profile.avatarColor }}>
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">TitanTrack</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarLink icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={<PlusCircle size={20}/>} label="Registrar" active={activeTab === 'log'} onClick={() => { setEditingWorkout(null); setActiveTab('log'); }} />
          <SidebarLink icon={<Sparkles size={20}/>} label="IA Coach" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <SidebarLink icon={<History size={20}/>} label="Historial" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <SidebarLink icon={<User size={20}/>} label="Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>

        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all mt-auto">
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: data.profile.avatarColor }}>
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">TitanTrack</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500">
            <LogOut size={20} />
          </button>
          <button onClick={() => setActiveTab('profile')} className="p-2 bg-slate-100 rounded-full">
            <User size={20} className="text-slate-600" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-10">
        {activeTab === 'dashboard' && <Dashboard data={data} onAddWeight={addWeight} onViewHistory={() => setActiveTab('history')} />}
        {activeTab === 'log' && <WorkoutLogger onSave={handleSaveWorkout} editWorkout={editingWorkout} onCancel={() => { setEditingWorkout(null); setActiveTab('history'); }} />}
        {activeTab === 'ai' && <AICoach data={data} />}
        
        {activeTab === 'history' && (
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <h2 className="text-2xl font-bold">Historial de Entrenamientos</h2>
               <div className="flex flex-wrap items-center gap-2">
                 <div className="relative flex-1 md:flex-none">
                   <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full bg-white border border-slate-200 text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8">
                     <option value="all">Todos los deportes</option>
                     {Object.values(SportType).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                   <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
                 <div className="relative flex-1 md:flex-none">
                   <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full bg-white border border-slate-200 text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 {(filterType !== 'all' || filterDate) && (
                   <button onClick={() => { setFilterType('all'); setFilterDate(''); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                 )}
               </div>
             </div>

             {filteredWorkouts.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                 <History size={48} className="mx-auto text-slate-300 mb-4" />
                 <p className="text-slate-500">No hay registros.</p>
               </div>
             ) : (
               <div className="grid gap-4">
                 {filteredWorkouts.map(w => (
                   <div key={w.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group">
                     <div className="flex justify-between items-start mb-3">
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                             w.type === SportType.Strength ? 'bg-orange-100 text-orange-600' :
                             w.type === SportType.Running ? 'bg-blue-100 text-blue-600' :
                             w.type === SportType.Swimming ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-600'
                           }`}>{w.type}</span>
                           <span className="text-xs text-slate-400 font-medium">{new Date(w.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <h4 className="font-bold text-slate-800">{new Date(w.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                       </div>
                       <button onClick={() => startEdit(w)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil size={18} /></button>
                     </div>
                     <div className="space-y-2">
                       {w.strengthData && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {w.strengthData.map((s, i) => (
                             <div key={i} className="text-sm bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-semibold text-slate-700">{s.exercise}:</span> {s.sets}x{s.reps} <span className="text-slate-400">@</span> {s.weight}kg</div>
                           ))}
                         </div>
                       )}
                       {w.cardioData && (
                         <div className="flex gap-4 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                           <div><span className="text-slate-400">Distancia:</span> <span className="font-bold">{w.cardioData.distance} {w.type === SportType.Swimming ? 'm' : 'km'}</span></div>
                           <div><span className="text-slate-400">Tiempo:</span> <span className="font-bold">{w.cardioData.timeMinutes} min</span></div>
                         </div>
                       )}
                       {w.notes && <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-50 pt-2">"{w.notes}"</p>}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="h-24 -mx-6 -mt-6 mb-12 flex items-end px-6 pb-4" style={{ backgroundColor: data.profile.avatarColor }}>
                <div className="bg-white p-4 rounded-3xl shadow-lg translate-y-8 border-4 border-white">
                  <User size={40} style={{ color: data.profile.avatarColor }} />
                </div>
              </div>
              
              <div className="pt-2">
                <h2 className="text-3xl font-black text-slate-800">{data.profile.name}</h2>
                <p className="text-slate-400 font-medium">Atleta Titan</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                 <ProfileItem icon={<Target className="text-orange-500"/>} label="Objetivo" value={data.profile.goal} />
                 <ProfileItem icon={<Ruler className="text-blue-500"/>} label="Altura" value={`${data.profile.height} cm`} />
                 <ProfileItem icon={<Activity className="text-emerald-500"/>} label="FC Reposo" value={`${data.profile.restingHeartRate} ppm`} />
                 <ProfileItem icon={<LayoutDashboard className="text-slate-500"/>} label="Peso Inicial" value={`${data.profile.initialWeight} kg`} />
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" /> Gestión de Datos
                </h3>
                <p className="text-sm text-slate-500 mb-6">Usa estas opciones para sincronizar tus entrenamientos entre diferentes dispositivos o guardar una copia de seguridad.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={handleExportData} className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-bold py-3 px-4 rounded-2xl hover:bg-indigo-100 transition-all">
                    <Download size={18} /> Exportar Backup (.json)
                  </button>
                  <div className="relative">
                    <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-2xl hover:bg-slate-200 transition-all">
                      <Upload size={18} /> Importar Backup
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <button onClick={logout} className="flex-1 bg-slate-50 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                  <LogOut size={18} /> Cambiar de Usuario
                </button>
                <button onClick={() => { if(confirm('¿Borrar TODOS tus entrenamientos y datos de perfil? Esta acción no se puede deshacer.')) { 
                     localStorage.removeItem(`${DATA_PREFIX}${data.profile.id}`);
                     const updated = users.filter(u => u.id !== data.profile.id);
                     setUsers(updated);
                     localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
                     logout();
                   } }} className="flex-1 bg-red-50 text-red-500 font-bold py-3 rounded-2xl hover:bg-red-100 transition-all">
                   Eliminar este Perfil
                 </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
        <NavButton icon={<LayoutDashboard />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavButton icon={<PlusCircle />} active={activeTab === 'log'} onClick={() => { setEditingWorkout(null); setActiveTab('log'); }} />
        <NavButton icon={<Sparkles />} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        <NavButton icon={<History />} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
      </nav>
    </div>
  );
};

const ProfileItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
    <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
      <p className="font-bold text-slate-700 text-lg">{value}</p>
    </div>
  </div>
);

const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-2 rounded-xl transition-all ${active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 24 }) : icon}
  </button>
);

export default App;