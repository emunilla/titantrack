import React, { useState } from 'react';
import { AppData, WeightEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Scale, Activity, Flame, ChevronRight, Calendar } from 'lucide-react';

interface Props {
  data: AppData;
  onAddWeight: (entry: WeightEntry) => void;
  onViewHistory: () => void;
}

const Dashboard: React.FC<Props> = ({ data, onAddWeight, onViewHistory }) => {
  const today = new Date().toISOString().split('T')[0];
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(today);
  
  const lastWeight = data.weightHistory[data.weightHistory.length - 1]?.weight || 0;
  const recentWorkouts = data.workouts.slice(0, 5);

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !weightDate) return;
    onAddWeight({
      date: weightDate,
      weight: parseFloat(newWeight)
    });
    setNewWeight('');
    setWeightDate(today);
  };

  const chartData = data.weightHistory
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      weight: entry.weight
    }));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Hola, {data.profile.name} 👋</h2>
        <p className="text-slate-500">Tu progreso semanal de un vistazo.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Scale className="text-blue-500" />} label="Peso Actual" value={`${lastWeight} kg`} sub="Último registro" />
        
        <button 
          onClick={onViewHistory}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-indigo-300 transition-all hover:shadow-md group"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition-colors">
              <Activity className="text-indigo-500" />
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Entrenamientos</p>
          <h4 className="text-2xl font-bold text-slate-800 mt-1">{data.workouts.length.toString()}</h4>
          <p className="text-xs text-indigo-400 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Ver historial completo</p>
        </button>

        <StatCard icon={<TrendingUp className="text-emerald-500" />} label="Objetivo" value={data.profile.goal} sub="Fuerza y Salud" />
        <StatCard icon={<Flame className="text-orange-500" />} label="Racha" value="3 días" sub="¡Sigue así!" />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold">Seguimiento de Peso</h3>
          <form onSubmit={handleWeightSubmit} className="flex flex-wrap items-center gap-2">
            <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} className="px-3 py-1 text-sm border border-slate-200 rounded-lg outline-none bg-slate-50" />
            <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="kg" className="w-20 px-3 py-1 text-sm border border-slate-200 rounded-lg outline-none" />
            <button type="submit" className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-700 font-bold transition-colors">REGISTRAR</button>
          </form>
        </div>
        <div className="h-64 w-full">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <Scale size={40} className="opacity-20" />
              <p>Necesitas al menos 2 registros de peso para ver el gráfico.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
          <button onClick={onViewHistory} className="text-xs text-indigo-600 font-bold hover:underline">Ver todo</button>
        </div>
        <div className="space-y-4">
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map((w) => (
              <div key={w.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={onViewHistory}>
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Activity size={20} className="text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{w.type}</p>
                  <p className="text-sm text-slate-500">{new Date(w.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600">Completado</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 py-4 italic">No hay entrenamientos registrados aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, sub: string }> = ({ icon, label, value, sub }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 rounded-lg bg-slate-50">{icon}</div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
    <p className="text-xs text-slate-400 mt-1">{sub}</p>
  </div>
);

export default Dashboard;