/* ═══════════════════════════════════════════════
   GAMEMARKET — SERVER.JS
   Servidor Node.js + MySQL
   Rode com: node server.js
═══════════════════════════════════════════════ */
require('dotenv').config();

const express = require('express');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─── Middlewares ─── */
app.use(cors());
app.use(express.json());

/* Serve os arquivos do frontend automaticamente */
app.use(express.static(path.join(__dirname, 'frontend')));

/* ─── Conexão com MySQL ─── */
const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10
});

/* Testa a conexão ao iniciar */
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado com sucesso!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar no MySQL:', err.message);
    console.error('Verifique o arquivo .env e se o MySQL está rodando.');
  });

/* ─── Middleware JWT ─── */
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

/* ════════════════════════════════════════
   AUTH — CADASTRO E LOGIN
════════════════════════════════════════ */

/* POST /api/register */
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || username.length < 3)
    return res.status(400).json({ error: 'Nome deve ter pelo menos 3 caracteres.' });
  if (!email || !email.includes('@'))
    return res.status(400).json({ error: 'E-mail inválido.' });
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });

  try {
    /* Verifica duplicidade */
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: 'E-mail ou usuário já cadastrado.' });

    /* Cria usuário */
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hash]
    );
    const userId = result.insertId;

    /* Cria perfil de gamificação */
    await pool.query(
      'INSERT INTO profiles (user_id) VALUES (?)',
      [userId]
    );

    /* Gera token */
    const token = jwt.sign(
      { id: userId, username, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: userId, username, email }
    });

  } catch (err) {
    console.error('Erro no cadastro:', err.message);
    res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
});

/* POST /api/login */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0)
      return res.status(401).json({ error: 'E-mail não encontrado.' });

    const user = users[0];
    const ok   = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ error: 'Senha incorreta.' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
});

/* ════════════════════════════════════════
   PERFIL
════════════════════════════════════════ */

/* GET /api/profile */
app.get('/api/profile', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Perfil não encontrado.' });

    const p = rows[0];
    res.json({
      id:                     p.user_id,
      username:               req.user.username,
      level:                  p.level,
      xp:                     p.xp,
      points:                 p.points,
      badges:                 p.badges    || [],
      purchases:              p.purchases || [],
      shares:                 p.shares    || [],
      ratings:                p.ratings   || {},
      missions:               p.missions  || null,
      missionDate:            p.mission_date,
      allMissionsRewardGiven: !!p.all_missions_reward_given,
      stats: {
        totalPurchases: p.total_purchases,
        totalRatings:   p.total_ratings,
        totalShares:    p.total_shares,
        totalSpent:     parseFloat(p.total_spent || 0),
        totalComments:  p.total_comments
      }
    });

  } catch (err) {
    console.error('Erro ao carregar perfil:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* PUT /api/profile */
app.put('/api/profile', auth, async (req, res) => {
  const p = req.body;
  try {
    await pool.query(`
      UPDATE profiles SET
        level                     = ?,
        xp                        = ?,
        points                    = ?,
        badges                    = ?,
        purchases                 = ?,
        shares                    = ?,
        ratings                   = ?,
        missions                  = ?,
        mission_date              = ?,
        all_missions_reward_given = ?,
        total_purchases           = ?,
        total_ratings             = ?,
        total_shares              = ?,
        total_spent               = ?,
        total_comments            = ?
      WHERE user_id = ?
    `, [
      p.level       || 1,
      p.xp          || 0,
      p.points      || 0,
      JSON.stringify(p.badges    || []),
      JSON.stringify(p.purchases || []),
      JSON.stringify(p.shares    || []),
      JSON.stringify(p.ratings   || {}),
      p.missions ? JSON.stringify(p.missions) : null,
      p.missionDate || null,
      p.allMissionsRewardGiven ? 1 : 0,
      p.stats?.totalPurchases || 0,
      p.stats?.totalRatings   || 0,
      p.stats?.totalShares    || 0,
      p.stats?.totalSpent     || 0,
      p.stats?.totalComments  || 0,
      req.user.id
    ]);

    res.json({ message: 'Perfil salvo!' });

  } catch (err) {
    console.error('Erro ao salvar perfil:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* ════════════════════════════════════════
   COMENTÁRIOS
════════════════════════════════════════ */

/* GET /api/comments/:gameId */
app.get('/api/comments/:gameId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM comments WHERE game_id = ? ORDER BY created_at DESC',
      [req.params.gameId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao carregar comentários:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* POST /api/comments */
app.post('/api/comments', auth, async (req, res) => {
  const { gameId, content } = req.body;

  if (!content?.trim())
    return res.status(400).json({ error: 'Comentário vazio.' });

  try {
    const [existing] = await pool.query(
      'SELECT id FROM comments WHERE game_id = ? AND user_id = ?',
      [gameId, req.user.id]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: 'Você já comentou neste jogo.' });

    await pool.query(
      'INSERT INTO comments (game_id, user_id, username, content) VALUES (?, ?, ?, ?)',
      [gameId, req.user.id, req.user.username, content.trim()]
    );

    res.status(201).json({ message: 'Comentário salvo!' });

  } catch (err) {
    console.error('Erro ao salvar comentário:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* ════════════════════════════════════════
   GIFT CODES
════════════════════════════════════════ */

/* POST /api/giftcodes */
app.post('/api/giftcodes', auth, async (req, res) => {
  const { gameId, code } = req.body;
  try {
    await pool.query(
      'INSERT INTO gift_codes (user_id, game_id, code) VALUES (?, ?, ?)',
      [req.user.id, gameId, code]
    );
    res.status(201).json({ message: 'Código salvo!' });
  } catch (err) {
    console.error('Erro ao salvar gift code:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* GET /api/giftcodes/:gameId */
app.get('/api/giftcodes/:gameId', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM gift_codes WHERE user_id = ? AND game_id = ?',
      [req.user.id, req.params.gameId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* GET /api/giftcodes/check/:code */
app.get('/api/giftcodes/check/:code', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM gift_codes WHERE code = ?',
      [req.params.code]
    );
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* ════════════════════════════════════════
   LEADERBOARD
════════════════════════════════════════ */

/* GET /api/leaderboard */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.username,
        p.points,
        p.level,
        RANK() OVER (ORDER BY p.points DESC) AS rank
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.points DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro no leaderboard:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* ─── Qualquer outra rota serve o frontend ─── */
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

/* ─── Inicia o servidor ─── */
app.listen(PORT, () => {
  console.log(`🎮 GameMarket rodando em http://localhost:${PORT}`);
  console.log(`   Pressione Ctrl+C para parar`);
});
