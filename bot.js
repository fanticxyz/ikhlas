/**
 * ═══════════════════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT
 * ═══════════════════════════════════════════════════════════════
 *
 *  Hadith  — fawazahmed0 CDN  (cdn.jsdelivr.net)  NO KEY
 *  Quran   — AlQuran Cloud    (api.alquran.cloud)  NO KEY
 *  Tafsir / Duas / Asma / Hijri — UmmahAPI         NO KEY
 *
 *  ENV:  DISCORD_TOKEN  (required)
 * ═══════════════════════════════════════════════════════════════
 */

require("dotenv").config();
const {
  Client, GatewayIntentBits, EmbedBuilder,
  SlashCommandBuilder, REST, Routes,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ─────────────────────────────────────────────────────
//  API BASES
// ─────────────────────────────────────────────────────
const FAWAZ   = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const QURAN   = "https://api.alquran.cloud/v1";
const UMMAH   = "https://ummahapi.com/api";

// ─────────────────────────────────────────────────────
//  COLLECTIONS
//  fawaz_eng  — English edition key
//  fawaz_ara  — Arabic edition key (for Arabic text)
// ─────────────────────────────────────────────────────
const COLLECTIONS = {
  bukhari:   { name: "Sahih al-Bukhari",  arabic: "صحيح البخاري",  color: 0x1B5E20, emoji: "📗", total: 7563, fawaz_eng: "eng-bukhari",   fawaz_ara: "ara-bukhari1"  },
  muslim:    { name: "Sahih Muslim",      arabic: "صحيح مسلم",     color: 0x0D47A1, emoji: "📘", total: 7470, fawaz_eng: "eng-muslim",     fawaz_ara: "ara-muslim"    },
  abudawud:  { name: "Sunan Abu Dawud",   arabic: "سنن أبي داود",  color: 0x4A148C, emoji: "📙", total: 5274, fawaz_eng: "eng-abudawud",   fawaz_ara: "ara-abudawud"  },
  tirmidhi:  { name: "Jami at-Tirmidhi",  arabic: "جامع الترمذي",  color: 0x880E4F, emoji: "📕", total: 3956, fawaz_eng: "eng-tirmidhi",   fawaz_ara: "ara-tirmidhi"  },
  ibnmajah:  { name: "Sunan Ibn Majah",   arabic: "سنن ابن ماجه",  color: 0x004D40, emoji: "📒", total: 4341, fawaz_eng: "eng-ibnmajah",   fawaz_ara: "ara-ibnmajah"  },
  nasai:     { name: "Sunan an-Nasa'i",   arabic: "سنن النسائي",   color: 0x37474F, emoji: "📓", total: 5761, fawaz_eng: "eng-nasai",      fawaz_ara: "ara-nasai"     },
  malik:     { name: "Muwatta Malik",     arabic: "موطأ مالك",     color: 0x6D4C41, emoji: "📔", total: 1858, fawaz_eng: "eng-malik",      fawaz_ara: "ara-malik"     },
  nawawi40:  { name: "40 Hadith Nawawi",  arabic: "الأربعون النووية", color: 0x00695C, emoji: "🌿", total: 42,   fawaz_eng: "eng-nawawi40",   fawaz_ara: "ara-nawawi40"  },
  qudsi40:   { name: "40 Hadith Qudsi",   arabic: "الأربعون القدسية", color: 0x1A237E, emoji: "✨", total: 40,   fawaz_eng: "eng-qudsi40",    fawaz_ara: "ara-qudsi40"   },
  dehlawi40: { name: "40 Hadith Dehlawi", arabic: "أربعون الشاه ولي الله", color: 0x4E342E, emoji: "📜", total: 40, fawaz_eng: "eng-dehlawi", fawaz_ara: "ara-dehlawi1" },
};
const COL_KEYS = Object.keys(COLLECTIONS);

// ─────────────────────────────────────────────────────
//  QURAN TRANSLATIONS  (AlQuran Cloud edition IDs)
// ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  sahih_international: { name: "Saheeh International", flag: "🇬🇧", edition: "en.sahih"    },
  pickthall:           { name: "Pickthall",             flag: "🇬🇧", edition: "en.pickthall" },
  yusuf_ali:           { name: "Yusuf Ali",             flag: "🇬🇧", edition: "en.yusufali"  },
};
const TRANS_KEYS  = Object.keys(TRANSLATIONS);
const DEFAULT_TR  = "sahih_international";

// ─────────────────────────────────────────────────────
//  TAFSIR EDITIONS  (UmmahAPI)
// ─────────────────────────────────────────────────────
const TAFSIRS = {
  ibn_kathir:    { name: "Ibn Kathir (Abridged)", scholar: "Hafiz Ibn Kathir",                         lang: "English", flag: "🇬🇧" },
  maarif:        { name: "Ma'arif al-Qur'an",     scholar: "Mufti Muhammad Shafi",                     lang: "English", flag: "🇬🇧" },
  muyassar:      { name: "Tafsir Muyassar",       scholar: "Ministry of Islamic Affairs, Saudi Arabia", lang: "Arabic",  flag: "🇸🇦" },
  ibn_kathir_ar: { name: "Ibn Kathir (Arabic)",   scholar: "Hafiz Ibn Kathir",                         lang: "Arabic",  flag: "🇸🇦" },
};

// ─────────────────────────────────────────────────────
//  DUA CATEGORIES  (UmmahAPI)
// ─────────────────────────────────────────────────────
const DUAS = {
  morning:      { name: "Morning Adhkar",     emoji: "🌅", count: 7 },
  evening:      { name: "Evening Adhkar",     emoji: "🌆", count: 5 },
  prayer:       { name: "During Prayer",      emoji: "🙏", count: 8 },
  after_prayer: { name: "After Prayer",       emoji: "📿", count: 8 },
  sleep:        { name: "Sleep",              emoji: "🌙", count: 6 },
  food:         { name: "Food & Drink",       emoji: "🍽️", count: 6 },
  travel:       { name: "Travel",             emoji: "✈️", count: 6 },
  distress:     { name: "Distress & Anxiety", emoji: "💙", count: 7 },
  forgiveness:  { name: "Forgiveness",        emoji: "🤍", count: 5 },
  illness:      { name: "Illness & Healing",  emoji: "💊", count: 5 },
  guidance:     { name: "Guidance",           emoji: "🧭", count: 3 },
  protection:   { name: "Protection",         emoji: "🛡️", count: 4 },
  dhikr:        { name: "Dhikr",              emoji: "📖", count: 6 },
  knowledge:    { name: "Knowledge",          emoji: "📚", count: 3 },
  gratitude:    { name: "Gratitude",          emoji: "🌸", count: 3 },
  marriage:     { name: "Marriage & Family",  emoji: "👨‍👩‍👧", count: 4 },
  hajj:         { name: "Hajj & Umrah",       emoji: "🕋", count: 4 },
  grief:        { name: "Grief & Loss",       emoji: "🤲", count: 4 },
  children:     { name: "Children",           emoji: "👶", count: 4 },
  night_prayer: { name: "Night Prayer",       emoji: "⭐", count: 4 },
  quran_recitation: { name: "Quran Recitation", emoji: "📜", count: 3 },
};
const DUA_KEYS = Object.keys(DUAS);

// ─────────────────────────────────────────────────────
//  SURAH NAME → NUMBER lookup
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
  "fatiha":1,"fatihah":1,"opening":1,
  "baqara":2,"baqarah":2,"cow":2,
  "imran":3,"al imran":3,
  "nisa":4,"nisaa":4,"women":4,
  "maidah":5,"maida":5,"table":5,
  "anam":6,"cattle":6,
  "araf":7,"heights":7,
  "anfal":8,"spoils":8,
  "tawba":9,"tawbah":9,"repentance":9,
  "yunus":10,"hud":11,"yusuf":12,
  "rad":13,"thunder":13,"ibrahim":14,"hijr":15,
  "nahl":16,"bee":16,
  "isra":17,"night journey":17,
  "kahf":18,"cave":18,
  "maryam":19,"mary":19,"taha":20,
  "anbiya":21,"prophets":21,
  "hajj":22,"pilgrimage":22,
  "muminun":23,"nur":24,"light":24,
  "furqan":25,"shuara":26,"poets":26,
  "naml":27,"ant":27,"ants":27,
  "qasas":28,"stories":28,
  "ankabut":29,"spider":29,
  "rum":30,"romans":30,
  "luqman":31,"sajdah":32,"prostration":32,
  "ahzab":33,"saba":34,"fatir":35,
  "yasin":36,"ya sin":36,"ya-sin":36,
  "saffat":37,"sad":38,
  "zumar":39,"groups":39,
  "ghafir":40,"mumin":40,
  "fussilat":41,"shura":42,"zukhruf":43,
  "dukhan":44,"smoke":44,
  "jathiyah":45,"ahqaf":46,
  "muhammad":47,"fath":48,"victory":48,
  "hujurat":49,"qaf":50,"dhariyat":51,
  "tur":52,"mount":52,
  "najm":53,"star":53,
  "qamar":54,"moon":54,
  "rahman":55,"ar rahman":55,
  "waqiah":56,"hadid":57,"iron":57,
  "mujadila":58,"hashr":59,
  "mumtahanah":60,"saf":61,
  "jumuah":62,"friday":62,
  "munafiqun":63,"taghabun":64,
  "talaq":65,"divorce":65,
  "tahrim":66,"mulk":67,"dominion":67,
  "qalam":68,"pen":68,
  "haqqah":69,"maarij":70,
  "nuh":71,"noah":71,
  "jinn":72,"muzzammil":73,"muddaththir":74,
  "qiyamah":75,"resurrection":75,
  "insan":76,"human":76,
  "mursalat":77,"naba":78,
  "naziat":79,"abasa":80,
  "takwir":81,"infitar":82,
  "mutaffifin":83,"inshiqaq":84,
  "buruj":85,"tariq":86,
  "ala":87,"most high":87,
  "ghashiyah":88,"fajr":89,"dawn":89,
  "balad":90,"shams":91,"sun":91,
  "layl":92,"night":92,
  "duha":93,"sharh":94,"inshirah":94,
  "tin":95,"fig":95,
  "alaq":96,"clot":96,"iqra":96,
  "qadr":97,"power":97,
  "bayyinah":98,"zalzalah":99,"earthquake":99,
  "adiyat":100,"qariah":101,
  "takathur":102,"asr":103,"time":103,
  "humazah":104,"fil":105,"elephant":105,
  "quraysh":106,"maun":107,
  "kawthar":108,"abundance":108,
  "kafirun":109,"disbelievers":109,
  "nasr":110,"masad":111,"lahab":111,
  "ikhlas":112,"sincerity":112,"tawhid":112,
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

// ─────────────────────────────────────────────────────
//  UTIL
// ─────────────────────────────────────────────────────
function clean(s) {
  return (s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&nbsp;/g," ").replace(/&#39;/g,"'").replace(/&quot;/g,'"')
    .trim();
}

// ═══════════════════════════════════════════════════════════════
//  FAWAZAHMED0 HADITH API
//
//  Single hadith: GET /editions/{eng-key}/{number}.json
//  Response shape:
//    { hadithnumber: N, hadith: [{ number, text, grades: [{grade, graded_by}] }] }
//
//  Arabic text:   GET /editions/{ara-key}/{number}.json
//    { hadithnumber: N, hadith: [{ number, text }] }
// ═══════════════════════════════════════════════════════════════
async function fawazFetch(edition, number) {
  const res = await fetch(`${FAWAZ}/${edition}/${number}.json`);
  if (!res.ok) throw new Error(`fawaz HTTP ${res.status} — ${edition}/${number}`);
  return res.json();
}

function parseHadith(engData, araData, colKey) {
  // Real fawaz structure:
  // { hadiths: [{ hadithnumber, text, grades: [{ name, grade }], reference: { book, hadith } }] }
  const h = engData.hadiths?.[0] ?? {};
  const a = araData?.hadiths?.[0] ?? {};

  const english = clean(h.text ?? "");
  const arabic  = clean(a.text ?? "");
  const number  = `${h.hadithnumber ?? h.arabicnumber ?? "?"}`;

  // grades: array of { name (scholar), grade }
  const grades   = h.grades ?? [];
  const rawGrade = grades[0]?.grade ?? null;
  const gradedBy = grades.map(g => g.name).filter(Boolean).join(", ") || null;

  // section info from metadata
  const section = engData.metadata?.section
    ? Object.values(engData.metadata.section)[0] ?? null
    : null;

  return { colKey, number, english, arabic, grade: normalGrade(rawGrade), gradedBy, section };
}

async function fetchHadith(colKey, number) {
  const col = COLLECTIONS[colKey];
  const [eng, ara] = await Promise.allSettled([
    fawazFetch(col.fawaz_eng, number),
    fawazFetch(col.fawaz_ara, number),
  ]);
  if (eng.status === "rejected") throw eng.reason;
  return parseHadith(eng.value, ara.status === "fulfilled" ? ara.value : null, colKey);
}

async function fetchRandomHadith(colKey) {
  const key = colKey ?? COL_KEYS[Math.floor(Math.random() * COL_KEYS.length)];
  const col = COLLECTIONS[key];
  const num = Math.floor(Math.random() * col.total) + 1;
  return fetchHadith(key, num);
}

// ═══════════════════════════════════════════════════════════════
//  QURAN  (AlQuran Cloud)
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
    surahName: ar.surah.englishName,
    surahArabic: ar.surah.name,
    surahNum: ar.surah.number,
    ayahNum: ar.numberInSurah,
    totalAyahs: ar.surah.numberOfAyahs,
    arabic: ar.text,
    translation: clean(tr.text),
    page: ar.page,
    juz: ar.juz,
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
    surahName: ar.surah.englishName,
    surahArabic: ar.surah.name,
    surahNum: ar.surah.number,
    ayahNum: ar.numberInSurah,
    totalAyahs: ar.surah.numberOfAyahs,
    arabic: ar.text,
    translation: clean(tr.text),
    page: ar.page,
    juz: ar.juz,
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
    number: info.number,
    nameArabic: info.name,
    nameEnglish: info.englishName,
    meaning: info.englishNameTranslation,
    revelation: info.revelationType,
    totalAyahs: info.numberOfAyahs,
    first,
  };
}

// ═══════════════════════════════════════════════════════════════
//  UMMAHAPI  (Tafsir · Dua · Asma · Hijri)
// ═══════════════════════════════════════════════════════════════
async function ummahFetch(path) {
  const res  = await fetch(`${UMMAH}${path}`);
  if (!res.ok) throw new Error(`UmmahAPI HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error("UmmahAPI error");
  return json.data;
}
const getTafsir    = (k,s,a) => ummahFetch(`/tafsir/${k}/surah/${s}/ayah/${a}`);
const getRandomDua = ()       => ummahFetch("/duas/random");
const getDuasByCat = c        => ummahFetch(`/duas/category/${c}`);
const getAllAsma   = ()        => ummahFetch("/asma-ul-husna");
const getHijri     = ()        => ummahFetch("/today-hijri");

// ═══════════════════════════════════════════════════════════════
//  EMBED BUILDERS
// ═══════════════════════════════════════════════════════════════
function hadithEmbed(h, showArabic = false) {
  const col = COLLECTIONS[h.colKey];
  const g   = h.grade ? (GRADE_META[h.grade] || { label: h.grade, emoji: "⚪", color: null }) : null;

  const embed = new EmbedBuilder()
    .setColor(g?.color ?? col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${h.number}` })
    .setDescription(`*"${h.english || "Translation unavailable."}"*`)
    .setFooter({ text: "fawazahmed0 CDN • لا علم إلا ما علَّم الله" })
    .setTimestamp();

  if (g) {
    embed.addFields({
      name: "📊 Grade",
      value: h.gradedBy ? `${g.emoji} **${g.label}**\n*by ${h.gradedBy}*` : `${g.emoji} **${g.label}**`,
      inline: false,
    });
  }
  embed.addFields(
    { name: "📖 Collection", value: col.name,       inline: true },
    { name: "🔢 Number",     value: `#${h.number}`, inline: true }
  );
  if (h.section) embed.addFields({ name: "📑 Section", value: h.section, inline: false });
  if (showArabic && h.arabic) {
    embed.addFields({ name: "🕌 Arabic", value: `\`\`\`${h.arabic.substring(0, 1000)}\`\`\`` });
  }
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
  const tr    = TRANSLATIONS[trKey] ?? TRANSLATIONS[DEFAULT_TR];
  const icon  = s.revelation === "Meccan" ? "🕋" : "🕌";
  const embed = new EmbedBuilder()
    .setColor(0x00695C)
    .setTitle(`${icon}  Surah ${s.number} — ${s.nameEnglish}  (${s.nameArabic})`)
    .addFields(
      { name: "💬 Meaning",      value: s.meaning || "—",             inline: true },
      { name: "📍 Revelation",   value: `${icon} ${s.revelation}`,    inline: true },
      { name: "🔢 Total Ayahs",  value: `${s.totalAyahs}`,            inline: true },
      { name: "🌐 Translation",  value: `${tr.flag} ${tr.name}`,      inline: true },
    );
  if (s.first) {
    embed.addFields(
      { name: "🕌 First Ayah (Arabic)", value: s.first.arabic, inline: false },
      { name: "📖 Translation",         value: `*"${s.first.translation}"*`, inline: false }
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
    .setTitle(`📚 ${t.scholar}`)
    .setDescription(text)
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
      { name: "🔢 Number",          value: `${name.number}/99`,   inline: true },
      { name: "🔤 Transliteration", value: name.transliteration,  inline: true },
      { name: "💬 Meaning",         value: name.meaning,          inline: true }
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
//  COMPONENTS
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

// customId: {code}|{colKey}|{num}   (pipe avoids splitting colKey)
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
      .addOptions(Object.entries(TAFSIRS).map(([k, v]) => ({
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
  new SlashCommandBuilder().setName("hadith").setDescription("Get a hadith by collection and number")
    .addStringOption(o => o.setName("collection").setDescription("Collection").setRequired(true)
      .addChoices(...COL_KEYS.slice(0,25).map(k => ({ name: COLLECTIONS[k].name, value: k }))))
    .addIntegerOption(o => o.setName("number").setDescription("Hadith number").setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName("random").setDescription("Get a random hadith")
    .addStringOption(o => o.setName("collection").setDescription("Collection (optional)")
      .addChoices(...COL_KEYS.slice(0,25).map(k => ({ name: COLLECTIONS[k].name, value: k })))),

  new SlashCommandBuilder().setName("ayah").setDescription("Get a Quran verse — surah can be a number or name")
    .addStringOption(o => o.setName("surah").setDescription("Surah number (1–114) or name e.g. Kahf, Al-Baqarah").setRequired(true))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANS_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("surah").setDescription("Get surah info — accepts number or name")
    .addStringOption(o => o.setName("surah").setDescription("Surah number or name e.g. Yasin, 36").setRequired(true))
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
].map(c => c.toJSON());

// ═══════════════════════════════════════════════════════════════
//  BOT READY
// ═══════════════════════════════════════════════════════════════
client.once("ready", async () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  const [typeRaw, ...parts] = (process.env.BOT_STATUS || "WATCHING:📖 /ayah /hadith /dua").split(":");
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
//  INTERACTION HANDLER
// ═══════════════════════════════════════════════════════════════
client.on("interactionCreate", async interaction => {

  // ── SLASH COMMANDS ──────────────────────────────────────────
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply();
    const cmd = interaction.commandName;

    // /hadith
    if (cmd === "hadith") {
      const colKey = interaction.options.getString("collection");
      const num    = interaction.options.getInteger("number");
      if (num > COLLECTIONS[colKey].total)
        return interaction.editReply({ embeds: [errEmbed(`${COLLECTIONS[colKey].name} only has up to #${COLLECTIONS[colKey].total}.`)] });
      try {
        const h = await fetchHadith(colKey, num);
        await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(colKey, num), colMenu()] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load hadith #${num}.\n\`${e.message}\``)] });
      }
    }

    // /random
    else if (cmd === "random") {
      const colKey = interaction.options.getString("collection") || null;
      try {
        const h   = await fetchRandomHadith(colKey);
        const num = parseInt(h.number) || 1;
        await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(h.colKey, num), colMenu()] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch a random hadith.")] });
      }
    }

    // /ayah
    else if (cmd === "ayah") {
      const surahIn = interaction.options.getString("surah");
      const ayahN   = interaction.options.getInteger("ayah");
      const trKey   = interaction.options.getString("translation") || DEFAULT_TR;
      const surahN  = resolveSurah(surahIn);
      if (!surahN)
        return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.\nUse a number 1–114 or a name like \`Al-Kahf\`, \`Yasin\`, \`Baqarah\`.`)] });
      try {
        const v = await fetchAyah(surahN, ayahN, trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, ayahN, v.totalAyahs), ayahBtns(surahN, ayahN, v.totalAyahs, trKey)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load ${surahN}:${ayahN}. The ayah may not exist in this surah.`)] });
      }
    }

    // /surah
    else if (cmd === "surah") {
      const surahIn = interaction.options.getString("surah");
      const trKey   = interaction.options.getString("translation") || DEFAULT_TR;
      const surahN  = resolveSurah(surahIn);
      if (!surahN)
        return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.`)] });
      try {
        const s = await fetchSurah(surahN, trKey);
        await interaction.editReply({ embeds: [surahEmbed(s, trKey)], components: [surahBtns(surahN, trKey)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load Surah ${surahN}.`)] });
      }
    }

    // /randomayah
    else if (cmd === "randomayah") {
      const trKey = interaction.options.getString("translation") || DEFAULT_TR;
      try {
        const v = await fetchRandomAyah(trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, v.surahNum, v.ayahNum, v.totalAyahs), ayahBtns(v.surahNum, v.ayahNum, v.totalAyahs, trKey)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch a random ayah.")] });
      }
    }

    // /tafsir
    else if (cmd === "tafsir") {
      const surahIn  = interaction.options.getString("surah");
      const ayahN    = interaction.options.getInteger("ayah");
      const tafsirK  = interaction.options.getString("scholar") || "ibn_kathir";
      const surahN   = resolveSurah(surahIn);
      if (!surahN)
        return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.`)] });
      try {
        const data = await getTafsir(tafsirK, surahN, ayahN);
        await interaction.editReply({ embeds: [tafsirEmbed(data, tafsirK)], components: [tafsirMenu(surahN, ayahN)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load tafsir for ${surahN}:${ayahN}.`)] });
      }
    }

    // /dua
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
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch a dua.")] });
      }
    }

    // /asmaallah
    else if (cmd === "asmaallah") {
      const num = interaction.options.getInteger("number") || 1;
      try {
        const resp  = await getAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [errEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [asmaEmbed(name)], components: [asmaBtns(num)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not load Asma ul Husna.")] });
      }
    }

    // /hijri
    else if (cmd === "hijri") {
      try {
        await interaction.editReply({ embeds: [hijriEmbed(await getHijri())] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch Hijri date.")] });
      }
    }

    // /daily
    else if (cmd === "daily") {
      try {
        const [h, v, dua, hijri] = await Promise.all([
          fetchRandomHadith(null), fetchRandomAyah(DEFAULT_TR),
          getRandomDua(), getHijri().catch(() => null),
        ]);
        const hE = hadithEmbed(h);  hE.setTitle("🌅  Daily Hadith");
        const aE = ayahEmbed(v);    aE.setTitle("📖  Daily Ayah");
        const dE = duaEmbed(dua);   dE.setTitle("🤲  Daily Dua");
        await interaction.editReply({ embeds: hijri ? [hijriEmbed(hijri), hE, aE, dE] : [hE, aE, dE] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not load daily content.")] });
      }
    }

    // /collections
    else if (cmd === "collections") {
      const lines = COL_KEYS.map(k => {
        const c = COLLECTIONS[k];
        return `${c.emoji} **${c.name}** (${c.arabic}) — ${c.total.toLocaleString()} hadiths`;
      });
      const total = COL_KEYS.reduce((s,k) => s + COLLECTIONS[k].total, 0);
      await interaction.editReply({ embeds: [
        new EmbedBuilder().setColor(0x5C4033).setTitle("📚  Hadith Collections")
          .setDescription(lines.join("\n") + `\n\n**Total: ${total.toLocaleString()} across ${COL_KEYS.length} collections**`)
          .setFooter({ text: "fawazahmed0 CDN — free, no API key needed" })
      ]});
    }

    // /explore
    else if (cmd === "explore") {
      await interaction.editReply({ embeds: [
        new EmbedBuilder().setColor(0x4E342E).setTitle("📚  Hadith Explorer")
          .setDescription(
            "Pick a collection to start browsing.\n**◀ / ▶** to navigate  •  **🎲** to jump anywhere\n\n" +
            COL_KEYS.map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** — ${COLLECTIONS[k].total.toLocaleString()}`).join("\n")
          )
          .setFooter({ text: "بسم الله الرحمن الرحيم" })
      ], components: [colMenu()] });
    }
  }

  // ── SELECT MENUS ──────────────────────────────────────────
  else if (interaction.isStringSelectMenu()) {
    const cid = interaction.customId;

    // collection switcher
    if (cid === "sc") {
      await interaction.deferUpdate();
      const colKey = interaction.values[0];
      try {
        const h = await fetchHadith(colKey, 1);
        await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(colKey, 1), colMenu()] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed(`Could not load ${COLLECTIONS[colKey]?.name || colKey}.`)] });
      }
    }

    // translation switcher  stm_{s}_{a}_{max}
    else if (cid.startsWith("stm_")) {
      await interaction.deferUpdate();
      const [,s,a,max] = cid.split("_");
      const surahN = parseInt(s), ayahN = parseInt(a), maxN = parseInt(max)||300;
      const trKey  = interaction.values[0];
      try {
        const v = await fetchAyah(surahN, ayahN, trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, ayahN, maxN), ayahBtns(surahN, ayahN, maxN, trKey)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not switch translation.")] });
      }
    }

    // tafsir select
    else if (cid === "stf") {
      await interaction.deferUpdate();
      const [tafsirK, s, a] = interaction.values[0].split("|");
      try {
        const data = await getTafsir(tafsirK, parseInt(s), parseInt(a));
        await interaction.editReply({ embeds: [tafsirEmbed(data, tafsirK)], components: [tafsirMenu(parseInt(s), parseInt(a))] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed(`Could not load tafsir for ${s}:${a}.`)] });
      }
    }

    // dua category
    else if (cid === "sdc") {
      await interaction.deferUpdate();
      const cat = interaction.values[0];
      try {
        const resp = await getDuasByCat(cat);
        const duas = Array.isArray(resp) ? resp : (resp.duas||[]);
        if (!duas.length) return interaction.editReply({ embeds: [errEmbed("No duas found.")] });
        await interaction.editReply({ embeds: [duaEmbed(duas[0])], components: [duaCatMenu(), duaBtns(cat, 0, duas.length)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load that category.")] });
      }
    }
  }

  // ── BUTTONS ───────────────────────────────────────────────
  else if (interaction.isButton()) {
    const id = interaction.customId;

    // hadith nav  hp|colKey|num  hn|..  hr|..  ha|..
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
      } catch {
        await interaction.editReply({ embeds: [errEmbed(`Could not load hadith #${num}.`)] });
      }
    }

    // ayah prev/next  ap_{s}_{a}_{max}_{tr}  /  an_...
    else if (id.startsWith("ap_") || id.startsWith("an_")) {
      await interaction.deferUpdate();
      const parts  = id.split("_");
      const s      = parseInt(parts[1]);
      const a      = parseInt(parts[2]);
      const max    = parseInt(parts[3])||300;
      const trKey  = parts.slice(4).join("_") || DEFAULT_TR;
      try {
        const v = await fetchAyah(s, a, trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, s, a, max), ayahBtns(s, a, max, trKey)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load that ayah.")] });
      }
    }

    // random ayah  ar_{tr}
    else if (id.startsWith("ar_")) {
      await interaction.deferUpdate();
      const trKey = id.slice(3) || DEFAULT_TR;
      try {
        const v = await fetchRandomAyah(trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, v.surahNum, v.ayahNum, v.totalAyahs), ayahBtns(v.surahNum, v.ayahNum, v.totalAyahs, trKey)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load a random ayah.")] });
      }
    }

    // surah nav  sp_{n}_{tr}  sn_{n}_{tr}  sr_{tr}  sa_{n}_{tr}
    else if (id.startsWith("sp_") || id.startsWith("sn_") || id.startsWith("sr_") || id.startsWith("sa_")) {
      await interaction.deferUpdate();
      const code  = id.substring(0, 2);
      const parts = id.split("_");

      if (code === "sa") {
        // jump to first ayah of this surah
        const surahN = parseInt(parts[1]);
        const trKey  = parts.slice(2).join("_") || DEFAULT_TR;
        try {
          const v = await fetchAyah(surahN, 1, trKey);
          await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, 1, v.totalAyahs), ayahBtns(surahN, 1, v.totalAyahs, trKey)] });
        } catch {
          await interaction.editReply({ embeds: [errEmbed("Could not load that ayah.")] });
        }
        return;
      }

      const surahN = code === "sr"
        ? Math.floor(Math.random() * 114) + 1
        : parseInt(parts[1]);
      const trKey  = code === "sr"
        ? parts.slice(1).join("_") || DEFAULT_TR
        : parts.slice(2).join("_") || DEFAULT_TR;
      try {
        const s = await fetchSurah(surahN, trKey);
        await interaction.editReply({ embeds: [surahEmbed(s, trKey)], components: [surahBtns(surahN, trKey)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed(`Could not load Surah ${surahN}.`)] });
      }
    }

    // tafsir open  to_{s}_{a}
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

    // dua prev/next  dp_{cat}_{idx}  dn_{cat}_{idx}
    else if (id.startsWith("dp_") || id.startsWith("dn_")) {
      await interaction.deferUpdate();
      const parts = id.split("_");
      const cat   = parts[1];
      const idx   = parseInt(parts[2]);
      try {
        const resp = await getDuasByCat(cat);
        const duas = Array.isArray(resp) ? resp : (resp.duas||[]);
        if (!duas[idx]) return interaction.editReply({ embeds: [errEmbed("Dua not found.")] });
        await interaction.editReply({ embeds: [duaEmbed(duas[idx])], components: [duaCatMenu(), duaBtns(cat, idx, duas.length)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load that dua.")] });
      }
    }

    // random dua
    else if (id === "dr") {
      await interaction.deferUpdate();
      try {
        await interaction.editReply({ embeds: [duaEmbed(await getRandomDua())], components: [duaCatMenu()] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load a random dua.")] });
      }
    }

    // asma nav  xp_{n}  xn_{n}  xr_{n}
    else if (id.startsWith("xp_") || id.startsWith("xn_") || id.startsWith("xr_")) {
      await interaction.deferUpdate();
      const num = parseInt(id.split("_")[1]);
      try {
        const resp  = await getAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names||resp);
        const name  = names.find(n => n.number === num) || names[num-1];
        if (!name) return interaction.editReply({ embeds: [errEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [asmaEmbed(name)], components: [asmaBtns(num)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load that name.")] });
      }
    }
  }
});

// ═══════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════
if (!process.env.DISCORD_TOKEN) {
  console.error("❌  DISCORD_TOKEN not set in .env");
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
