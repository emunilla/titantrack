
import React, { useState } from 'react';
import { AppData, NutritionInfo, NutritionGuidelines, Supplement } from '../types';
import { generateNutritionGuidelines } from '../services/aiService';
import { Apple, Plus, Trash2, Save, Loader2, Sparkles, AlertCircle, CheckCircle, Flame, Eye, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  data: AppData;
  onError?: (message: string) => void;
  onSaveNutritionInfo: (info: NutritionInfo) => Promise<void>;
  onSaveGuidelines: (guidelines: NutritionGuidelines) => Promise<void>;
  onDeleteGuidelines: (id: string) => Promise<void>;
}

const NutritionGuidelinesComponent: React.FC<Props> = ({ 
  data, 
  onError, 
  onSaveNutritionInfo,
  onSaveGuidelines,
  onDeleteGuidelines
}) => {
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo>(
    data.profile.nutritionInfo || { supplements: [], additionalData: '' }
  );
  const [currentSupplement, setCurrentSupplement] = useState<Supplement>({ name: '', frequency: '' });
  const [generatedGuidelines, setGeneratedGuidelines] = useState<NutritionGuidelines | null>(null);
  const [selectedGuideline, setSelectedGuideline] = useState<NutritionGuidelines | null>(null);
  const [isNutritionInfoExpanded, setIsNutritionInfoExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingGuidelines, setIsSavingGuidelines] = useState(false);

  const addSupplement = () => {
    if (currentSupplement.name.trim()) {
      setNutritionInfo({
        ...nutritionInfo,
        supplements: [...(nutritionInfo.supplements || []), currentSupplement],
        lastUpdated: new Date().toISOString()
      });
      setCurrentSupplement({ name: '', frequency: '', dosage: '' });
    }
  };

  const removeSupplement = (index: number) => {
    const newSupplements = (nutritionInfo.supplements || []).filter((_, i) => i !== index);
    setNutritionInfo({
      ...nutritionInfo,
      supplements: newSupplements,
      lastUpdated: new Date().toISOString()
    });
  };

  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    try {
      await onSaveNutritionInfo({
        ...nutritionInfo,
        lastUpdated: new Date().toISOString()
      });
    } catch (err: any) {
      if (onError) onError(err.message || 'Error al guardar información nutricional');
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleGenerateGuidelines = async () => {
    setIsGenerating(true);
    try {
      const guidelines = await generateNutritionGuidelines(data, nutritionInfo);
      setGeneratedGuidelines(guidelines);
    } catch (err: any) {
      if (onError) onError(err.message || 'Error al generar pautas nutricionales');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGuidelines = async () => {
    if (!generatedGuidelines) return;
    setIsSavingGuidelines(true);
    try {
      await onSaveGuidelines({
        ...generatedGuidelines,
        date: new Date().toISOString()
      });
      setGeneratedGuidelines(null); // Limpiar después de guardar
    } catch (err: any) {
      if (onError) onError(err.message || 'Error al guardar pautas');
    } finally {
      setIsSavingGuidelines(false);
    }
  };

  const handleDeleteGuidelines = async (id: string) => {
    if (!confirm('¿Eliminar esta pauta nutricional guardada?')) return;
    try {
      await onDeleteGuidelines(id);
      if (selectedGuideline?.id === id) {
        setSelectedGuideline(null);
      }
    } catch (err: any) {
      if (onError) onError(err.message || 'Error al eliminar pauta');
    }
  };

  const renderGuidelines = (guidelines: NutritionGuidelines) => (
    <div className="space-y-6">
      {/* Macronutrientes */}
      {guidelines.macronutrients && (
        <div className="bg-card-inner p-4 rounded-xl border border-main">
          <h4 className="text-[10px] font-black text-dim uppercase tracking-widest mb-3">Macronutrientes</h4>
          <div className="space-y-2 text-xs text-bright">
            {guidelines.macronutrients.proteins && (
              <p><span className="font-black">Proteínas:</span> {guidelines.macronutrients.proteins}</p>
            )}
            {guidelines.macronutrients.carbohydrates && (
              <p><span className="font-black">Carbohidratos:</span> {guidelines.macronutrients.carbohydrates}</p>
            )}
            {guidelines.macronutrients.fats && (
              <p><span className="font-black">Grasas:</span> {guidelines.macronutrients.fats}</p>
            )}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {guidelines.recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines.recommendations.increase && guidelines.recommendations.increase.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Plus size={12} /> Potenciar
              </h4>
              <ul className="space-y-1 text-xs text-bright">
                {guidelines.recommendations.increase.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guidelines.recommendations.decrease && guidelines.recommendations.decrease.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Trash2 size={12} /> Minorar
              </h4>
              <ul className="space-y-1 text-xs text-bright">
                {guidelines.recommendations.decrease.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Suplementos */}
      {guidelines.supplements && (
        <div className="bg-card-inner p-4 rounded-xl border border-main">
          <h4 className="text-[10px] font-black text-dim uppercase tracking-widest mb-3">Suplementos</h4>
          <div className="space-y-4">
            {guidelines.supplements.recommended && guidelines.supplements.recommended.length > 0 && (
              <div>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Recomendados:</p>
                <div className="space-y-2">
                  {guidelines.supplements.recommended.map((supp, idx) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-lg border border-main">
                      <p className="text-xs font-black text-bright uppercase">{supp.name}</p>
                      <p className="text-[9px] text-dim mt-1">{supp.reason}</p>
                      {supp.dosage && <p className="text-[9px] text-dim">Dosis sugerida: {supp.dosage}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guidelines.supplements.adjust && guidelines.supplements.adjust.length > 0 && (
              <div>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Ajustes:</p>
                <div className="space-y-2">
                  {guidelines.supplements.adjust.map((supp, idx) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-lg border border-main">
                      <p className="text-xs font-black text-bright uppercase">{supp.name}</p>
                      <p className="text-[9px] text-dim mt-1">Actual: {supp.current}</p>
                      <p className="text-[9px] text-emerald-500 mt-1">Recomendación: {supp.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consejo General */}
      {guidelines.generalAdvice && (
        <div className="bg-accent/10 border border-accent/30 p-4 rounded-xl">
          <h4 className="text-[10px] font-black accent-color uppercase tracking-widest mb-3">Consejo General</h4>
          <p className="text-xs text-bright leading-relaxed">{guidelines.generalAdvice}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Información Nutricional del Usuario - Colapsable */}
      <div className="panel-custom rounded-2xl overflow-hidden">
        <button
          onClick={() => setIsNutritionInfoExpanded(!isNutritionInfoExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-card-inner transition-all"
        >
          <div className="flex items-center gap-3">
            <Apple className="accent-color" size={24} />
            <div className="text-left">
              <h2 className="text-xl font-black text-bright uppercase tracking-tighter">Información Nutricional</h2>
              <p className="text-[9px] text-dim uppercase tracking-widest mt-1">Datos para personalizar las pautas</p>
            </div>
          </div>
          {isNutritionInfoExpanded ? <ChevronUp className="text-dim" size={20} /> : <ChevronDown className="text-dim" size={20} />}
        </button>

        {isNutritionInfoExpanded && (
          <div className="px-6 pb-6 pt-2 space-y-6 animate-fade-in border-t border-main">
          {/* Suplementos Actuales */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest flex items-center gap-2">
              <Flame size={12} className="accent-color" />
              Suplementos Actuales
            </label>
            
            <div className="space-y-2">
              {(nutritionInfo.supplements || []).map((supp, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-card-inner border border-main rounded-xl">
                  <div className="flex-1">
                    <p className="text-xs font-black text-bright uppercase">{supp.name}</p>
                    <p className="text-[9px] text-dim">Frecuencia: {supp.frequency}</p>
                    {supp.dosage && <p className="text-[9px] text-dim">Dosis: {supp.dosage}</p>}
                  </div>
                  <button
                    onClick={() => removeSupplement(idx)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-card-inner border border-main rounded-xl">
              <input
                type="text"
                value={currentSupplement.name}
                onChange={(e) => setCurrentSupplement({ ...currentSupplement, name: e.target.value })}
                placeholder="Nombre del suplemento"
                className="bg-input-custom border border-main p-3 rounded-lg text-xs font-bold text-bright outline-none focus:border-accent uppercase"
              />
              <input
                type="text"
                value={currentSupplement.frequency}
                onChange={(e) => setCurrentSupplement({ ...currentSupplement, frequency: e.target.value })}
                placeholder="Frecuencia (ej: Diario, 3x/semana)"
                className="bg-input-custom border border-main p-3 rounded-lg text-xs font-bold text-bright outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSupplement.dosage || ''}
                  onChange={(e) => setCurrentSupplement({ ...currentSupplement, dosage: e.target.value })}
                  placeholder="Dosis (opcional)"
                  className="flex-1 bg-input-custom border border-main p-3 rounded-lg text-xs font-bold text-bright outline-none focus:border-accent"
                />
                <button
                  onClick={addSupplement}
                  className="px-4 bg-accent text-white rounded-lg hover:opacity-90 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Datos Adicionales */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={12} className="accent-color" />
              Datos Adicionales (Opcional)
            </label>
            <textarea
              value={nutritionInfo.additionalData || ''}
              onChange={(e) => setNutritionInfo({ ...nutritionInfo, additionalData: e.target.value })}
              placeholder="Ej: Alergias, restricciones dietéticas, objetivos específicos, horarios de comida..."
              className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent min-h-[100px] resize-y"
            />
          </div>

          <button
            onClick={handleSaveInfo}
            disabled={isSavingInfo}
            className="w-full bg-accent text-white font-black py-3 rounded-xl text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSavingInfo ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSavingInfo ? 'Guardando...' : 'Guardar Información Nutricional'}
          </button>
          </div>
        )}
      </div>

      {/* Pautas Guardadas */}
      {data.savedGuidelines && data.savedGuidelines.length > 0 && (
        <div className="panel-custom p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-main">
            <CheckCircle className="accent-color" size={24} />
            <div>
              <h2 className="text-xl font-black text-bright uppercase tracking-tighter">Pautas Guardadas</h2>
              <p className="text-[9px] text-dim uppercase tracking-widest mt-1">Historial de pautas nutricionales</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.savedGuidelines.map((guideline) => (
              <div
                key={guideline.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedGuideline?.id === guideline.id
                    ? 'bg-accent/10 border-accent'
                    : 'bg-card-inner border-main hover:border-accent'
                }`}
                onClick={() => setSelectedGuideline(selectedGuideline?.id === guideline.id ? null : guideline)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="accent-color" size={18} />
                    <div>
                      <p className="text-xs font-black text-bright uppercase">
                        {new Date(guideline.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-[9px] text-dim">
                        {new Date(guideline.date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGuideline(selectedGuideline?.id === guideline.id ? null : guideline);
                      }}
                      className="p-2 text-dim hover:text-bright hover:bg-card-inner rounded-lg transition-all"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (guideline.id) handleDeleteGuidelines(guideline.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pautas Generadas */}
      {generatedGuidelines && (
        <div className="panel-custom p-6 rounded-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-main">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-500" size={24} />
              <div>
                <h3 className="text-lg font-black text-bright uppercase tracking-tighter">Pautas Generadas</h3>
                <p className="text-[9px] text-dim uppercase tracking-widest mt-1">
                  {new Date(generatedGuidelines.date).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveGuidelines}
              disabled={isSavingGuidelines}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSavingGuidelines ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Guardar
            </button>
          </div>

          {renderGuidelines(generatedGuidelines)}
        </div>
      )}

      {/* Pauta Seleccionada (Guardada) */}
      {selectedGuideline && selectedGuideline.id && (
        <div className="panel-custom p-6 rounded-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-main">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-500" size={24} />
              <div>
                <h3 className="text-lg font-black text-bright uppercase tracking-tighter">Pauta Guardada</h3>
                <p className="text-[9px] text-dim uppercase tracking-widest mt-1 flex items-center gap-2">
                  <Calendar size={10} />
                  {new Date(selectedGuideline.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (selectedGuideline.id) handleDeleteGuidelines(selectedGuideline.id);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-400 transition-all flex items-center gap-2"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>

          {renderGuidelines(selectedGuideline)}
        </div>
      )}

      {/* Generación de Pautas - Al Final */}
      <div className="panel-custom p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-main">
          <Sparkles className="accent-color" size={24} />
          <div>
            <h2 className="text-xl font-black text-bright uppercase tracking-tighter">Generar Pautas Nutricionales</h2>
            <p className="text-[9px] text-dim uppercase tracking-widest mt-1">Generación inteligente basada en IA</p>
          </div>
        </div>

        <button
          onClick={handleGenerateGuidelines}
          disabled={isGenerating || data.workouts.length === 0}
          className="w-full bg-accent text-white font-black py-4 rounded-xl text-xs tracking-[0.3em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 uppercase disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {isGenerating ? 'Generando Pautas...' : 'Generar Pautas Nutricionales con IA'}
        </button>

        {data.workouts.length === 0 && (
          <p className="text-[10px] text-dim text-center mt-4 italic">
            Necesitas registrar al menos un entrenamiento para generar pautas personalizadas
          </p>
        )}
      </div>
    </div>
  );
};

export default NutritionGuidelinesComponent;
