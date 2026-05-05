/**
 * ═══════════════════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT  —  v3  (sunnah.com + Ticket System)
 * ═══════════════════════════════════════════════════════════════
 *
 *  Hadith  — sunnah.com API  KEY: SUNNAH_API_KEY
 *  Quran   — AlQuran Cloud   NO KEY
 *  Tafsir / Duas / Asma / Hijri — UmmahAPI  NO KEY
 *  Tickets — built-in (no external API)
 *
 *  ENV:  DISCORD_TOKEN   (required)
 *        SUNNAH_API_KEY  (required)
 * ═══════════════════════════════════════════════════════════════
 */

require("dotenv").config();
const {
  Client, GatewayIntentBits, EmbedBuilder,
  SlashCommandBuilder, REST, Routes,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

// ─────────────────────────────────────────────────────
//  API BASES
// ─────────────────────────────────────────────────────
const SUNNAH  = "https://api.sunnah.com/v1";
const QURAN   = "https://api.alquran.cloud/v1";
const UMMAH   = "https://ummahapi.com/api";
const SUNNAH_KEY = process.env.SUNNAH_API_KEY || "cKKr53NtU7VQ1FfvKcjMVf7ANxz31i6l";

// ─────────────────────────────────────────────────────
//  TICKET STORAGE  (in-memory; survives restarts via
//  a simple JSON file: tickets.json)
// ─────────────────────────────────────────────────────
const fs   = require("fs");
const path = require("path");
const TICKETS_FILE = path.join(__dirname, "tickets.json");

function loadTickets() {
  try { return JSON.parse(fs.readFileSync(TICKETS_FILE, "utf8")); }
  catch { return { config: {}, open: {} }; }
}
function saveTickets(data) {
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(data, null, 2));
}

// tickets.config[guildId] = { categoryId, supportRoleId, logChannelId, panelChannelId, nextId }
// tickets.open[channelId] = { guildId, userId, ticketId, type, createdAt, claimed, claimedBy }
let TICKETS = loadTickets();

// ─────────────────────────────────────────────────────
//  COLLECTIONS
// ─────────────────────────────────────────────────────
const COLLECTIONS = {
  bukhari:        { name: "Sahih al-Bukhari",    arabic: "صحيح البخاري",     color: 0x1B5E20, emoji: "📗", total: 7563, collectionId: "bukhari"        },
  muslim:         { name: "Sahih Muslim",         arabic: "صحيح مسلم",        color: 0x0D47A1, emoji: "📘", total: 7470, collectionId: "muslim"         },
  abudawud:       { name: "Sunan Abu Dawud",      arabic: "سنن أبي داود",     color: 0x4A148C, emoji: "📙", total: 5274, collectionId: "abudawud"       },
  tirmidhi:       { name: "Jami at-Tirmidhi",     arabic: "جامع الترمذي",     color: 0x880E4F, emoji: "📕", total: 3956, collectionId: "tirmidhi"       },
  ibnmajah:       { name: "Sunan Ibn Majah",      arabic: "سنن ابن ماجه",     color: 0x004D40, emoji: "📒", total: 4341, collectionId: "ibnmajah"       },
  nasai:          { name: "Sunan an-Nasa'i",      arabic: "سنن النسائي",      color: 0x37474F, emoji: "📓", total: 5761, collectionId: "nasai"          },
  malik:          { name: "Muwatta Malik",        arabic: "موطأ مالك",        color: 0x6D4C41, emoji: "📔", total: 1858, collectionId: "malik"          },
  nawawi40:       { name: "40 Hadith Nawawi",     arabic: "الأربعون النووية", color: 0x00695C, emoji: "🌿", total: 42,   collectionId: "nawawi40"       },
  qudsi40:        { name: "40 Hadith Qudsi",      arabic: "الأربعون القدسية", color: 0x1A237E, emoji: "✨", total: 40,   collectionId: "qudsi40"        },
  riyadussalihin: { name: "Riyad as-Salihin",     arabic: "رياض الصالحين",   color: 0x2E7D32, emoji: "🌸", total: 1896, collectionId: "riyadussalihin" },
  mishkat:        { name: "Mishkat al-Masabih",   arabic: "مشكاة المصابيح",  color: 0x4E342E, emoji: "📜", total: 6294, collectionId: "mishkat"        },
  adab:           { name: "Al-Adab Al-Mufrad",    arabic: "الأدب المفرد",     color: 0x01579B, emoji: "🌺", total: 1322, collectionId: "adab"           },
};
const COL_KEYS = Object.keys(COLLECTIONS);

// ─────────────────────────────────────────────────────
//  QURAN TRANSLATIONS
// ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  sahih_international: { name: "Saheeh International", flag: "🇬🇧", edition: "en.sahih"    },
  pickthall:           { name: "Pickthall",             flag: "🇬🇧", edition: "en.pickthall" },
  yusuf_ali:           { name: "Yusuf Ali",             flag: "🇬🇧", edition: "en.yusufali"  },
};
const TRANS_KEYS = Object.keys(TRANSLATIONS);
const DEFAULT_TR = "sahih_international";

// ─────────────────────────────────────────────────────
//  TAFSIRS
// ─────────────────────────────────────────────────────
const TAFSIRS = {
  ibn_kathir:    { name: "Ibn Kathir (Abridged)", scholar: "Hafiz Ibn Kathir",                          lang: "English", flag: "🇬🇧" },
  maarif:        { name: "Ma'arif al-Qur'an",     scholar: "Mufti Muhammad Shafi",                      lang: "English", flag: "🇬🇧" },
  muyassar:      { name: "Tafsir Muyassar",       scholar: "Ministry of Islamic Affairs, Saudi Arabia",  lang: "Arabic",  flag: "🇸🇦" },
  ibn_kathir_ar: { name: "Ibn Kathir (Arabic)",   scholar: "Hafiz Ibn Kathir",                          lang: "Arabic",  flag: "🇸🇦" },
};

// ─────────────────────────────────────────────────────
//  DUAS
// ─────────────────────────────────────────────────────
const DUAS = {
  morning:          { name: "Morning Adhkar",      emoji: "🌅", count: 7  },
  evening:          { name: "Evening Adhkar",      emoji: "🌆", count: 5  },
  prayer:           { name: "During Prayer",       emoji: "🙏", count: 8  },
  after_prayer:     { name: "After Prayer",        emoji: "📿", count: 8  },
  sleep:            { name: "Sleep",               emoji: "🌙", count: 6  },
  food:             { name: "Food & Drink",        emoji: "🍽️", count: 6  },
  travel:           { name: "Travel",              emoji: "✈️", count: 6  },
  distress:         { name: "Distress & Anxiety",  emoji: "💙", count: 7  },
  forgiveness:      { name: "Forgiveness",         emoji: "🤍", count: 5  },
  illness:          { name: "Illness & Healing",   emoji: "💊", count: 5  },
  guidance:         { name: "Guidance",            emoji: "🧭", count: 3  },
  protection:       { name: "Protection",          emoji: "🛡️", count: 4  },
  dhikr:            { name: "Dhikr",               emoji: "📖", count: 6  },
  knowledge:        { name: "Knowledge",           emoji: "📚", count: 3  },
  gratitude:        { name: "Gratitude",           emoji: "🌸", count: 3  },
  marriage:         { name: "Marriage & Family",   emoji: "👨‍👩‍👧", count: 4 },
  hajj:             { name: "Hajj & Umrah",        emoji: "🕋", count: 4  },
  grief:            { name: "Grief & Loss",        emoji: "🤲", count: 4  },
  children:         { name: "Children",            emoji: "👶", count: 4  },
  night_prayer:     { name: "Night Prayer",        emoji: "⭐", count: 4  },
  quran_recitation: { name: "Quran Recitation",    emoji: "📜", count: 3  },
};
const DUA_KEYS = Object.keys(DUAS);

// ─────────────────────────────────────────────────────
//  SURAH LOOKUP
// ─────────────────────────────────────────────────────
const SURAH_NAMES = [
  "Al-Fatihah","Al-Baqarah","Ali 'Imran","An-Nisa","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum",
  "Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shuraa","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saf","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat",
  "Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas",
];

const SURAH_ALIASES = {
  "fatiha":1,"fatihah":1,"opening":1,"baqara":2,"baqarah":2,"cow":2,"imran":3,"al imran":3,
  "nisa":4,"nisaa":4,"women":4,"maidah":5,"maida":5,"table":5,"anam":6,"cattle":6,
  "araf":7,"heights":7,"anfal":8,"spoils":8,"tawba":9,"tawbah":9,"repentance":9,
  "yunus":10,"hud":11,"yusuf":12,"rad":13,"thunder":13,"ibrahim":14,"hijr":15,
  "nahl":16,"bee":16,"isra":17,"night journey":17,"kahf":18,"cave":18,
  "maryam":19,"mary":19,"taha":20,"anbiya":21,"prophets":21,"hajj":22,"pilgrimage":22,
  "muminun":23,"nur":24,"light":24,"furqan":25,"shuara":26,"poets":26,"naml":27,"ant":27,"ants":27,
  "qasas":28,"stories":28,"ankabut":29,"spider":29,"rum":30,"romans":30,
  "luqman":31,"sajdah":32,"prostration":32,"ahzab":33,"saba":34,"fatir":35,
  "yasin":36,"ya sin":36,"ya-sin":36,"saffat":37,"sad":38,"zumar":39,"groups":39,
  "ghafir":40,"mumin":40,"fussilat":41,"shura":42,"zukhruf":43,"dukhan":44,"smoke":44,
  "jathiyah":45,"ahqaf":46,"muhammad":47,"fath":48,"victory":48,"hujurat":49,"qaf":50,
  "dhariyat":51,"tur":52,"mount":52,"najm":53,"star":53,"qamar":54,"moon":54,
  "rahman":55,"ar rahman":55,"waqiah":56,"hadid":57,"iron":57,"mujadila":58,"hashr":59,
  "mumtahanah":60,"saf":61,"jumuah":62,"friday":62,"munafiqun":63,"taghabun":64,
  "talaq":65,"divorce":65,"tahrim":66,"mulk":67,"dominion":67,"qalam":68,"pen":68,
  "haqqah":69,"maarij":70,"nuh":71,"noah":71,"jinn":72,"muzzammil":73,"muddaththir":74,
  "qiyamah":75,"resurrection":75,"insan":76,"human":76,"mursalat":77,"naba":78,
  "naziat":79,"abasa":80,"takwir":81,"infitar":82,"mutaffifin":83,"inshiqaq":84,
  "buruj":85,"tariq":86,"ala":87,"most high":87,"ghashiyah":88,"fajr":89,"dawn":89,
  "balad":90,"shams":91,"sun":91,"layl":92,"night":92,"duha":93,"sharh":94,"inshirah":94,
  "tin":95,"fig":95,"alaq":96,"clot":96,"iqra":96,"qadr":97,"power":97,
  "bayyinah":98,"zalzalah":99,"earthquake":99,"adiyat":100,"qariah":101,
  "takathur":102,"asr":103,"time":103,"humazah":104,"fil":105,"elephant":105,
  "quraysh":106,"maun":107,"kawthar":108,"abundance":108,"kafirun":109,"disbelievers":109,
  "nasr":110,"masad":111,"lahab":111,"ikhlas":112,"sincerity":112,"tawhid":112,
  "falaq":113,"nas":114,"mankind":114,
};

function resolveSurah(input) {
  if (!input) return null;
  const n = parseInt(input);
  if (!isNaN(n) && n >= 1 && n <= 114) return n;
  const lower = input.trim().toLowerCase()
    .replace(/^(al-|al |as-|as |an-|an |at-|at |az-|az |ad-|ad |ar-|ar |ash-|ash )/i, "").trim();
  if (SURAH_ALIASES[lower] != null) return SURAH_ALIASES[lower];
  if (SURAH_ALIASES[input.trim().toLowerCase()] != null) return SURAH_ALIASES[input.trim().toLowerCase()];
  const idx = SURAH_NAMES.findIndex(s =>
    s.toLowerCase() === input.trim().toLowerCase() ||
    s.toLowerCase().replace(/^(al-|as-|an-|at-|az-|ad-|ar-|ash-)/i,"").trim() === lower
  );
  return idx !== -1 ? idx + 1 : null;
}

// ─────────────────────────────────────────────────────
//  GRADE SYSTEM
// ─────────────────────────────────────────────────────
const GRADE_MAP = {
  "sahih":"Sahih","صحيح":"Sahih","authentic":"Sahih","sound":"Sahih",
  "hasan":"Hasan","حسن":"Hasan","good":"Hasan",
  "hasan sahih":"Hasan Sahih","sahih hasan":"Hasan Sahih",
  "da'if":"Da'if","daif":"Da'if","da`eef":"Da'if","weak":"Da'if","ضعيف":"Da'if",
  "maudu":"Maudu","fabricated":"Maudu","موضوع":"Maudu",
  "mursal":"Mursal","mawquf":"Mawquf",
};
const GRADE_META = {
  "Sahih":       { label: "Sahih — Authentic",    emoji: "🟢", color: 0x1B5E20 },
  "Hasan":       { label: "Hasan — Good",          emoji: "🟡", color: 0xF9A825 },
  "Hasan Sahih": { label: "Hasan Sahih",           emoji: "🟢", color: 0x2E7D32 },
  "Da'if":       { label: "Da'if — Weak",          emoji: "🔴", color: 0xB71C1C },
  "Maudu":       { label: "Maudu — Fabricated",    emoji: "⛔", color: 0x212121 },
  "Mursal":      { label: "Mursal — Disconnected", emoji: "🟠", color: 0xE65100 },
  "Mawquf":      { label: "Mawquf — Stopped",      emoji: "🟣", color: 0x6A1B9A },
};
function normalGrade(raw) {
  if (!raw) return null;
  return GRADE_MAP[raw.trim().toLowerCase()] || raw.trim();
}

function clean(s) {
  return (s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&nbsp;/g," ").replace(/&#39;/g,"'").replace(/&quot;/g,'"')
    .trim();
}
function truncate(s, max = 3800) {
  if (!s) return "";
  return s.length > max ? s.substring(0, max) + "\n*(truncated…)*" : s;
}

// ═══════════════════════════════════════════════════════════════
//  SUNNAH.COM API
// ═══════════════════════════════════════════════════════════════
async function sunnahFetch(p) {
  const res = await fetch(`${SUNNAH}${p}`, { headers: { "x-api-key": SUNNAH_KEY } });
  if (!res.ok) throw new Error(`sunnah.com HTTP ${res.status}`);
  return res.json();
}

async function fetchHadith(colKey, number) {
  const col  = COLLECTIONS[colKey];
  const data = await sunnahFetch(`/collections/${col.collectionId}/hadiths/${number}`);
  const h    = data.data ?? data;
  const english  = clean(h.text ?? h.body ?? "");
  const arabic   = clean(h.arabicText ?? h.arabic ?? "");
  const num      = `${h.hadithNumber ?? number}`;
  const grades   = h.grades ?? [];
  const bookName = h.book?.bookName ?? "";
  const bookNum  = h.book?.bookNumber ?? "";
  const chapter  = h.chapter?.chapterEnglish ?? "";
  let finalGrade, allGrades;
  const ALWAYS_SAHIH = new Set(["bukhari","muslim"]);
  if (grades.length === 0 && ALWAYS_SAHIH.has(colKey)) {
    finalGrade = "Sahih";
    allGrades  = "🟢 **Sahih** *(Agreed Upon — Muttafaqun Alayh)*";
  } else if (grades.length > 0) {
    const primary = grades.find(g => /albani/i.test(g.graded_by ?? "")) ?? grades[0];
    finalGrade    = normalGrade(primary.grade);
    allGrades     = grades.map(g => {
      const gMeta = GRADE_META[normalGrade(g.grade)];
      return `${gMeta?.emoji ?? "⚪"} **${g.graded_by ?? "Unknown"}**: ${g.grade}`;
    }).join("\n");
  } else { finalGrade = null; allGrades = null; }
  const ref = bookNum ? `Book ${bookNum}${h.hadithNumber ? `, Hadith ${h.hadithNumber}` : ""}` : null;
  return { colKey, number: num, english, arabic, grade: finalGrade, allGrades, section: chapter, bookName, ref };
}

async function fetchRandomHadith(colKey) {
  const key = colKey ?? COL_KEYS[Math.floor(Math.random() * COL_KEYS.length)];
  const num = Math.floor(Math.random() * COLLECTIONS[key].total) + 1;
  return fetchHadith(key, num);
}

// ═══════════════════════════════════════════════════════════════
//  QURAN
// ═══════════════════════════════════════════════════════════════
async function fetchAyah(surahN, ayahN, trKey = DEFAULT_TR) {
  const ed  = TRANSLATIONS[trKey]?.edition ?? TRANSLATIONS[DEFAULT_TR].edition;
  const res = await fetch(`${QURAN}/ayah/${surahN}:${ayahN}/editions/quran-uthmani,${ed}`);
  if (!res.ok) throw new Error(`AlQuran HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran: ${json.status}`);
  const ar = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const tr = json.data.find(d => d.edition.identifier === ed);
  if (!ar || !tr) throw new Error("AlQuran bad response");
  return {
    surahName: ar.surah.englishName, surahArabic: ar.surah.name,
    surahNum: ar.surah.number, ayahNum: ar.numberInSurah,
    totalAyahs: ar.surah.numberOfAyahs, arabic: ar.text,
    translation: clean(tr.text), page: ar.page, juz: ar.juz,
  };
}

async function fetchRandomAyah(trKey = DEFAULT_TR) {
  const ed  = TRANSLATIONS[trKey]?.edition ?? TRANSLATIONS[DEFAULT_TR].edition;
  const res = await fetch(`${QURAN}/ayah/random/editions/quran-uthmani,${ed}`);
  if (!res.ok) throw new Error(`AlQuran HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran: ${json.status}`);
  const ar = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const tr = json.data.find(d => d.edition.identifier === ed);
  if (!ar || !tr) throw new Error("AlQuran bad response");
  return {
    surahName: ar.surah.englishName, surahArabic: ar.surah.name,
    surahNum: ar.surah.number, ayahNum: ar.numberInSurah,
    totalAyahs: ar.surah.numberOfAyahs, arabic: ar.text,
    translation: clean(tr.text), page: ar.page, juz: ar.juz,
  };
}

async function fetchSurah(surahN, trKey = DEFAULT_TR) {
  const ed  = TRANSLATIONS[trKey]?.edition ?? TRANSLATIONS[DEFAULT_TR].edition;
  const [infoRes, firstRes] = await Promise.all([
    fetch(`${QURAN}/surah/${surahN}`),
    fetch(`${QURAN}/ayah/${surahN}:1/editions/quran-uthmani,${ed}`),
  ]);
  if (!infoRes.ok) throw new Error(`AlQuran surah HTTP ${infoRes.status}`);
  const info = (await infoRes.json()).data;
  let first = null;
  if (firstRes.ok) {
    const j = await firstRes.json();
    if (j.code === 200) {
      const ar = j.data.find(d => d.edition.identifier === "quran-uthmani");
      const tr = j.data.find(d => d.edition.identifier === ed);
      if (ar && tr) first = { arabic: ar.text, translation: clean(tr.text) };
    }
  }
  return {
    number: info.number, nameArabic: info.name, nameEnglish: info.englishName,
    meaning: info.englishNameTranslation, revelation: info.revelationType,
    totalAyahs: info.numberOfAyahs, first,
  };
}

// ═══════════════════════════════════════════════════════════════
//  UMMAHAPI
// ═══════════════════════════════════════════════════════════════
async function ummahFetch(p) {
  const res  = await fetch(`${UMMAH}${p}`);
  if (!res.ok) throw new Error(`UmmahAPI HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error("UmmahAPI error");
  return json.data;
}
const getTafsir    = (k,s,a) => ummahFetch(`/tafsir/${k}/surah/${s}/ayah/${a}`);
const getRandomDua = ()       => ummahFetch("/duas/random");
const getDuasByCat = c        => ummahFetch(`/duas/category/${c}`);
const getAllAsma    = ()       => ummahFetch("/asma-ul-husna");
const getHijri     = ()       => ummahFetch("/today-hijri");

// ═══════════════════════════════════════════════════════════════
//  EMBED BUILDERS
// ═══════════════════════════════════════════════════════════════
function hadithEmbed(h, showArabic = false) {
  const col = COLLECTIONS[h.colKey];
  const g   = h.grade ? (GRADE_META[h.grade] || { label: h.grade, emoji: "⚪", color: null }) : null;
  const embed = new EmbedBuilder()
    .setColor(g?.color ?? col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${h.number}` })
    .setDescription(`*"${truncate(h.english || "Translation unavailable.", 3800)}"*`)
    .setFooter({ text: "sunnah.com API • لا علم إلا ما علَّم الله" })
    .setTimestamp();
  if (g) embed.addFields({ name: "📊 Grade", value: h.allGrades ? h.allGrades.substring(0,1000) : `${g.emoji} **${g.label}**`, inline: false });
  embed.addFields(
    { name: "📖 Collection", value: col.name,       inline: true },
    { name: "🔢 Number",     value: `#${h.number}`, inline: true }
  );
  if (h.bookName) embed.addFields({ name: "📚 Book",    value: h.bookName,                  inline: true });
  if (h.section)  embed.addFields({ name: "📑 Chapter", value: truncate(h.section, 256),    inline: false });
  if (h.ref)      embed.addFields({ name: "🔗 Reference", value: h.ref,                     inline: true });
  if (showArabic && h.arabic) embed.addFields({ name: "🕌 Arabic", value: `\`\`\`${truncate(h.arabic, 1000)}\`\`\`` });
  return embed;
}

function ayahEmbed(v, trKey = DEFAULT_TR) {
  const tr    = TRANSLATIONS[trKey] ?? TRANSLATIONS[DEFAULT_TR];
  const embed = new EmbedBuilder()
    .setColor(0x1B5E20)
    .setAuthor({ name: `📖  ${v.surahName} (${v.surahArabic})  •  ${v.surahNum}:${v.ayahNum}` })
    .setDescription(`*"${v.translation || "Translation unavailable."}"*`);
  if (v.arabic) embed.addFields({ name: "🕌 Arabic", value: v.arabic });
  embed.addFields(
    { name: "📍 Reference",   value: `${v.surahNum}:${v.ayahNum}`, inline: true },
    { name: "🌐 Translation", value: `${tr.flag} ${tr.name}`,      inline: true }
  );
  if (v.page) embed.addFields({ name: "📄 Page", value: `${v.page}/604`, inline: true });
  if (v.juz)  embed.addFields({ name: "🗂️ Juz",  value: `${v.juz}/30`,  inline: true });
  embed.setFooter({ text: "القرآن الكريم — The Noble Quran" }).setTimestamp();
  return embed;
}

function surahEmbed(s, trKey = DEFAULT_TR) {
  const tr   = TRANSLATIONS[trKey] ?? TRANSLATIONS[DEFAULT_TR];
  const icon = s.revelation === "Meccan" ? "🕋" : "🕌";
  const embed = new EmbedBuilder()
    .setColor(0x00695C)
    .setTitle(`${icon}  Surah ${s.number} — ${s.nameEnglish}  (${s.nameArabic})`)
    .addFields(
      { name: "💬 Meaning",     value: s.meaning || "—",          inline: true },
      { name: "📍 Revelation",  value: `${icon} ${s.revelation}`, inline: true },
      { name: "🔢 Total Ayahs", value: `${s.totalAyahs}`,         inline: true },
      { name: "🌐 Translation", value: `${tr.flag} ${tr.name}`,   inline: true },
    );
  if (s.first) {
    embed.addFields(
      { name: "🕌 First Ayah (Arabic)", value: s.first.arabic,                   inline: false },
      { name: "📖 Translation",         value: `*"${s.first.translation}"*`,      inline: false }
    );
  }
  embed.setFooter({ text: "القرآن الكريم — AlQuran Cloud" }).setTimestamp();
  return embed;
}

function tafsirEmbed(data, key) {
  const t    = TAFSIRS[key] || { name: key, scholar: "", lang: "Unknown", flag: "📚" };
  const raw  = data.tafsir?.text || "Tafsir unavailable.";
  const text = raw.length > 3900 ? raw.substring(0, 3900) + "\n*(truncated)*" : raw;
  return new EmbedBuilder().setColor(0x4A148C)
    .setAuthor({ name: `${t.flag}  ${t.name}  •  ${data.verse_key}` })
    .setTitle(`📚 ${t.scholar}`).setDescription(text)
    .addFields(
      { name: "📖 Scholar",  value: t.scholar,      inline: true },
      { name: "🗣️ Language", value: t.lang,         inline: true },
      { name: "📍 Ayah",     value: data.verse_key, inline: true }
    )
    .setFooter({ text: "UmmahAPI • تفسير القرآن الكريم" }).setTimestamp();
}

function duaEmbed(dua) {
  const cat  = DUAS[dua.category] || { name: dua.category_info?.name || dua.category, emoji: "🤲" };
  const reps = dua.repeat > 1 ? `\n\n*Repeat: **${dua.repeat}x***` : "";
  return new EmbedBuilder().setColor(0x006064)
    .setAuthor({ name: `${cat.emoji}  ${cat.name}  •  Dua #${dua.id}` })
    .setTitle(dua.title)
    .setDescription(`**${dua.arabic}**\n\n*${dua.transliteration}*\n\n"${dua.translation}"${reps}`)
    .addFields(
      { name: "📚 Source",   value: dua.source, inline: true },
      { name: "📂 Category", value: cat.name,   inline: true }
    )
    .setFooter({ text: "ادْعُونِي أَسْتَجِبْ لَكُمْ — Call upon Me; I will respond to you. (40:60)" })
    .setTimestamp();
}

function asmaEmbed(name) {
  return new EmbedBuilder().setColor(0x1A237E)
    .setAuthor({ name: `✨  Asma ul Husna — Name #${name.number} of 99` })
    .setTitle(`${name.arabic}  •  ${name.transliteration}`)
    .setDescription(`**"${name.meaning}"**\n\n${name.description || ""}`)
    .addFields(
      { name: "🔢 Number",          value: `${name.number}/99`,  inline: true },
      { name: "🔤 Transliteration", value: name.transliteration, inline: true },
      { name: "💬 Meaning",         value: name.meaning,         inline: true }
    )
    .setFooter({ text: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ — (7:180)" }).setTimestamp();
}

function hijriEmbed(data) {
  const { hijri: h, gregorian: g } = data;
  return new EmbedBuilder().setColor(0x3E2723).setTitle("🌙  Today's Islamic Date")
    .addFields(
      { name: "🗓️ Hijri Date",     value: `**${h.day} ${h.month_name} ${h.year} AH**`, inline: false },
      { name: "📅 Gregorian Date", value: g.formatted || `${g.day}/${g.month}/${g.year}`, inline: false }
    )
    .setFooter({ text: "UmmahAPI • Hijri Calendar" }).setTimestamp();
}

function errEmbed(msg) {
  return new EmbedBuilder().setColor(0xB71C1C).setTitle("⚠️  Could not load")
    .setDescription(msg).setFooter({ text: "Check the number/name and try again" });
}

// ═══════════════════════════════════════════════════════════════
//  TICKET SYSTEM HELPERS
// ═══════════════════════════════════════════════════════════════

// Ticket types users can choose from when opening
const TICKET_TYPES = [
  { label: "❓ General Support",   value: "general",   description: "Questions and general help"       },
  { label: "🕌 Islamic Question",  value: "islamic",   description: "Questions about Islam & knowledge" },
  { label: "🛠️ Bot Issue",         value: "bot",       description: "Report a bug or bot problem"       },
  { label: "⚠️ Report a User",     value: "report",    description: "Report a member's behaviour"       },
  { label: "💡 Suggestion",        value: "suggest",   description: "Share an idea or suggestion"       },
  { label: "🤝 Partnership",       value: "partner",   description: "Partnership requests"              },
];

const TICKET_TYPE_LABELS = Object.fromEntries(TICKET_TYPES.map(t => [t.value, t.label]));

// Panel embed shown in the ticket channel
function ticketPanelEmbed() {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("🎫  Support Tickets")
    .setDescription(
      "Need help? Click the button below to open a ticket.\n\n" +
      "**Available categories:**\n" +
      TICKET_TYPES.map(t => `${t.label} — *${t.description}*`).join("\n") +
      "\n\n> React ❌ on a bot message to delete it."
    )
    .setFooter({ text: "One ticket at a time please • الإسلام بوت" })
    .setTimestamp();
}

// Panel action row — single "Open Ticket" button
function ticketPanelRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_open")
      .setLabel("🎫  Open a Ticket")
      .setStyle(ButtonStyle.Success)
  );
}

// Type selector shown after clicking Open Ticket
function ticketTypeRow() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ticket_type_select")
      .setPlaceholder("Choose a ticket category…")
      .addOptions(TICKET_TYPES)
  );
}

// Controls inside the ticket channel (for staff)
function ticketControlRow(claimed, claimedBy) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_claim")
      .setLabel(claimed ? `✅ Claimed by ${claimedBy}` : "🙋 Claim Ticket")
      .setStyle(claimed ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setDisabled(claimed),
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("🔒 Close Ticket")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("ticket_transcript")
      .setLabel("📄 Transcript")
      .setStyle(ButtonStyle.Secondary),
  );
}

// Embed inside the newly created ticket channel
function ticketWelcomeEmbed(user, type, ticketId) {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`🎫  Ticket #${ticketId} — ${TICKET_TYPE_LABELS[type] || type}`)
    .setDescription(
      `Welcome ${user}, a staff member will be with you shortly.\n\n` +
      `**Please describe your issue in detail below.**\n\n` +
      `*Staff: use the buttons below to claim or close this ticket.*`
    )
    .addFields(
      { name: "👤 Opened by", value: `${user}`,         inline: true },
      { name: "📂 Type",       value: TICKET_TYPE_LABELS[type] || type, inline: true },
      { name: "🆔 Ticket ID",  value: `#${ticketId}`,   inline: true },
    )
    .setFooter({ text: "الإسلام بوت • Ticket System" })
    .setTimestamp();
}

// Send transcript to log channel
async function sendTranscript(guild, ticket, channel) {
  const cfg = TICKETS.config[guild.id];
  if (!cfg?.logChannelId) return;
  const logCh = guild.channels.cache.get(cfg.logChannelId);
  if (!logCh) return;

  // Fetch last 100 messages and format them
  const msgs = await channel.messages.fetch({ limit: 100 }).catch(() => null);
  if (!msgs) return;

  const lines = [...msgs.values()].reverse().map(m =>
    `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content || "(embed/attachment)"}`
  );

  const text = lines.join("\n");
  const buf  = Buffer.from(text, "utf8");

  await logCh.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📄  Transcript — Ticket #${ticket.ticketId}`)
        .addFields(
          { name: "👤 User",    value: `<@${ticket.userId}>`, inline: true },
          { name: "📂 Type",    value: TICKET_TYPE_LABELS[ticket.type] || ticket.type, inline: true },
          { name: "📅 Opened",  value: new Date(ticket.createdAt).toUTCString(), inline: false },
        )
        .setFooter({ text: "الإسلام بوت • Ticket System" })
        .setTimestamp(),
    ],
    files: [{ attachment: buf, name: `ticket-${ticket.ticketId}.txt` }],
  });
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENTS (Islamic Bot)
// ═══════════════════════════════════════════════════════════════
function colMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("sc").setPlaceholder("Switch collection…")
      .addOptions(COL_KEYS.slice(0,25).map(k => ({
        label: COLLECTIONS[k].name,
        description: `${COLLECTIONS[k].total.toLocaleString()} hadiths`,
        value: k, emoji: COLLECTIONS[k].emoji,
      })))
  );
}
function hadithBtns(colKey, num, showArabic = false) {
  const col  = COLLECTIONS[colKey];
  const n    = parseInt(num) || 1;
  const prev = Math.max(1, n - 1);
  const next = Math.min(col.total, n + 1);
  const rand = Math.floor(Math.random() * col.total) + 1;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`hp|${colKey}|${prev}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(n <= 1),
    new ButtonBuilder().setCustomId(`hn|${colKey}|${next}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(n >= col.total),
    new ButtonBuilder().setCustomId(`hr|${colKey}|${rand}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ha|${colKey}|${n}`).setLabel(showArabic ? "Hide Arabic" : "🕌 Arabic").setStyle(ButtonStyle.Secondary)
  );
}
function tranMenu(curKey, s, a, max) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId(`stm_${s}_${a}_${max}`)
      .setPlaceholder("Switch translation…")
      .addOptions(TRANS_KEYS.map(k => ({
        label: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`,
        value: k, default: k === curKey,
      })))
  );
}
function ayahBtns(s, a, max, trKey) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ap_${s}_${Math.max(1,a-1)}_${max}_${trKey}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(a <= 1),
    new ButtonBuilder().setCustomId(`an_${s}_${Math.min(max,a+1)}_${max}_${trKey}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(a >= max),
    new ButtonBuilder().setCustomId(`ar_${trKey}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`to_${s}_${a}`).setLabel("📚 Tafsir").setStyle(ButtonStyle.Success)
  );
}
function surahBtns(n, trKey) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`sp_${Math.max(1,n-1)}_${trKey}`).setLabel("◀ Prev Surah").setStyle(ButtonStyle.Secondary).setDisabled(n <= 1),
    new ButtonBuilder().setCustomId(`sn_${Math.min(114,n+1)}_${trKey}`).setLabel("Next Surah ▶").setStyle(ButtonStyle.Secondary).setDisabled(n >= 114),
    new ButtonBuilder().setCustomId(`sr_${trKey}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`sa_${n}_${trKey}`).setLabel("📖 Read Ayahs").setStyle(ButtonStyle.Success)
  );
}
function tafsirMenu(s, a) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("stf").setPlaceholder("📚 Choose a Tafsir…")
      .addOptions(Object.entries(TAFSIRS).map(([k,v]) => ({
        label: `${v.flag} ${v.name}`, description: `${v.scholar} • ${v.lang}`, value: `${k}|${s}|${a}`,
      })))
  );
}
function duaCatMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("sdc").setPlaceholder("📂 Choose a category…")
      .addOptions(DUA_KEYS.slice(0,25).map(k => ({
        label: `${DUAS[k].emoji} ${DUAS[k].name}`, description: `${DUAS[k].count} duas`, value: k,
      })))
  );
}
function duaBtns(cat, idx, total) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`dp_${cat}_${Math.max(0,idx-1)}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(idx <= 0),
    new ButtonBuilder().setCustomId(`dn_${cat}_${Math.min(total-1,idx+1)}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(idx >= total-1),
    new ButtonBuilder().setCustomId("dr").setLabel("🎲 Random").setStyle(ButtonStyle.Primary)
  );
}
function asmaBtns(n) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`xp_${Math.max(1,n-1)}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(n <= 1),
    new ButtonBuilder().setCustomId(`xn_${Math.min(99,n+1)}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(n >= 99),
    new ButtonBuilder().setCustomId(`xr_${Math.floor(Math.random()*99)+1}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary)
  );
}

// ═══════════════════════════════════════════════════════════════
//  SLASH COMMANDS
// ═══════════════════════════════════════════════════════════════
const commands = [
  // ── Islamic commands ──────────────────────────────────────
  new SlashCommandBuilder().setName("hadith").setDescription("Get a hadith by collection and number")
    .addStringOption(o => o.setName("collection").setDescription("Collection").setRequired(true)
      .addChoices(...COL_KEYS.slice(0,25).map(k => ({ name: COLLECTIONS[k].name, value: k }))))
    .addIntegerOption(o => o.setName("number").setDescription("Hadith number").setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName("random").setDescription("Get a random hadith")
    .addStringOption(o => o.setName("collection").setDescription("Collection (optional)")
      .addChoices(...COL_KEYS.slice(0,25).map(k => ({ name: COLLECTIONS[k].name, value: k })))),

  new SlashCommandBuilder().setName("ayah").setDescription("Get a Quran verse")
    .addStringOption(o => o.setName("surah").setDescription("Surah number or name").setRequired(true))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANS_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("surah").setDescription("Get surah info")
    .addStringOption(o => o.setName("surah").setDescription("Surah number or name").setRequired(true))
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANS_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("randomayah").setDescription("Get a random Quran verse")
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANS_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("tafsir").setDescription("Get commentary for a verse")
    .addStringOption(o => o.setName("surah").setDescription("Surah number or name").setRequired(true))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("scholar").setDescription("Tafsir (default: Ibn Kathir)")
      .addChoices(...Object.entries(TAFSIRS).map(([k,v]) => ({ name: `${v.flag} ${v.name} (${v.lang})`, value: k })))),

  new SlashCommandBuilder().setName("dua").setDescription("Browse duas by category or get a random one")
    .addStringOption(o => o.setName("category").setDescription("Category (optional)")
      .addChoices(...DUA_KEYS.slice(0,25).map(k => ({ name: `${DUAS[k].emoji} ${DUAS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("asmaallah").setDescription("Browse the 99 Names of Allah")
    .addIntegerOption(o => o.setName("number").setDescription("Number 1–99").setMinValue(1).setMaxValue(99)),

  new SlashCommandBuilder().setName("hijri").setDescription("Get today's Hijri date"),
  new SlashCommandBuilder().setName("daily").setDescription("Daily hadith, ayah, and dua"),
  new SlashCommandBuilder().setName("collections").setDescription("List all hadith collections"),
  new SlashCommandBuilder().setName("explore").setDescription("Explore hadith collections interactively"),

  // ── Ticket commands ───────────────────────────────────────
  new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("⚙️ Set up the ticket system (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o => o.setName("panel_channel").setDescription("Channel to post the ticket panel in").setRequired(true))
    .addChannelOption(o => o.setName("category").setDescription("Category where ticket channels are created").setRequired(true))
    .addRoleOption(o => o.setName("support_role").setDescription("Role that can see and manage tickets").setRequired(true))
    .addChannelOption(o => o.setName("log_channel").setDescription("Channel to send ticket transcripts/logs").setRequired(false)),

  new SlashCommandBuilder()
    .setName("ticket-add")
    .setDescription("Add a user to the current ticket")
    .addUserOption(o => o.setName("user").setDescription("User to add").setRequired(true)),

  new SlashCommandBuilder()
    .setName("ticket-remove")
    .setDescription("Remove a user from the current ticket")
    .addUserOption(o => o.setName("user").setDescription("User to remove").setRequired(true)),

  new SlashCommandBuilder()
    .setName("ticket-close")
    .setDescription("Close the current ticket"),

  new SlashCommandBuilder()
    .setName("ticket-rename")
    .setDescription("Rename the current ticket channel")
    .addStringOption(o => o.setName("name").setDescription("New channel name").setRequired(true)),

  new SlashCommandBuilder()
    .setName("ticket-config")
    .setDescription("Show the current ticket configuration (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

].map(c => c.toJSON());

// ═══════════════════════════════════════════════════════════════
//  BOT READY
// ═══════════════════════════════════════════════════════════════
client.once("ready", async () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  const [typeRaw, ...parts] = (process.env.BOT_STATUS || "WATCHING:📖 /ayah /hadith /ticket-setup").split(":");
  client.user.setPresence({
    activities: [{ name: parts.join(":"), type: { PLAYING:0,STREAMING:1,LISTENING:2,WATCHING:3,COMPETING:5 }[typeRaw.toUpperCase()] ?? 3 }],
    status: process.env.BOT_ONLINE_STATUS || "online",
  });
  const rest = new REST({ version:"10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Commands registered");
  } catch(e) { console.error(e); }
});

// ═══════════════════════════════════════════════════════════════
//  AUTO VERSE DETECTION
// ═══════════════════════════════════════════════════════════════
const SURAH_MAX_AYAH = [
  0,7,286,200,176,120,165,206,75,129,109,
  123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,
  34,30,73,54,45,83,182,88,75,85,
  54,53,89,59,37,35,38,29,18,45,
  60,49,62,55,78,96,29,22,24,13,
  14,11,11,18,12,12,30,52,52,44,
  28,28,20,56,40,31,50,40,46,42,
  29,19,36,25,22,17,19,26,30,20,
  15,21,11,8,8,19,5,8,8,11,
  11,8,3,9,5,4,7,3,6,3,
  5,4,5,4,
];
function isValidAyah(s, a) {
  return s >= 1 && s <= 114 && a >= 1 && a <= (SURAH_MAX_AYAH[s] || 286);
}
const VERSE_RE = /\[?(?:([\w\u0600-\u06FF''\-\u2019 ]{2,40})\s+)?(\d{1,3}):(\d{1,3})(?:-\d{1,3})?\]?/g;

function autoVerseEmbed(v) {
  const tr = TRANSLATIONS[DEFAULT_TR];
  return new EmbedBuilder()
    .setColor(0x2E7D32)
    .setTitle(`${v.surahName} ${v.surahNum}:${v.ayahNum} — ${tr.flag} ${tr.name}`)
    .setDescription(`**<${v.ayahNum}>** ${v.translation}\n\n> ${v.arabic}`)
    .setFooter({ text: `${v.surahName} (${v.surahArabic}) • ${v.surahNum}:${v.ayahNum}/${v.totalAyahs} • الإسلام بوت` });
}

const verseCooldown = new Map();

client.on("messageCreate", async message => {
  if (message.author.bot || message.webhookId) return;
  const content = message.content;
  if (!content || content.length < 3) return;
  const now = Date.now();
  if (now - (verseCooldown.get(message.channelId) || 0) < 5000) return;
  const hits = [];
  let m;
  VERSE_RE.lastIndex = 0;
  while ((m = VERSE_RE.exec(content)) !== null && hits.length < 3) {
    const rawName = m[1]?.trim() || null;
    const sNum    = parseInt(m[2]);
    const aNum    = parseInt(m[3]);
    let surahN = rawName
      ? resolveSurah(rawName) ?? (sNum >= 1 && sNum <= 114 ? sNum : null)
      : (sNum >= 1 && sNum <= 114 ? sNum : null);
    if (!surahN || !isValidAyah(surahN, aNum)) continue;
    const key = `${surahN}:${aNum}`;
    if (hits.some(h => h.key === key)) continue;
    hits.push({ surahN, aNum, key });
  }
  if (!hits.length) return;
  verseCooldown.set(message.channelId, now);
  const settled = await Promise.allSettled(hits.map(h => fetchAyah(h.surahN, h.aNum, DEFAULT_TR)));
  const embeds  = settled.filter(r => r.status === "fulfilled").map(r => autoVerseEmbed(r.value));
  if (!embeds.length) return;
  try {
    const reply = await message.reply({ embeds, allowedMentions: { repliedUser: false } });
    await reply.react("❌").catch(() => {});
    reply.awaitReactions({
      filter: (reaction, user) => reaction.emoji.name === "❌" && user.id === message.author.id,
      max: 1, time: 60_000, errors: [],
    }).then(col => { if (col.size) reply.delete().catch(() => {}); });
  } catch (e) { console.error("autoVerse error:", e); }
});

// ═══════════════════════════════════════════════════════════════
//  INTERACTION HANDLER
// ═══════════════════════════════════════════════════════════════
client.on("interactionCreate", async interaction => {

  // ── SLASH COMMANDS ──────────────────────────────────────────
  if (interaction.isChatInputCommand()) {
    const cmd = interaction.commandName;

    // ════ TICKET COMMANDS ════════════════════════════════════

    // /ticket-setup
    if (cmd === "ticket-setup") {
      await interaction.deferReply({ ephemeral: true });
      const panelCh   = interaction.options.getChannel("panel_channel");
      const category  = interaction.options.getChannel("category");
      const suppRole  = interaction.options.getRole("support_role");
      const logCh     = interaction.options.getChannel("log_channel");
      const gid       = interaction.guildId;

      // Validate category type
      if (category.type !== ChannelType.GuildCategory) {
        return interaction.editReply({ content: "❌ The **category** option must be a Category channel, not a text channel." });
      }

      // Init config
      if (!TICKETS.config[gid]) TICKETS.config[gid] = { nextId: 1 };
      TICKETS.config[gid].categoryId     = category.id;
      TICKETS.config[gid].supportRoleId  = suppRole.id;
      TICKETS.config[gid].panelChannelId = panelCh.id;
      if (logCh) TICKETS.config[gid].logChannelId = logCh.id;
      saveTickets(TICKETS);

      // Post or update the panel
      try {
        await panelCh.send({ embeds: [ticketPanelEmbed()], components: [ticketPanelRow()] });
      } catch {
        return interaction.editReply({ content: "❌ I couldn't send a message to that panel channel. Check my permissions." });
      }

      return interaction.editReply({
        content:
          `✅ **Ticket system configured!**\n\n` +
          `📌 Panel: ${panelCh}\n` +
          `📁 Category: **${category.name}**\n` +
          `👥 Support Role: ${suppRole}\n` +
          (logCh ? `📋 Log Channel: ${logCh}\n` : "") +
          `\nUsers can now open tickets by clicking the button in ${panelCh}.`,
      });
    }

    // /ticket-config
    else if (cmd === "ticket-config") {
      await interaction.deferReply({ ephemeral: true });
      const cfg = TICKETS.config[interaction.guildId];
      if (!cfg) return interaction.editReply({ content: "❌ Ticket system not configured. Run `/ticket-setup` first." });
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("⚙️  Ticket Configuration")
        .addFields(
          { name: "📁 Category",      value: cfg.categoryId    ? `<#${cfg.categoryId}>` : "Not set",    inline: true },
          { name: "👥 Support Role",  value: cfg.supportRoleId ? `<@&${cfg.supportRoleId}>` : "Not set", inline: true },
          { name: "📌 Panel Channel", value: cfg.panelChannelId ? `<#${cfg.panelChannelId}>` : "Not set", inline: true },
          { name: "📋 Log Channel",   value: cfg.logChannelId  ? `<#${cfg.logChannelId}>` : "Not set",   inline: true },
          { name: "🔢 Next Ticket #", value: `${cfg.nextId ?? 1}`,                                        inline: true },
          { name: "📂 Open Tickets",  value: `${Object.values(TICKETS.open).filter(t => t.guildId === interaction.guildId).length}`, inline: true },
        )
        .setFooter({ text: "الإسلام بوت • Ticket System" })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    // /ticket-close
    else if (cmd === "ticket-close") {
      await interaction.deferReply({ ephemeral: true });
      const ticket = TICKETS.open[interaction.channelId];
      if (!ticket) return interaction.editReply({ content: "❌ This channel is not a ticket." });
      await interaction.editReply({ content: "🔒 Closing ticket and saving transcript…" });
      const ch = interaction.channel;
      await sendTranscript(interaction.guild, ticket, ch).catch(() => {});
      delete TICKETS.open[interaction.channelId];
      saveTickets(TICKETS);
      await ch.send({ embeds: [
        new EmbedBuilder().setColor(0xB71C1C)
          .setTitle("🔒  Ticket Closed")
          .setDescription(`Closed by ${interaction.user}.\nThis channel will be deleted in 5 seconds.`)
          .setTimestamp()
      ]});
      setTimeout(() => ch.delete().catch(() => {}), 5000);
    }

    // /ticket-add
    else if (cmd === "ticket-add") {
      await interaction.deferReply({ ephemeral: true });
      const ticket = TICKETS.open[interaction.channelId];
      if (!ticket) return interaction.editReply({ content: "❌ This channel is not a ticket." });
      const user = interaction.options.getUser("user");
      await interaction.channel.permissionOverwrites.create(user, {
        ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
      });
      await interaction.editReply({ content: `✅ Added ${user} to the ticket.` });
      await interaction.channel.send(`👋 ${user} has been added to this ticket by ${interaction.user}.`);
    }

    // /ticket-remove
    else if (cmd === "ticket-remove") {
      await interaction.deferReply({ ephemeral: true });
      const ticket = TICKETS.open[interaction.channelId];
      if (!ticket) return interaction.editReply({ content: "❌ This channel is not a ticket." });
      const user = interaction.options.getUser("user");
      if (user.id === ticket.userId) return interaction.editReply({ content: "❌ You can't remove the ticket creator." });
      await interaction.channel.permissionOverwrites.delete(user).catch(() => {});
      await interaction.editReply({ content: `✅ Removed ${user} from the ticket.` });
      await interaction.channel.send(`👋 ${user} has been removed from this ticket by ${interaction.user}.`);
    }

    // /ticket-rename
    else if (cmd === "ticket-rename") {
      await interaction.deferReply({ ephemeral: true });
      const ticket = TICKETS.open[interaction.channelId];
      if (!ticket) return interaction.editReply({ content: "❌ This channel is not a ticket." });
      const name = interaction.options.getString("name").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await interaction.channel.setName(`ticket-${name}`).catch(() => {});
      await interaction.editReply({ content: `✅ Renamed channel to **ticket-${name}**.` });
    }

    // ════ ISLAMIC COMMANDS ══════════════════════════════════
    else {
      await interaction.deferReply();

      if (cmd === "hadith") {
        const colKey = interaction.options.getString("collection");
        const num    = interaction.options.getInteger("number");
        if (num > COLLECTIONS[colKey].total)
          return interaction.editReply({ embeds: [errEmbed(`${COLLECTIONS[colKey].name} only has up to #${COLLECTIONS[colKey].total}.`)] });
        try {
          const h = await fetchHadith(colKey, num);
          await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(colKey, num), colMenu()] });
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed(`Could not load hadith #${num}.\n\`${e.message}\``)] }); }
      }

      else if (cmd === "random") {
        const colKey = interaction.options.getString("collection") || null;
        try {
          const h   = await fetchRandomHadith(colKey);
          const num = parseInt(h.number) || 1;
          await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(h.colKey, num), colMenu()] });
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed("Could not fetch a random hadith.")] }); }
      }

      else if (cmd === "ayah") {
        const surahIn = interaction.options.getString("surah");
        const ayahN   = interaction.options.getInteger("ayah");
        const trKey   = interaction.options.getString("translation") || DEFAULT_TR;
        const surahN  = resolveSurah(surahIn);
        if (!surahN) return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.`)] });
        try {
          const v = await fetchAyah(surahN, ayahN, trKey);
          await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, ayahN, v.totalAyahs), ayahBtns(surahN, ayahN, v.totalAyahs, trKey)] });
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed(`Could not load ${surahN}:${ayahN}.`)] }); }
      }

      else if (cmd === "surah") {
        const surahIn = interaction.options.getString("surah");
        const trKey   = interaction.options.getString("translation") || DEFAULT_TR;
        const surahN  = resolveSurah(surahIn);
        if (!surahN) return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.`)] });
        try {
          const s = await fetchSurah(surahN, trKey);
          await interaction.editReply({ embeds: [surahEmbed(s, trKey)], components: [surahBtns(surahN, trKey)] });
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed(`Could not load Surah ${surahN}.`)] }); }
      }

      else if (cmd === "randomayah") {
        const trKey = interaction.options.getString("translation") || DEFAULT_TR;
        try {
          const v = await fetchRandomAyah(trKey);
          await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, v.surahNum, v.ayahNum, v.totalAyahs), ayahBtns(v.surahNum, v.ayahNum, v.totalAyahs, trKey)] });
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed("Could not fetch a random ayah.")] }); }
      }

      else if (cmd === "tafsir") {
        const surahIn = interaction.options.getString("surah");
        const ayahN   = interaction.options.getInteger("ayah");
        const tafsirK = interaction.options.getString("scholar") || "ibn_kathir";
        const surahN  = resolveSurah(surahIn);
        if (!surahN) return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.`)] });
        try {
          const data = await getTafsir(tafsirK, surahN, ayahN);
          await interaction.editReply({ embeds: [tafsirEmbed(data, tafsirK)], components: [tafsirMenu(surahN, ayahN)] });
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed(`Could not load tafsir for ${surahN}:${ayahN}.`)] }); }
      }

      else if (cmd === "dua") {
        const cat = interaction.options.getString("category");
        try {
          if (cat) {
            const resp = await getDuasByCat(cat);
            const duas = Array.isArray(resp) ? resp : (resp.duas || []);
            if (!duas.length) return interaction.editReply({ embeds: [errEmbed("No duas found.")] });
            await interaction.editReply({ embeds: [duaEmbed(duas[0])], components: [duaCatMenu(), duaBtns(cat, 0, duas.length)] });
          } else {
            await interaction.editReply({ embeds: [duaEmbed(await getRandomDua())], components: [duaCatMenu()] });
          }
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed("Could not fetch a dua.")] }); }
      }

      else if (cmd === "asmaallah") {
        const num = interaction.options.getInteger("number") || 1;
        try {
          const resp  = await getAllAsma();
          const names = Array.isArray(resp) ? resp : (resp.names || resp);
          const name  = names.find(n => n.number === num) || names[num - 1];
          if (!name) return interaction.editReply({ embeds: [errEmbed("Name not found.")] });
          await interaction.editReply({ embeds: [asmaEmbed(name)], components: [asmaBtns(num)] });
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed("Could not load Asma ul Husna.")] }); }
      }

      else if (cmd === "hijri") {
        try { await interaction.editReply({ embeds: [hijriEmbed(await getHijri())] }); }
        catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed("Could not fetch Hijri date.")] }); }
      }

      else if (cmd === "daily") {
        try {
          const [h, v, dua, hijri] = await Promise.all([
            fetchRandomHadith(null), fetchRandomAyah(DEFAULT_TR),
            getRandomDua(), getHijri().catch(() => null),
          ]);
          const hE = hadithEmbed(h); hE.setTitle("🌅  Daily Hadith");
          const aE = ayahEmbed(v);   aE.setTitle("📖  Daily Ayah");
          const dE = duaEmbed(dua);  dE.setTitle("🤲  Daily Dua");
          await interaction.editReply({ embeds: hijri ? [hijriEmbed(hijri), hE, aE, dE] : [hE, aE, dE] });
        } catch(e) { console.error(e); await interaction.editReply({ embeds: [errEmbed("Could not load daily content.")] }); }
      }

      else if (cmd === "collections") {
        const lines = COL_KEYS.map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** (${COLLECTIONS[k].arabic}) — ${COLLECTIONS[k].total.toLocaleString()} hadiths`);
        const total = COL_KEYS.reduce((s,k) => s + COLLECTIONS[k].total, 0);
        await interaction.editReply({ embeds: [
          new EmbedBuilder().setColor(0x5C4033).setTitle("📚  Hadith Collections")
            .setDescription(lines.join("\n") + `\n\n**Total: ${total.toLocaleString()} across ${COL_KEYS.length} collections**`)
            .setFooter({ text: "sunnah.com API — Powered by sunnah.com" })
        ]});
      }

      else if (cmd === "explore") {
        await interaction.editReply({ embeds: [
          new EmbedBuilder().setColor(0x4E342E).setTitle("📚  Hadith Explorer")
            .setDescription("Pick a collection to start browsing.\n**◀ / ▶** to navigate  •  **🎲** to jump anywhere\n\n" +
              COL_KEYS.map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** — ${COLLECTIONS[k].total.toLocaleString()}`).join("\n"))
            .setFooter({ text: "بسم الله الرحمن الرحيم" })
        ], components: [colMenu()] });
      }
    }
  }

  // ── SELECT MENUS ──────────────────────────────────────────
  else if (interaction.isStringSelectMenu()) {
    const cid = interaction.customId;

    // ── Ticket type chosen ──
    if (cid === "ticket_type_select") {
      await interaction.deferReply({ ephemeral: true });
      const type  = interaction.values[0];
      const gid   = interaction.guildId;
      const cfg   = TICKETS.config[gid];
      if (!cfg) return interaction.editReply({ content: "❌ Ticket system not configured. Ask an admin to run `/ticket-setup`." });

      // Check if user already has an open ticket in this guild
      const existing = Object.values(TICKETS.open).find(t => t.guildId === gid && t.userId === interaction.user.id);
      if (existing) {
        return interaction.editReply({ content: `❌ You already have an open ticket: <#${existing.channelId}>` });
      }

      const ticketId = cfg.nextId ?? 1;
      cfg.nextId     = ticketId + 1;
      saveTickets(TICKETS);

      const guild    = interaction.guild;
      const category = guild.channels.cache.get(cfg.categoryId);
      if (!category) return interaction.editReply({ content: "❌ Ticket category not found. Ask an admin to re-run `/ticket-setup`." });

      // Create the ticket channel
      let ticketCh;
      try {
        ticketCh = await guild.channels.create({
          name: `ticket-${ticketId.toString().padStart(4, "0")}`,
          type: ChannelType.GuildText,
          parent: cfg.categoryId,
          permissionOverwrites: [
            { id: guild.roles.everyone,        deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id,          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: cfg.supportRoleId,            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] },
            { id: client.user.id,               allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages] },
          ],
        });
      } catch(e) {
        console.error("ticket create error:", e);
        return interaction.editReply({ content: "❌ Failed to create ticket channel. Check my permissions in the category." });
      }

      // Store the ticket
      const ticketData = {
        guildId: gid, channelId: ticketCh.id, userId: interaction.user.id,
        ticketId, type, createdAt: Date.now(), claimed: false, claimedBy: null,
      };
      TICKETS.open[ticketCh.id] = ticketData;
      saveTickets(TICKETS);

      // Send welcome message
      await ticketCh.send({
        content: `${interaction.user} | <@&${cfg.supportRoleId}>`,
        embeds: [ticketWelcomeEmbed(interaction.user, type, ticketId)],
        components: [ticketControlRow(false, null)],
        allowedMentions: { users: [interaction.user.id], roles: [cfg.supportRoleId] },
      });

      // Log to log channel
      if (cfg.logChannelId) {
        const logCh = guild.channels.cache.get(cfg.logChannelId);
        logCh?.send({ embeds: [
          new EmbedBuilder().setColor(0x57F287)
            .setTitle("🎫  New Ticket Opened")
            .addFields(
              { name: "👤 User",    value: `${interaction.user} (${interaction.user.id})`, inline: true },
              { name: "📂 Type",    value: TICKET_TYPE_LABELS[type] || type,               inline: true },
              { name: "🆔 Ticket", value: `#${ticketId} — ${ticketCh}`,                   inline: true },
            )
            .setTimestamp()
        ]}).catch(() => {});
      }

      return interaction.editReply({ content: `✅ Your ticket has been created: ${ticketCh}` });
    }

    // ── Islamic select menus ──
    if (cid === "sc") {
      await interaction.deferUpdate();
      const colKey = interaction.values[0];
      try {
        const h = await fetchHadith(colKey, 1);
        await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(colKey, 1), colMenu()] });
      } catch { await interaction.editReply({ embeds: [errEmbed(`Could not load ${COLLECTIONS[colKey]?.name || colKey}.`)] }); }
    }
    else if (cid.startsWith("stm_")) {
      await interaction.deferUpdate();
      const [,s,a,max] = cid.split("_");
      const surahN = parseInt(s), ayahN = parseInt(a), maxN = parseInt(max)||300;
      const trKey  = interaction.values[0];
      try {
        const v = await fetchAyah(surahN, ayahN, trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, ayahN, maxN), ayahBtns(surahN, ayahN, maxN, trKey)] });
      } catch { await interaction.editReply({ embeds: [errEmbed("Could not switch translation.")] }); }
    }
    else if (cid === "stf") {
      await interaction.deferUpdate();
      const [tafsirK, s, a] = interaction.values[0].split("|");
      try {
        const data = await getTafsir(tafsirK, parseInt(s), parseInt(a));
        await interaction.editReply({ embeds: [tafsirEmbed(data, tafsirK)], components: [tafsirMenu(parseInt(s), parseInt(a))] });
      } catch { await interaction.editReply({ embeds: [errEmbed(`Could not load tafsir for ${s}:${a}.`)] }); }
    }
    else if (cid === "sdc") {
      await interaction.deferUpdate();
      const cat = interaction.values[0];
      try {
        const resp = await getDuasByCat(cat);
        const duas = Array.isArray(resp) ? resp : (resp.duas||[]);
        if (!duas.length) return interaction.editReply({ embeds: [errEmbed("No duas found.")] });
        await interaction.editReply({ embeds: [duaEmbed(duas[0])], components: [duaCatMenu(), duaBtns(cat, 0, duas.length)] });
      } catch { await interaction.editReply({ embeds: [errEmbed("Could not load that category.")] }); }
    }
  }

  // ── BUTTONS ───────────────────────────────────────────────
  else if (interaction.isButton()) {
    const id = interaction.customId;

    // ── Ticket: Open panel button ──
    if (id === "ticket_open") {
      await interaction.reply({
        content: "**What type of ticket would you like to open?**",
        components: [ticketTypeRow()],
        ephemeral: true,
      });
      return;
    }

    // ── Ticket: Claim ──
    if (id === "ticket_claim") {
      const ticket = TICKETS.open[interaction.channelId];
      if (!ticket) return interaction.reply({ content: "❌ Not a ticket channel.", ephemeral: true });
      const cfg = TICKETS.config[interaction.guildId];
      const member = interaction.member;
      const hasSupportRole = cfg?.supportRoleId && member.roles.cache.has(cfg.supportRoleId);
      if (!hasSupportRole && !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: "❌ Only support staff can claim tickets.", ephemeral: true });
      }
      ticket.claimed   = true;
      ticket.claimedBy = interaction.user.username;
      TICKETS.open[interaction.channelId] = ticket;
      saveTickets(TICKETS);
      await interaction.update({ components: [ticketControlRow(true, interaction.user.username)] });
      await interaction.channel.send(`✅ **${interaction.user}** has claimed this ticket.`);
      return;
    }

    // ── Ticket: Close (button) ──
    if (id === "ticket_close") {
      const ticket = TICKETS.open[interaction.channelId];
      if (!ticket) return interaction.reply({ content: "❌ Not a ticket channel.", ephemeral: true });
      await interaction.reply({ content: "🔒 Closing ticket…", ephemeral: true });
      const ch = interaction.channel;
      await sendTranscript(interaction.guild, ticket, ch).catch(() => {});
      delete TICKETS.open[interaction.channelId];
      saveTickets(TICKETS);
      await ch.send({ embeds: [
        new EmbedBuilder().setColor(0xB71C1C)
          .setTitle("🔒  Ticket Closed")
          .setDescription(`Closed by ${interaction.user}. This channel will be deleted in 5 seconds.`)
          .setTimestamp()
      ]});

      // Log closure
      const cfg = TICKETS.config[interaction.guildId];
      if (cfg?.logChannelId) {
        const logCh = interaction.guild.channels.cache.get(cfg.logChannelId);
        logCh?.send({ embeds: [
          new EmbedBuilder().setColor(0xED4245)
            .setTitle("🔒  Ticket Closed")
            .addFields(
              { name: "🆔 Ticket",    value: `#${ticket.ticketId}`,        inline: true },
              { name: "👤 User",      value: `<@${ticket.userId}>`,        inline: true },
              { name: "🛡️ Closed by", value: `${interaction.user}`,        inline: true },
            )
            .setTimestamp()
        ]}).catch(() => {});
      }

      setTimeout(() => ch.delete().catch(() => {}), 5000);
      return;
    }

    // ── Ticket: Transcript ──
    if (id === "ticket_transcript") {
      const ticket = TICKETS.open[interaction.channelId];
      if (!ticket) return interaction.reply({ content: "❌ Not a ticket channel.", ephemeral: true });
      await interaction.reply({ content: "📄 Generating transcript…", ephemeral: true });
      await sendTranscript(interaction.guild, ticket, interaction.channel).catch(() => {});
      const cfg = TICKETS.config[interaction.guildId];
      const dest = cfg?.logChannelId ? `<#${cfg.logChannelId}>` : "the log channel";
      await interaction.editReply({ content: `✅ Transcript sent to ${dest}.` });
      return;
    }

    // ── Islamic buttons ──
    if (/^h[pnra]\|/.test(id)) {
      await interaction.deferUpdate();
      const [code, colKey, numStr] = id.split("|");
      const num = parseInt(numStr);
      try {
        const h = await fetchHadith(colKey, num);
        const showArabic = code === "ha"
          ? !(interaction.message.embeds[0]?.fields?.some(f => f.name === "🕌 Arabic") || false)
          : false;
        await interaction.editReply({ embeds: [hadithEmbed(h, showArabic)], components: [hadithBtns(colKey, num, showArabic), colMenu()] });
      } catch { await interaction.editReply({ embeds: [errEmbed(`Could not load hadith #${num}.`)] }); }
    }
    else if (id.startsWith("ap_") || id.startsWith("an_")) {
      await interaction.deferUpdate();
      const parts = id.split("_");
      const s = parseInt(parts[1]), a = parseInt(parts[2]), max = parseInt(parts[3])||300;
      const trKey = parts.slice(4).join("_") || DEFAULT_TR;
      try {
        const v = await fetchAyah(s, a, trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, s, a, max), ayahBtns(s, a, max, trKey)] });
      } catch { await interaction.editReply({ embeds: [errEmbed("Could not load that ayah.")] }); }
    }
    else if (id.startsWith("ar_")) {
      await interaction.deferUpdate();
      const trKey = id.slice(3) || DEFAULT_TR;
      try {
        const v = await fetchRandomAyah(trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, v.surahNum, v.ayahNum, v.totalAyahs), ayahBtns(v.surahNum, v.ayahNum, v.totalAyahs, trKey)] });
      } catch { await interaction.editReply({ embeds: [errEmbed("Could not load a random ayah.")] }); }
    }
    else if (id.startsWith("sp_") || id.startsWith("sn_") || id.startsWith("sr_") || id.startsWith("sa_")) {
      await interaction.deferUpdate();
      const code = id.substring(0, 2);
      const parts = id.split("_");
      if (code === "sa") {
        const surahN = parseInt(parts[1]);
        const trKey  = parts.slice(2).join("_") || DEFAULT_TR;
        try {
          const v = await fetchAyah(surahN, 1, trKey);
          await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, 1, v.totalAyahs), ayahBtns(surahN, 1, v.totalAyahs, trKey)] });
        } catch { await interaction.editReply({ embeds: [errEmbed("Could not load that ayah.")] }); }
        return;
      }
      const surahN = code === "sr" ? Math.floor(Math.random() * 114) + 1 : parseInt(parts[1]);
      const trKey  = code === "sr" ? parts.slice(1).join("_") || DEFAULT_TR : parts.slice(2).join("_") || DEFAULT_TR;
      try {
        const s = await fetchSurah(surahN, trKey);
        await interaction.editReply({ embeds: [surahEmbed(s, trKey)], components: [surahBtns(surahN, trKey)] });
      } catch { await interaction.editReply({ embeds: [errEmbed(`Could not load Surah ${surahN}.`)] }); }
    }
    else if (id.startsWith("to_")) {
      await interaction.deferUpdate();
      const [,s,a] = id.split("_");
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0x4A148C).setTitle("📚  Choose a Tafsir")
          .setDescription(`Select commentary for **${s}:${a}**\n\n` +
            Object.entries(TAFSIRS).map(([,v]) => `${v.flag} **${v.name}** — *${v.scholar}* (${v.lang})`).join("\n"))
          .setFooter({ text: "تفسير القرآن الكريم — UmmahAPI" })],
        components: [tafsirMenu(parseInt(s), parseInt(a))],
      });
    }
    else if (id.startsWith("dp_") || id.startsWith("dn_")) {
      await interaction.deferUpdate();
      const parts = id.split("_");
      const cat = parts[1], idx = parseInt(parts[2]);
      try {
        const resp = await getDuasByCat(cat);
        const duas = Array.isArray(resp) ? resp : (resp.duas||[]);
        if (!duas[idx]) return interaction.editReply({ embeds: [errEmbed("Dua not found.")] });
        await interaction.editReply({ embeds: [duaEmbed(duas[idx])], components: [duaCatMenu(), duaBtns(cat, idx, duas.length)] });
      } catch { await interaction.editReply({ embeds: [errEmbed("Could not load that dua.")] }); }
    }
    else if (id === "dr") {
      await interaction.deferUpdate();
      try { await interaction.editReply({ embeds: [duaEmbed(await getRandomDua())], components: [duaCatMenu()] }); }
      catch { await interaction.editReply({ embeds: [errEmbed("Could not load a random dua.")] }); }
    }
    else if (id.startsWith("xp_") || id.startsWith("xn_") || id.startsWith("xr_")) {
      await interaction.deferUpdate();
      const num = parseInt(id.split("_")[1]);
      try {
        const resp  = await getAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names||resp);
        const name  = names.find(n => n.number === num) || names[num-1];
        if (!name) return interaction.editReply({ embeds: [errEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [asmaEmbed(name)], components: [asmaBtns(num)] });
      } catch { await interaction.editReply({ embeds: [errEmbed("Could not load that name.")] }); }
    }
  }
});

// ═══════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════
if (!process.env.DISCORD_TOKEN) { console.error("❌  DISCORD_TOKEN not set"); process.exit(1); }
if (!SUNNAH_KEY)                { console.error("❌  SUNNAH_API_KEY not set"); process.exit(1); }
client.login(process.env.DISCORD_TOKEN);
