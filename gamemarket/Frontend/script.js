/* ═══════════════════════════════════════════════════════════
   GAMEMARKET v4.0 — SCRIPT.JS
   Backend: Node.js + MySQL
   database.js faz todas as chamadas à API
═══════════════════════════════════════════════════════════ */
'use strict';

/* ─────────────────────────────────────────────
   1. CONSTANTES
───────────────────────────────────────────── */
const LEVEL_TITLES = [
  '','Iniciante','Aprendiz','Guerreiro','Veterano','Elite',
  'Especialista','Mestre','Grão-Mestre','Lendário','Supremo'
];

const getXpForLevel    = (level) => level * 50;
const getLevelDiscount = (level) => Math.min(level, 10);
const COIN_VALUE       = 0.01;
const coinsToBRL       = (coins) => (coins * COIN_VALUE).toFixed(2).replace('.', ',');

const ALL_BADGES = [
  { id:'first_purchase', icon:'🛒', name:'Primeira Compra',  desc:'Comprou seu primeiro jogo'     },
  { id:'critic',         icon:'⭐', name:'Crítico',          desc:'Avaliou 5 jogos'               },
  { id:'commenter',      icon:'💬', name:'Comentador',       desc:'Deixou 5 comentários'          },
  { id:'sharer',         icon:'📢', name:'Compartilhador',   desc:'Compartilhou 3 jogos'          },
  { id:'retailer',       icon:'🏪', name:'Varejista',        desc:'Comprou 10 jogos'              },
  { id:'master_gamer',   icon:'👑', name:'Mestre Gamer',     desc:'Atingiu o nível 10'            },
  { id:'explorer',       icon:'🗺️', name:'Explorador',      desc:'Comprou jogo de 3 plataformas' }
];

const MISSION_TEMPLATES = [
  { id:'daily_login',    icon:'fa-right-to-bracket', name:'Login Diário',    target:1, reward:5,  type:'login'    },
  { id:'browse_games',   icon:'fa-eye',              name:'Ver 5 Jogos',     target:5, reward:15, type:'browse'   },
  { id:'daily_purchase', icon:'fa-cart-shopping',    name:'Comprar 1 Jogo',  target:1, reward:30, type:'purchase' },
  { id:'daily_rate',     icon:'fa-star',             name:'Avaliar 1 Jogo',  target:1, reward:20, type:'rate'     },
  { id:'daily_comment',  icon:'fa-comment',          name:'Comentar 1 Jogo', target:1, reward:10, type:'comment'  }
];

const FAKE_PLAYERS = [
  { name:'NeonKnight',   points:4850, level:9 },
  { name:'CyberHunter',  points:4200, level:8 },
  { name:'PixelQueen',   points:3750, level:8 },
  { name:'DarkShadow99', points:3100, level:7 },
  { name:'StarBlaster',  points:2800, level:6 },
  { name:'VoidWalker',   points:2400, level:6 },
  { name:'GlitchMaster', points:1900, level:5 },
  { name:'ByteRunner',   points:1500, level:4 },
  { name:'LaserFox',     points:1100, level:3 },
  { name:'NanoBot',      points:700,  level:2 }
];

/* ─────────────────────────────────────────────
   2. CATÁLOGO DE JOGOS
───────────────────────────────────────────── */
const getBg = (plat) => {
  const c = { playstation:'003087', xbox:'107c10', nintendo:'e4000f', steam:'1b2838' };
  return `https://placehold.co/600x338/${c[plat]}/ffffff?text=`;
};

const GAMES_DATA = [
  { id:'ps_001', title:"God of War: Ragnarök",         platform:'playstation', price:179.90, originalPrice:299.90, rating:4.9, badges:['popular','sale'],    description:"Embarque em uma épica jornada nórdica com Kratos e Atreus. Enfrente os deuses do Ragnarök em combates brutais e explore os Nove Reinos.",                      image:"img/games/god-of-war-ragnarok.jpg",      reviews:[{author:"GamerPro",rating:5,text:"Obra-prima absoluta!"},{author:"NorseWarrior",rating:5,text:"Combate incrível!"}] },
  { id:'ps_002', title:"Spider-Man 2",                  platform:'playstation', price:249.90, originalPrice:299.90, rating:4.8, badges:['new','popular'],      description:"Peter Parker e Miles Morales unem forças para enfrentar Venom e Kraven em Nova York.",                                                                              image:"img/games/Spiderman2.jpg",     reviews:[{author:"WebHead",rating:5,text:"Melhor Homem-Aranha!"},{author:"MarvelFan",rating:5,text:"Perfeito."}] },
  { id:'ps_003', title:"Horizon Forbidden West",        platform:'playstation', price:149.90, originalPrice:249.90, rating:4.7, badges:['sale'],               description:"Aloy continua sua jornada pelo oeste proibido, enfrentando novas máquinas em um mundo pós-apocalíptico.",                                                             image:"img/games/horizon.jpg",     reviews:[{author:"AloyStan",rating:5,text:"Mundo aberto incrível!"}] },
  { id:'ps_004', title:"Demon's Souls Remake",          platform:'playstation', price:199.90, originalPrice:299.90, rating:4.6, badges:['sale'],               description:"O clássico que definiu um gênero, completamente reconstruído para PS5 com gráficos deslumbrantes.",                                                                 image:"img/games/demon-souls.jpg",     reviews:[{author:"SoulsVet",rating:5,text:"Remake perfeito!"}] },
  { id:'ps_005', title:"Final Fantasy XVI",             platform:'playstation', price:229.90, originalPrice:299.90, rating:4.7, badges:['popular'],            description:"Uma nova era de Final Fantasy com combate em tempo real e Eikons épicos em Valisthea.",                                                                              image:"img/games/FF.jpg",reviews:[{author:"FFLegacy",rating:5,text:"Melhor FF em anos!"}] },
  { id:'ps_006', title:"Returnal",                      platform:'playstation', price:169.90, originalPrice:249.90, rating:4.5, badges:['sale'],               description:"Roguelike de ficção científica com combate bullet-hell frenético. Cada morte revela mais da história.",                                                             image:"img/games/returnal.jpg",         reviews:[{author:"RogueKing",rating:5,text:"Viciante!"}] },
  { id:'ps_007', title:"Ratchet & Clank: Rift Apart",  platform:'playstation', price:189.90, originalPrice:249.90, rating:4.8, badges:['popular'],            description:"Viaje entre dimensões com Ratchet e Rivet em uma aventura colorida que demonstra o poder do PS5.",                                                               image:"img/games/RC.jpg",    reviews:[{author:"PlatformFan",rating:5,text:"Tecnicamente impressionante!"}] },
  { id:'ps_008', title:"Ghostwire: Tokyo",              platform:'playstation', price:99.90,  originalPrice:199.90, rating:4.3, badges:['sale'],               description:"Explore um Tokyo sobrenatural repleto de espíritos. Use poderes psíquicos para purificar a cidade.",                                                              image:"img/games/GT.jpg",  reviews:[{author:"TokyoFan",rating:4,text:"Atmosfera única!"}] },
  /* ── Xbox ── */
  { id:'xb_001', title:"Halo Infinite",                 platform:'xbox',        price:149.90, originalPrice:249.90, rating:4.6, badges:['popular','sale'],    description:"Master Chief retorna em uma aventura de mundo aberto com multiplayer gratuito e mecânicas de gancho.",                                                              image:"img/games/Halo.jpg",           reviews:[{author:"SpartanPro",rating:5,text:"Campanha incrível!"}] },
  { id:'xb_002', title:"Forza Horizon 5",               platform:'xbox',        price:199.90, originalPrice:249.90, rating:4.9, badges:['popular'],            description:"O melhor jogo de corrida em um México deslumbrante. Mais de 500 carros e mundo aberto sem igual.",                                                               image:"img/games/Forza.jpg",         reviews:[{author:"SpeedKing",rating:5,text:"Melhor corrida EVER!"}] },
  { id:'xb_003', title:"Microsoft Flight Simulator 2024",platform:'xbox',       price:299.90, originalPrice:349.90, rating:4.8, badges:['new'],                description:"A simulação de voo mais realista já criada. Todo o planeta Terra como playground.",                                                                            image:"img/games/MFS.jpg",        reviews:[{author:"PilotPro",rating:5,text:"Revolucionário!"}] },
  { id:'xb_004', title:"Starfield",                     platform:'xbox',        price:229.90, originalPrice:299.90, rating:4.4, badges:['popular'],            description:"Explore mais de 1000 planetas no primeiro RPG espacial da Bethesda em 25 anos.",                                                                               image:"img/games/starfield.jpg",               reviews:[{author:"SpaceExplorer",rating:5,text:"Horas de conteúdo!"}] },
  { id:'xb_005', title:"Senua's Saga: Hellblade II",    platform:'xbox',        price:199.90, originalPrice:249.90, rating:4.7, badges:['new'],                description:"A jornada perturbadora de Senua continua na Islândia medieval com áudio binaural único.",                                                                    image:"img/games/hell.jpg",             reviews:[{author:"NarrativeGamer",rating:5,text:"Arte interativa!"}] },
  { id:'xb_006', title:"Gears 5",                       platform:'xbox',        price:99.90,  originalPrice:199.90, rating:4.5, badges:['sale'],               description:"Kait Diaz assume o centro em uma aventura épica com co-op, multiplayer e modo Horda.",                                                                       image:"img/games/gear 5.jpg",                 reviews:[{author:"GearHead",rating:5,text:"Melhor Gears!"}] },
  { id:'xb_007', title:"Fable",                         platform:'xbox',        price:279.90, originalPrice:299.90, rating:4.6, badges:['new'],                description:"O renascimento da amada série RPG. Explore Albion com humor britânico e escolhas morais.",                                                                    image:"img/games/fable.jpg",              reviews:[{author:"FableLegend",rating:5,text:"Bem-vindo de volta!"}] },
  { id:'xb_008', title:"Sea of Thieves",                platform:'xbox',        price:119.90, originalPrice:199.90, rating:4.4, badges:['sale','popular'],     description:"Seja o pirata que sempre quis ser. Navegue, saquie e lute com amigos em mundo compartilhado.",                                                               image:"img/games/SOF.jpg",          reviews:[{author:"PirateKing",rating:5,text:"Melhor com amigos!"}] },
  /* ── Nintendo ── */
  { id:'nt_001', title:"Zelda: Tears of the Kingdom",   platform:'nintendo',    price:299.90, originalPrice:349.90, rating:5.0, badges:['popular'],            description:"Link explora os céus e profundezas de Hyrule com novas habilidades revolucionárias. Construa e explore em liberdade total.",                                  image:"img/games/zelda.jpg",          reviews:[{author:"ZeldaFan",rating:5,text:"Melhor jogo de todos os tempos."},{author:"HyruleHero",rating:5,text:"Criatividade sem limites!"}] },
  { id:'nt_002', title:"Super Mario Bros. Wonder",       platform:'nintendo',    price:279.90, originalPrice:299.90, rating:4.9, badges:['popular','new'],      description:"Mario se reinventa com a Flor Maravilha que transforma cada fase de formas inesperadas.",                                                                   image:"img/games/mario.jpg",        reviews:[{author:"PlumberFan",rating:5,text:"Criativo e divertido!"}] },
  { id:'nt_003', title:"Pokémon Scarlet",                platform:'nintendo',    price:249.90, originalPrice:299.90, rating:4.3, badges:['popular'],            description:"Explore Paldea em um mundo aberto de Pokémon pela primeira vez com três jornadas independentes.",                                                             image:"img/games/pokemon.jpg",     reviews:[{author:"PokeMaster",rating:4,text:"Conceito incrível!"}] },
  { id:'nt_004', title:"Metroid Prime 4: Beyond",       platform:'nintendo',    price:299.90, originalPrice:299.90, rating:4.8, badges:['new'],                description:"Samus Aran retorna em uma aventura galáctica de primeira pessoa. Explore e derrote ameaças cósmicas.",                                                     image:"img/games/metroid.jpg",     reviews:[{author:"SamusFan",rating:5,text:"Valeu a espera!"}] },
  { id:'nt_005', title:"Splatoon 3",                    platform:'nintendo',    price:229.90, originalPrice:299.90, rating:4.6, badges:['sale'],               description:"O shooter de tinta mais colorido volta com novas armas, modos e campanha Retorno dos Mamíferos.",                                                            image:"img/games/platon.jpg",          reviews:[{author:"InkMaster",rating:5,text:"Multiplayer viciante!"}] },
  { id:'nt_006', title:"Fire Emblem Engage",            platform:'nintendo',    price:199.90, originalPrice:249.90, rating:4.5, badges:['sale'],               description:"Convoque heróis lendários com os Emblemas. Estratégia tática profunda com sistema de relacionamentos.",                                                     image:"img/games/fire.jpg",  reviews:[{author:"TacticsKing",rating:5,text:"Sistema fantástico!"}] },
  /* ── Steam ── */
  { id:'st_001', title:"Baldur's Gate 3",               platform:'steam',       price:199.90, originalPrice:249.90, rating:5.0, badges:['popular'],            description:"O RPG definitivo baseado em D&D. Escolhas que importam, personagens memoráveis e co-op para 4 jogadores.",                                                  image:"img/games/baldurs.jpg",         reviews:[{author:"DnDMaster",rating:5,text:"GOTY de todos os anos."},{author:"RPGLegend",rating:5,text:"Nunca vi tantas escolhas!"}] },
  { id:'st_002', title:"Cyberpunk 2077: Phantom Liberty",platform:'steam',      price:149.90, originalPrice:199.90, rating:4.8, badges:['popular','sale'],     description:"A expansão que redimiu Cyberpunk 2077. Espionagem e traição em Dogtown com Idris Elba.",                                                                  image:"img/games/cyberpunk.jpg",         reviews:[{author:"NightCityV",rating:5,text:"Melhor que o jogo base!"}] },
  { id:'st_003', title:"Elden Ring: Shadow of the Erdtree",platform:'steam',    price:179.90, originalPrice:219.90, rating:4.9, badges:['popular'],            description:"A expansão definitiva de Elden Ring. O País das Sombras com novos inimigos e o desafio mais brutal da FromSoftware.",                                      image:"img/games/eldenring.jpg",             reviews:[{author:"TarnishedOne",rating:5,text:"60+ horas de puro sofrimento feliz."}] },
  { id:'st_004', title:"Palworld",                      platform:'steam',       price:79.90,  originalPrice:99.90,  rating:4.4, badges:['popular','sale'],     description:"Capture e treine criaturas em um mundo de sobrevivência. Construa bases e sobreviva com amigos.",                                                          image:"img/games/palword.jpg",               reviews:[{author:"PalTrainer",rating:4,text:"Viciante demais!"}] },
  { id:'st_005', title:"Hades II",                      platform:'steam',       price:89.90,  originalPrice:109.90, rating:4.9, badges:['new','popular'],      description:"Melinoë luta contra Cronos no Olimpo. Roguelike com narrativa brilhante e jogabilidade viciante.",                                                          image:"img/games/hades.jpg",                reviews:[{author:"RogueLord",rating:5,text:"Supera o original!"}] },
  { id:'st_006', title:"Black Myth: Wukong",            platform:'steam',       price:229.90, originalPrice:249.90, rating:4.8, badges:['new'],                description:"Baseado na Jornada ao Oeste, enfrente monstros da mitologia chinesa em combates espetaculares.",                                                         image:"img/games/wukong.jpg",      reviews:[{author:"WukongFan",rating:5,text:"Visualmente deslumbrante!"}] }
];

const HERO_SLIDES = [
  { gameId:'xb_001', tag:'🏆 Jogo do Ano'   },
  { gameId:'st_003', tag:'⭐ Melhor RPG'    },
  { gameId:'ps_001', tag:'🔥 Mais Vendido'  },
  { gameId:'xb_002', tag:'🚗 Melhor Corrida'}
];

/* ─────────────────────────────────────────────
   3. ESTADO GLOBAL
───────────────────────────────────────────── */
const state = {
  user:               null,   // perfil vindo do banco
  currentUser:        null,   // dados do JWT (id, username, email)
  games:              GAMES_DATA,
  filteredGames:      [...GAMES_DATA],
  currentFilter:      'all',
  currentSort:        'default',
  searchQuery:        '',
  currentGame:        null,
  heroSlide:          0,
  heroInterval:       null,
  browsedGames:       new Set(),
  useCoinsInCheckout: false
};

/* ─────────────────────────────────────────────
   4. UTILITÁRIOS
───────────────────────────────────────────── */
const setEl = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

const setButtonLoading = (btn, loading, originalHTML = '') => {
  if (!btn) return;
  btn.disabled  = loading;
  btn.innerHTML = loading
    ? '<i class="fas fa-spinner fa-spin"></i> Aguarde...'
    : originalHTML;
};

/* ─────────────────────────────────────────────
   5. MISSÕES DIÁRIAS
───────────────────────────────────────────── */
const shouldResetMissions = () => {
  const today = new Date().toDateString();
  return state.user?.missionDate !== today;
};

const generateDailyMissions = () => {
  const login  = MISSION_TEMPLATES[0];
  const others = [...MISSION_TEMPLATES.slice(1)]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  return [login, ...others].map(t => ({
    ...t, progress:0, completed:false, rewarded:false
  }));
};

const initMissions = async () => {
  const today = new Date().toDateString();
  if (shouldResetMissions()) {
    state.user.missions               = generateDailyMissions();
    state.user.missionDate            = today;
    state.user.allMissionsRewardGiven = false;
    await dbSaveProfile(null, state.user);
  }
  await progressMission('login', 1);
};

const progressMission = async (type, amount = 1) => {
  if (!state.user?.missions) return;
  let updated = false;

  state.user.missions.forEach(m => {
    if (m.type !== type || m.completed) return;
    m.progress = Math.min(m.progress + amount, m.target);
    if (m.progress >= m.target && !m.rewarded) {
      m.completed = true;
      m.rewarded  = true;
      state.user.points += m.reward;
      showToast('Missão Completa!', `"${m.name}" — +${m.reward} moedas`, 'success', '🎯');
      updated = true;
    }
    updated = true;
  });

  if (updated) {
    checkAllMissionsComplete();
    await dbSaveProfile(null, state.user);
    updateSidebarProfile();
    renderMissions();
  }
};

const checkAllMissionsComplete = async () => {
  if (!state.user?.missions) return;
  if (state.user.missions.every(m => m.completed) && !state.user.allMissionsRewardGiven) {
    state.user.allMissionsRewardGiven = true;
    state.user.points += 100;
    state.user.xp     += 50;
    showToast('🎉 Missões do Dia!', 'Completou tudo! +100 moedas +50 XP', 'xp', '🏆');
    await dbSaveProfile(null, state.user);
    updateSidebarProfile();
  }
};

/* ─────────────────────────────────────────────
   6. GAMIFICAÇÃO
───────────────────────────────────────────── */
const addXp = async (amount) => {
  state.user.xp += amount;
  let leveledUp = false;

  while (state.user.level < 10) {
    const needed = getXpForLevel(state.user.level);
    if (state.user.xp >= needed) {
      state.user.xp    -= needed;
      state.user.level++;
      leveledUp = true;
    } else break;
  }

  if (state.user.level >= 10)
    state.user.xp = Math.min(state.user.xp, getXpForLevel(10));

  await dbSaveProfile(null, state.user);
  updateSidebarProfile();
  if (leveledUp) { await checkBadge('master_gamer'); showLevelUpModal(); }
};

const addPoints = async (amount) => {
  state.user.points += amount;
  await dbSaveProfile(null, state.user);
  updateSidebarProfile();
};

const checkBadge = async (id) => {
  if (state.user.badges.includes(id)) return;
  const b = ALL_BADGES.find(b => b.id === id);
  if (!b) return;
  state.user.badges.push(id);
  await dbSaveProfile(null, state.user);
  showToast('Badge Desbloqueada!', `${b.icon} ${b.name}`, 'warning', '🏅');
};

const checkAllBadges = async () => {
  const { purchases, stats, level, shares } = state.user;
  if (purchases.length >= 1)          await checkBadge('first_purchase');
  if (stats.totalRatings >= 5)        await checkBadge('critic');
  if ((stats.totalComments||0) >= 5)  await checkBadge('commenter');
  if (shares.length >= 3)             await checkBadge('sharer');
  if (purchases.length >= 10)         await checkBadge('retailer');
  if (level >= 10)                    await checkBadge('master_gamer');
  const plats = new Set(
    purchases.map(pid => GAMES_DATA.find(g => g.id === pid)?.platform).filter(Boolean)
  );
  if (plats.size >= 3) await checkBadge('explorer');
};

/* ─────────────────────────────────────────────
   7. AÇÕES DO USUÁRIO
───────────────────────────────────────────── */
const purchaseGame = async (gameId, useCoins = false) => {
  const game = GAMES_DATA.find(g => g.id === gameId);
  if (!game) return;

  if (state.user.purchases.includes(gameId)) {
    showToast('Já Adquirido', 'Você já possui este jogo!', 'info', 'ℹ️');
    return;
  }

  /* Calcula preço */
  const levelDiscount = getLevelDiscount(state.user.level);
  let   finalPrice    = game.price * (1 - levelDiscount / 100);
  let   coinsUsed     = 0;

  if (useCoins && state.user.points > 0) {
    const maxCoinDisc = finalPrice * 0.5;
    const coinDisc    = Math.min(state.user.points * COIN_VALUE, maxCoinDisc);
    coinsUsed         = Math.floor(coinDisc / COIN_VALUE);
    finalPrice       -= coinsUsed * COIN_VALUE;
    state.user.points -= coinsUsed;
  }

  /* Gera gift code único */
  const giftCode = await dbGenerateUniqueCode();
  await dbSaveGiftCode(null, gameId, giftCode);

  /* Atualiza perfil */
  state.user.purchases.push(gameId);
  state.user.stats.totalPurchases++;
  state.user.stats.totalSpent += finalPrice;

  await addXp(50);
  await addPoints(50);
  await progressMission('purchase', 1);
  await checkAllBadges();
  await dbSaveProfile(null, state.user);

  closeModal('modal-checkout');
  showPurchaseSuccessModal(game, giftCode, coinsUsed);
  renderGames();
  updateLibraryBadge();
};

const rateGame = async (gameId, rating) => {
  if (state.user.ratings[gameId]) {
    showToast('Já Avaliado', 'Você já avaliou este jogo!', 'info', 'ℹ️');
    return;
  }
  state.user.ratings[gameId] = rating;
  state.user.stats.totalRatings++;
  await addPoints(10);
  await progressMission('rate', 1);
  await checkAllBadges();
  await dbSaveProfile(null, state.user);
  showToast('Avaliação Enviada!', '+10 moedas', 'success', '⭐');
};

const shareGame = async (gameId) => {
  const game = GAMES_DATA.find(g => g.id === gameId);
  if (!game) return;
  if (state.user.shares.includes(gameId)) {
    showToast('Já Compartilhado', 'Você já compartilhou!', 'info', 'ℹ️');
    return;
  }
  state.user.shares.push(gameId);
  state.user.stats.totalShares++;
  await addPoints(20);
  await checkAllBadges();
  await dbSaveProfile(null, state.user);
  navigator.clipboard?.writeText(`https://gamemarket.gg/game/${gameId}`).catch(() => {});
  showToast('Link Copiado!', '+20 moedas', 'success', '📤');
};

const addComment = async (gameId, text) => {
  if (!text.trim()) {
    showToast('Erro', 'Escreva algo antes de comentar.', 'error', '❌');
    return false;
  }

  const ok = await dbAddComment(gameId, null, null, text.trim());
  if (!ok) return false;

  state.user.stats.totalComments = (state.user.stats.totalComments || 0) + 1;
  await addPoints(5);
  await progressMission('comment', 1);
  await checkAllBadges();
  await dbSaveProfile(null, state.user);
  showToast('Comentário Enviado!', '+5 moedas', 'success', '💬');
  return true;
};

/* ─────────────────────────────────────────────
   8. SIDEBAR
───────────────────────────────────────────── */
const updateSidebarProfile = () => {
  if (!state.user) return;
  const { user }  = state;
  const discount  = getLevelDiscount(user.level);
  const xpNeeded  = getXpForLevel(user.level);
  const xpPct     = user.level >= 10
    ? 100
    : Math.min((user.xp / xpNeeded) * 100, 100);

  setEl('sidebar-username',    user.username);
  setEl('header-username',     user.username);
  setEl('sidebar-level-badge', user.level);
  setEl('sidebar-level-title', LEVEL_TITLES[user.level] || 'Supremo');
  setEl('xp-text', `${user.xp} / ${user.level >= 10 ? '∞' : xpNeeded}`);

  const xpBar = document.getElementById('xp-bar');
  if (xpBar) xpBar.style.width = `${xpPct}%`;

  setEl('sidebar-points', user.points.toLocaleString('pt-BR'));
  setEl('coins-brl',      `= R$ ${coinsToBRL(user.points)}`);
  setEl('discount-text',  `${discount}% de desconto (nível ${user.level})`);
};

const renderMissions = () => {
  const list = document.getElementById('missions-list');
  if (!list || !state.user?.missions) return;

  const now      = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const h    = Math.floor(diff / 3600000);
  const m    = Math.floor((diff % 3600000) / 60000);
  setEl('missions-reset-time', `${h}h ${m}m`);

  list.innerHTML = state.user.missions.map(mission => {
    const pct = Math.min((mission.progress / mission.target) * 100, 100);
    return `
      <div class="mission-item">
        <div class="mission-header">
          <span class="mission-name">
            <i class="fas ${mission.icon}"></i> ${mission.name}
          </span>
          <span class="mission-progress-text">${mission.progress}/${mission.target}</span>
        </div>
        <div class="mission-bar-wrap">
          <div class="mission-bar ${mission.completed ? 'complete' : ''}"
               style="width:${pct}%"></div>
        </div>
        <span class="mission-reward">+${mission.reward} moedas</span>
      </div>`;
  }).join('');
};

const renderLeaderboard = async () => {
  const list = document.getElementById('leaderboard-list');
  if (!list || !state.user) return;

  let players = [];
  try {
    const dbPlayers = await dbLoadLeaderboard();
    if (dbPlayers?.length > 0) {
      players = dbPlayers.map(p => ({
        name:   p.username,
        points: p.points,
        level:  p.level,
        isYou:  p.username === state.user.username
      }));
    }
  } catch {
    players = [];
  }

  /* Garante que o usuário aparece */
  if (!players.length || !players.some(p => p.isYou)) {
    players = [
      ...FAKE_PLAYERS,
      { name: state.user.username, points: state.user.points, level: state.user.level, isYou: true }
    ].sort((a, b) => b.points - a.points);
  }

  const top10    = players.slice(0, 10);
  const userRank = players.findIndex(p => p.isYou) + 1;
  setEl('your-rank', `#${userRank}`);

  const rc = ['gold', 'silver', 'bronze'];
  list.innerHTML = top10.map((p, i) => `
    <li class="leaderboard-item ${p.isYou ? 'is-you' : ''}">
      <span class="lb-rank ${rc[i] || ''}">${i + 1}</span>
      <div class="lb-avatar">
        <i class="fas fa-user" style="font-size:0.65rem"></i>
      </div>
      <div class="lb-info">
        <div class="lb-name">${p.isYou ? '👤 ' + p.name : p.name}</div>
        <div class="lb-points">${p.points.toLocaleString('pt-BR')} moedas</div>
      </div>
    </li>`).join('');
};

const updateLibraryBadge = () => {
  const count = state.user?.purchases?.length || 0;
  ['library-count', 'cart-count'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = count; el.classList.toggle('hidden', count === 0); }
  });
};

/* ─────────────────────────────────────────────
   9. HERO BANNER
───────────────────────────────────────────── */
const initHero = () => {
  const slider = document.getElementById('hero-slider');
  const dots   = document.getElementById('hero-dots');
  if (!slider || !dots) return;

  slider.innerHTML = HERO_SLIDES.map((slide, i) => {
    const game = GAMES_DATA.find(g => g.id === slide.gameId);
    if (!game) return '';
    const disc = game.originalPrice > game.price
      ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;
    return `
      <div class="hero-slide ${i === 0 ? 'active' : ''}" data-game-id="${game.id}">
        <div class="hero-slide-bg" style="background-image:url('${game.image}')"></div>
        <div class="hero-slide-overlay"></div>
        <div class="hero-slide-content">
          <div class="hero-badge">${slide.tag}</div>
          <h1 class="hero-title">${game.title}</h1>
          <p class="hero-subtitle">
            ${game.platform.charAt(0).toUpperCase() + game.platform.slice(1)}
            — ${game.description.substring(0, 80)}...
          </p>
          <div class="hero-price-wrap">
            <span class="hero-price">R$ ${game.price.toFixed(2).replace('.', ',')}</span>
            ${disc > 0 ? `
              <span class="hero-price-original">
                R$ ${game.originalPrice.toFixed(2).replace('.', ',')}
              </span>
              <span class="hero-discount-tag">-${disc}%</span>` : ''}
          </div>
          <div class="hero-cta">
            <button class="btn-primary hero-buy-btn" data-game-id="${game.id}">
              <i class="fas fa-cart-shopping"></i> Comprar
            </button>
            <button class="btn-secondary hero-details-btn" data-game-id="${game.id}">
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  dots.innerHTML = HERO_SLIDES.map((_, i) =>
    `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`
  ).join('');

  dots.querySelectorAll('.hero-dot').forEach(d =>
    d.addEventListener('click', () => goToSlide(parseInt(d.dataset.slide)))
  );

  slider.addEventListener('click', e => {
    const buy = e.target.closest('.hero-buy-btn');
    const det = e.target.closest('.hero-details-btn');
    if (buy) openCheckoutModal(buy.dataset.gameId);
    if (det) openProductModal(det.dataset.gameId);
  });

  startHeroAutoPlay();
};

const goToSlide = (index) => {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  const slider = document.getElementById('hero-slider');
  state.heroSlide = (index + HERO_SLIDES.length) % HERO_SLIDES.length;
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  if (slider) slider.style.transform = `translateX(-${state.heroSlide * 100}%)`;
  slides[state.heroSlide]?.classList.add('active');
  dots[state.heroSlide]?.classList.add('active');
};

const startHeroAutoPlay = () => {
  clearInterval(state.heroInterval);
  state.heroInterval = setInterval(() => goToSlide(state.heroSlide + 1), 5000);
};

/* ─────────────────────────────────────────────
   10. CARDS DE JOGOS
───────────────────────────────────────────── */
const renderStars = (r) => {
  const f = Math.floor(r), h = r % 1 >= 0.5 ? 1 : 0, e = 5 - f - h;
  return '<i class="fas fa-star"></i>'.repeat(f) +
    (h ? '<i class="fas fa-star-half-alt"></i>' : '') +
    '<i class="far fa-star"></i>'.repeat(e);
};

const getPlatformIcon = (p) => ({
  playstation: 'fab fa-playstation',
  xbox:        'fab fa-xbox',
  nintendo:    'fas fa-gamepad',
  steam:       'fab fa-steam'
}[p] || 'fas fa-gamepad');

const createGameCard = (game) => {
  const isPurchased = state.user?.purchases.includes(game.id);
  const disc        = game.originalPrice > game.price
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;
  const levelDisc   = getLevelDiscount(state.user?.level || 1);
  const finalPrice  = game.price * (1 - levelDisc / 100);
  const badgesHtml  = (game.badges || []).map(b => {
    const lbl = { new:'Novo', sale:'Oferta', popular:'Popular', exclusive:'Exclusivo' };
    return `<span class="badge badge-${b}">${lbl[b] || b}</span>`;
  }).join('');

  return `
    <article class="game-card" data-game-id="${game.id}" role="button" tabindex="0">
      <div class="card-img-wrap">
        <img class="card-img" src="${game.image}" alt="${game.title}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="card-img-placeholder" style="display:none">
          <i class="fas ${getPlatformIcon(game.platform)}"></i>
        </div>
        <div class="card-badges">${badgesHtml}</div>
        <div class="platform-badge ${game.platform}">
          <i class="${getPlatformIcon(game.platform)}"></i>
        </div>
      </div>
      <div class="card-body">
        <p class="card-platform-tag ${game.platform}">${game.platform.toUpperCase()}</p>
        <h3 class="card-title-text">${game.title}</h3>
        <div class="card-rating">
          <span class="stars">${renderStars(game.rating)}</span>
          <span class="rating-text">${game.rating.toFixed(1)} (${game.reviews.length})</span>
        </div>
        <div class="card-price-wrap">
          <span class="card-price">R$ ${finalPrice.toFixed(2).replace('.', ',')}</span>
          ${disc > 0 || levelDisc > 0
            ? `<span class="card-price-original">R$ ${game.price.toFixed(2).replace('.', ',')}</span>`
            : ''}
          ${disc > 0 ? `<span class="card-discount">-${disc}%</span>` : ''}
        </div>
        <button class="card-btn ${isPurchased ? 'purchased' : ''}"
          data-action="buy" data-game-id="${game.id}" ${isPurchased ? 'disabled' : ''}>
          ${isPurchased
            ? '<i class="fas fa-check"></i> Adquirido'
            : '<i class="fas fa-cart-shopping"></i> Comprar'}
        </button>
      </div>
    </article>`;
};

const renderGames = () => {
  const grid = document.getElementById('games-grid');
  if (!grid) return;

  let games = [...state.games];
  if (state.currentFilter !== 'all')
    games = games.filter(g => g.platform === state.currentFilter);
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    games = games.filter(g =>
      g.title.toLowerCase().includes(q) || g.platform.toLowerCase().includes(q)
    );
  }
  switch (state.currentSort) {
    case 'price-asc':  games.sort((a, b) => a.price - b.price); break;
    case 'price-desc': games.sort((a, b) => b.price - a.price); break;
    case 'rating':     games.sort((a, b) => b.rating - a.rating); break;
    case 'name':       games.sort((a, b) => a.title.localeCompare(b.title)); break;
  }

  state.filteredGames = games;
  const count = document.getElementById('results-count');
  if (count) count.innerHTML =
    `<strong>${games.length}</strong> jogo${games.length !== 1 ? 's' : ''} encontrado${games.length !== 1 ? 's' : ''}`;

  if (!games.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-gamepad"></i>
        <p>Nenhum jogo encontrado.</p>
      </div>`;
    return;
  }

  grid.innerHTML = games.map(createGameCard).join('');

  grid.querySelectorAll('.game-card').forEach(card => {
    const gid = card.dataset.gameId;
    card.addEventListener('click', e => {
      if (e.target.closest('[data-action="buy"]')) return;
      openProductModal(gid);
      if (!state.browsedGames.has(gid)) {
        state.browsedGames.add(gid);
        progressMission('browse', 1);
      }
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProductModal(gid); }
    });
    card.querySelector('[data-action="buy"]')?.addEventListener('click', e => {
      e.stopPropagation(); openCheckoutModal(gid);
    });
  });
};

/* ─────────────────────────────────────────────
   11. BIBLIOTECA
───────────────────────────────────────────── */
const showView = (view) => {
  document.getElementById('view-store').classList.toggle('view-hidden',   view !== 'store');
  document.getElementById('view-library').classList.toggle('view-hidden', view !== 'library');
  document.getElementById('hero').classList.toggle('view-hidden',         view !== 'store');
  document.getElementById('btn-library').classList.toggle('active-view',  view === 'library');
  if (view === 'library') renderLibrary();
};

const renderLibrary = async () => {
  const grid = document.getElementById('library-grid');
  const sub  = document.getElementById('library-subtitle');
  if (!grid) return;

  const purchases = state.user?.purchases || [];
  if (sub) sub.textContent =
    `${purchases.length} jogo${purchases.length !== 1 ? 's' : ''} na sua coleção`;

  if (!purchases.length) {
    grid.innerHTML = `
      <div class="library-empty">
        <i class="fas fa-book-open"></i>
        <h3>Biblioteca Vazia</h3>
        <p>Você ainda não comprou nenhum jogo.</p>
        <button class="btn-primary" id="btn-library-to-store">
          <i class="fas fa-store"></i> Ir para a Loja
        </button>
      </div>`;
    document.getElementById('btn-library-to-store')
      ?.addEventListener('click', () => showView('store'));
    return;
  }

  /* Carrega todos os gift codes de uma vez */
  const codes = await Promise.all(
    purchases.map(pid => dbGetGiftCode(null, pid))
  );

  grid.innerHTML = purchases.map((pid, idx) => {
    const game     = GAMES_DATA.find(g => g.id === pid);
    if (!game) return '';
    const codeData = codes[idx];
    const code     = codeData?.code || 'GAME-????-????-????';
    const date     = codeData?.created_at
      ? new Date(codeData.created_at).toLocaleDateString('pt-BR') : '—';
    return `
      <div class="library-card">
        <div class="library-card-img">
          <img src="${game.image}" alt="${game.title}"
            onerror="this.src='https://placehold.co/400x200/13131f/666?text=GM'">
          <div class="platform-badge ${game.platform}">
            <i class="${getPlatformIcon(game.platform)}"></i>
          </div>
        </div>
        <div class="library-card-body">
          <div class="library-card-title">${game.title}</div>
          <div class="library-card-meta">
            <span><i class="${getPlatformIcon(game.platform)}"></i> ${game.platform}</span>
          </div>
          <div class="library-card-date">
            <i class="fas fa-calendar-alt"></i> Adquirido em ${date}
          </div>
          <div class="library-code-preview">${code.substring(0, 12)}…</div>
          <button class="btn-view-code" data-game-id="${pid}">
            <i class="fas fa-key"></i> Ver Código Gift Card
          </button>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.btn-view-code').forEach(btn =>
    btn.addEventListener('click', () => openGiftCardModal(btn.dataset.gameId))
  );
};

/* ─────────────────────────────────────────────
   12. MODAIS
───────────────────────────────────────────── */
const openModal      = (id) => { document.getElementById(id)?.classList.add('open'); document.body.style.overflow = 'hidden'; };
const closeModal     = (id) => { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow = ''; };
const closeAllModals = ()   => { document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); document.body.style.overflow = ''; };

/* ── Modal Produto ── */
const openProductModal = async (gameId) => {
  const game = GAMES_DATA.find(g => g.id === gameId);
  if (!game) return;
  state.currentGame = game;

  const content = document.getElementById('modal-product-content');
  if (!content) return;

  /* Mostra loading enquanto carrega comentários */
  content.innerHTML = `
    <div style="padding:3rem;text-align:center;color:var(--text-muted)">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem"></i>
      <p style="margin-top:1rem">Carregando...</p>
    </div>`;
  openModal('modal-product');

  const isPurchased  = state.user?.purchases.includes(gameId);
  const isRated      = !!state.user?.ratings[gameId];
  const isShared     = state.user?.shares.includes(gameId);
  const disc         = game.originalPrice > game.price
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;
  const levelDisc    = getLevelDiscount(state.user?.level || 1);
  const finalPrice   = game.price * (1 - levelDisc / 100);

  /* Carrega comentários do banco */
  const comments     = await dbLoadComments(gameId);
  const hasCommented = await dbHasCommented(gameId);

  content.innerHTML = `
    <div class="modal-product-content">
      <div class="modal-product-grid">
        <div class="modal-product-img">
          <img src="${game.image}" alt="${game.title}"
            onerror="this.src='https://placehold.co/600x375/13131f/666?text=GM'">
        </div>
        <div class="modal-product-info">
          <h2>${game.title}</h2>
          <p class="modal-platform-tag ${game.platform}">
            <i class="${getPlatformIcon(game.platform)}"></i>
            ${game.platform.charAt(0).toUpperCase() + game.platform.slice(1)}
          </p>
          <div class="modal-rating">
            <span class="modal-stars">${renderStars(game.rating)}</span>
            <span class="modal-rating-num">${game.rating.toFixed(1)}</span>
            <span class="modal-reviews-count">(${game.reviews.length} avaliações)</span>
          </div>
          <p class="modal-description">${game.description}</p>
          <div class="modal-price-wrap">
            <span class="modal-price">R$ ${finalPrice.toFixed(2).replace('.', ',')}</span>
            ${disc > 0 ? `
              <span class="modal-price-original">
                R$ ${game.price.toFixed(2).replace('.', ',')}
              </span>
              <span class="modal-discount-tag">-${disc}%</span>` : ''}
          </div>
          ${levelDisc > 0 ? `
            <p class="modal-level-discount">
              <i class="fas fa-tag"></i> Desconto nível ${state.user.level}: -${levelDisc}%
            </p>` : ''}
          <div class="modal-actions">
            <button class="btn-buy-modal" ${isPurchased ? 'disabled' : ''}>
              ${isPurchased
                ? '<i class="fas fa-check"></i> Adquirido'
                : '<i class="fas fa-cart-shopping"></i> Comprar Agora'}
            </button>
            ${!isRated ? `
              <div style="background:rgba(255,214,10,0.05);border:1px solid rgba(255,214,10,0.2);
                border-radius:12px;padding:0.875rem;">
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">
                  <i class="fas fa-star" style="color:var(--neon-yellow)"></i>
                  Avalie este jogo (+10 moedas):
                </p>
                <div class="star-rating-input">
                  ${[1,2,3,4,5].map(n =>
                    `<button class="star-btn" data-rating="${n}">
                      <i class="far fa-star"></i>
                    </button>`).join('')}
                </div>
              </div>` : `
              <button class="btn-rate-modal" disabled>
                <i class="fas fa-star"></i> Avaliado (${state.user.ratings[gameId]}★)
              </button>`}
            <button class="btn-share-modal">
              <i class="fas fa-share-nodes"></i>
              ${isShared ? 'Compartilhado ✓' : 'Compartilhar (+20 moedas)'}
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="modal-reviews">
        <h4><i class="fas fa-comments"></i> Avaliações</h4>
        ${game.reviews.map(r => `
          <div class="review-item">
            <div class="review-header">
              <span class="review-author">
                <i class="fas fa-user-circle"></i> ${r.author}
              </span>
              <span class="review-stars">${renderStars(r.rating)}</span>
            </div>
            <p class="review-text">"${r.text}"</p>
          </div>`).join('')}
      </div>

      <!-- Comentários -->
      <div class="comments-section">
        <h4>
          <i class="fas fa-comment-dots"></i> Comentários da Comunidade
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;margin-left:0.5rem">
            (${comments.length})
          </span>
        </h4>
        ${!hasCommented ? `
          <div class="comment-form">
            <textarea class="comment-textarea" id="comment-input"
              placeholder="Compartilhe sua experiência..." maxlength="300"></textarea>
            <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
              <button class="btn-comment" id="btn-send-comment">
                <i class="fas fa-paper-plane"></i> Comentar
              </button>
              <span class="comment-hint">
                <i class="fas fa-coins"></i> +5 moedas
              </span>
            </div>
          </div>` : `
          <div style="background:rgba(57,255,20,0.05);border:1px solid rgba(57,255,20,0.2);
            border-radius:8px;padding:0.6rem 1rem;margin-bottom:1rem;
            font-size:0.8rem;color:var(--neon-green)">
            <i class="fas fa-check"></i> Você já comentou neste jogo.
          </div>`}
        <div class="comments-list" id="comments-list">
          ${comments.length
            ? comments.map(c => `
              <div class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">
                    <i class="fas fa-user-circle"></i> ${c.username}
                  </span>
                  <span class="comment-date">
                    ${new Date(c.created_at).toLocaleDateString('pt-BR', {
                      day:'2-digit', month:'2-digit', year:'numeric',
                      hour:'2-digit', minute:'2-digit'
                    })}
                  </span>
                </div>
                <p class="comment-text">${c.content}</p>
              </div>`).join('')
            : '<p class="no-comments">Seja o primeiro a comentar!</p>'}
        </div>
      </div>
    </div>`;

  /* Eventos */
  content.querySelector('.btn-buy-modal')?.addEventListener('click', () => {
    if (!isPurchased) { closeModal('modal-product'); openCheckoutModal(gameId); }
  });

  content.querySelector('.btn-share-modal')?.addEventListener('click', () => shareGame(gameId));

  /* Star rating */
  const starInput = content.querySelector('.star-rating-input');
  if (starInput) {
    const btns = starInput.querySelectorAll('.star-btn');
    btns.forEach(btn => {
      const r = parseInt(btn.dataset.rating);
      btn.addEventListener('mouseenter', () => {
        btns.forEach((b, i) => {
          b.querySelector('i').className    = i < r ? 'fas fa-star' : 'far fa-star';
          b.querySelector('i').style.color  = i < r ? 'var(--neon-yellow)' : '';
        });
      });
      starInput.addEventListener('mouseleave', () => {
        btns.forEach(b => {
          b.querySelector('i').className   = 'far fa-star';
          b.querySelector('i').style.color = '';
        });
      });
      btn.addEventListener('click', () => {
        rateGame(gameId, r);
        btns.forEach((b, i) => {
          b.querySelector('i').className   = i < r ? 'fas fa-star' : 'far fa-star';
          b.querySelector('i').style.color = i < r ? 'var(--neon-yellow)' : '';
          b.disabled = true;
        });
      });
    });
  }

  /* Comentário */
  const commentBtn = content.querySelector('#btn-send-comment');
  if (commentBtn) {
    commentBtn.addEventListener('click', async () => {
      const ta = document.getElementById('comment-input');
      if (!ta) return;
      setButtonLoading(commentBtn, true);
      const ok = await addComment(gameId, ta.value);
      if (ok) {
        const updated = await dbLoadComments(gameId);
        const listEl  = document.getElementById('comments-list');
        if (listEl) {
          listEl.innerHTML = updated.map(c => `
            <div class="comment-item">
              <div class="comment-header">
                <span class="comment-author">
                  <i class="fas fa-user-circle"></i> ${c.username}
                </span>
                <span class="comment-date">
                  ${new Date(c.created_at).toLocaleDateString('pt-BR', {
                    day:'2-digit', month:'2-digit', year:'numeric',
                    hour:'2-digit', minute:'2-digit'
                  })}
                </span>
              </div>
              <p class="comment-text">${c.content}</p>
            </div>`).join('');
        }
        ta.value = '';
        commentBtn.disabled = true;
        commentBtn.innerHTML = '<i class="fas fa-check"></i> Comentado';
      } else {
        setButtonLoading(commentBtn, false, '<i class="fas fa-paper-plane"></i> Comentar');
      }
    });
  }
};

/* ── Modal Checkout ── */
const openCheckoutModal = (gameId) => {
  const game = GAMES_DATA.find(g => g.id === gameId);
  if (!game) return;
  if (state.user?.purchases.includes(gameId)) {
    showToast('Já Adquirido', 'Você já possui este jogo!', 'info', 'ℹ️');
    return;
  }

  const content     = document.getElementById('modal-checkout-content');
  if (!content) return;

  const levelDisc   = getLevelDiscount(state.user?.level || 1);
  const saleDisc    = game.originalPrice > game.price
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;
  const basePrice   = game.price;
  const levelSave   = basePrice * (levelDisc / 100);
  const afterLevel  = basePrice - levelSave;
  const availCoins  = state.user?.points || 0;
  const maxCoinDisc = afterLevel * 0.5;
  const coinDisc    = Math.min(availCoins * COIN_VALUE, maxCoinDisc);
  const coinsNeeded = Math.floor(coinDisc / COIN_VALUE);

  state.useCoinsInCheckout = false;

  const renderRows = (useCoins) => {
    const final = useCoins ? afterLevel - coinDisc : afterLevel;
    return `
      <div class="price-row">
        <span>Preço base</span>
        <span>R$ ${basePrice.toFixed(2).replace('.', ',')}</span>
      </div>
      ${saleDisc > 0 ? `
        <div class="price-row discount">
          <span>Desconto da oferta (-${saleDisc}%)</span>
          <span>já aplicado</span>
        </div>` : ''}
      ${levelDisc > 0 ? `
        <div class="price-row discount">
          <span>Desconto nível ${state.user.level} (-${levelDisc}%)</span>
          <span>-R$ ${levelSave.toFixed(2).replace('.', ',')}</span>
        </div>` : ''}
      ${useCoins && coinsNeeded > 0 ? `
        <div class="price-row coins-row">
          <span>Moedas usadas (-${coinsNeeded.toLocaleString('pt-BR')})</span>
          <span>-R$ ${coinDisc.toFixed(2).replace('.', ',')}</span>
        </div>` : ''}
      <div class="price-row total">
        <span>Total</span>
        <span>R$ ${final.toFixed(2).replace('.', ',')}</span>
      </div>`;
  };

  content.innerHTML = `
    <h2 class="checkout-title">
      <i class="fas fa-cart-shopping"></i> Finalizar Compra
    </h2>
    <div class="checkout-game-info">
      <div class="checkout-game-thumb">
        <img src="${game.image}" alt="${game.title}"
          onerror="this.src='https://placehold.co/80x56/13131f/666?text=GM'">
      </div>
      <div class="checkout-game-details">
        <h4>${game.title}</h4>
        <p><i class="${getPlatformIcon(game.platform)}"></i> ${game.platform}</p>
      </div>
    </div>
    <div class="checkout-price-breakdown" id="checkout-price-rows">
      ${renderRows(false)}
    </div>
    ${availCoins > 0 ? `
    <div class="coins-toggle-wrap">
      <div class="coins-toggle-label">
        <i class="fas fa-coins" style="color:var(--neon-yellow)"></i>
        Usar moedas
        <strong>(${availCoins.toLocaleString('pt-BR')} = R$ ${coinsToBRL(availCoins)})</strong>
        <br>
        <span style="font-size:0.7rem;color:var(--text-muted)">
          Máx. 50% — economiza R$ ${coinDisc.toFixed(2).replace('.', ',')}
        </span>
      </div>
      <label class="toggle-switch">
        <input type="checkbox" id="toggle-coins">
        <span class="toggle-slider"></span>
      </label>
    </div>` : ''}
    <div class="checkout-rewards">
      <i class="fas fa-gift" style="color:var(--neon-purple)"></i>
      Você receberá: <strong>+50 XP</strong> e <strong>+50 moedas</strong>
      + <strong>Gift Card exclusivo!</strong>
    </div>
    <div class="checkout-actions">
      <button class="btn-secondary" id="btn-cancel-checkout">Cancelar</button>
      <button class="btn-primary" id="btn-confirm-purchase">
        <i class="fas fa-lock"></i> Confirmar Compra
      </button>
    </div>`;

  content.querySelector('#toggle-coins')?.addEventListener('change', function () {
    state.useCoinsInCheckout = this.checked;
    const rows = document.getElementById('checkout-price-rows');
    if (rows) rows.innerHTML = renderRows(this.checked);
  });

  content.querySelector('#btn-cancel-checkout')
    ?.addEventListener('click', () => closeModal('modal-checkout'));

  const confirmBtn = content.querySelector('#btn-confirm-purchase');
  confirmBtn?.addEventListener('click', async () => {
    setButtonLoading(confirmBtn, true);
    await purchaseGame(gameId, state.useCoinsInCheckout);
    setButtonLoading(confirmBtn, false, '<i class="fas fa-lock"></i> Confirmar Compra');
  });

  openModal('modal-checkout');
};

/* ── Modal Compra Confirmada ── */
const showPurchaseSuccessModal = (game, giftCode, coinsUsed) => {
  const content = document.getElementById('modal-success-content');
  if (!content) return;
  content.innerHTML = `
    <span class="success-icon">🎉</span>
    <h2 class="success-title">Compra Realizada!</h2>
    <p class="success-subtitle">${game.title} está na sua biblioteca.</p>
    <div class="success-rewards">
      <span class="reward-chip"><i class="fas fa-bolt"></i> +50 XP</span>
      <span class="reward-chip"><i class="fas fa-coins"></i> +50 moedas</span>
      ${coinsUsed > 0 ? `
        <span class="reward-chip"
          style="background:rgba(255,0,110,0.1);border-color:rgba(255,0,110,0.3);color:var(--neon-pink)">
          <i class="fas fa-coins"></i> -${coinsUsed.toLocaleString('pt-BR')} usadas
        </span>` : ''}
    </div>
    <div class="success-code-wrap">
      <span class="success-code-label">🎁 Seu Gift Card</span>
      <div class="success-code" id="success-code-text">${giftCode}</div>
      <button class="btn-copy-code" id="btn-copy-success">
        <i class="fas fa-copy"></i> Copiar Código
      </button>
    </div>
    <div class="success-actions">
      <button class="btn-secondary" id="btn-success-library">
        <i class="fas fa-book-open"></i> Ver Biblioteca
      </button>
      <button class="btn-primary" id="btn-success-continue">
        <i class="fas fa-store"></i> Continuar Comprando
      </button>
    </div>`;

  content.querySelector('#btn-copy-success')?.addEventListener('click', function () {
    navigator.clipboard?.writeText(giftCode).catch(() => {});
    this.innerHTML = '<i class="fas fa-check"></i> Copiado!';
    this.classList.add('copied');
  });
  content.querySelector('#btn-success-library')?.addEventListener('click', () => {
    closeModal('modal-purchase-success'); showView('library');
  });
  content.querySelector('#btn-success-continue')
    ?.addEventListener('click', () => closeModal('modal-purchase-success'));

  openModal('modal-purchase-success');
};

/* ── Modal Gift Card ── */
const openGiftCardModal = async (gameId) => {
  const game     = GAMES_DATA.find(g => g.id === gameId);
  const codeData = await dbGetGiftCode(null, gameId);
  if (!game || !codeData) return;

  const content = document.getElementById('modal-giftcard-content');
  if (!content) return;

  const date = new Date(codeData.created_at).toLocaleDateString('pt-BR', {
    day:'2-digit', month:'long', year:'numeric'
  });

  content.innerHTML = `
    <div class="giftcard-header">
      <h2><i class="fas fa-gift"></i> Gift Card</h2>
      <p>Código de ativação do seu jogo</p>
    </div>
    <div class="giftcard-game-info">
      <div class="giftcard-game-thumb">
        <img src="${game.image}" alt="${game.title}"
          onerror="this.src='https://placehold.co/64x44/13131f/666?text=GM'">
      </div>
      <div>
        <div class="giftcard-game-name">${game.title}</div>
        <div class="giftcard-game-platform">
          <i class="${getPlatformIcon(game.platform)}"></i>
          ${game.platform} · ${date}
        </div>
      </div>
    </div>
    <div class="giftcard-code-wrap">
      <span class="giftcard-code-label">Código de Ativação</span>
      <div class="giftcard-code">${codeData.code}</div>
      <button class="btn-copy-code" id="btn-copy-gc">
        <i class="fas fa-copy"></i> Copiar Código
      </button>
    </div>
    <p class="giftcard-footer">
      <i class="fas fa-shield-alt" style="color:var(--neon-cyan)"></i>
      Código único vinculado à sua conta. Guarde-o em local seguro.
    </p>`;

  content.querySelector('#btn-copy-gc')?.addEventListener('click', function () {
    navigator.clipboard?.writeText(codeData.code).catch(() => {});
    this.innerHTML = '<i class="fas fa-check"></i> Copiado!';
    this.classList.add('copied');
    setTimeout(() => {
      this.innerHTML = '<i class="fas fa-copy"></i> Copiar Código';
      this.classList.remove('copied');
    }, 2500);
  });

  openModal('modal-giftcard');
};

/* ── Modal Perfil ── */
const openProfileModal = () => {
  const content = document.getElementById('modal-profile-content');
  if (!content || !state.user) return;
  const { user } = state;
  const disc     = getLevelDiscount(user.level);
  const xpNeeded = getXpForLevel(user.level);
  const xpPct    = user.level >= 10
    ? 100 : Math.min((user.xp / xpNeeded) * 100, 100);

  content.innerHTML = `
    <h2 style="margin-bottom:1.5rem;font-size:1.1rem;color:var(--text-secondary)">
      <i class="fas fa-user-circle" style="color:var(--neon-cyan)"></i> Meu Perfil
    </h2>
    <div class="profile-modal-header">
      <div class="profile-modal-avatar">
        <i class="fas fa-user"></i>
        <div class="level-badge">${user.level}</div>
      </div>
      <div class="profile-modal-info">
        <h2>${user.username}</h2>
        <p class="profile-modal-level">
          ${LEVEL_TITLES[user.level] || 'Supremo'} — Nível ${user.level}
        </p>
        <div class="xp-section" style="margin-bottom:0.5rem">
          <div class="xp-labels">
            <span style="font-size:0.75rem;color:var(--text-muted)">XP</span>
            <span style="font-size:0.75rem;color:var(--text-muted)">
              ${user.xp} / ${user.level >= 10 ? '∞' : xpNeeded}
            </span>
          </div>
          <div class="xp-bar-wrap">
            <div class="xp-bar" style="width:${xpPct}%"></div>
          </div>
        </div>
        <div style="display:flex;gap:1rem;font-size:0.8rem;color:var(--text-muted);flex-wrap:wrap">
          <span>
            <i class="fas fa-coins" style="color:var(--neon-yellow)"></i>
            ${user.points.toLocaleString('pt-BR')} moedas = R$ ${coinsToBRL(user.points)}
          </span>
          ${disc > 0 ? `
            <span>
              <i class="fas fa-tag" style="color:var(--neon-green)"></i>
              ${disc}% desconto
            </span>` : ''}
        </div>
      </div>
    </div>
    <div class="profile-stats-grid">
      <div class="stat-item">
        <div class="stat-value">${user.purchases.length}</div>
        <div class="stat-label">Jogos</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${user.stats.totalRatings}</div>
        <div class="stat-label">Avaliações</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${user.stats.totalComments || 0}</div>
        <div class="stat-label">Comentários</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${user.stats.totalShares}</div>
        <div class="stat-label">Shares</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${user.badges.length}</div>
        <div class="stat-label">Badges</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">R$ ${user.stats.totalSpent.toFixed(0)}</div>
        <div class="stat-label">Gasto</div>
      </div>
    </div>
    <div class="badges-section">
      <h4><i class="fas fa-medal"></i> Conquistas</h4>
      <div class="badges-grid">
        ${ALL_BADGES.map(b => {
          const unlocked = user.badges.includes(b.id);
          return `
            <div class="badge-item ${unlocked ? 'unlocked' : 'locked'}" title="${b.desc}">
              <div class="badge-icon">${b.icon}</div>
              <div class="badge-name">${b.name}</div>
              <div style="font-size:0.6rem;margin-top:0.2rem;
                color:${unlocked ? 'var(--neon-green)' : 'var(--text-muted)'}">
                ${unlocked ? '✓ Desbloqueada' : '🔒 Bloqueada'}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;

  openModal('modal-profile');
};

/* ── Modal Level Up ── */
const showLevelUpModal = () => {
  const content = document.getElementById('levelup-content');
  if (!content) return;
  const disc = getLevelDiscount(state.user.level);
  content.innerHTML = `
    <span class="levelup-icon">🎉</span>
    <h2>LEVEL UP!</h2>
    <p>Parabéns, você subiu de nível!</p>
    <span class="levelup-new-level">${state.user.level}</span>
    <span class="levelup-title">${LEVEL_TITLES[state.user.level] || 'Supremo'}</span>
    ${disc > 0 ? `
      <p style="color:var(--neon-green);font-size:0.9rem;margin-bottom:1.5rem">
        <i class="fas fa-tag"></i> Desconto desbloqueado: ${disc}%!
      </p>` : ''}
    <button class="btn-primary" id="btn-close-levelup" style="margin:0 auto">
      <i class="fas fa-gamepad"></i> Continuar!
    </button>`;
  openModal('modal-levelup');
  document.getElementById('btn-close-levelup')
    ?.addEventListener('click', () => closeModal('modal-levelup'));
};

/* ─────────────────────────────────────────────
   13. TOAST
───────────────────────────────────────────── */
const showToast = (title, message, type = 'info', icon = 'ℹ️') => {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 350);
  }, 4000);
};

/* ─────────────────────────────────────────────
   14. EVENT LISTENERS — LOGIN
───────────────────────────────────────────── */
const initLoginListeners = () => {
  /* Tabs */
  document.querySelectorAll('.login-tab').forEach(tab =>
    tab.addEventListener('click', () => switchLoginTab(tab.dataset.tab))
  );
  document.querySelectorAll('.btn-link[data-tab]').forEach(btn =>
    btn.addEventListener('click', () => switchLoginTab(btn.dataset.tab))
  );

  /* Toggle senha */
  document.querySelectorAll('.btn-toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  });

  /* Login */
  document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();
    const btn      = e.target.querySelector('.login-submit');
    const email    = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
      showFormError('login-email-err', 'Preencha todos os campos.');
      return;
    }

    setButtonLoading(btn, true);
    const { user, error } = await dbLogin(email, password);

    if (error) {
      showFormError('login-email-err', error);
      setButtonLoading(btn, false, '<i class="fas fa-right-to-bracket"></i> Entrar');
      return;
    }

    state.currentUser = user;
    state.user        = await dbLoadProfile();

    if (!state.user) {
      showFormError('login-email-err', 'Erro ao carregar perfil. Tente novamente.');
      setButtonLoading(btn, false, '<i class="fas fa-right-to-bracket"></i> Entrar');
      return;
    }

    setButtonLoading(btn, false, '<i class="fas fa-right-to-bracket"></i> Entrar');
    enterApp();
  });

  /* Cadastro */
  document.getElementById('form-register')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();
    const btn      = e.target.querySelector('.login-submit');
    const username = document.getElementById('reg-username')?.value.trim();
    const email    = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;

    if (!username || username.length < 3) {
      showFormError('reg-username-err', 'Mínimo 3 caracteres.'); return;
    }
    if (!email || !email.includes('@')) {
      showFormError('reg-email-err', 'E-mail inválido.'); return;
    }
    if (!password || password.length < 6) {
      showFormError('reg-password-err', 'Mínimo 6 caracteres.'); return;
    }

    setButtonLoading(btn, true);
    const { user, error } = await dbRegister(username, email, password);

    if (error) {
      showFormError('reg-email-err', error);
      setButtonLoading(btn, false, '<i class="fas fa-user-plus"></i> Criar Conta');
      return;
    }

    state.currentUser = user;
    state.user        = await dbLoadProfile();

    if (!state.user) {
      showFormError('reg-email-err', 'Erro ao criar perfil. Tente novamente.');
      setButtonLoading(btn, false, '<i class="fas fa-user-plus"></i> Criar Conta');
      return;
    }

    setButtonLoading(btn, false, '<i class="fas fa-user-plus"></i> Criar Conta');
    enterApp();
  });
};

const switchLoginTab = (tab) => {
  document.querySelectorAll('.login-tab')
    .forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.login-form')
    .forEach(f => f.classList.toggle('active', f.id === `form-${tab}`));
};

const showFormError  = (id, msg) => { const el = document.getElementById(id); if (el) el.textContent = msg; };
const clearFormErrors = () => {
  document.querySelectorAll('[id$="-err"]').forEach(el => el.textContent = '');
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
};

/* ─────────────────────────────────────────────
   15. ENTRAR NO APP
───────────────────────────────────────────── */
const enterApp = () => {
  document.getElementById('login-screen').style.display = 'none';
  const app = document.getElementById('app');
  app.classList.remove('app-hidden');
  app.style.display = 'block';
  initApp();
};

/* ─────────────────────────────────────────────
   16. EVENT LISTENERS — APP
───────────────────────────────────────────── */
const initAppListeners = () => {
  window.addEventListener('scroll', () => {
    document.getElementById('main-header')
      ?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  const hamburger = document.getElementById('btn-hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav?.classList.toggle('open');
  });

  document.getElementById('btn-search')?.addEventListener('click', () => {
    document.getElementById('search-bar-wrap')?.classList.add('open');
    document.getElementById('search-input')?.focus();
  });
  document.getElementById('btn-search-close')?.addEventListener('click', () => {
    document.getElementById('search-bar-wrap')?.classList.remove('open');
    state.searchQuery = '';
    const si = document.getElementById('search-input');
    if (si) si.value = '';
    renderGames();
  });
  document.getElementById('search-input')?.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderGames();
  });

  const setFilter = (filter) => {
    state.currentFilter = filter;
    document.querySelectorAll('.pill')
      .forEach(p => p.classList.toggle('active', p.dataset.filter === filter));
    document.querySelectorAll('.nav-link[data-filter]')
      .forEach(l => l.classList.toggle('active', l.dataset.filter === filter));
    renderGames();
  };

  document.querySelectorAll('.pill')
    .forEach(p => p.addEventListener('click', () => setFilter(p.dataset.filter)));
  document.querySelectorAll('.nav-link[data-filter]').forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      setFilter(l.dataset.filter);
      showView('store');
      mobileNav?.classList.remove('open');
      hamburger?.classList.remove('active');
    });
  });

  document.getElementById('sort-select')?.addEventListener('change', e => {
    state.currentSort = e.target.value; renderGames();
  });

  document.getElementById('btn-profile')?.addEventListener('click', openProfileModal);
  document.getElementById('btn-open-profile')?.addEventListener('click', openProfileModal);
  document.getElementById('btn-library')?.addEventListener('click', () => showView('library'));
  document.getElementById('btn-cart')?.addEventListener('click', () => showView('library'));
  document.getElementById('btn-back-store')?.addEventListener('click', () => showView('store'));
  document.getElementById('mobile-library-link')?.addEventListener('click', e => {
    e.preventDefault(); showView('library'); mobileNav?.classList.remove('open');
  });
  document.getElementById('btn-go-home')?.addEventListener('click', e => {
    e.preventDefault(); showView('store');
  });

  /* Logout */
  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    if (confirm('Deseja sair da sua conta?')) {
      await dbLogout();
      state.user        = null;
      state.currentUser = null;
      state.browsedGames.clear();
      clearInterval(state.heroInterval);
      document.getElementById('app').style.display = 'none';
      document.getElementById('app').classList.add('app-hidden');
      document.getElementById('login-screen').style.display = 'flex';
      showView('store');
    }
  });

  document.getElementById('hero-prev')?.addEventListener('click', () => {
    goToSlide(state.heroSlide - 1); startHeroAutoPlay();
  });
  document.getElementById('hero-next')?.addEventListener('click', () => {
    goToSlide(state.heroSlide + 1); startHeroAutoPlay();
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.modal) closeModal(btn.dataset.modal);
      else closeAllModals();
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAllModals(); });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });

  const hero = document.getElementById('hero');
  hero?.addEventListener('mouseenter', () => clearInterval(state.heroInterval));
  hero?.addEventListener('mouseleave', () => startHeroAutoPlay());

  let touchX = 0;
  hero?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive:true });
  hero?.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? state.heroSlide + 1 : state.heroSlide - 1);
      startHeroAutoPlay();
    }
  }, { passive:true });
};

/* ─────────────────────────────────────────────
   17. INICIALIZAÇÃO DO APP
───────────────────────────────────────────── */
const initApp = async () => {
  console.log('%c🎮 GameMarket v4.0 (MySQL)','color:#00f5ff;font-size:14px;font-weight:bold');
  await initMissions();
  updateSidebarProfile();
  renderMissions();
  await renderLeaderboard();
  initHero();
  renderGames();
  updateLibraryBadge();
  initAppListeners();
  await checkAllBadges();
  setTimeout(() => showToast(
    `🎮 Bem-vindo, ${state.user.username}!`,
    `Nível ${state.user.level} · ${state.user.points} moedas`,
    'info', '🎯'
  ), 600);
};

/* ─────────────────────────────────────────────
   18. PONTO DE ENTRADA
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLoginListeners();

  /* Verifica sessão salva (token JWT no localStorage) */
  const savedUser = dbGetCurrentUser();
  if (savedUser) {
    state.currentUser = savedUser;
    dbLoadProfile().then(profile => {
      if (profile) {
        state.user = profile;
        enterApp();
      }
    });
  }
});