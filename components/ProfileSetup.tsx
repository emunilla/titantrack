import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Target, User, Scale, Sparkles, Ruler, Activity, X } from 'lucide-react';

interface Props {
  onSubmit: (profile: UserProfile) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const AVATAR_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ProfileSetup: React.FC<Props> = ({ onSubmit, onCancel, showCancel }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('Ganar masa muscular');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [rhr, setRhr] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !weight || !height || !rhr) return;
    onSubmit({ id: Math.random().toString(36).substr(2, 9), name, goal, initialWeight: parseFloat(weight), height: parseFloat(height), restingHeartRate: parseInt(rhr), avatarColor: color });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200 relative">
        {showCancel && onCancel && (<button onClick={onCancel} className="absolute top-6 right-6 p-2 text-slate-400"><X size={20} /></button>)}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: color }}><Sparkles className="text-white w-8 h-8" /></div>
          <h1 className="text-2xl font-bold text-slate-800">Tu Perfil Titan</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between gap-2 mb-4">{AVATAR_COLORS.map(c => (<button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-4 ${color === c ? 'border-indigo-200 scale-110' : 'border-transparent opacity-60'}`} style={{ backgroundColor: c }} />))}</div>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Nombre" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="0.1" required value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Peso (kg)" />
            <input type="number" required value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Altura (cm)" />
          </div>
          <input type="number" required value={rhr} onChange={(e) => setRhr(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Pulsaciones Reposo" />
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200">
            <option>Ganar masa muscular</option><option>Perder grasa</option><option>Mejorar resistencia</option><option>Salud</option>
          </select>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4">Registrar Perfil</button>
        </form>
      </div>
    </div>
  );
};
export default ProfileSetup;