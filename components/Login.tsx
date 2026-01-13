import React from 'react';
import { UserAccount } from '../types';
import { UserPlus, Sparkles, User as UserIcon, ChevronRight } from 'lucide-react';

interface Props {
  users: UserAccount[];
  onSelectUser: (userId: string) => void;
  onCreateNew: () => void;
}

const Login: React.FC<Props> = ({ users, onSelectUser, onCreateNew }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100 mb-6"><Sparkles className="text-white w-10 h-10" /></div>
          <h1 className="text-4xl font-black text-slate-800">TitanTrack</h1>
          <p className="text-slate-500 mt-2 text-lg">¿Quién entrena hoy?</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <button key={user.id} onClick={() => onSelectUser(user.id)} className="group bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: user.avatarColor }}><UserIcon size={28} /></div>
                <h3 className="font-bold text-xl text-slate-800">{user.name}</h3>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1" />
            </button>
          ))}
          <button onClick={onCreateNew} className="mt-4 bg-slate-100 border-2 border-dashed border-slate-300 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-slate-200 transition-all text-slate-500">
            <div className="bg-white p-3 rounded-full shadow-sm"><UserPlus /></div>
            <span className="font-bold">Añadir Usuario</span>
          </button>
        </div>
        <p className="text-center text-slate-400 text-sm mt-12">Datos locales persistentes.</p>
      </div>
    </div>
  );
};
export default Login;