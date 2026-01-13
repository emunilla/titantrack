import React, { useState, useEffect } from 'react';
import { SportType, Workout, StrengthSet } from '../types';
import { Plus, Trash2, Dumbbell, Timer, Navigation2, Waves, Calendar, X } from 'lucide-react';

interface Props {
  onSave: (workout: Workout) => void;
  editWorkout?: Workout | null;
  onCancel?: () => void;
}

const STANDARD_EXERCISES = [
  "Sentadilla con barra", "Press de banca", "Peso muerto", "Press militar", "Remo con barra", "Dominadas", "Jalón al pecho", "Face pull", "Remo con mancuerna", "Zancadas", "Press de banca inclinado", "Press con mancuernas", "Prensa de piernas", "Hip thrust", "Curl de bíceps", "Extensiones de tríceps", "Elevaciones laterales", "Press francés", "Remo en polea baja", "Aperturas con mancuernas", "Plancha abdominal", "Fondos en paralelas", "Sentadilla búlgara", "Extensiones de cuádriceps", "Curl femoral", "Elevación de talones", "Pec Deck"
];

const WorkoutLogger: React.FC<Props> = ({ onSave, editWorkout, onCancel }) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [type, setType] = useState<SportType>(SportType.Strength);
  const [strengthSets, setStrengthSets] = useState<StrengthSet[]>([{ exercise: '', sets: 4, reps: 10, weight: 20 }]);
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editWorkout) {
      setDate(new Date(editWorkout.date).toISOString().split('T')[0]);
      setType(editWorkout.type);
      setNotes(editWorkout.notes || '');
      if (editWorkout.strengthData) setStrengthSets(editWorkout.strengthData);
      if (editWorkout.cardioData) {
        setDistance(editWorkout.cardioData.distance.toString());
        setTime(editWorkout.cardioData.timeMinutes.toString());
        setHeartRate(editWorkout.cardioData.avgHeartRate?.toString() || '');
      }
    }
  }, [editWorkout]);

  const handleAddSet = () => setStrengthSets([...strengthSets, { exercise: '', sets: 4, reps: 10, weight: 20 }]);
  const handleRemoveSet = (index: number) => setStrengthSets(strengthSets.filter((_, i) => i !== index));
  const updateSet = (index: number, field: keyof StrengthSet, value: any) => {
    const newSets = [...strengthSets];
    newSets[index] = { ...newSets[index], [field]: value };
    setStrengthSets(newSets);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes());
    const workout: Workout = { id: editWorkout?.id || Math.random().toString(36).substr(2, 9), date: selectedDate.toISOString(), type, notes };
    if (type === SportType.Strength) {
      workout.strengthData = strengthSets.filter(s => s.exercise.trim() !== '');
    } else {
      workout.cardioData = { distance: parseFloat(distance) || 0, timeMinutes: parseFloat(time) || 0, avgHeartRate: heartRate ? parseInt(heartRate) : undefined };
    }
    onSave(workout);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">{editWorkout ? 'Editar Entrenamiento' : 'Registrar Entrenamiento'}</h2>
        {editWorkout && onCancel && (
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="max-w-xs">
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Calendar size={16} /> Fecha</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Tipo</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <TypeButton active={type === SportType.Strength} onClick={() => setType(SportType.Strength)} icon={<Dumbbell />} label="Fuerza" />
            <TypeButton active={type === SportType.Running} onClick={() => setType(SportType.Running)} icon={<Navigation2 />} label="Correr" />
            <TypeButton active={type === SportType.Swimming} onClick={() => setType(SportType.Swimming)} icon={<Waves />} label="Nadar" />
            <TypeButton active={type === SportType.Cycling} onClick={() => setType(SportType.Cycling)} icon={<Timer />} label="Ciclismo" />
          </div>
        </div>
        {type === SportType.Strength ? (
          <div className="space-y-4">
            <button type="button" onClick={handleAddSet} className="text-sm text-indigo-600 font-medium">+ Añadir Ejercicio</button>
            <datalist id="strength-exercises">{STANDARD_EXERCISES.map(ex => <option key={ex} value={ex} />)}</datalist>
            {strengthSets.map((set, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-4 border border-slate-100">
                <div className="flex gap-2">
                  <input list="strength-exercises" type="text" placeholder="Ejercicio" value={set.exercise} onChange={(e) => updateSet(idx, 'exercise', e.target.value)} className="flex-1 bg-white border border-slate-200 p-3 rounded-xl" />
                  <button type="button" onClick={() => handleRemoveSet(idx)} className="text-red-400 p-2"><Trash2 size={20} /></button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Series</label><input type="number" value={set.sets} onChange={(e) => updateSet(idx, 'sets', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl" /></div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Reps</label><input type="number" value={set.reps} onChange={(e) => updateSet(idx, 'reps', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl" /></div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-2">kg</label><input type="number" step="0.1" value={set.weight} onChange={(e) => updateSet(idx, 'weight', parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label={type === SportType.Swimming ? "Distancia (m)" : "Distancia (km)"} type="number" value={distance} onChange={setDistance} placeholder="" />
            <InputField label="Tiempo (min)" type="number" value={time} onChange={setTime} placeholder="" />
            <InputField label="FC Media" type="number" value={heartRate} onChange={setHeartRate} placeholder="" />
          </div>
        )}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl h-24 outline-none resize-none" placeholder="Notas..." />
        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Guardar Entrenamiento</button>
      </form>
    </div>
  );
};

const TypeButton = ({ active, onClick, icon, label }: any) => (
  <button type="button" onClick={onClick} className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}>{icon}<span className="text-xs font-semibold mt-1">{label}</span></button>
);
const InputField = ({ label, type, value, onChange }: any) => (
  <div><label className="block text-sm font-medium text-slate-600 mb-2">{label}</label><input type={type} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl" /></div>
);
export default WorkoutLogger;