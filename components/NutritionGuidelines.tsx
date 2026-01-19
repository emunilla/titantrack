
import React, { useState } from 'react';
import { AppData, NutritionInfo, NutritionGuidelines, Supplement } from '../types';
import { generateNutritionGuidelines } from '../services/aiService';
import { Apple, Plus, Trash2, Save, Loader2, Sparkles, AlertCircle, CheckCircle, Flame } from 'lucide-react';

interface Props {
  data: AppData;
  onError?: (message: string) => void;
  onSaveNutritionInfo: (info: NutritionInfo) => Promise<void>;
  onSaveGuidelines: (guidelines: NutritionGuidelines) => Promise<void>;
}

const NutritionGuidelinesComponent: React.FC<Props> = ({ 
  data, 
  onError, 
  onSaveNutritionInfo,
  onSaveGuidelines 
}) => {
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo>(
    data.profile.nutritionInfo || { supplements: [], additionalData: '' }
  );
  const [currentSupplement, setCurrentSupplement] = useState<Supplement>({ name: '', frequency: '' });
  const [generatedGuidelines, setGeneratedGuidelines] = useState<NutritionGuidelines | null>(null);
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
    } catch (err: any) {
      if (onError) onError(err.message || 'Error al guardar pautas');
    } finally {
      setIsSavingGuidelines(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información Nutricional del Usuario */}
      <div className="panel-custom p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-main">
          <Apple className="accent-color" size={24} />
          <div>
            <h2 className="text-xl font-black text-bright uppercase tracking-tighter">Información Nutricional</h2>
            <p className="text-[9px] text-dim uppercase tracking-widest mt-1">Datos para personalizar las pautas</p>
          </div>
        </div>

        <div className="space-y-6">
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
      </div>

      {/* Generación de Pautas */}
      <div className="panel-custom p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-main">
          <Sparkles className="accent-color" size={24} />
          <div>
            <h2 className="text-xl font-black text-bright uppercase tracking-tighter">Pautas Nutricionales</h2>
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

          <div className="space-y-6">
            {/* Macronutrientes */}
            {generatedGuidelines.macronutrients && (
              <div className="bg-card-inner p-4 rounded-xl border border-main">
                <h4 className="text-[10px] font-black text-dim uppercase tracking-widest mb-3">Macronutrientes</h4>
                <div className="space-y-2 text-xs text-bright">
                  {generatedGuidelines.macronutrients.proteins && (
                    <p><span className="font-black">Proteínas:</span> {generatedGuidelines.macronutrients.proteins}</p>
                  )}
                  {generatedGuidelines.macronutrients.carbohydrates && (
                    <p><span className="font-black">Carbohidratos:</span> {generatedGuidelines.macronutrients.carbohydrates}</p>
                  )}
                  {generatedGuidelines.macronutrients.fats && (
                    <p><span className="font-black">Grasas:</span> {generatedGuidelines.macronutrients.fats}</p>
                  )}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {generatedGuidelines.recommendations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedGuidelines.recommendations.increase && generatedGuidelines.recommendations.increase.length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Plus size={12} /> Potenciar
                    </h4>
                    <ul className="space-y-1 text-xs text-bright">
                      {generatedGuidelines.recommendations.increase.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedGuidelines.recommendations.decrease && generatedGuidelines.recommendations.decrease.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Trash2 size={12} /> Minorar
                    </h4>
                    <ul className="space-y-1 text-xs text-bright">
                      {generatedGuidelines.recommendations.decrease.map((item, idx) => (
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
            {generatedGuidelines.supplements && (
              <div className="bg-card-inner p-4 rounded-xl border border-main">
                <h4 className="text-[10px] font-black text-dim uppercase tracking-widest mb-3">Suplementos</h4>
                <div className="space-y-4">
                  {generatedGuidelines.supplements.recommended && generatedGuidelines.supplements.recommended.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Recomendados:</p>
                      <div className="space-y-2">
                        {generatedGuidelines.supplements.recommended.map((supp, idx) => (
                          <div key={idx} className="p-3 bg-black/20 rounded-lg border border-main">
                            <p className="text-xs font-black text-bright uppercase">{supp.name}</p>
                            <p className="text-[9px] text-dim mt-1">{supp.reason}</p>
                            {supp.dosage && <p className="text-[9px] text-dim">Dosis sugerida: {supp.dosage}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedGuidelines.supplements.adjust && generatedGuidelines.supplements.adjust.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Ajustes:</p>
                      <div className="space-y-2">
                        {generatedGuidelines.supplements.adjust.map((supp, idx) => (
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
            {generatedGuidelines.generalAdvice && (
              <div className="bg-accent/10 border border-accent/30 p-4 rounded-xl">
                <h4 className="text-[10px] font-black accent-color uppercase tracking-widest mb-3">Consejo General</h4>
                <p className="text-xs text-bright leading-relaxed">{generatedGuidelines.generalAdvice}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionGuidelinesComponent;
