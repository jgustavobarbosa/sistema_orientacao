'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { LogOut } from 'lucide-react';

export function UserProfileMenu({ session }: { session: Session }) {
  return (
    <div className="flex items-center gap-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-350 hidden sm:inline-block">
          Olá, <span className="font-semibold text-slate-100">{session.user.name}</span>
        </span>
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'Avatar'}
            className="h-8 w-8 rounded-full border border-slate-800"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center text-indigo-400 font-semibold text-xs shrink-0">
            {session.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl transition-all duration-200 cursor-pointer"
        title="Sair da Conta"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
