
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://arpuudrssqfjyijlphgi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HTyc2f8XGto085XjsIOHWg_zdE1paMY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables de entorno de Supabase no configuradas. Usando valores por defecto.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  auth: {
    async signUp(email: string, pass: string) {
      const { data, error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;
      return data;
    },
    async signIn(email: string, pass: string) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  },
  profiles: {
    async getMyProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error && error.code === 'PGRST116') return null; // No existe perfil
        if (error && error.message.includes('not found')) throw new Error("TABLE_MISSING:profiles");
        return data;
      } catch (e: any) {
        if (e.message?.includes('TABLE_MISSING')) throw e;
        return null;
      }
    },
    async create(profile: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase.from('profiles').insert({ 
        id: user.id, name: profile.name, goal: profile.goal, initial_weight: profile.initialWeight,
        height: profile.height, resting_heart_rate: profile.restingHeartRate, avatar_color: profile.avatarColor
      }).select().single();
      if (error) throw error;
      return data;
    },
    async update(profile: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase.from('profiles').update({ 
        name: profile.name, goal: profile.goal, initial_weight: profile.initialWeight,
        height: profile.height, resting_heart_rate: profile.restingHeartRate, avatar_color: profile.avatarColor
      }).eq('id', user.id).select().single();
      if (error) throw error;
      return data;
    },
    async updateNutritionInfo(nutritionInfo: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase.from('profiles').update({ 
        nutrition_info: nutritionInfo
      }).eq('id', user.id).select().single();
      if (error) throw error;
      return data;
    }
  },
  workouts: {
    async getMyWorkouts() {
      const { data, error } = await supabase.from('workouts').select('*').order('date', { ascending: false });
      if (error && error.message.includes('not found')) throw new Error("TABLE_MISSING:workouts");
      return data || [];
    },
    async save(workout: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase.from('workouts').upsert({ 
        ...workout, 
        profile_id: user.id
      }).select().single();
      if (error) throw error;
      return data;
    },
    async delete(workoutId: string) {
      const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
      if (error) throw error;
    }
  },
  plans: {
    async getMyPlans() {
      const { data, error } = await supabase.from('training_plans').select('*').order('created_at', { ascending: false });
      if (error && error.message.includes('not found')) throw new Error("TABLE_MISSING:training_plans");
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        objective: p.objective,
        frequency: p.frequency,
        durationWeeks: p.duration_weeks,
        schedule: p.schedule,
        timePerSession: p.time_per_session,
        status: p.status,
        content: p.content,
        createdAt: p.created_at
      }));
    },
    async save(plan: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      
      // Validar campos requeridos
      if (!plan.name || !plan.type) {
        throw new Error("Nombre y tipo de plan son requeridos");
      }
      
      const { data, error } = await supabase.from('training_plans').upsert({
        id: plan.id || undefined, // Si no hay ID, Supabase lo generará
        profile_id: user.id,
        name: plan.name,
        type: plan.type,
        objective: plan.objective || null,
        frequency: plan.frequency || null,
        duration_weeks: plan.durationWeeks || null,
        schedule: plan.schedule || null,
        time_per_session: plan.timePerSession || null,
        status: plan.status || 'active',
        content: plan.content || {}
      }, {
        onConflict: 'id' // Si existe, actualizar
      }).select().single();
      
      if (error) {
        console.error('Error saving plan:', error);
        throw new Error(error.message || 'Error al guardar el plan');
      }
      return data;
    },
    async delete(planId: string) {
      const { error } = await supabase.from('training_plans').delete().eq('id', planId);
      if (error) throw error;
    }
  },
  weightHistory: {
    async getMyHistory() {
      const { data, error } = await supabase.from('weight_history').select('*').order('date', { ascending: true });
      if (error && error.message.includes('not found')) throw new Error("TABLE_MISSING:weight_history");
      return (data || []).map(d => ({
        id: d.id, date: d.date, weight: d.weight, fatPercentage: d.fat_percentage, musclePercentage: d.muscle_percentage
      }));
    },
    async add(entry: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase.from('weight_history').insert({ 
        date: entry.date, weight: entry.weight, fat_percentage: entry.fatPercentage,
        muscle_percentage: entry.musclePercentage, profile_id: user.id 
      }).select().single();
      if (error) throw error;
      return data;
    }
  },
  nutritionGuidelines: {
    async getMyGuidelines() {
      const { data, error } = await supabase.from('nutrition_guidelines').select('*').order('date', { ascending: false });
      if (error && error.message.includes('not found')) throw new Error("TABLE_MISSING:nutrition_guidelines");
      return (data || []).map(g => ({
        id: g.id,
        date: g.date,
        macronutrients: g.macronutrients,
        recommendations: g.recommendations,
        supplements: g.supplements,
        generalAdvice: g.general_advice
      }));
    },
    async save(guidelines: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase.from('nutrition_guidelines').insert({
        profile_id: user.id,
        date: guidelines.date,
        macronutrients: guidelines.macronutrients || {},
        recommendations: guidelines.recommendations || {},
        supplements: guidelines.supplements || {},
        general_advice: guidelines.generalAdvice || null
      }).select().single();
      if (error) throw error;
      return data;
    },
    async delete(guidelineId: string) {
      const { error } = await supabase.from('nutrition_guidelines').delete().eq('id', guidelineId);
      if (error) throw error;
    }
  }
};
