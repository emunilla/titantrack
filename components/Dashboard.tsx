
import React, { useState } from 'react';
import { AppData, WeightEntry, SportType } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Activity, Plus, Calendar, Percent, ChevronRight, Users } from 'lucide-react';

interface Props {
  data: AppData;
  onAddWeight: (entry: WeightEntry) => void;
  onViewHistory: () => void;
}

const Dashboard: React.FC<Props> = ({ data, onAddWeight, onViewHistory }) => {
  const [showBiometricsForm, setShowBiometricsForm] = useState(false);
  const [newEntry, setNewEntry] = useState<WeightEntry>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    fatPercentage: 0,
    musclePercentage: 0
  });
  
  const lastEntry = data.weightHistory[data.weightHistory.length - 1];
  const lastWeight = lastEntry?.weight || 0;
  const recentWorkouts = data.workouts.slice(0, 5);

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.weight || newEntry.weight <= 0) {
      alert('El peso debe ser mayor a 0');
      return;
    }
    if (newEntry.fatPercentage < 0 || newEntry.fatPercentage > 100) {
      alert('El porcentaje de grasa debe estar entre 0 y 100');
      return;
    }
    if (newEntry.musclePercentage < 0 || newEntry.musclePercentage > 100) {
      alert('El porcentaje de músculo debe estar entre 0 y 100');
      return;
    }
    onAddWeight(newEntry);
    setShowBiometricsForm(false);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      fatPercentage: 0,
      musclePercentage: 0
    });
  };

  const chartData = data.weightHistory
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      weight: entry.weight || 0,
      fat: entry.fatPercentage || 0,
      muscle: entry.musclePercentage || 0
    }))
    .filter(entry => entry.weight > 0); // Solo mostrar entradas con peso válido

  const getWorkoutLabel = (w: any) => {
    switch (w.type) {
      case SportType.Strength: return 'Fuerza';
      case SportType.Running: return 'Carrera';
      case SportType.Swimming: return 'Natación';
      case SportType.GroupClass: return w.groupClassData?.classType || 'Clase Colectiva';
      default: return 'Actividad';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Peso Actual" value={`${lastWeight} KG`} icon={<Scale className="accent-color"/>} trend="SINC" />
        <StatCard label="Sesiones" value={data.workouts.length.toString()} icon={<Activity className="accent-color"/>} trend="HIST" onClick={onViewHistory} clickable />
        <StatCard label="% Grasa" value={lastEntry?.fatPercentage ? `${lastEntry.fatPercentage}%` : '--'} icon={<Percent className="text-orange-500"/>} />
        <StatCard label="% Músculo" value={lastEntry?.musclePercentage ? `${lastEntry.musclePercentage}%` : '--'} icon={<Activity className="text-emerald-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel-custom p-6 rounded-2xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="text-[10px] font-black text-dim tracking-[0.2em] uppercase">MÉTRICAS DE COMPOSICIÓN</h3>
            <button 
              onClick={() => setShowBiometricsForm(!showBiometricsForm)}
              className="bg-accent text-white text-[9px] font-black px-4 py-2 rounded-lg hover:brightness-110 transition-all uppercase tracking-widest flex items-center gap-2 shadow-md"
            >
              <Plus size={14}/> {showBiometricsForm ? 'Cerrar Registro' : 'Nueva Medición'}
            </button>
          </div>

          {showBiometricsForm && (
            <div className="mb-8 bg-card-inner border border-main p-6 rounded-xl animate-fade-in">
              <form onSubmit={handleEntrySubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-dim uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10}/> Fecha
                  </label>
                  <input 
                    type="date" 
                    value={newEntry.date} 
                    onChange={e => setNewEntry({...newEntry, date: e.target.value})} 
                    className="w-full bg-input-custom border border-main text-[10px] p-2 text-bright outline-none focus:border-accent rounded" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-dim uppercase tracking-widest flex items-center gap-1">
                    <Scale size={10}/> Peso (kg)
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="00.0" 
                    onChange={e => {
                      const val = e.target.value;
                      setNewEntry({...newEntry, weight: val === '' ? 0 : parseFloat(val) || 0});
                    }} 
                    className="w-full bg-input-custom border border-main text-[10px] p-2 accent-color outline-none focus:border-accent rounded" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-dim uppercase tracking-widest flex items-center gap-1">
                    <Percent size={10}/> % Grasa
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="00.0" 
                    onChange={e => {
                      const val = e.target.value;
                      setNewEntry({...newEntry, fatPercentage: val === '' ? 0 : parseFloat(val) || 0});
                    }} 
                    className="w-full bg-input-custom border border-main text-[10px] p-2 text-orange-500 outline-none focus:border-orange-500 rounded" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-dim uppercase tracking-widest flex items-center gap-1">
                    <Activity size={10}/> % Músculo
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="00.0" 
                    onChange={e => {
                      const val = e.target.value;
                      setNewEntry({...newEntry, musclePercentage: val === '' ? 0 : parseFloat(val) || 0});
                    }} 
                    className="w-full bg-input-custom border border-main text-[10px] p-2 text-emerald-500 outline-none focus:border-emerald-500 rounded" 
                  />
                </div>
                <button type="submit" className="md:col-span-4 bg-accent text-white py-3 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all rounded-lg shadow-lg">Sincronizar Biometría</button>
              </form>
            </div>
          )}

          <div className="h-64 min-h-[256px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-main)', fontSize: 9, fontWeight: 700}} />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '10px'}}
                    itemStyle={{fontWeight: 900}}
                    formatter={(value: any, name: string) => {
                      const labels: any = { weight: 'PESO (kg)', fat: 'GRASA (%)', muscle: 'MÚSCULO (%)' };
                      const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
                      return [numValue, labels[name] || name];
                    }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorAccent)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-dim text-xs uppercase tracking-widest">
                No hay datos para mostrar
              </div>
            )}
          </div>
        </div>

        <div className="panel-custom p-6 rounded-2xl">
          <h3 className="text-[10px] font-black text-dim tracking-[0.2em] uppercase mb-6">ACTIVIDAD RECIENTE</h3>
          <div className="space-y-4">
            {recentWorkouts.map(w => (
              <div key={w.id} onClick={onViewHistory} className="flex items-center justify-between border-b border-main pb-4 last:border-0 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-card-inner transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                    w.type === SportType.GroupClass ? 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5' : 'accent-color border-main group-hover:border-accent'
                  }`}>
                    {w.type === SportType.GroupClass ? <Users size={18}/> : <Activity size={18}/>}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-bright uppercase group-hover:accent-color transition-colors">
                      {getWorkoutLabel(w)}
                    </p>
                    <p className="text-[10px] font-mono text-dim uppercase">{new Date(w.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-dim group-hover:accent-color group-hover:translate-x-1 transition-all" />
              </div>
            ))}
            {recentWorkouts.length === 0 && (
              <div className="text-center py-10 opacity-30">
                <Activity size={32} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase">Sin datos registrados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, onClick, clickable }: any) => (
  <div 
    onClick={onClick}
    className={`panel-custom p-5 rounded-2xl relative overflow-hidden group transition-all ${clickable ? 'cursor-pointer hover:border-accent hover:shadow-lg' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 bg-card-inner border border-main rounded-xl accent-color transition-all`}>
        {icon}
      </div>
      {trend && <span className="text-[8px] font-black text-emerald-500 tracking-widest uppercase font-mono bg-emerald-500/10 px-2 py-0.5 rounded">{trend}</span>}
    </div>
    <p className="text-[10px] font-black text-dim uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-sm md:text-xl font-black text-bright tracking-tighter uppercase truncate">{value}</h4>
  </div>
);

export default Dashboard;
