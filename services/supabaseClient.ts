
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://arpuudrssqfjyijlphgi.supabase.co';
const supabaseAnonKey = 'sb_publishable_HTyc2f8XGto085XjsIOHWg_zdE1paMY';

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
        if (error && error.code !== 'PGRST116') return null; // PGRST116 es "no rows found"
        return data;
      } catch (e) {
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
    }
  },
  workouts: {
    async getMyWorkouts() {
      try {
        const { data, error } = await supabase.from('workouts').select('*').order('date', { ascending: false });
        if (error) {
          console.warn("Tabla 'workouts' no encontrada o inaccesible. Devolviendo []");
          return [];
        }
        return data || [];
      } catch (e) {
        return [];
      }
    },
    async save(workout: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase.from('workouts').upsert({ ...workout, profile_id: user.id }).select().single();
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
      try {
        const { data, error } = await supabase.from('training_plans').select('*').order('created_at', { ascending: false });
        if (error) {
          console.warn("Tabla 'training_plans' no encontrada o inaccesible (404). Devolviendo []");
          return [];
        }
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
      } catch (e) {
        return [];
      }
    },
    async save(plan: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase.from('training_plans').upsert({
        id: plan.id,
        profile_id: user.id,
        name: plan.name,
        type: plan.type,
        objective: plan.objective,
        frequency: plan.frequency,
        duration_weeks: plan.durationWeeks,
        schedule: plan.schedule,
        time_per_session: plan.timePerSession,
        status: plan.status,
        content: plan.content
      }).select().single();
      if (error) throw error;
      return data;
    },
    async delete(planId: string) {
      const { error } = await supabase.from('training_plans').delete().eq('id', planId);
      if (error) throw error;
    }
  },
  weightHistory: {
    async getMyHistory() {
      try {
        const { data, error } = await supabase.from('weight_history').select('*').order('date', { ascending: true });
        if (error) {
          console.warn("Tabla 'weight_history' no encontrada o inaccesible. Devolviendo []");
          return [];
        }
        return (data || []).map(d => ({
          id: d.id, date: d.date, weight: d.weight, fatPercentage: d.fat_percentage, musclePercentage: d.muscle_percentage
        }));
      } catch (e) {
        return [];
      }
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
  }
};
