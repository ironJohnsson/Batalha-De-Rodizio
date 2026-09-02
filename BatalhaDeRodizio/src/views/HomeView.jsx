import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  Trophy,
  Flame,
  Utensils,
  PlusCircle,
  Award,
  History,
  TrendingUp,
  BarChart3,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Crown
} from 'lucide-react';

export default function HomeView({
  onCreateRoom,
  onJoinRoom,
  onOpenAuth,
  initialCode = ''
}) {
  const { user, stats, isAuthenticated } = useAuth();
  const [roomCode, setRoomCode] = useState(initialCode);
  const [roomName, setRoomName] = useState('');
  const [guestNickname, setGuestNickname] = useState('');
  const [activeTab, setActiveTab] = useState('join');
  const [leaderboard, setLeaderboard] = useState({ topWins: [], topSlices: [] });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

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

  const handleJoin = (e) => {
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

    onJoinRoom({
      code,
      userId: user?.id || null,
      nickname
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    const nickname = isAuthenticated ? user.nickname : guestNickname.trim();

    if (!nickname) {
      setError('Por favor, informe seu apelido para ser o anfitrião.');
      return;
    }

    onCreateRoom({
      name: roomName.trim() || 'Mesa de Rodízio',
      hostUserId: user?.id || null,
      hostNickname: nickname
    });
  };

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
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-all"
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
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  activeTab === 'join'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-orange-400 dark:border dark:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Entrar em Sala</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('create'); setError(''); }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  activeTab === 'create'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-orange-400 dark:border dark:border-zinc-700'
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
                    className="w-full uppercase font-mono tracking-widest text-center text-lg font-bold rounded-2xl border border-zinc-200 bg-zinc-50 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 dark:focus:border-orange-500"
                  />
                </div>

                {!isAuthenticated && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Seu Apelido na Mesa
                    </label>
                    <input
                      type="text"
                      value={guestNickname}
                      onChange={(e) => setGuestNickname(e.target.value)}
                      placeholder="Ex: Matheus"
                      maxLength={20}
                      required
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 dark:focus:border-orange-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <span>Entrar na Batalha</span>
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
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 dark:focus:border-orange-500"
                  />
                </div>

                {!isAuthenticated && (
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
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 dark:focus:border-orange-500"
                    />
                  </div>
                )}

                <div className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <span className="font-bold">Regra da Mesa:</span> Como criador da sala, apenas você terá o botão para finalizar a competição quando o rodízio terminar.
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Criar Sala e Gerar Código</span>
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
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Seu Perfil
                  </span>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                    {user.nickname}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <Award className="h-3.5 w-3.5" />
                  <span>{stats.title}</span>
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
            </div>
          ) : (
            <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-6 shadow-xl dark:border-orange-500/20 dark:bg-zinc-900">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Guarde suas Estatísticas
              </h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Cadastre um apelido e senha para registrar suas fatias em todos os rodízios, acompanhar sua média e subir de patente.
              </p>
              <button
                onClick={onOpenAuth}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-500 transition-all shadow-md shadow-orange-600/20"
              >
                <span>Criar Conta em 10 Segundos</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span>Mural dos Campeões</span>
              </h3>
            </div>

            {leaderboard.topWins.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">
                Nenhuma batalha registrada no ranking global ainda. Seja o primeiro a vencer!
              </p>
            ) : (
              <div className="space-y-2.5">
                {leaderboard.topWins.slice(0, 5).map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-zinc-400 w-4">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        {player.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-xs font-bold text-amber-500">
                        {player.wins} {player.wins === 1 ? 'vitória' : 'vitórias'}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        (Média: {player.avg_slices})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
