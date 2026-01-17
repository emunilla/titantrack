
import React, { useState, useEffect, useMemo } from 'react';
import { AppData, SportType, Workout, UserProfile, TrainingPlan, StrengthSet } from './types';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import AICoach from './components/AICoach';
import ProfileSetup from './components/ProfileSetup';
import AuthForm from './components/AuthForm';
import TrainingPlans from './components/TrainingPlans';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import { db, supabase } from './services/supabaseClient';
import { 
  LayoutDashboard, PlusCircle, Sparkles, User, History, 
  Activity, Target, LogOut, Loader2, CalendarDays, Trash2, Settings,
  Scale, Moon, Sun, Ruler, Users, Rocket, Database, Copy, ShieldCheck,
  ChevronDown, ChevronUp, Clock, Map, Heart, StickyNote, Dumbbell, Layers
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'ai' | 'profile' | 'history' | 'plans'>('dashboard');
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [filterType, setFilterType] = useState<SportType | 'all'>('all');
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadAllUserData();
      else { setData(null); setIsLoading(false); }
    });

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
    setMissingTables([]);
    try {
      const profile = await db.profiles.getMyProfile();
      if (!profile) { 
        setData(null); setIsLoading(false); setIsFetchingData(false); return; 
      }
      
      const [workouts, weightHistory, plans] = await Promise.all([
        db.workouts.getMyWorkouts(),
        db.weightHistory.getMyHistory(),
        db.plans.getMyPlans()
      ]);

      setData({
        profile: {
          id: profile.id, 
          name: profile.name, 
          goal: profile.goal, 
          initialWeight: profile.initial_weight,
          height: profile.height, 
          restingHeartRate: profile.resting_heart_rate, 
          // Fix: Changed avatar_color to avatarColor to match UserProfile interface
          avatarColor: profile.avatar_color
        },
        workouts: workouts.map((w: any) => ({
          id: w.id, date: w.date, type: w.type as SportType, strengthData: w.strength_data,
          cardioData: w.cardio_data, groupClassData: w.group_class_data, notes: w.notes, planId: w.plan_id
        })),
        weightHistory,
        plans
      });
    } catch (err: any) {
      if (err.message?.includes('TABLE_MISSING')) {
        const tableName = err.message.split(':')[1];
        setMissingTables(prev => [...new Set([...prev, tableName])]);
      }
      console.error("Error cargando datos:", err);
    } finally {
      setIsFetchingData(false);
      setIsLoading(false);
    }
  };

  const handleSaveWorkout = async (workout: Workout) => {
    setIsFetchingData(true);
    try {
      const isNew = workout.id.length < 15;
      await db.workouts.save({
        id: isNew ? undefined : workout.id,
        date: workout.date,
        type: workout.type,
        strength_data: workout.strengthData,
        cardio_data: workout.cardioData,
        group_class_data: workout.groupClassData,
        notes: workout.notes,
        plan_id: workout.planId
      });
      await loadAllUserData();
      setEditingWorkout(null);
      setActiveTab('history');
      success(isNew ? 'Sesión registrada exitosamente' : 'Sesión actualizada');
    } catch (err: any) {
      showError(err.message || "Error al guardar. Verifica la estructura de las tablas en Supabase.");
    } finally { setIsFetchingData(false); }
  };

  const logout = async () => { 
    setIsLoading(true);
    await db.auth.signOut(); 
    setSession(null); setData(null); setIsLoading(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedWorkouts(newExpanded);
  };

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

  const SQL_SETUP = `-- ESQUEMA COMPLETO PARA TITAN BUILDER
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. TABLA DE PERFILES (Vinculada a Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  goal text,
  initial_weight double precision,
  height double precision,
  resting_heart_rate integer,
  avatar_color text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. TABLA DE PLANES (Misiones)
CREATE TABLE IF NOT EXISTS public.training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  objective text,
  frequency integer,
  duration_weeks integer,
  schedule text,
  time_per_session integer,
  status text DEFAULT 'active',
  content jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. TABLA DE ENTRENAMIENTOS
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.training_plans(id) ON DELETE SET NULL,
  date timestamp with time zone NOT NULL,
  type text NOT NULL,
  strength_data jsonb,
  cardio_data jsonb,
  group_class_data jsonb,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. TABLA DE PESO (Historial)
CREATE TABLE IF NOT EXISTS public.weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  weight double precision NOT NULL,
  fat_percentage double precision,
  muscle_percentage double precision,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. SEGURIDAD DE FILA (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS PRIVADAS
CREATE POLICY "RLS_Profiles" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "RLS_Plans" ON training_plans FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "RLS_Workouts" ON workouts FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "RLS_Weight" ON weight_history FOR ALL USING (auth.uid() = profile_id);`;

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="animate-spin text-cyan-400" size={48}/>
        <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] animate-pulse">Iniciando Terminal...</p>
      </div>
    );
  }

  if (!session) return <AuthForm onAuthSuccess={loadAllUserData} />;

  if (missingTables.length > 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full panel-custom p-10 rounded-3xl border-amber-500/50 shadow-[0_0_100px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-amber-500 text-black rounded-2xl shadow-lg"><Database size={32}/></div>
            <div>
              <h2 className="text-3xl font-black text-bright uppercase tracking-tighter italic">Infraestructura Vacía</h2>
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mt-1">Sincronización de Base de Datos requerida</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
             <div className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
               <ShieldCheck className="text-amber-500 shrink-0" size={20} />
               <p className="text-xs text-dim leading-relaxed uppercase">
                 Por seguridad, <span className="text-bright font-bold">debes crear las tablas tú mismo</span> desde el panel de Supabase. El frontend no tiene permisos para modificar tu estructura de datos remota.
               </p>
             </div>
             
             <div className="panel-custom p-6 bg-slate-900 rounded-xl">
               <ol className="text-[10px] text-dim space-y-3 font-bold uppercase tracking-widest">
                 <li className="flex gap-3"><span className="text-amber-500">01.</span> Entra en tu proyecto de Supabase.</li>
                 <li className="flex gap-3"><span className="text-amber-500">02.</span> Ve a "SQL Editor" en el menú izquierdo.</li>
                 <li className="flex gap-3"><span className="text-amber-500">03.</span> Pega el código de abajo y pulsa "Run".</li>
               </ol>
             </div>
          </div>

          <div className="relative bg-black rounded-xl p-6 mb-8 border border-main group max-h-[250px] overflow-y-auto">
            <button 
              onClick={() => { navigator.clipboard.writeText(SQL_SETUP); success("SQL copiado al portapapeles"); }}
              className="sticky top-0 float-right p-3 bg-accent text-white rounded-xl shadow-xl z-20 hover:scale-105 transition-all"
              title="Copiar Script SQL"
            >
              <Copy size={18}/>
            </button>
            <pre className="text-[11px] font-mono text-cyan-400 whitespace-pre-wrap leading-relaxed">
              {SQL_SETUP}
            </pre>
          </div>

          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="flex-1 bg-accent text-white font-black py-5 rounded-2xl text-xs tracking-widest uppercase shadow-xl hover:brightness-110 transition-all">He ejecutado el script, reintentar</button>
            <button onClick={logout} className="px-8 panel-custom text-red-500 font-black text-[10px] tracking-widest uppercase rounded-2xl hover:bg-red-500/10 transition-all">Salir</button>
          </div>
        </div>
      </div>
    );
  }

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
          <SidebarLink icon={<LayoutDashboard size={18}/>} label="PANEL DE CONTROL" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={<PlusCircle size={18}/>} label="REGISTRAR SESIÓN" active={activeTab === 'log'} onClick={() => { setEditingWorkout(null); setActiveTab('log'); }} />
          <SidebarLink icon={<Rocket size={18}/>} label="MISIONES" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
          <SidebarLink icon={<History size={18}/>} label="HISTORIAL" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <SidebarLink icon={<Sparkles size={18}/>} label="ANALISTA IA" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
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
        {activeTab === 'ai' && <AICoach data={data} onError={showError} />}
        {activeTab === 'plans' && <TrainingPlans data={data} onSavePlan={async (p) => { await db.plans.save(p); await loadAllUserData(); setActiveTab('plans'); success('Misión guardada exitosamente'); }} onDeletePlan={async (id) => { if(confirm('¿BORRAR ESTA MISIÓN?')){ await db.plans.delete(id); loadAllUserData(); success('Misión eliminada'); }}} onError={showError} />}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-custom p-6 rounded-xl">
               <div>
                <h2 className="text-xl font-black text-bright flex items-center gap-2 tracking-tight uppercase"><History className="accent-color" size={20} /> Historial</h2>
                <p className="text-xs text-dim mt-1 font-mono uppercase tracking-[0.2em]">Operaciones Registradas</p>
               </div>
               <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="bg-input-custom border border-main text-[10px] font-black px-4 py-2 rounded-lg text-bright outline-none focus:border-cyan-400 cursor-pointer uppercase">
                 <option value="all">Todas las Actividades</option>
                 <option value={SportType.Strength}>Fuerza</option>
                 <option value={SportType.GroupClass}>Clases Colectivas</option>
                 <option value={SportType.Running}>Carrera</option>
                 <option value={SportType.Swimming}>Natación</option>
               </select>
            </div>
            <div className="space-y-4">
              {sortedDates.map(dateKey => (
                <div key={dateKey} className="space-y-2">
                  <div className="bg-slate-500/10 px-4 py-2 border-l-4 border-main flex items-center gap-2">
                    <CalendarDays size={14} className="accent-color" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-dim">{new Date(dateKey + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                  </div>
                  {workoutsGroupedByDate[dateKey].map(w => {
                    const isExpanded = expandedWorkouts.has(w.id);
                    return (
                      <div key={w.id} className={`panel-custom rounded-xl transition-all flex flex-col overflow-hidden border ${isExpanded ? 'border-accent shadow-lg bg-slate-500/5' : 'hover:border-accent border-main'}`}>
                        <div 
                          onClick={() => toggleExpand(w.id)}
                          className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 min-w-[200px]">
                            <div className="w-10 h-10 rounded-xl border border-main flex items-center justify-center accent-color">
                              {w.type === SportType.GroupClass ? <Users size={20} /> : <Activity size={20} />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-bright uppercase group-hover:accent-color transition-colors">
                                {w.type === SportType.GroupClass ? w.groupClassData?.classType || 'Clase Colectiva' : w.type}
                              </p>
                              <p className="text-[9px] font-mono text-dim uppercase">{new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             {/* Mini métricas rápidas */}
                             <div className="hidden md:flex gap-4 mr-4">
                               {w.cardioData && (
                                 <span className="text-[9px] font-mono text-dim uppercase">{w.cardioData.distance}KM / {w.cardioData.timeMinutes}MIN</span>
                               )}
                               {w.strengthData && (
                                 <span className="text-[9px] font-mono text-dim uppercase">{w.strengthData.length} BLOQUES</span>
                               )}
                             </div>

                             <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setEditingWorkout(w); setActiveTab('log'); }} className="p-3 panel-custom accent-color rounded-xl hover:bg-slate-500/10 transition-all"><Settings size={18}/></button>
                                <button onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if(confirm('¿BORRAR ESTA SESIÓN?')) { 
                                    db.workouts.delete(w.id)
                                      .then(() => { loadAllUserData(); success('Sesión eliminada'); })
                                      .catch((err: any) => showError(err.message || 'Error al eliminar'));
                                  }
                                }} className="p-3 panel-custom text-red-500 rounded-xl hover:bg-red-500/10 transition-all"><Trash2 size={18}/></button>
                                <div className="ml-2 text-dim">
                                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                             </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-6 pb-6 pt-2 animate-fade-in border-t border-main/50 space-y-6">
                            {/* Detalle de Fuerza */}
                            {w.type === SportType.Strength && w.strengthData && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {w.strengthData.map((set, sIdx) => (
                                  <div key={sIdx} className={`p-4 rounded-xl border flex flex-col gap-3 group transition-all ${set.isBiSet ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-black/40 border-main/50'}`}>
                                    {/* Ejercicio A */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${set.isBiSet ? 'bg-indigo-500/10 text-indigo-400' : 'bg-accent/10 text-accent'}`}>
                                          {set.isBiSet ? <Layers size={16} /> : <Dumbbell size={16} />}
                                        </div>
                                        <div>
                                          <p className="text-[11px] font-black text-bright uppercase">
                                            {set.isBiSet ? 'A: ' : ''}{set.exercise}
                                          </p>
                                          <p className="text-[9px] text-dim font-mono">{set.sets} SERIES × {set.reps} REPS</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-black text-bright">{set.weight} KG</p>
                                        <p className="text-[8px] font-mono text-dim uppercase">CARGA</p>
                                      </div>
                                    </div>

                                    {/* Ejercicio B si es BiSet */}
                                    {set.isBiSet && (
                                      <div className="pt-3 border-t border-indigo-500/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <div className="text-[10px] font-black">B</div>
                                          </div>
                                          <div>
                                            <p className="text-[11px] font-black text-bright uppercase">
                                              {set.exercise2 || 'EJERCICIO B'}
                                            </p>
                                            <p className="text-[9px] text-dim font-mono">{set.sets} SERIES × {set.reps2 || set.reps} REPS</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-black text-bright">{set.weight2 || set.weight} KG</p>
                                          <p className="text-[8px] font-mono text-dim uppercase">CARGA</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Detalle de Cardio */}
                            {(w.type === SportType.Running || w.type === SportType.Swimming || w.type === SportType.Cycling) && w.cardioData && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricDetail label="Distancia" value={`${w.cardioData.distance} km`} icon={<Map size={14}/>} />
                                <MetricDetail label="Duración" value={`${w.cardioData.timeMinutes} min`} icon={<Clock size={14}/>} />
                                {w.cardioData.avgHeartRate && <MetricDetail label="Pulsaciones" value={`${w.cardioData.avgHeartRate} ppm`} icon={<Heart size={14}/>} />}
                                {w.cardioData.pace && <MetricDetail label="Ritmo Medio" value={w.cardioData.pace} icon={<Activity size={14}/>} />}
                              </div>
                            )}

                            {/* Detalle de Clase Colectiva */}
                            {w.type === SportType.GroupClass && w.groupClassData && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <MetricDetail label="Tipo de Clase" value={w.groupClassData.classType} icon={<Users size={14}/>} />
                                <MetricDetail label="Duración" value={`${w.groupClassData.timeMinutes} min`} icon={<Clock size={14}/>} />
                                {w.groupClassData.avgHeartRate && <MetricDetail label="Pulsaciones" value={`${w.groupClassData.avgHeartRate} ppm`} icon={<Heart size={14}/>} />}
                              </div>
                            )}

                            {/* Notas */}
                            {w.notes && (
                              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">
                                  <StickyNote size={12} /> Observaciones Operativas
                                </div>
                                <p className="text-xs text-bright leading-relaxed whitespace-pre-wrap">{w.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                             <p className="text-[10px] font-mono text-dim uppercase tracking-widest">ESTADO: ONLINE</p>
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
                    <button onClick={logout} className="mt-12 w-full panel-custom border-red-500/30 text-red-500 font-black py-4 rounded-xl text-[10px] tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all uppercase">DESCONECTAR</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 panel-custom border-t border-main px-4 py-4 flex justify-between items-center z-50 backdrop-blur-xl bg-opacity-80 gap-4">
        <NavButton icon={<LayoutDashboard />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavButton icon={<PlusCircle />} active={activeTab === 'log'} onClick={() => { setEditingWorkout(null); setActiveTab('log'); }} />
        <NavButton icon={<Rocket />} active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
        <NavButton icon={<History />} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <NavButton icon={<Sparkles />} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
      </nav>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

const MetricDetail = ({ label, value, icon }: any) => (
  <div className="bg-black/20 p-3 rounded-lg border border-main/30">
    <div className="flex items-center gap-2 text-[8px] font-black text-dim uppercase tracking-widest mb-1">
      {icon} {label}
    </div>
    <p className="text-xs font-black text-bright uppercase">{value}</p>
  </div>
);

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
