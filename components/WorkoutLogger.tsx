
import React, { useState, useEffect } from 'react';
import { SportType, Workout, StrengthSet, TrainingPlan, IndividualSet } from '../types';
import { Plus, Trash2, X, Save, Layers, Rocket, Dumbbell, Flame, Zap, Search, Image as ImageIcon, Users, Activity } from 'lucide-react';

interface Props {
  onSave: (workout: Workout) => void;
  editWorkout?: Workout | null;
  onCancel: () => void;
  activePlans?: TrainingPlan[];
}

const GROUP_CLASSES = ["Total Body", "GAP", "Strength", "Dumbbells", "Pilates", "Yoga", "Cross Fit", "Bike"];

// Base de datos de ejercicios con imágenes (usando placeholders por ahora)
const EXERCISES_DB: Array<{name: string, image?: string, category: string}> = [
  // Piernas
  { name: "Sentadilla con Barra", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Sentadilla Búlgara", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Prensa de Piernas", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Extensiones de Cuádriceps", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Curl Femoral", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Peso Muerto Convencional", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Peso Muerto Rumano", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Hip Thrust", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Zancadas (Lunges)", category: "Piernas", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  // Pecho
  { name: "Press de Banca", category: "Pecho", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Press Inclinado con Mancuernas", category: "Pecho", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Aperturas (Flyes)", category: "Pecho", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Fondos (Dips)", category: "Pecho", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  // Hombros
  { name: "Press Militar", category: "Hombros", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Elevaciones Laterales", category: "Hombros", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Face Pulls", category: "Hombros", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Pájaros (Rear Delt)", category: "Hombros", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  // Espalda
  { name: "Dominadas", category: "Espalda", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Jalón al Pecho", category: "Espalda", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Remo con Barra", category: "Espalda", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Remo en Polea Baja", category: "Espalda", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Remo con Mancuerna", category: "Espalda", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  // Brazos
  { name: "Curl de Bíceps con Barra", category: "Brazos", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Curl Martillo", category: "Brazos", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Press Francés", category: "Brazos", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Extensiones de Tríceps", category: "Brazos", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  // Core
  { name: "Plancha Abdominal", category: "Core", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Rueda Abdominal", category: "Core", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
  { name: "Elevación de Piernas", category: "Core", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" }
];

const COMMON_EXERCISES = EXERCISES_DB.map(ex => ex.name);

const WorkoutLogger: React.FC<Props> = ({ onSave, editWorkout, onCancel, activePlans = [] }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<SportType>(SportType.Strength);
  const [strengthSets, setStrengthSets] = useState<StrengthSet[]>([{ exercise: '', individualSets: [{ reps: 10, weight: 20, type: 'work' }], isBiSet: false }]);
  const [showExerciseSelector, setShowExerciseSelector] = useState<number | string | null>(null);
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [calories, setCalories] = useState('');
  const [selectedClass, setSelectedClass] = useState(GROUP_CLASSES[0]);
  const [notes, setNotes] = useState('');
  const [planId, setPlanId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (editWorkout) {
      setDate(new Date(editWorkout.date).toISOString().split('T')[0]);
      setType(editWorkout.type);
      setNotes(editWorkout.notes || '');
      setPlanId(editWorkout.planId);
      if (editWorkout.strengthData) setStrengthSets(editWorkout.strengthData);
      if (editWorkout.cardioData) {
        setDistance(editWorkout.cardioData.distance.toString());
        setTime(editWorkout.cardioData.timeMinutes.toString());
        setHeartRate(editWorkout.cardioData.avgHeartRate?.toString() || '');
        setCalories(editWorkout.cardioData.calories?.toString() || '');
      }
      if (editWorkout.groupClassData) {
        setSelectedClass(editWorkout.groupClassData.classType);
        setTime(editWorkout.groupClassData.timeMinutes.toString());
        setHeartRate(editWorkout.groupClassData.avgHeartRate?.toString() || '');
        setCalories(editWorkout.groupClassData.calories?.toString() || '');
      }
    }
  }, [editWorkout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (type === SportType.Strength) {
      const validSets = strengthSets.filter(s => s.exercise.trim() !== '');
      if (validSets.length === 0) {
        alert('Agrega al menos un ejercicio de fuerza');
        return;
      }
      // Validar series individuales
      const invalidSet = validSets.find(set => {
        if (set.individualSets && set.individualSets.length > 0) {
          return set.individualSets.some(individualSet => 
            individualSet.reps <= 0 || individualSet.weight < 0
          );
        }
        // Compatibilidad con formato antiguo
        if (set.sets && set.reps && set.weight) {
          return set.sets <= 0 || set.reps <= 0 || set.weight < 0;
        }
        return true; // Sin series
      });
      if (invalidSet) {
        alert(`El ejercicio "${invalidSet.exercise}" tiene valores inválidos. Las repeticiones y el peso deben ser mayores a 0.`);
        return;
      }
    } else if (type === SportType.GroupClass) {
      if (!time || parseFloat(time) <= 0) {
        alert('La duración debe ser mayor a 0 minutos');
        return;
      }
    } else {
      if (!distance || parseFloat(distance) <= 0) {
        alert('La distancia debe ser mayor a 0 km');
        return;
      }
      if (!time || parseFloat(time) <= 0) {
        alert('La duración debe ser mayor a 0 minutos');
        return;
      }
    }

    const workout: Workout = { 
      id: editWorkout?.id || Math.random().toString(36).substr(2, 9), 
      date: new Date(date).toISOString(), type, notes, planId 
    };

    if (type === SportType.Strength) {
      // Filtrar ejercicios válidos y convertir formato antiguo si es necesario
      workout.strengthData = strengthSets
        .filter(s => s.exercise.trim() !== '')
        .map(s => {
          // Si tiene individualSets, usarlo; si no, convertir formato antiguo
          if (!s.individualSets && s.sets && s.reps && s.weight) {
            // Convertir formato antiguo a nuevo
            const individualSets: IndividualSet[] = [];
            for (let i = 0; i < s.sets; i++) {
              individualSets.push({ reps: s.reps!, weight: s.weight!, type: 'work' });
            }
            return { ...s, individualSets };
          }
          return s;
        });
    } else if (type === SportType.GroupClass) {
      workout.groupClassData = { 
        classType: selectedClass, 
        timeMinutes: parseFloat(time) || 0, 
        avgHeartRate: heartRate ? parseInt(heartRate) : undefined,
        calories: calories ? parseInt(calories) : undefined
      };
    } else {
      workout.cardioData = { 
        distance: parseFloat(distance) || 0, 
        timeMinutes: parseFloat(time) || 0, 
        avgHeartRate: heartRate ? parseInt(heartRate) : undefined,
        calories: calories ? parseInt(calories) : undefined
      };
    }
    onSave(workout);
  };

  const updateSet = (idx: number, updates: Partial<StrengthSet>) => {
    const newSets = [...strengthSets];
    newSets[idx] = { ...newSets[idx], ...updates };
    setStrengthSets(newSets);
  };

  const addIndividualSet = (exerciseIdx: number, isExercise2: boolean = false) => {
    const newSets = [...strengthSets];
    const set = newSets[exerciseIdx];
    const newIndividualSet: IndividualSet = { reps: 10, weight: 20, type: 'work' };
    
    if (isExercise2) {
      if (!set.individualSets2) set.individualSets2 = [];
      set.individualSets2 = [...set.individualSets2, newIndividualSet];
    } else {
      if (!set.individualSets) set.individualSets = [];
      set.individualSets = [...set.individualSets, newIndividualSet];
    }
    setStrengthSets(newSets);
  };

  const updateIndividualSet = (exerciseIdx: number, setIdx: number, updates: Partial<IndividualSet>, isExercise2: boolean = false) => {
    const newSets = [...strengthSets];
    const set = newSets[exerciseIdx];
    
    if (isExercise2 && set.individualSets2) {
      set.individualSets2[setIdx] = { ...set.individualSets2[setIdx], ...updates };
    } else if (set.individualSets) {
      set.individualSets[setIdx] = { ...set.individualSets[setIdx], ...updates };
    }
    setStrengthSets(newSets);
  };

  const removeIndividualSet = (exerciseIdx: number, setIdx: number, isExercise2: boolean = false) => {
    const newSets = [...strengthSets];
    const set = newSets[exerciseIdx];
    
    if (isExercise2 && set.individualSets2) {
      set.individualSets2 = set.individualSets2.filter((_, i) => i !== setIdx);
    } else if (set.individualSets) {
      set.individualSets = set.individualSets.filter((_, i) => i !== setIdx);
    }
    setStrengthSets(newSets);
  };

  const toggleBiSet = (idx: number) => {
    const newSets = [...strengthSets];
    const isBiSet = !newSets[idx].isBiSet;
    newSets[idx] = { 
      ...newSets[idx], 
      isBiSet,
      exercise2: isBiSet ? '' : undefined,
      individualSets2: isBiSet ? [] : undefined
    };
    setStrengthSets(newSets);
  };

  const getExerciseImage = (exerciseName: string) => {
    const exercise = EXERCISES_DB.find(ex => ex.name === exerciseName);
    return exercise?.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop';
  };

  return (
    <div className="max-w-4xl mx-auto panel-custom p-6 md:p-8 rounded-2xl animate-fade-in shadow-2xl">
      {/* Lista de sugerencias global para los inputs */}
      <datalist id="exercise-list">
        {COMMON_EXERCISES.map(ex => <option key={ex} value={ex} />)}
      </datalist>

      <div className="flex justify-between items-center mb-10 pb-4 border-b border-main">
        <div>
          <h2 className="text-xl font-black text-bright tracking-tighter uppercase">{editWorkout ? 'Ajustar Sesión' : 'Nueva Sesión Operativa'}</h2>
          <p className="text-[9px] font-mono accent-color mt-1 uppercase tracking-widest">SISTEMA: ENTRADA DE DATOS</p>
        </div>
        <button type="button" onClick={onCancel} className="p-3 panel-custom hover:border-red-500 hover:text-red-500 transition-all text-dim rounded-xl"><X size={20}/></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Vincular Misión (Opcional)</label>
            <div className="relative">
              <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 accent-color" size={16} />
              <select 
                value={planId || ''} 
                onChange={(e) => setPlanId(e.target.value || undefined)}
                className="w-full bg-input-custom border border-main pl-12 pr-4 py-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent appearance-none uppercase"
              >
                <option value="">Sesión Independiente</option>
                {activePlans.filter(p => p.type === type).map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-input-custom border border-main p-4 text-bright font-bold outline-none focus:border-accent rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Modalidad</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <ModalButton active={type === SportType.Strength} onClick={() => { setType(SportType.Strength); setCalories(''); }} label="FUERZA" icon={<Dumbbell size={16} />} />
            <ModalButton active={type === SportType.GroupClass} onClick={() => { setType(SportType.GroupClass); setCalories(''); }} label="CLASE" icon={<Users size={16} />} />
            <ModalButton active={type === SportType.Running} onClick={() => { setType(SportType.Running); setCalories(''); }} label="CARRERA" icon={<Zap size={16} />} />
            <ModalButton active={type === SportType.Swimming} onClick={() => { setType(SportType.Swimming); setCalories(''); }} label="NATACIÓN" icon={<Activity size={16} />} />
          </div>
        </div>

        {type === SportType.Strength && (
          <div className="space-y-6">
            {strengthSets.map((set, idx) => {
              const individualSets = set.individualSets || [];
              const individualSets2 = set.individualSets2 || [];
              
              return (
                <div key={idx} className={`panel-custom p-6 rounded-2xl relative group animate-fade-in transition-all border-l-4 ${set.isBiSet ? 'border-l-indigo-500 bg-indigo-500/5' : 'border-l-accent'}`}>
                  <div className="flex flex-col gap-6">
                    {/* Primer Ejercicio */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] font-black text-dim uppercase tracking-widest flex items-center gap-1">
                          <Dumbbell size={10} className="accent-color" /> Ejercicio {set.isBiSet ? 'A' : ''}
                        </label>
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={() => toggleBiSet(idx)}
                            className={`text-[8px] font-black px-2 py-0.5 rounded transition-all uppercase tracking-widest border ${set.isBiSet ? 'bg-indigo-500 text-white border-indigo-500' : 'text-dim border-main hover:border-accent'}`}
                          >
                            <Layers size={10} className="inline mr-1" /> Bi-Set
                          </button>
                          <button type="button" onClick={() => setStrengthSets(strengthSets.filter((_, i) => i !== idx))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      
                      {/* Selector de ejercicio con imagen */}
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => setShowExerciseSelector(showExerciseSelector === idx ? null : idx)}
                            className="w-full bg-input-custom border border-main p-3 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent flex items-center gap-3 hover:bg-card-inner transition-all"
                          >
                            {set.exercise ? (
                              <>
                                <img src={getExerciseImage(set.exercise)} alt={set.exercise} className="w-12 h-12 object-cover rounded-lg" />
                                <span className="flex-1 text-left uppercase">{set.exercise}</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon size={20} className="text-dim" />
                                <span className="flex-1 text-left text-dim">Seleccionar Ejercicio</span>
                              </>
                            )}
                            <Search size={16} className="text-dim" />
                          </button>
                          
                          {/* Selector visual de ejercicios */}
                          {showExerciseSelector === idx && (
                            <div className="mt-2 bg-card-inner border border-main rounded-xl p-4 max-h-96 overflow-y-auto">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {EXERCISES_DB.map(ex => (
                                  <button
                                    key={ex.name}
                                    type="button"
                                    onClick={() => {
                                      updateSet(idx, { exercise: ex.name, individualSets: [{ reps: 10, weight: 20, type: 'work' }] });
                                      setShowExerciseSelector(null);
                                    }}
                                    className="p-3 bg-input-custom border border-main rounded-lg hover:border-accent transition-all text-left"
                                  >
                                    <img src={ex.image} alt={ex.name} className="w-full h-24 object-cover rounded mb-2" />
                                    <p className="text-[9px] font-black text-bright uppercase">{ex.name}</p>
                                    <p className="text-[8px] text-dim">{ex.category}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Series individuales */}
                      {set.exercise && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[8px] font-black text-dim uppercase tracking-widest">Series</label>
                            <button
                              type="button"
                              onClick={() => addIndividualSet(idx, false)}
                              className="text-[8px] font-black text-accent hover:text-bright transition-all flex items-center gap-1"
                            >
                              <Plus size={12} /> Añadir Serie
                            </button>
                          </div>
                          {individualSets.map((individualSet, setIdx) => (
                            <div key={setIdx} className="flex gap-3 items-center p-3 bg-card-inner border border-main rounded-lg">
                              <span className="text-[9px] font-black text-dim w-6">#{setIdx + 1}</span>
                              <MiniInput label="Reps" value={individualSet.reps} onChange={(v: number) => updateIndividualSet(idx, setIdx, { reps: v }, false)} />
                              <MiniInput label="KG" value={individualSet.weight} onChange={(v: number) => updateIndividualSet(idx, setIdx, { weight: v }, false)} />
                              <button
                                type="button"
                                onClick={() => updateIndividualSet(idx, setIdx, { type: individualSet.type === 'warmup' ? 'work' : 'warmup' }, false)}
                                className={`px-3 py-1.5 text-[8px] font-black uppercase rounded transition-all ${
                                  individualSet.type === 'warmup' 
                                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                                    : 'bg-accent/20 text-accent border border-accent/30'
                                }`}
                              >
                                {individualSet.type === 'warmup' ? <Flame size={10} className="inline mr-1" /> : <Zap size={10} className="inline mr-1" />}
                                {individualSet.type === 'warmup' ? 'Calentamiento' : 'Trabajo'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeIndividualSet(idx, setIdx, false)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Segundo Ejercicio (Bi-Set) */}
                      {set.isBiSet && (
                        <div className="pt-4 border-t border-indigo-500/20 space-y-4 animate-fade-in">
                          <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                            <Layers size={10} className="inline" /> Ejercicio B (Bi-Serie)
                          </label>
                          
                          <div className="flex gap-4 items-start">
                            <div className="flex-1">
                              <button
                                type="button"
                                onClick={() => setShowExerciseSelector(showExerciseSelector === `b-${idx}` ? null : `b-${idx}`)}
                                className="w-full bg-input-custom border border-indigo-500/30 p-3 rounded-xl text-xs font-bold text-bright outline-none focus:border-indigo-500 flex items-center gap-3 hover:bg-card-inner transition-all"
                              >
                                {set.exercise2 ? (
                                  <>
                                    <img src={getExerciseImage(set.exercise2)} alt={set.exercise2} className="w-12 h-12 object-cover rounded-lg" />
                                    <span className="flex-1 text-left uppercase">{set.exercise2}</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon size={20} className="text-dim" />
                                    <span className="flex-1 text-left text-dim">Seleccionar Ejercicio</span>
                                  </>
                                )}
                                <Search size={16} className="text-dim" />
                              </button>
                              
                              {showExerciseSelector === `b-${idx}` && (
                                <div className="mt-2 bg-card-inner border border-main rounded-xl p-4 max-h-96 overflow-y-auto">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {EXERCISES_DB.map(ex => (
                                      <button
                                        key={ex.name}
                                        type="button"
                                        onClick={() => {
                                          updateSet(idx, { exercise2: ex.name, individualSets2: [{ reps: 10, weight: 20, type: 'work' }] });
                                          setShowExerciseSelector(null);
                                        }}
                                        className="p-3 bg-input-custom border border-main rounded-lg hover:border-accent transition-all text-left"
                                      >
                                        <img src={ex.image} alt={ex.name} className="w-full h-24 object-cover rounded mb-2" />
                                        <p className="text-[9px] font-black text-bright uppercase">{ex.name}</p>
                                        <p className="text-[8px] text-dim">{ex.category}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Series individuales ejercicio 2 */}
                          {set.exercise2 && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-[8px] font-black text-dim uppercase tracking-widest">Series</label>
                                <button
                                  type="button"
                                  onClick={() => addIndividualSet(idx, true)}
                                  className="text-[8px] font-black text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1"
                                >
                                  <Plus size={12} /> Añadir Serie
                                </button>
                              </div>
                              {individualSets2.map((individualSet, setIdx) => (
                                <div key={setIdx} className="flex gap-3 items-center p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                                  <span className="text-[9px] font-black text-indigo-400 w-6">#{setIdx + 1}</span>
                                  <MiniInput label="Reps" value={individualSet.reps} onChange={(v: number) => updateIndividualSet(idx, setIdx, { reps: v }, true)} />
                                  <MiniInput label="KG" value={individualSet.weight} onChange={(v: number) => updateIndividualSet(idx, setIdx, { weight: v }, true)} />
                                  <button
                                    type="button"
                                    onClick={() => updateIndividualSet(idx, setIdx, { type: individualSet.type === 'warmup' ? 'work' : 'warmup' }, true)}
                                    className={`px-3 py-1.5 text-[8px] font-black uppercase rounded transition-all ${
                                      individualSet.type === 'warmup' 
                                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    }`}
                                  >
                                    {individualSet.type === 'warmup' ? <Flame size={10} className="inline mr-1" /> : <Zap size={10} className="inline mr-1" />}
                                    {individualSet.type === 'warmup' ? 'Calentamiento' : 'Trabajo'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeIndividualSet(idx, setIdx, true)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setStrengthSets([...strengthSets, { exercise: '', individualSets: [], isBiSet: false }])} className="w-full py-4 border-2 border-dashed border-main rounded-xl text-dim text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all group flex items-center justify-center gap-2">
              <Plus size={14} className="group-hover:scale-110 transition-transform" /> Añadir Bloque de Ejercicio
            </button>
          </div>
        )}

        {/* Inputs de Cardio / Clase */}
        {(type === SportType.Running || type === SportType.Swimming || type === SportType.Cycling) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
             <TechInputGroup label="Distancia (KM)" value={distance} onChange={setDistance} type="number" step="0.01" />
             <TechInputGroup label="Tiempo (MIN)" value={time} onChange={setTime} type="number" />
             <TechInputGroup label="Pulsaciones (AVG)" value={heartRate} onChange={setHeartRate} type="number" />
             <TechInputGroup label="Calorías (KCAL)" value={calories} onChange={setCalories} type="number" />
          </div>
        )}

        {type === SportType.GroupClass && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Tipo de Clase</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent uppercase appearance-none">
                  {GROUP_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <TechInputGroup label="Tiempo (MIN)" value={time} onChange={setTime} type="number" />
             <TechInputGroup label="Pulsaciones (AVG)" value={heartRate} onChange={setHeartRate} type="number" />
             <TechInputGroup label="Calorías (KCAL)" value={calories} onChange={setCalories} type="number" />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Notas de la Sesión</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="COMENTARIOS TÉCNICOS, SENSACIONES, RM..."
            className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent min-h-[100px] uppercase"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="submit" className="flex-1 bg-accent text-white font-black py-5 rounded-xl text-xs tracking-[0.2em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase">
            <Save size={18}/> Sincronizar Registro en Nucleo
          </button>
        </div>
      </form>
    </div>
  );
};

const ModalButton = ({ active, onClick, label, icon }: any) => (
  <button type="button" onClick={onClick} className={`py-4 px-2 text-[9px] font-black border transition-all rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 ${active ? 'bg-accent border-accent text-white shadow-md' : 'panel-custom text-dim hover:border-accent'}`}>
    {icon}
    {label}
  </button>
);

const MiniInput = ({ label, value, onChange }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Permitir campo vacío mientras se escribe
    if (inputValue === '' || inputValue === '-') {
      onChange(0);
      return;
    }
    const numValue = parseFloat(inputValue);
    // Validar que sea >= 0 y no sea NaN
    if (!isNaN(numValue) && numValue >= 0 && isFinite(numValue)) {
      onChange(numValue);
    }
    // Si es negativo o inválido, mantener el valor anterior
  };

  return (
    <div className="text-center">
      <p className="text-[8px] font-black text-dim uppercase mb-1 tracking-widest">{label}</p>
      <input 
        type="number" 
        step="0.5" 
        min="0"
        value={value ?? 0} 
        onChange={handleChange}
        className="w-16 bg-input-custom border border-main text-center text-xs font-black p-2 rounded-lg focus:border-accent outline-none text-bright" 
      />
    </div>
  );
};

const TechInputGroup = ({ label, value, onChange, type = "text", step = "1" }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const inputValue = e.target.value;
      // Permitir campo vacío mientras se escribe
      if (inputValue === '' || inputValue === '-') {
        onChange('');
        return;
      }
      const numValue = parseFloat(inputValue);
      // Validar que sea >= 0 y no sea NaN ni infinito
      if (!isNaN(numValue) && numValue >= 0 && isFinite(numValue)) {
        onChange(inputValue);
      }
      // Si es negativo o inválido, mantener el valor anterior
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} 
        step={step}
        min={type === "number" ? "0" : undefined}
        value={value} 
        onChange={handleChange}
        className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent transition-all uppercase" 
      />
    </div>
  );
};

export default WorkoutLogger;
