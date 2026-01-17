
import React, { useState, useEffect, useMemo } from 'react';
import { AppData, SportType, Workout, UserProfile, TrainingPlan } from './types';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import AICoach from './components/AICoach';
import ProfileSetup from './components/ProfileSetup';
import AuthForm from './components/AuthForm';
import TrainingPlans from './components/TrainingPlans';
import { db, supabase } from './services/supabaseClient';
import { 
  LayoutDashboard, PlusCircle, Sparkles, User, History, 
  Activity, Target, LogOut, Loader2, CalendarDays, Trash2, Settings,
  Scale, Moon, Sun, Monitor, Ruler, Users, Rocket
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'ai' | 'profile' | 'history' | 'plans'>('dashboard');
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [filterType, setFilterType] = useState<SportType | 'all'>('all');

  useEffect(() => {
    // Escuchar cambios en la sesión de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadAllUserData();
      } else {
        setData(null);
        setIsLoading(false);
      }
    });

    // Carga inicial de sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadAllUserData();
      else setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('titan-theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (theme === 'light') document.body.classList.add('theme-traditional');
    else document.body.classList.remove('theme-traditional');
    localStorage.setItem('titan-theme', theme);
  }, [theme]);

  const loadAllUserData = async () => {
    setIsFetchingData(true);
    try {
      const profile = await db.profiles.getMyProfile();
      if (!profile) { 
        setData(null); 
        setIsLoading(false);
        setIsFetchingData(false);
        return; 
      }
      
      // Cargamos cada recurso de forma resiliente
      const workouts = await db.workouts.getMyWorkouts().catch(() => []);
      const weightHistory = await db.weightHistory.getMyHistory().catch(() => []);
      const plans = await db.plans.getMyPlans().catch(() => []);

      setData({
        profile: {
          id: profile.id, 
          name: profile.name, 
          goal: profile.goal, 
          initialWeight: profile.initial_weight,
          height: profile.height, 
          restingHeartRate: profile.resting_heart_rate, 
          avatarColor: profile.avatar_color
        },
        workouts: (workouts || []).map((w: any) => ({
          id: w.id, date: w.date, type: w.type as SportType, strengthData: w.strength_data,
          cardioData: w.cardio_data, groupClassData: w.group_class_data, notes: w.notes, planId: w.plan_id
        })),
        weightHistory: weightHistory || [],
        plans: plans || []
      });
    } catch (err) {
      console.error("Error crítico cargando datos:", err);
    } finally {
      setIsFetchingData(false);
      setIsLoading(false);
    }
  };

  const handleSaveWorkout = async (workout: Workout) => {
    setIsFetchingData(true);
    try {
      const isNew = workout.id.length < 15;
      const dbWorkout = {
        id: isNew ? undefined : workout.id,
        date: workout.date,
        type: workout.type,
        strength_data: workout.strengthData,
        cardio_data: workout.cardioData,
        group_class_data: workout.groupClassData,
        notes: workout.notes,
        plan_id: workout.planId
      };
      await db.workouts.save(dbWorkout);
      await loadAllUserData();
      setEditingWorkout(null);
      setActiveTab('history');
    } catch (err) {
      alert("Error al guardar la sesión.");
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('¿CONFIRMAR ELIMINACIÓN PERMANENTE?')) return;
    setDeletingId(workoutId);
    try {
      await db.workouts.delete(workoutId);
      await loadAllUserData();
    } catch (err) {
      alert("Error al eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSavePlan = async (plan: TrainingPlan) => {
    setIsFetchingData(true);
    try {
      await db.plans.save(plan);
      await loadAllUserData();
      setActiveTab('plans');
    } catch (err) {
      alert("Error al guardar la misión.");
    } finally {
      setIsFetchingData(false);
    }
  };

  const logout = async () => { 
    setIsLoading(true);
    await db.auth.signOut(); 
    setSession(null); 
    setData(null); 
    setIsLoading(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const workoutsGroupedByDate = useMemo(() => {
    if (!data) return {};
    const filtered = data.workouts.filter(w => filterType === 'all' || w.type === filterType);
    const groups: Record<string, Workout[]> = {};
    filtered.forEach(w => {
      const dateKey = new Date(w.date).toISOString().split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(w);
    });
    return groups;
  }, [data, filterType]);

  const sortedDates = Object.keys(workoutsGroupedByDate).sort((a, b) => b.localeCompare(a));

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="animate-spin text-cyan-400" size={48}/>
        <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] animate-pulse">Iniciando Terminal...</p>
      </div>
    );
  }

  if (!session) return <AuthForm onAuthSuccess={loadAllUserData} />;

  if (!data && isFetchingData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-cyan-400 gap-4">
        <Loader2 className="animate-spin" size={48}/>
        <p className="font-mono tracking-widest uppercase text-xs">Sincronizando Perfil...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <ProfileSetup 
        onSubmit={async (p) => { await db.profiles.create(p); await loadAllUserData(); }} 
        onLogout={logout}
        showCancel={false} 
      />
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 sidebar-custom z-50">
        <div className="p-6 flex items-center gap-3 border-b border-main">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center shadow-lg">
            <Activity className="text-white" size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter text-bright uppercase italic">Titan<span className="accent-color">Builder</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <p className="text-[10px] font-black text-dim tracking-[0.2em] mb-4 ml-4">OPERACIONES</p>
          <SidebarLink icon={<LayoutDashboard size={18}/>} label="PANEL DE CONTROL" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={<PlusCircle size={18}/>} label="REGISTRAR SESIÓN" active={activeTab === 'log'} onClick={() => { setEditingWorkout(null); setActiveTab('log'); }} />
          <SidebarLink icon={<Rocket size={18}/>} label="MISIONES (PLANES)" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
          <SidebarLink icon={<History size={18}/>} label="HISTORIAL" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          
          <div className="pt-8">
            <p className="text-[10px] font-black text-dim tracking-[0.2em] mb-4 ml-4">INTELIGENCIA</p>
            <SidebarLink icon={<Sparkles size={18}/>} label="ANALISTA IA" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          </div>
        </nav>

        <div className="p-4 border-t border-main">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-500/10 transition-all text-xs font-bold mb-4 border border-main">
            {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
            <span className="text-bright uppercase tracking-widest">{theme === 'dark' ? 'Modo Tradicional' : 'Modo Élite'}</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className="w-full flex items-center gap-3 mb-4 px-2 py-2 hover:bg-slate-500/10 rounded transition-all group">
            <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{backgroundColor: data.profile.avatarColor}}>{data.profile.name[0]}</div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-bright truncate group-hover:accent-color">{data.profile.name}</p>
              <p className="text-[10px] text-dim truncate uppercase tracking-tighter">PERFIL TITÁN</p>
            </div>
          </button>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-dim hover:text-red-500 transition-all uppercase tracking-widest">
            <LogOut size={14} /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between p-4 panel-custom sticky top-0 z-50">
        <h1 className="font-black tracking-tighter text-bright italic uppercase">Titan<span className="accent-color">Builder</span></h1>
        <div className="flex gap-2">
           <button onClick={toggleTheme} className="p-2 border border-main rounded-lg text-bright">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
           <button onClick={() => setActiveTab('profile')} className="w-10 h-10 rounded-lg panel-custom flex items-center justify-center accent-color shadow-sm"><User size={20}/></button>
        </div>
      </header>

      <main className="md:ml-64 p-4 md:p-8 animate-fade-in pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard data={data} onAddWeight={async (e) => { await db.weightHistory.add(e); loadAllUserData(); }} onViewHistory={() => setActiveTab('history')} />
        )}
        {activeTab === 'log' && (
          <WorkoutLogger 
            onSave={handleSaveWorkout} 
            editWorkout={editingWorkout} 
            onCancel={() => setActiveTab('history')} 
            activePlans={data.plans.filter(p => p.status === 'active')}
          />
        )}
        {activeTab === 'ai' && <AICoach data={data} />}
        {activeTab === 'plans' && <TrainingPlans data={data} onSavePlan={handleSavePlan} onDeletePlan={async (id) => { if(confirm('¿BORRAR ESTA MISIÓN?')){ await db.plans.delete(id); loadAllUserData(); }}} />}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-custom p-6 rounded-xl">
               <div>
                <h2 className="text-xl font-black text-bright flex items-center gap-2 tracking-tight uppercase"><History className="accent-color" size={20} /> Registro de Actividad</h2>
                <p className="text-xs text-dim mt-1 font-mono uppercase tracking-[0.2em]">Historial Operativo</p>
               </div>
               <div className="flex gap-2">
                 <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="bg-input-custom border border-main text-[10px] font-black px-4 py-2 rounded-lg text-bright outline-none focus:border-cyan-400 cursor-pointer uppercase">
                   <option value="all">Todas las Actividades</option>
                   <option value={SportType.Strength}>Fuerza</option>
                   <option value={SportType.GroupClass}>Clases Colectivas</option>
                   <option value={SportType.Running}>Carrera</option>
                   <option value={SportType.Swimming}>Natación</option>
                 </select>
               </div>
            </div>

            <div className="space-y-4">
              {sortedDates.map(dateKey => (
                <div key={dateKey} className="space-y-2">
                  <div className="bg-slate-500/10 px-4 py-2 border-l-4 border-main accent-color flex items-center gap-2">
                    <CalendarDays size={14} className="accent-color" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-dim">{new Date(dateKey + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                  </div>
                  {workoutsGroupedByDate[dateKey].map(w => (
                    <div key={w.id} className="panel-custom p-4 rounded-xl hover:border-accent transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                          w.type === SportType.Strength ? 'border-orange-500/50 text-orange-500' : 
                          w.type === SportType.GroupClass ? 'border-indigo-500/50 text-indigo-500' : 'accent-color border-main'
                        }`}>
                          {w.type === SportType.GroupClass ? <Users size={24} /> : <Activity size={24} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-bright tracking-tight uppercase">
                            {w.type === SportType.Strength ? 'Fuerza' : 
                             w.type === SportType.GroupClass ? 'Clase Colectiva' : 
                             w.type === SportType.Running ? 'Carrera' : 'Natación'}
                          </p>
                          <p className="text-[9px] font-mono text-dim uppercase">{new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          {w.planId && (
                            <div className="flex items-center gap-1 mt-1">
                              <Rocket size={10} className="accent-color" />
                              <span className="text-[8px] font-black accent-color uppercase tracking-widest">Misión Vinculada</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        {w.type === SportType.Strength && w.strengthData && (
                          <div className="flex flex-wrap gap-2">
                            {w.strengthData.map((s, idx) => (
                              <div key={idx} className={`bg-slate-500/5 border px-3 py-2 rounded-lg flex flex-col gap-1 ${s.isBiSet ? 'border-indigo-500/30' : 'border-main'}`}>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center justify-between gap-6">
                                    <span className="text-[10px] font-bold text-bright uppercase tracking-tighter">{s.exercise}</span>
                                    <span className="text-[10px] font-black accent-color">{s.sets}x{s.reps} @ {s.weight}kg</span>
                                  </div>
                                  {s.isBiSet && (
                                    <div className="border-t border-main pt-1 mt-1 flex items-center justify-between gap-6">
                                      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">{s.exercise2}</span>
                                      <span className="text-[10px] font-black text-orange-500">{s.sets2}x{s.reps2} @ {s.weight2}kg</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingWorkout(w); setActiveTab('log'); }} className="p-3 panel-custom hover:border-accent accent-color rounded-xl transition-all shadow-sm"><Settings size={18}/></button>
                        <button onClick={() => handleDeleteWorkout(w.id)} disabled={deletingId === w.id} className="p-3 panel-custom border-red-500/20 hover:border-red-500 text-red-500 rounded-xl transition-all shadow-sm flex items-center justify-center">
                          {deletingId === w.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18}/>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {isEditingProfile ? (
              <ProfileSetup 
                initialData={data.profile} 
                onSubmit={async (p) => { await db.profiles.update(p); loadAllUserData(); setIsEditingProfile(false); }} 
                onCancel={() => setIsEditingProfile(false)} 
                showCancel={true} 
              />
            ) : (
              <div className="panel-custom rounded-2xl overflow-hidden">
                <div className="h-2 w-full bg-accent"></div>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 border-4 border-main rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-xl" style={{backgroundColor: data.profile.avatarColor}}>{data.profile.name[0]}</div>
                        <div>
                          <h2 className="text-4xl font-black text-bright uppercase italic tracking-tighter">{data.profile.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                             <p className="text-[10px] font-mono text-dim uppercase tracking-widest">ESTADO: LISTO PARA ENTRENAR</p>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setIsEditingProfile(true)} className="p-4 panel-custom hover:border-accent accent-color transition-all rounded-xl"><Settings size={22} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ProfileValue label="Misión Principal" value={data.profile.goal} icon={<Target size={14}/>} />
                      <ProfileValue label="Estatura" value={`${data.profile.height} cm`} icon={<Ruler size={14}/>} />
                      <ProfileValue label="FCR" value={`${data.profile.restingHeartRate} ppm`} icon={<Activity size={14}/>} />
                      <ProfileValue label="Peso Inicial" value={`${data.profile.initialWeight} kg`} icon={<Scale size={14}/>} />
                    </div>
                    <button onClick={logout} className="mt-12 w-full panel-custom border-red-500/30 text-red-500 font-black py-4 rounded-xl text-[10px] tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all uppercase">DESCONECTAR TERMINAL</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 panel-custom border-t border-main px-4 py-4 flex justify-between items-center z-50 backdrop-blur-xl bg-opacity-80 overflow-x-auto gap-4">
        <NavButton icon={<LayoutDashboard />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavButton icon={<PlusCircle />} active={activeTab === 'log'} onClick={() => { setEditingWorkout(null); setActiveTab('log'); }} />
        <NavButton icon={<Rocket />} active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
        <NavButton icon={<History />} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <NavButton icon={<Sparkles />} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
      </nav>
    </div>
  );
};

const ProfileValue = ({ label, value, icon }: any) => (
  <div className="panel-custom bg-slate-500/5 p-5 rounded-xl group hover:border-accent transition-all">
    <div className="flex items-center gap-2 text-[9px] font-black text-dim uppercase tracking-widest mb-1 group-hover:accent-color transition-colors">{icon} {label}</div>
    <p className="text-xl font-black text-bright tracking-tighter uppercase truncate">{value}</p>
  </div>
);

const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-4 text-[11px] font-black tracking-[0.2em] transition-all rounded-xl ${active ? 'bg-accent text-white shadow-lg' : 'text-dim hover:text-bright hover:bg-slate-500/10'}`}>
    {icon} <span>{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`transition-all p-2 rounded-xl shrink-0 ${active ? 'accent-color bg-slate-500/10 scale-110 shadow-sm' : 'text-dim'}`}>
    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 24 }) : icon}
  </button>
);

export default App;
