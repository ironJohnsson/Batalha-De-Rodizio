import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogIn, LogOut, Utensils, Award } from 'lucide-react';

export default function Navbar({ onOpenAuth, onNavigateHome }) {
  const { user, stats, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              Batalha de Rodízio
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Contador & Placar ao Vivo
            </p>
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-all"
            title={isDark ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-700" />
            )}
          </button>

          {/* User Account / Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.nickname}
                </span>
                <span className="text-[10px] font-medium text-orange-500 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {stats?.title || 'Participante'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sair da Conta"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-red-950/40 dark:hover:border-red-900/50 dark:hover:text-red-400 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

