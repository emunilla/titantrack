
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  onAuthSuccess: () => void;
}

const AuthForm: React.FC<Props> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSignedUp(false);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.session) onAuthSuccess();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setSignedUp(true);
        } else {
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.message === 'User already registered') {
        setError("Este registro ya existe en el núcleo.");
      } else if (err.message === 'Invalid login credentials') {
        setError("Credenciales de acceso no válidas.");
      } else {
        setError(err.message || "Error en el sistema de acceso.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (signedUp) {
    return (
      <div className="min-h-screen bg-app-custom flex items-center justify-center p-4">
        <div className="w-full max-w-md panel-custom p-10 rounded-2xl text-center">
          <div className="inline-flex bg-accent/10 p-4 rounded-2xl border border-accent/30 mb-8">
            <CheckCircle2 className="accent-color w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-bright mb-3 uppercase tracking-tighter">Confirmación Enviada</h2>
          <p className="text-xs text-dim mb-8 uppercase tracking-widest leading-loose">
            Protocolo de seguridad activado. Revisa tu buzón en <span className="font-bold accent-color">{email}</span> para validar tu acceso.
          </p>
          <button 
            onClick={() => { setIsLogin(true); setSignedUp(false); }}
            className="w-full bg-accent text-white font-black py-4 rounded-xl text-[10px] tracking-[0.3em] hover:brightness-110 transition-all uppercase shadow-lg"
          >
            VOLVER AL TERMINAL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-custom flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-accent rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[10%] right-[5%] w-64 h-64 bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md panel-custom p-10 rounded-3xl relative z-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex bg-accent p-4 rounded-2xl shadow-xl mb-6">
            <ShieldCheck size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-bright tracking-tighter uppercase italic">Titan<span className="accent-color">Builder</span></h1>
          <p className="text-[11px] font-mono text-dim mt-2 uppercase tracking-[0.2em]">{isLogin ? 'ACCESO OPERATIVO' : 'REGISTRO DE TITÁN'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Email de Operaciones</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input-custom border border-main pl-12 pr-4 py-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent transition-all shadow-sm"
                placeholder="USUARIO@TITAN.COM"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Clave de Encriptación</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
              <input 
                type="password" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input-custom border border-main pl-12 pr-4 py-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent transition-all shadow-sm"
                placeholder="******"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-[10px] font-bold flex items-start gap-3 animate-fade-in uppercase tracking-tight">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent text-white font-black py-5 rounded-xl text-xs tracking-[0.4em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
            {isLogin ? 'CONECTAR SISTEMA' : 'GENERAR PERFIL'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-[10px] font-black text-dim hover:accent-color transition-all uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-accent/50 pb-1"
          >
            {isLogin ? '¿SIN ACCESO? REGÍSTRATE AQUÍ' : '¿YA ERES TITÁN? CONECTAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
