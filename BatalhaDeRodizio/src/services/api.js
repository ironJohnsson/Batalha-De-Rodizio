// Connect directly to backend port 4000 when running in dev on port 5173/5174
const API_BASE = (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '5174'))
  ? `http://${window.location.hostname}:4000/api`
  : '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('contarodizio_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr) {
    throw new Error('Não foi possível conectar ao servidor backend (Porta 4000). Verifique se o servidor está rodando.');
  }

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      throw new Error(`Resposta inválida do servidor (Status ${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new Error(data.error || `Erro no servidor (Status ${response.status}).`);
  }

  return data;
}
