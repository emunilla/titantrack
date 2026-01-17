
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Target, User, Scale, Sparkles, Ruler, Activity, X, Shield, ArrowRight, LogOut } from 'lucide-react';

interface Props {
  onSubmit: (profile: UserProfile) => void;
  onCancel?: () => void;
  onLogout?: () => void; // Nueva prop para cerrar sesión
  showCancel?: boolean;
  initialData?: UserProfile;
}

const AVATAR_COLORS = ['#06b6d4', '#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#f8fafc'];

const ProfileSetup: React.FC<Props> = ({ onSubmit, onCancel, onLogout, showCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [goal, setGoal] = useState(initialData?.goal || 'Ganar masa muscular');
  const [weight, setWeight] = useState(initialData?.initialWeight?.toString() || '');
  const [height, setHeight] = useState(initialData?.height?.toString() || '');
  const [rhr, setRhr] = useState(initialData?.restingHeartRate?.toString() || '');
  const [color, setColor] = useState(initialData?.avatarColor || AVATAR_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !weight || !height || !rhr) return;
    onSubmit({ 
      id: initialData?.id || Math.random().toString(36).substr(2, 9), 
      name, 
      goal, 
      initialWeight: parseFloat(weight), 
      height: parseFloat(height), 
      restingHeartRate: parseInt(rhr), 
      avatarColor: color 
    });
  };

  return (
    <div className={`${initialData ? 'w-full' : 'min-h-screen flex items-center justify-center p-4 bg-app-custom'}`}>
      <div className={`w-full max-w-md panel-custom p-8 rounded relative shadow-[var(--shadow)]`}>
        {showCancel && onCancel && (
          <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-dim hover:text-bright transition-all">
            <X size={20} />
          </button>
        )}
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded border-2 border-dashed border-main flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 rounded flex items-center justify-center shadow-lg" style={{ backgroundColor: color }}>
              <Sparkles className="text-black w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-bright uppercase tracking-tighter">
            {initialData ? 'Actualizar Perfil' : 'Configurar Perfil'}
          </h1>
          <p className="text-[10px] font-mono accent-color mt-1 uppercase tracking-widest">Protocolo de Identidad Titan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-dim uppercase tracking-widest ml-1">Color de Identidad</label>
            <div className="flex justify-between gap-2 p-3 bg-card-inner border border-main rounded">
              {AVATAR_COLORS.map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => setColor(c)} 
                  className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-[var(--accent)] scale-125' : 'border-transparent opacity-40 hover:opacity-100'}`} 
                  style={{ backgroundColor: c }} 
                />
              ))}
            </div>
          </div>

          <TechInput 
            label="Nombre / Alias" 
            placeholder="Introduce tu nombre..." 
            value={name} 
            onChange={setName} 
            icon={<User size={14}/>} 
          />

          <div className="grid grid-cols-2 gap-4">
            <TechInput 
              label="Peso Base (kg)" 
              placeholder="00.0" 
              type="number" 
              value={weight} 
              onChange={setWeight} 
              icon={<Scale size={14}/>} 
            />
            <TechInput 
              label="Altura (cm)" 
              placeholder="180" 
              type="number" 
              value={height} 
              onChange={setHeight} 
              icon={<Ruler size={14}/>} 
            />
          </div>

          <TechInput 
            label="Pulsaciones en Reposo" 
            placeholder="60" 
            type="number" 
            value={rhr} 
            onChange={setRhr} 
            icon={<Activity size={14}/>} 
          />

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Misión Estratégica</label>
            <select 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)} 
              className="w-full bg-input-custom border border-main text-xs font-bold p-4 text-bright outline-none focus:border-accent rounded uppercase tracking-widest"
            >
              <option>Ganar masa muscular</option>
              <option>Perder grasa corporal</option>
              <option>Mejorar resistencia</option>
              <option>Salud y Bienestar</option>
              <option>Desarrollar fuerza máxima</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-accent text-white font-black py-4 rounded text-xs tracking-[0.3em] shadow-[var(--shadow)] hover:opacity-90 transition-all uppercase flex items-center justify-center gap-2">
            {initialData ? 'Sincronizar Datos' : 'Registrar Perfil'} <ArrowRight size={16}/>
          </button>
        </form>

        {!initialData && onLogout && (
          <button 
            onClick={onLogout}
            className="mt-6 w-full flex items-center justify-center gap-2 text-[10px] font-black text-dim hover:text-red-500 transition-all uppercase tracking-widest"
          >
            <LogOut size={14} /> Volver al acceso (Cerrar Sesión)
          </button>
        )}
      </div>
    </div>
  );
};

const TechInput = ({ label, placeholder, value, onChange, icon, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-dim uppercase tracking-widest ml-1 flex items-center gap-2">
      {icon} {label}
    </label>
    <input 
      type={type} 
      required 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full bg-input-custom border border-main p-4 text-xs font-bold text-bright outline-none focus:border-accent rounded placeholder:opacity-60 uppercase" 
    />
  </div>
);

export default ProfileSetup;
