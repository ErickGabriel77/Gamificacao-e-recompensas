/* ═══════════════════════════════════════════════
   GAMEMARKET — DATABASE.JS
   Fica dentro de frontend/
   Faz chamadas HTTP para o server.js
═══════════════════════════════════════════════ */

const API = 'http://localhost:3000/api';

/* ─── Token JWT ─── */
const getToken   = ()      => localStorage.getItem('gm_token');
const saveToken  = (token) => localStorage.setItem('gm_token', token);
const clearToken = ()      => localStorage.removeItem('gm_token');

/* ─── Fetch com tratamento de erro ─── */
const apiFetch = async (url, options = {}) => {
  try {
    const res  = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.error || 'Erro desconhecido.' };
    return { data, error: null };
  } catch (err) {
    console.error('Erro na requisição:', err.message);
    return { data: null, error: 'Sem conexão com o servidor. Verifique se o server.js está rodando.' };
  }
};

/* ─── Headers com token ─── */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

/* ════════════════════════════════════════
   AUTENTICAÇÃO
════════════════════════════════════════ */

const dbRegister = async (username, email, password) => {
  const { data, error } = await apiFetch(`${API}/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, email, password })
  });
  if (error) return { user: null, error };
  saveToken(data.token);
  return { user: data.user, error: null };
};

const dbLogin = async (email, password) => {
  const { data, error } = await apiFetch(`${API}/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password })
  });
  if (error) return { user: null, error };
  saveToken(data.token);
  return { user: data.user, error: null };
};

const dbLogout = async () => {
  clearToken();
};

/* Lê o usuário do token JWT salvo */
const dbGetCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }
    return payload;
  } catch {
    clearToken();
    return null;
  }
};

/* Escuta mudanças de sessão (chamado no DOMContentLoaded) */
const dbOnAuthChange = (callback) => {
  callback(dbGetCurrentUser());
};

/* ════════════════════════════════════════
   PERFIL
════════════════════════════════════════ */

const dbLoadProfile = async () => {
  const { data, error } = await apiFetch(`${API}/profile`, {
    headers: authHeaders()
  });
  if (error) { console.error('Erro ao carregar perfil:', error); return null; }
  return data;
};

/* _userId ignorado — o server pega pelo token JWT */
const dbSaveProfile = async (_userId, profile) => {
  const { error } = await apiFetch(`${API}/profile`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(profile)
  });
  if (error) console.error('Erro ao salvar perfil:', error);
  return !error;
};

/* ════════════════════════════════════════
   COMENTÁRIOS
════════════════════════════════════════ */

const dbLoadComments = async (gameId) => {
  const { data } = await apiFetch(`${API}/comments/${gameId}`);
  return data || [];
};

const dbAddComment = async (gameId, _userId, _username, content) => {
  const { data, error } = await apiFetch(`${API}/comments`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ gameId, content })
  });
  if (error) { console.error('Erro ao comentar:', error); return false; }
  return true;
};

const dbHasCommented = async (gameId) => {
  const comments = await dbLoadComments(gameId);
  const user     = dbGetCurrentUser();
  if (!user) return false;
  return comments.some(c => c.user_id === user.id);
};

/* ════════════════════════════════════════
   GIFT CODES
════════════════════════════════════════ */

const dbSaveGiftCode = async (_userId, gameId, code) => {
  const { error } = await apiFetch(`${API}/giftcodes`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ gameId, code })
  });
  if (error) console.error('Erro ao salvar gift code:', error);
  return !error;
};

const dbGetGiftCode = async (_userId, gameId) => {
  const { data } = await apiFetch(`${API}/giftcodes/${gameId}`, {
    headers: authHeaders()
  });
  return data || null;
};

const dbCodeExists = async (code) => {
  const { data } = await apiFetch(`${API}/giftcodes/check/${code}`);
  return data?.exists || false;
};

const dbGenerateUniqueCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg   = () => Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  let code, exists = true;
  while (exists) {
    code   = `GAME-${seg()}-${seg()}-${seg()}`;
    exists = await dbCodeExists(code);
  }
  return code;
};

/* ════════════════════════════════════════
   LEADERBOARD
════════════════════════════════════════ */

const dbLoadLeaderboard = async () => {
  const { data } = await apiFetch(`${API}/leaderboard`);
  return data || [];
};