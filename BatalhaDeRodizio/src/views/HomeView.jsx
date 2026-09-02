import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { getTitleByStats } from '../utils/titles';
import { 
  Users, 
  PlusCircle, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Utensils, 
  Award, 
  History, 
  ArrowRight, 
  Sparkles, 
  User,
  Lock,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';

export default function HomeView({ 
  onCreateRoom, 
  onJoinRoom, 
  onOpenAuth, 
  onOpenProfile, 
  initialCode 
}) {
  const { user, stats, isAuthenticated, login, register } = useAuth();
  const [roomCode, setRoomCode] = useState(initialCode);
  const [roomName, setRoomName] = useState('');
  const [guestNickname, setGuestNickname] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [wantAccount, setWantAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('join');
  const [leaderboard, setLeaderboard] = useState({ topWins: [], topSlices: [] });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setRoomCode(initialCode.toUpperCase());
      setActiveTab('join');
    }
  }, [initialCode]);

  useEffect(() => {
    async function loadData() {
      try {
        const lbData = await apiRequest('/stats/leaderboard');
        setLeaderboard(lbData);
      } catch (err) {}

      if (isAuthenticated) {
        try {
          const histData = await apiRequest('/stats/history');
          setHistory(histData.history || []);
        } catch (err) {}
      }
    }
    loadData();
  }, [isAuthenticated]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    const code = roomCode.trim().toUpperCase();
    const nickname = isAuthenticated ? user.nickname : guestNickname.trim();

    if (!code) {
      setError('Por favor, digite o código da sala.');
      return;
    }

    if (!nickname) {
      setError('Por favor, digite seu apelido.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If user typed a password, authenticate or register on the fly
      if (!isAuthenticated && guestPassword) {
        let authResult;
        try {
          authResult = await login(nickname, guestPassword);
        } catch (loginErr) {
          authResult = await register(nickname, guestPassword);
        }

        onJoinRoom({
          code,
          userId: authResult.user.id,
          nickname: authResult.user.nickname
        });
        return;
      }

      onJoinRoom({
        code,
        userId: user?.id || null,
        nickname
      });
    } catch (err) {
      setError(err.message || 'Erro ao entrar na sala.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const nickname = isAuthenticated ? user.nickname : guestNickname.trim();

    if (!nickname) {
      setError('Por favor, informe seu apelido para ser o anfitrião.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isAuthenticated && guestPassword) {
        let authResult;
        try {
          authResult = await login(nickname, guestPassword);
        } catch (loginErr) {
          authResult = await register(nickname, guestPassword);
        }

        onCreateRoom({
          name: roomName.trim() || 'Mesa de Rodízio',
          hostUserId: authResult.user.id,
          hostNickname: authResult.user.nickname
        });
        return;
      }

      onCreateRoom({
        name: roomName.trim() || 'Mesa de Rodízio',
        hostUserId: user?.id || null,
        hostNickname: nickname
      });
    } catch (err) {
      setError(err.message || 'Erro ao criar a sala.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTitle = isAuthenticated ? getTitleByStats(stats?.wins, stats?.total_slices) : '';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Batalha de Rodízio
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Crie uma sala, compartilhe o código na mesa e dispute quem come mais fatias em tempo real.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end">
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Salvar histórico e médias: Crie sua conta</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1.5 dark:bg-zinc-950 mb-6 border border-zinc-200/50 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => { setActiveTab('join'); setError(''); }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'join'
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-orange-400 dark:border dark:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Entrar em Sala</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('create'); setError(''); }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-orange-400 dark:border dark:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Criar Nova Sala</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            )}

            {activeTab === 'join' ? (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Código da Sala
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ROD-A4B2"
                    maxLength={10}
                    required
                    className="w-full uppercase font-mono tracking-widest text-center text-lg font-bold rounded-2xl border border-zinc-200 bg-zinc-50 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 dark:focus:border-orange-500"
                  />
                </div>

                {!isAuthenticated && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Seu Apelido na Mesa
                      </label>
                      <input
                        type="text"
                        value={guestNickname}
                        onChange={(e) => setGuestNickname(e.target.value)}
                        placeholder="Ex: Josefina"
                        maxLength={20}
                        required
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 dark:focus:border-orange-500"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={wantAccount}
                          onChange={(e) => {
                            setWantAccount(e.target.checked);
                            if (!e.target.checked) setGuestPassword('');
                          }}
                          className="w-4 h-4 rounded text-orange-600 border-zinc-300 dark:border-zinc-700 focus:ring-orange-500 dark:bg-zinc-900"
                        />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Salvar no Mural dos Campeões (Criar Senha)</span>
                        </span>
                      </label>

                      {wantAccount && (
                        <div className="mt-2.5 animate-in fade-in duration-150 relative">
                          <input
                            type={showGuestPassword ? "text" : "password"}
                            value={guestPassword}
                            onChange={(e) => setGuestPassword(e.target.value)}
                            placeholder="Crie ou digite sua senha"
                            className="w-full rounded-xl border border-zinc-200 bg-white pr-10 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGuestPassword(!showGuestPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            title={showGuestPassword ? "Ocultar senha" : "Ver senha"}
                          >
                            {showGuestPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-all focus:outline-hidden focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Entrando...' : 'Entrar na Batalha'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Nome da Mesa / Rodízio (Opcional)
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Ex: Rodízio na Bella Pizza"
                    maxLength={40}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 dark:focus:border-orange-500"
                  />
                </div>

                {!isAuthenticated && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Seu Apelido (Anfitrião da Sala)
                      </label>
                      <input
                        type="text"
                        value={guestNickname}
                        onChange={(e) => setGuestNickname(e.target.value)}
                        placeholder="Ex: Carlos"
                        maxLength={20}
                        required
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 dark:focus:border-orange-500"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={wantAccount}
                          onChange={(e) => {
                            setWantAccount(e.target.checked);
                            if (!e.target.checked) setGuestPassword('');
                          }}
                          className="w-4 h-4 rounded text-orange-600 border-zinc-300 dark:border-zinc-700 focus:ring-orange-500 dark:bg-zinc-900"
                        />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Salvar no Mural dos Campeões (Criar Senha)</span>
                        </span>
                      </label>

                      {wantAccount && (
                        <div className="mt-2.5 animate-in fade-in duration-150 relative">
                          <input
                            type={showGuestPassword ? "text" : "password"}
                            value={guestPassword}
                            onChange={(e) => setGuestPassword(e.target.value)}
                            placeholder="Crie ou digite sua senha"
                            className="w-full rounded-xl border border-zinc-200 bg-white pr-10 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGuestPassword(!showGuestPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            title={showGuestPassword ? "Ocultar senha" : "Ver senha"}
                          >
                            {showGuestPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <span className="font-bold">Regra da Mesa:</span> Como criador da sala, apenas você terá o botão para finalizar a competição quando o rodízio terminar.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-all focus:outline-hidden focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{isSubmitting ? 'Criando...' : 'Criar Sala e Gerar Código'}</span>
                </button>
              </form>
            )}
          </div>

          {isAuthenticated && history.length > 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-orange-500" />
                  <span>Seus Últimos Rodízios</span>
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {history.length} sessões
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {history.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {item.room_name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Campeão: <span className="font-semibold text-amber-500">{item.winner_nickname}</span> • {item.total_players} jogadores
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-black text-orange-600 dark:text-orange-400">
                        {item.slice_count} fatias
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        {item.finished_at ? new Date(item.finished_at).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          {isAuthenticated && stats ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
              {/* Profile Card Header - Clickable anywhere to edit! */}
              <div 
                onClick={onOpenProfile}
                className="group flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800 cursor-pointer"
                title="Clique para abrir e editar seu perfil"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                    <span>Seu Perfil</span>
                    <Edit3 className="w-3 h-3 text-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {user.nickname}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20 group-hover:scale-105 transition-transform">
                  <Award className="h-3.5 w-3.5" />
                  <span>{currentTitle}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-[11px] font-semibold">Média de Fatias</span>
                  </div>
                  <span className="font-mono text-2xl font-black text-zinc-900 dark:text-white">
                    {stats.avg_slices}
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[11px] font-semibold">Vitórias</span>
                  </div>
                  <span className="font-mono text-2xl font-black text-amber-500">
                    {stats.wins}
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                    <Flame className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-[11px] font-semibold">Recorde (1 sessão)</span>
                  </div>
                  <span className="font-mono text-2xl font-black text-zinc-900 dark:text-white">
                    {stats.max_slices}
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                    <Utensils className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[11px] font-semibold">Total Devorado</span>
                  </div>
                  <span className="font-mono text-2xl font-black text-zinc-900 dark:text-white">
                    {stats.total_slices}
                  </span>
                </div>
              </div>

              {/* View / Edit Profile Button */}
              <button
                type="button"
                onClick={onOpenProfile}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white py-3 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>Editar Perfil e Alterar Apelido</span>
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-6 shadow-xl dark:border-orange-500/20 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 font-bold mb-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-base font-black">Crie Sua Conta de Guerreiro</h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Cadastre-se para calcular sua média de fatias por rodízio, salvar suas vitórias e disputar o Mural dos Campeões com seus amigos!
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full rounded-2xl bg-orange-600 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/30 hover:bg-orange-500 transition-all cursor-pointer"
              >
                Entrar ou Criar Conta
              </button>
            </div>
          )}

          {/* Leaderboard */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Mural dos Campeões</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-medium">Contas Verificadas</span>
            </div>

            {leaderboard.topWins && leaderboard.topWins.length > 0 ? (
              <div className="space-y-2.5">
                {leaderboard.topWins.map((champ, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 text-center font-mono font-black text-xs ${
                        idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-amber-700' : 'text-zinc-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block leading-tight">
                          {champ.nickname}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                          (Média de fatias: <strong className="text-zinc-700 dark:text-zinc-300">{champ.avg_slices}</strong>)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-amber-500 block">
                        {champ.wins} {champ.wins === 1 ? 'vitória' : 'vitórias'}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {champ.total_slices} fatias total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-400">
                Nenhum campeão registrado ainda. Crie uma sala e termine o primeiro rodízio!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
