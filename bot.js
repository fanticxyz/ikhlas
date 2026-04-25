/**
 * ═══════════════════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT  —  Multi-API Edition
 * ═══════════════════════════════════════════════════════════════
 *
 *  HADITH APIS  (fallback order per collection)
 *  ─────────────────────────────────────────────────────────────
 *  1. fawazahmed0 CDN   cdn.jsdelivr.net/gh/fawazahmed0  NO KEY
 *     └─ 7 main + nawawi40, qudsi40, dehlawi40
 *        multi-scholar grades (Albani, Arnaut, etc.)
 *
 *  2. HadithAPI.com     hadithapi.com                    KEY SET
 *     └─ EXCLUSIVE: mishkat, musnad-ahmad, silsila-sahiha
 *        also fallback for 7 main collections
 *        grades: Sahih / Hasan / Da'eef (Darussalam)
 *
 *  3. HadeethEnc.com    hadeethenc.com/api               NO KEY
 *     └─ /authentic — Sahih-only curated + explanations
 *
 *  4. UmmahAPI          ummahapi.com/api                 NO KEY
 *     └─ Final fallback + Duas / Asma / Hijri
 *
 *  QURAN  →  AlQuran Cloud  (api.alquran.cloud/v1)
 *    /ayah   — search by surah number OR name + ayah number
 *    /surah  — get full surah info + first ayah
 *  TAFSIR · DUAS · ASMA · HIJRI  →  UmmahAPI
 *
 *  ENV VARS  (.env)
 *  ─────────────────────────────────────────────────────────────
 *  DISCORD_TOKEN      required
 *  BOT_STATUS         optional  e.g. "WATCHING:📖 /ayah /hadith"
 *  BOT_ONLINE_STATUS  optional  e.g. "online"
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
const FAWAZ_CDN      = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
const HADITHAPI_COM  = "https://hadithapi.com/api";
const HADITHAPI_KEY  = "$2y$10$hT78jmSQjT0Gz9LnpTMOH4gQgQpXHanDE7ahj4eVpFWtfYDkwu";
const HADEETHENC_API = "https://hadeethenc.com/api/v1";
const UMMAH_API      = "https://ummahapi.com/api";
const QURAN_API      = "https://api.alquran.cloud/v1";

// ─────────────────────────────────────────────────────
//  SURAH LOOKUP  (name → number)
//  Supports English names, transliterations, and aliases
// ─────────────────────────────────────────────────────
const SURAH_LIST = [
  "Al-Fatihah","Al-Baqarah","Ali 'Imran","An-Nisa","Al-Ma'idah",
  "Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr",
  "An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan",
  "Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum",
  "Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir",
  "Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shuraa","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah",
  "Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman",
  "Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saf","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq",
  "At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah",
  "Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj",
  "At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh","At-Tin",
  "Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat",
  "Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil",
  "Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas",
];

// Extra aliases / common alternate spellings
const SURAH_ALIASES = {
  "fatiha": 1, "fatihah": 1, "fatiha": 1, "opening": 1,
  "baqara": 2, "baqarah": 2, "cow": 2,
  "imran": 3, "al imran": 3, "family of imran": 3,
  "nisa": 4, "nisaa": 4, "women": 4,
  "maidah": 5, "maida": 5, "table": 5,
  "anam": 6, "cattle": 6,
  "araf": 7, "heights": 7,
  "anfal": 8, "spoils": 8,
  "tawbah": 9, "tawba": 9, "repentance": 9, "bara'ah": 9,
  "yunus": 10, "jonah": 10,
  "hud": 11,
  "yusuf": 12, "joseph": 12,
  "rad": 13, "thunder": 13,
  "ibrahim": 14, "abraham": 14,
  "hijr": 15, "rocky tract": 15,
  "nahl": 16, "bee": 16,
  "isra": 17, "bani israel": 17, "night journey": 17,
  "kahf": 18, "cave": 18,
  "maryam": 19, "mary": 19,
  "taha": 20,
  "anbiya": 21, "prophets": 21,
  "hajj": 22, "pilgrimage": 22,
  "muminun": 23, "believers": 23,
  "nur": 24, "light": 24,
  "furqan": 25, "criterion": 25,
  "shuara": 26, "poets": 26,
  "naml": 27, "ant": 27, "ants": 27,
  "qasas": 28, "stories": 28,
  "ankabut": 29, "spider": 29,
  "rum": 30, "romans": 30,
  "luqman": 31,
  "sajdah": 32, "prostration": 32,
  "ahzab": 33, "confederates": 33,
  "saba": 34, "sheba": 34,
  "fatir": 35, "originator": 35,
  "yasin": 36, "ya sin": 36,
  "saffat": 37, "those lined up": 37,
  "sad": 38,
  "zumar": 39, "groups": 39,
  "ghafir": 40, "forgiver": 40, "mumin": 40,
  "fussilat": 41, "explained": 41,
  "shura": 42, "consultation": 42,
  "zukhruf": 43, "ornaments": 43,
  "dukhan": 44, "smoke": 44,
  "jathiyah": 45, "crouching": 45,
  "ahqaf": 46, "wind-curved sandhills": 46,
  "muhammad": 47,
  "fath": 48, "victory": 48,
  "hujurat": 49, "rooms": 49,
  "qaf": 50,
  "dhariyat": 51, "winds": 51,
  "tur": 52, "mount": 52,
  "najm": 53, "star": 53,
  "qamar": 54, "moon": 54,
  "rahman": 55, "ar rahman": 55,
  "waqiah": 56, "inevitable": 56,
  "hadid": 57, "iron": 57,
  "mujadila": 58, "pleading": 58,
  "hashr": 59, "exile": 59,
  "mumtahanah": 60, "tested": 60,
  "saf": 61, "ranks": 61,
  "jumuah": 62, "friday": 62,
  "munafiqun": 63, "hypocrites": 63,
  "taghabun": 64, "mutual loss": 64,
  "talaq": 65, "divorce": 65,
  "tahrim": 66, "prohibition": 66,
  "mulk": 67, "dominion": 67,
  "qalam": 68, "pen": 68,
  "haqqah": 69, "reality": 69,
  "maarij": 70, "ascending stairways": 70,
  "nuh": 71, "noah": 71,
  "jinn": 72,
  "muzzammil": 73, "enshrouded": 73,
  "muddaththir": 74, "cloaked": 74,
  "qiyamah": 75, "resurrection": 75,
  "insan": 76, "human": 76, "dahr": 76,
  "mursalat": 77, "emissaries": 77,
  "naba": 78, "tidings": 78,
  "naziat": 79, "those who drag": 79,
  "abasa": 80, "frowned": 80,
  "takwir": 81, "overturn": 81,
  "infitar": 82, "cleaving": 82,
  "mutaffifin": 83, "defrauding": 83,
  "inshiqaq": 84, "splitting open": 84,
  "buruj": 85, "mansions of stars": 85,
  "tariq": 86, "morning star": 86,
  "ala": 87, "most high": 87,
  "ghashiyah": 88, "overwhelming": 88,
  "fajr": 89, "dawn": 89,
  "balad": 90, "city": 90,
  "shams": 91, "sun": 91,
  "layl": 92, "night": 92,
  "duha": 93, "morning hours": 93,
  "sharh": 94, "relief": 94, "inshirah": 94,
  "tin": 95, "fig": 95,
  "alaq": 96, "clot": 96, "iqra": 96,
  "qadr": 97, "power": 97, "night of power": 97,
  "bayyinah": 98, "clear proof": 98,
  "zalzalah": 99, "earthquake": 99,
  "adiyat": 100, "courser": 100,
  "qariah": 101, "calamity": 101,
  "takathur": 102, "rivalry": 102,
  "asr": 103, "time": 103,
  "humazah": 104, "slanderer": 104,
  "fil": 105, "elephant": 105,
  "quraysh": 106,
  "maun": 107, "small kindnesses": 107,
  "kawthar": 108, "abundance": 108,
  "kafirun": 109, "disbelievers": 109,
  "nasr": 110, "divine support": 110,
  "masad": 111, "palm fiber": 111, "lahab": 111,
  "ikhlas": 112, "sincerity": 112, "tawhid": 112,
  "falaq": 113, "daybreak": 113,
  "nas": 114, "mankind": 114,
};

/** Resolve a user input (number string or name) to surah number 1-114 */
function resolveSurah(input) {
  if (!input) return null;
  const trimmed = input.trim();
  // Pure number
  const n = parseInt(trimmed);
  if (!isNaN(n) && n >= 1 && n <= 114) return n;
  // Name match
  const lower = trimmed.toLowerCase()
    .replace(/^(al-|al |as-|as |an-|an |at-|at |az-|az |ad-|ad |ar-|ar |ash-|ash )/i, "")
    .trim();
  // Check aliases first
  if (SURAH_ALIASES[lower] != null) return SURAH_ALIASES[lower];
  if (SURAH_ALIASES[trimmed.toLowerCase()] != null) return SURAH_ALIASES[trimmed.toLowerCase()];
  // Check SURAH_LIST partial match
  const idx = SURAH_LIST.findIndex(s =>
    s.toLowerCase() === trimmed.toLowerCase() ||
    s.toLowerCase().replace(/^(al-|as-|an-|at-|az-|ad-|ar-|ash-)/i, "").trim() === lower
  );
  if (idx !== -1) return idx + 1;
  return null;
}

// ─────────────────────────────────────────────────────
//  COLLECTION REGISTRY
// ─────────────────────────────────────────────────────
const COLLECTIONS = {
  bukhari: {
    name: "Sahih al-Bukhari", arabic: "صحيح البخاري",
    color: 0x1B5E20, emoji: "📗", total: 7563,
    apis: ["fawaz", "hadithapi", "ummah"],
    fawaz_edition: "eng-bukhari", hadithapi_slug: "sahih-bukhari", ummah_key: "bukhari",
  },
  muslim: {
    name: "Sahih Muslim", arabic: "صحيح مسلم",
    color: 0x0D47A1, emoji: "📘", total: 7470,
    apis: ["fawaz", "hadithapi", "ummah"],
    fawaz_edition: "eng-muslim", hadithapi_slug: "sahih-muslim", ummah_key: "muslim",
  },
  abudawud: {
    name: "Sunan Abu Dawud", arabic: "سنن أبي داود",
    color: 0x4A148C, emoji: "📙", total: 5274,
    apis: ["fawaz", "hadithapi", "ummah"],
    fawaz_edition: "eng-abudawud", hadithapi_slug: "abu-dawood", ummah_key: "abudawud",
  },
  tirmidhi: {
    name: "Jami at-Tirmidhi", arabic: "جامع الترمذي",
    color: 0x880E4F, emoji: "📕", total: 3956,
    apis: ["fawaz", "hadithapi", "ummah"],
    fawaz_edition: "eng-tirmidhi", hadithapi_slug: "al-tirmidhi", ummah_key: "tirmidhi",
  },
  ibnmajah: {
    name: "Sunan Ibn Majah", arabic: "سنن ابن ماجه",
    color: 0x004D40, emoji: "📒", total: 4341,
    apis: ["fawaz", "hadithapi", "ummah"],
    fawaz_edition: "eng-ibnmajah", hadithapi_slug: "ibn-e-majah", ummah_key: "ibnmajah",
  },
  nasai: {
    name: "Sunan an-Nasa'i", arabic: "سنن النسائي",
    color: 0x37474F, emoji: "📓", total: 5761,
    apis: ["fawaz", "hadithapi", "ummah"],
    fawaz_edition: "eng-nasai", hadithapi_slug: "sunan-nasai", ummah_key: "nasai",
  },
  malik: {
    name: "Muwatta Malik", arabic: "موطأ مالك",
    color: 0x6D4C41, emoji: "📔", total: 1858,
    apis: ["fawaz", "ummah"],
    fawaz_edition: "eng-malik", ummah_key: "malik",
  },
  nawawi40: {
    name: "40 Hadith Nawawi", arabic: "الأربعون النووية",
    color: 0x00695C, emoji: "🌿", total: 42,
    apis: ["fawaz"],
    fawaz_edition: "eng-nawawi40",
  },
  qudsi40: {
    name: "40 Hadith Qudsi", arabic: "الأربعون القدسية",
    color: 0x1A237E, emoji: "✨", total: 40,
    apis: ["fawaz"],
    fawaz_edition: "eng-qudsi40",
  },
  dehlawi40: {
    name: "40 Hadith Dehlawi", arabic: "أربعون الشاه ولي الله",
    color: 0x4E342E, emoji: "📜", total: 40,
    apis: ["fawaz"],
    fawaz_edition: "eng-dehlawi",
  },
  mishkat: {
    name: "Mishkat al-Masabih", arabic: "مشكاة المصابيح",
    color: 0x311B92, emoji: "🔦", total: 6290,
    apis: ["hadithapi"],
    hadithapi_slug: "mishkat",
  },
  ahmad: {
    name: "Musnad Ahmad", arabic: "مسند أحمد",
    color: 0xBF360C, emoji: "📰", total: 27647,
    apis: ["hadithapi"],
    hadithapi_slug: "musnad-ahmad",
  },
  silsila: {
    name: "Al-Silsila Al-Sahiha", arabic: "السلسلة الصحيحة",
    color: 0x558B2F, emoji: "⛓️", total: 4035,
    apis: ["hadithapi"],
    hadithapi_slug: "al-silsila-sahiha",
  },
};
const COLLECTION_KEYS = Object.keys(COLLECTIONS);

// ─────────────────────────────────────────────────────
//  QURAN TRANSLATIONS
// ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  sahih_international: { name: "Saheeh International", flag: "🇬🇧", lang: "English", edition: "en.sahih" },
  pickthall:           { name: "Marmaduke Pickthall",  flag: "🇬🇧", lang: "English", edition: "en.pickthall" },
  yusuf_ali:           { name: "Yusuf Ali",             flag: "🇬🇧", lang: "English", edition: "en.yusufali" },
};
const TRANSLATION_KEYS    = Object.keys(TRANSLATIONS);
const DEFAULT_TRANSLATION = "sahih_international";

// ─────────────────────────────────────────────────────
//  TAFSIR EDITIONS
// ─────────────────────────────────────────────────────
const TAFSIR_EDITIONS = {
  ibn_kathir:    { name: "Tafsir Ibn Kathir (Abridged)", scholar: "Hafiz Ibn Kathir",                         lang: "English", flag: "🇬🇧" },
  maarif:        { name: "Ma'arif al-Qur'an",            scholar: "Mufti Muhammad Shafi",                     lang: "English", flag: "🇬🇧" },
  muyassar:      { name: "Tafsir Muyassar",              scholar: "Ministry of Islamic Affairs, Saudi Arabia", lang: "Arabic",  flag: "🇸🇦" },
  ibn_kathir_ar: { name: "Tafsir Ibn Kathir (Arabic)",   scholar: "Hafiz Ibn Kathir",                         lang: "Arabic",  flag: "🇸🇦" },
};

// ─────────────────────────────────────────────────────
//  DUA CATEGORIES
// ─────────────────────────────────────────────────────
const DUA_CATEGORIES = {
  morning:          { name: "Morning Adhkar",     emoji: "🌅", count: 7 },
  evening:          { name: "Evening Adhkar",     emoji: "🌆", count: 5 },
  prayer:           { name: "During Prayer",      emoji: "🙏", count: 8 },
  after_prayer:     { name: "After Prayer",       emoji: "📿", count: 8 },
  sleep:            { name: "Sleep",              emoji: "🌙", count: 6 },
  food:             { name: "Food & Drink",       emoji: "🍽️", count: 6 },
  travel:           { name: "Travel",             emoji: "✈️", count: 6 },
  distress:         { name: "Distress & Anxiety", emoji: "💙", count: 7 },
  forgiveness:      { name: "Forgiveness",        emoji: "🤍", count: 5 },
  illness:          { name: "Illness & Healing",  emoji: "💊", count: 5 },
  guidance:         { name: "Guidance",           emoji: "🧭", count: 3 },
  protection:       { name: "Protection",         emoji: "🛡️", count: 4 },
  dhikr:            { name: "Dhikr",              emoji: "📖", count: 6 },
  knowledge:        { name: "Knowledge",          emoji: "📚", count: 3 },
  gratitude:        { name: "Gratitude",          emoji: "🌸", count: 3 },
  marriage:         { name: "Marriage & Family",  emoji: "👨‍👩‍👧", count: 4 },
  hajj:             { name: "Hajj & Umrah",       emoji: "🕋", count: 4 },
  grief:            { name: "Grief & Loss",       emoji: "🤲", count: 4 },
  children:         { name: "Children",           emoji: "👶", count: 4 },
  night_prayer:     { name: "Night Prayer",       emoji: "⭐", count: 4 },
  quran_recitation: { name: "Quran Recitation",   emoji: "📜", count: 3 },
};
const DUA_CATEGORY_KEYS = Object.keys(DUA_CATEGORIES);

// ═══════════════════════════════════════════════════════════════
//  GRADE SYSTEM
// ═══════════════════════════════════════════════════════════════
const GRADE_ALIASES = {
  "sahih": "Sahih", "صحيح": "Sahih", "authentic": "Sahih", "sound": "Sahih",
  "hasan": "Hasan", "حسن": "Hasan", "good": "Hasan",
  "hasan sahih": "Hasan Sahih", "sahih hasan": "Hasan Sahih", "حسن صحيح": "Hasan Sahih",
  "da'if": "Da'if", "daif": "Da'if", "da`eef": "Da'if", "daeef": "Da'if",
  "weak": "Da'if", "ضعيف": "Da'if", "da`if": "Da'if",
  "maudu": "Maudu", "maudu'": "Maudu", "fabricated": "Maudu", "موضوع": "Maudu",
  "mursal": "Mursal", "mawquf": "Mawquf",
};
function normaliseGrade(raw) {
  if (!raw) return null;
  return GRADE_ALIASES[raw.trim().toLowerCase()] || raw.trim();
}
const GRADE_META = {
  "Sahih":       { label: "Sahih — Authentic",    emoji: "🟢", color: 0x1B5E20 },
  "Hasan":       { label: "Hasan — Good",          emoji: "🟡", color: 0xF9A825 },
  "Hasan Sahih": { label: "Hasan Sahih",           emoji: "🟢", color: 0x2E7D32 },
  "Da'if":       { label: "Da'if — Weak",          emoji: "🔴", color: 0xB71C1C },
  "Maudu":       { label: "Maudu — Fabricated",    emoji: "⛔", color: 0x212121 },
  "Mursal":      { label: "Mursal — Disconnected", emoji: "🟠", color: 0xE65100 },
  "Mawquf":      { label: "Mawquf — Stopped",      emoji: "🟣", color: 0x6A1B9A },
};

// ═══════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════
function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .trim();
}

// ═══════════════════════════════════════════════════════════════
//  API 1 — FAWAZAHMED0 CDN  (primary)
// ═══════════════════════════════════════════════════════════════
function _normaliseFawaz(data, colKey) {
  const h       = data.hadith?.[0] ?? data;
  const english = stripHtml(h?.text ?? h?.english ?? "");
  const number  = `${data.hadithnumber ?? h?.hadithnumber ?? "?"}`;
  const grades  = h?.grades ?? data.grades ?? [];
  const rawGrade = grades.find(g => g.graded_by)?.grade ?? grades[0]?.grade ?? null;
  const gradeBy  = grades.find(g => g.graded_by)?.graded_by ?? (grades[0] ? "fawazahmed0" : null);
  return {
    key: colKey, number, arabic: "", english,
    grade: normaliseGrade(rawGrade), gradeSource: gradeBy,
    chapterTitle: null, bookNumber: null, apiSource: "fawazahmed0",
  };
}

async function fawaz_byIndex(colKey, index) {
  const edition = COLLECTIONS[colKey].fawaz_edition;
  if (!edition) throw new Error("No fawaz edition for " + colKey);
  const res = await fetch(`${FAWAZ_CDN}/editions/${edition}/${index}.json`);
  if (!res.ok) throw new Error(`fawaz HTTP ${res.status}`);
  return _normaliseFawaz(await res.json(), colKey);
}

async function fawaz_random(colKey) {
  const col = COLLECTIONS[colKey];
  if (!col.fawaz_edition) throw new Error("No fawaz edition for " + colKey);
  return fawaz_byIndex(colKey, Math.floor(Math.random() * col.total) + 1);
}

// ═══════════════════════════════════════════════════════════════
//  API 2 — HADITHAPI.COM
// ═══════════════════════════════════════════════════════════════
function _normaliseHadithApiCom(h, colKey) {
  return {
    key: colKey,
    number:      `${h.hadithNumber ?? h.id ?? "?"}`,
    arabic:      stripHtml(h.hadithArabic ?? ""),
    english:     stripHtml(h.hadithEnglish ?? ""),
    grade:       normaliseGrade(h.status ?? null),
    gradeSource: "Darussalam",
    chapterTitle: h.chapterEnglish ?? null,
    bookNumber:  h.book?.bookNumber ?? null,
    apiSource:   "HadithAPI.com",
  };
}

async function hadithApiCom_byNumber(colKey, number) {
  const slug = COLLECTIONS[colKey].hadithapi_slug;
  if (!slug) throw new Error("No HadithAPI slug for " + colKey);
  const res  = await fetch(
    `${HADITHAPI_COM}/hadiths/?apiKey=${HADITHAPI_KEY}&book=${slug}&hadithNumber=${number}&paginate=1`
  );
  if (!res.ok) throw new Error(`HadithAPI.com HTTP ${res.status}`);
  const json = await res.json();
  const h    = json.hadiths?.data?.[0];
  if (!h) throw new Error("No hadith in HadithAPI.com response");
  return _normaliseHadithApiCom(h, colKey);
}

async function hadithApiCom_random(colKey) {
  const col = COLLECTIONS[colKey];
  return hadithApiCom_byNumber(colKey, Math.floor(Math.random() * col.total) + 1);
}

// ═══════════════════════════════════════════════════════════════
//  API 3 — HADEETHENC.COM  (authentic-only random)
// ═══════════════════════════════════════════════════════════════
async function hadeethenc_random() {
  const res = await fetch(`${HADEETHENC_API}/hadeeths/random/?language=en`);
  if (!res.ok) throw new Error(`HadeethEnc HTTP ${res.status}`);
  const h = await res.json();
  return {
    key: "authentic",
    number:      `${h.id ?? "?"}`,
    arabic:      stripHtml(h.arabic ?? ""),
    english:     stripHtml(h.text ?? h.translation ?? ""),
    grade:       "Sahih",
    gradeSource: "HadeethEnc.com (verified authentic)",
    chapterTitle: h.title ?? null,
    bookNumber:  null,
    apiSource:   "HadeethEnc.com",
    explanation: h.explanation ? stripHtml(h.explanation).substring(0, 500) : null,
    attribution: h.attribution ?? null,
  };
}

// ═══════════════════════════════════════════════════════════════
//  API 4 — UMMAHAPI  (final fallback + duas / asma / hijri)
// ═══════════════════════════════════════════════════════════════
async function ummahFetch(path) {
  const res  = await fetch(`${UMMAH_API}${path}`);
  if (!res.ok) throw new Error(`UmmahAPI HTTP ${res.status} — ${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(`UmmahAPI error — ${path}`);
  return json.data;
}
function _normaliseUmmah(data, colKey) {
  return {
    key: colKey,
    number:      `${data.hadithnumber ?? "?"}`,
    arabic:      stripHtml(data.arabic ?? ""),
    english:     stripHtml(data.english ?? ""),
    grade:       normaliseGrade(data.grade ?? null),
    gradeSource: "UmmahAPI",
    chapterTitle: null, bookNumber: null, apiSource: "UmmahAPI",
  };
}
async function ummah_byNumber(colKey, number) {
  const key = COLLECTIONS[colKey].ummah_key;
  if (!key) throw new Error("No UmmahAPI key for " + colKey);
  return _normaliseUmmah(await ummahFetch(`/hadith/${key}/${number}`), colKey);
}
async function ummah_random(colKey) {
  if (colKey && COLLECTIONS[colKey]?.ummah_key) {
    return _normaliseUmmah(await ummahFetch(`/hadith/${COLLECTIONS[colKey].ummah_key}/random`), colKey);
  }
  const data = await ummahFetch("/hadith/random");
  const k    = COLLECTION_KEYS.find(k => COLLECTIONS[k].ummah_key === data.collection) || "bukhari";
  return _normaliseUmmah(data, k);
}

// ═══════════════════════════════════════════════════════════════
//  SMART FETCH  — tries apis[] in order, silently falls back
// ═══════════════════════════════════════════════════════════════
async function fetchHadith(colKey, index) {
  const col  = COLLECTIONS[colKey];
  const errs = [];
  for (const api of col.apis) {
    try {
      if (api === "fawaz")     return await fawaz_byIndex(colKey, index);
      if (api === "hadithapi") return await hadithApiCom_byNumber(colKey, index);
      if (api === "ummah")     return await ummah_byNumber(colKey, index);
    } catch (e) {
      errs.push(`[${api}] ${e.message}`);
      console.warn(`fetchHadith fallback ${api}:`, e.message);
    }
  }
  throw new Error(`All APIs failed for ${colKey}#${index}: ${errs.join("; ")}`);
}

async function fetchRandomHadith(colKey) {
  const keys = colKey ? [colKey] : COLLECTION_KEYS;
  const key  = keys[Math.floor(Math.random() * keys.length)];
  const col  = COLLECTIONS[key];
  const errs = [];
  for (const api of col.apis) {
    try {
      if (api === "fawaz")     return await fawaz_random(key);
      if (api === "hadithapi") return await hadithApiCom_random(key);
      if (api === "ummah")     return await ummah_random(key);
    } catch (e) {
      errs.push(`[${api}] ${e.message}`);
      console.warn(`fetchRandom fallback ${api}:`, e.message);
    }
  }
  throw new Error(`All APIs failed random ${key}: ${errs.join("; ")}`);
}

// ═══════════════════════════════════════════════════════════════
//  QURAN  (AlQuran Cloud)
// ═══════════════════════════════════════════════════════════════
async function fetchAyah(surahNum, ayah, transKey = DEFAULT_TRANSLATION) {
  const ed  = TRANSLATIONS[transKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  const res = await fetch(`${QURAN_API}/ayah/${surahNum}:${ayah}/editions/quran-uthmani,${ed}`);
  if (!res.ok) throw new Error(`AlQuran HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran: ${json.status}`);
  const ar = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const tr = json.data.find(d => d.edition.identifier === ed);
  if (!ar || !tr) throw new Error("AlQuran bad response");
  return {
    surah: { name_english: ar.surah.englishName, name_arabic: ar.surah.name, number: ar.surah.number },
    verse: {
      verse_key: `${surahNum}:${ayah}`, arabic: ar.text, text: stripHtml(tr.text),
      surah_total_ayahs: ar.surah.numberOfAyahs, page: ar.page, juz: ar.juz,
    },
  };
}

async function fetchRandomAyah(transKey = DEFAULT_TRANSLATION) {
  const ed  = TRANSLATIONS[transKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  const res = await fetch(`${QURAN_API}/ayah/random/editions/quran-uthmani,${ed}`);
  if (!res.ok) throw new Error(`AlQuran HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran: ${json.status}`);
  const ar = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const tr = json.data.find(d => d.edition.identifier === ed);
  if (!ar || !tr) throw new Error("AlQuran bad response");
  return {
    surah: { name_english: ar.surah.englishName, name_arabic: ar.surah.name, number: ar.surah.number },
    verse: {
      verse_key: `${ar.surah.number}:${ar.numberInSurah}`, arabic: ar.text, text: stripHtml(tr.text),
      surah_total_ayahs: ar.surah.numberOfAyahs, page: ar.page, juz: ar.juz,
    },
  };
}

async function fetchSurah(surahNum, transKey = DEFAULT_TRANSLATION) {
  const ed  = TRANSLATIONS[transKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  // Fetch surah info + first ayah
  const [infoRes, ayahRes] = await Promise.all([
    fetch(`${QURAN_API}/surah/${surahNum}`),
    fetch(`${QURAN_API}/ayah/${surahNum}:1/editions/quran-uthmani,${ed}`),
  ]);
  if (!infoRes.ok) throw new Error(`AlQuran surah HTTP ${infoRes.status}`);
  const infoJson = await infoRes.json();
  if (infoJson.code !== 200) throw new Error(`AlQuran surah: ${infoJson.status}`);
  const info = infoJson.data;

  let firstAyah = null;
  if (ayahRes.ok) {
    const ayahJson = await ayahRes.json();
    if (ayahJson.code === 200) {
      const ar = ayahJson.data.find(d => d.edition.identifier === "quran-uthmani");
      const tr = ayahJson.data.find(d => d.edition.identifier === ed);
      if (ar && tr) firstAyah = { arabic: ar.text, translation: stripHtml(tr.text) };
    }
  }

  return {
    number:           info.number,
    name_arabic:      info.name,
    name_english:     info.englishName,
    name_translation: info.englishNameTranslation,
    revelation_type:  info.revelationType,
    total_ayahs:      info.numberOfAyahs,
    firstAyah,
  };
}

// ═══════════════════════════════════════════════════════════════
//  UMMAHAPI WRAPPERS  (Tafsir · Dua · Asma · Hijri)
// ═══════════════════════════════════════════════════════════════
const fetchTafsir         = (k, s, a) => ummahFetch(`/tafsir/${k}/surah/${s}/ayah/${a}`);
const fetchRandomDua      = ()        => ummahFetch("/duas/random");
const fetchDuasByCategory = cat       => ummahFetch(`/duas/category/${cat}`);
const fetchAllAsma        = ()        => ummahFetch("/asma-ul-husna");
const fetchTodayHijri     = ()        => ummahFetch("/today-hijri");

// ═══════════════════════════════════════════════════════════════
//  EMBED BUILDERS
// ═══════════════════════════════════════════════════════════════
function buildHadithEmbed(h, showArabic = false) {
  const col = COLLECTIONS[h.key] || { name: h.key || "Hadith", color: 0x1A237E, emoji: "📖" };
  const g   = h.grade ? (GRADE_META[h.grade] || { label: h.grade, emoji: "⚪", color: null }) : null;

  const embed = new EmbedBuilder()
    .setColor(g?.color || col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${h.number}` })
    .setDescription(`*"${h.english || "Translation unavailable."}"*`)
    .setFooter({ text: `via ${h.apiSource} • لا علم إلا ما علَّم الله` })
    .setTimestamp();

  if (g) {
    const gradeVal = h.gradeSource
      ? `${g.emoji} **${g.label}**\n*Graded by: ${h.gradeSource}*`
      : `${g.emoji} **${g.label}**`;
    embed.addFields({ name: "📊 Grade", value: gradeVal, inline: false });
  }
  embed.addFields(
    { name: "📖 Collection", value: col.name,       inline: true },
    { name: "🔢 Number",     value: `#${h.number}`, inline: true }
  );
  if (h.bookNumber   != null) embed.addFields({ name: "📚 Book",    value: `${h.bookNumber}`,   inline: true });
  if (h.chapterTitle)         embed.addFields({ name: "📑 Chapter", value: `${h.chapterTitle}`, inline: false });
  if (showArabic && h.arabic) embed.addFields({ name: "🕌 Arabic",  value: `\`\`\`${h.arabic.substring(0, 1000)}\`\`\`` });
  return embed;
}

function buildAuthenticEmbed(h) {
  const embed = new EmbedBuilder()
    .setColor(0x1B5E20)
    .setAuthor({ name: "✅  Verified Authentic Hadith — HadeethEnc.com" })
    .setDescription(`*"${h.english}"*`)
    .addFields({ name: "📊 Grade", value: `🟢 **Sahih — Authentic**\n*Source: ${h.gradeSource}*`, inline: false });
  if (h.chapterTitle) embed.addFields({ name: "📚 Topic",       value: h.chapterTitle,      inline: false });
  if (h.explanation)  embed.addFields({ name: "💡 Explanation", value: h.explanation + "…", inline: false });
  if (h.attribution)  embed.addFields({ name: "📖 Attribution", value: h.attribution,       inline: true });
  if (h.arabic)       embed.addFields({ name: "🕌 Arabic",      value: `\`\`\`${h.arabic.substring(0, 800)}\`\`\`` });
  embed.setFooter({ text: "HadeethEnc.com — Authentic hadiths with scholarly explanations" }).setTimestamp();
  return embed;
}

function buildAyahEmbed(data, transKey = DEFAULT_TRANSLATION) {
  const { surah, verse } = data;
  const trans = TRANSLATIONS[transKey] || TRANSLATIONS[DEFAULT_TRANSLATION];
  const embed = new EmbedBuilder()
    .setColor(0x1B5E20)
    .setAuthor({ name: `📖  ${surah.name_english} (${surah.name_arabic})  •  Ayah ${verse.verse_key}` })
    .setDescription(`*"${verse.text || "Translation unavailable."}"*`);
  if (verse.arabic) embed.addFields({ name: "🕌 Arabic", value: verse.arabic });
  embed.addFields(
    { name: "📍 Reference",   value: verse.verse_key,               inline: true },
    { name: "🌐 Translation", value: `${trans.flag} ${trans.name}`, inline: true },
    { name: "🗣️ Language",   value: trans.lang,                     inline: true }
  );
  if (verse.page) embed.addFields({ name: "📄 Page", value: `${verse.page} / 604`, inline: true });
  if (verse.juz)  embed.addFields({ name: "🗂️ Juz",  value: `${verse.juz} / 30`,  inline: true });
  embed.setFooter({ text: "القرآن الكريم — The Noble Quran" }).setTimestamp();
  return embed;
}

function buildSurahEmbed(info, transKey = DEFAULT_TRANSLATION) {
  const trans = TRANSLATIONS[transKey] || TRANSLATIONS[DEFAULT_TRANSLATION];
  const revIcon = info.revelation_type === "Meccan" ? "🕋" : "🕌";
  const embed = new EmbedBuilder()
    .setColor(0x1B5E20)
    .setTitle(`${revIcon}  Surah ${info.number} — ${info.name_english}  (${info.name_arabic})`)
    .setDescription(info.firstAyah
      ? `**First Ayah:**\n${info.firstAyah.arabic}\n\n*"${info.firstAyah.translation}"*`
      : "")
    .addFields(
      { name: "📖 English Name",    value: info.name_english,                  inline: true },
      { name: "💬 Meaning",         value: info.name_translation || "—",       inline: true },
      { name: "📍 Revelation",      value: `${revIcon} ${info.revelation_type}`, inline: true },
      { name: "🔢 Total Ayahs",     value: `${info.total_ayahs}`,              inline: true },
      { name: "🌐 Translation",     value: `${trans.flag} ${trans.name}`,      inline: true },
      { name: "📖 Surah Number",    value: `${info.number} / 114`,             inline: true }
    )
    .setFooter({ text: "القرآن الكريم — The Noble Quran  •  AlQuran Cloud" })
    .setTimestamp();
  return embed;
}

function buildTafsirEmbed(data, tafsirKey) {
  const info    = TAFSIR_EDITIONS[tafsirKey] || { name: tafsirKey, scholar: "", lang: "Unknown", flag: "📚" };
  const rawText = data.tafsir?.text || "Tafsir unavailable for this ayah.";
  const text    = rawText.length > 3900 ? rawText.substring(0, 3900) + "\n\n*(Truncated)*" : rawText;
  return new EmbedBuilder().setColor(0x4A148C)
    .setAuthor({ name: `${info.flag}  ${info.name}  •  Ayah ${data.verse_key}` })
    .setTitle(`📚 Tafsir — ${info.scholar}`)
    .setDescription(text)
    .addFields(
      { name: "📖 Scholar",  value: info.scholar,   inline: true },
      { name: "🗣️ Language", value: info.lang,      inline: true },
      { name: "📍 Ayah",     value: data.verse_key, inline: true }
    )
    .setFooter({ text: "Tafsir via UmmahAPI • تفسير القرآن الكريم" }).setTimestamp();
}

function buildDuaEmbed(dua) {
  const cat  = DUA_CATEGORIES[dua.category] || { name: dua.category_info?.name || dua.category, emoji: "🤲" };
  const reps = dua.repeat > 1 ? `\n\n*Repeat: **${dua.repeat}x***` : "";
  return new EmbedBuilder().setColor(0x006064)
    .setAuthor({ name: `${cat.emoji}  ${cat.name}  •  Dua #${dua.id}` })
    .setTitle(dua.title)
    .setDescription(`**${dua.arabic}**\n\n*${dua.transliteration}*\n\n"${dua.translation}"${reps}`)
    .addFields(
      { name: "📚 Source",   value: dua.source, inline: true },
      { name: "📂 Category", value: cat.name,   inline: true }
    )
    .setFooter({ text: "ادْعُونِي أَسْتَجِبْ لَكُمْ — Call upon Me; I will respond to you. (40:60)" }).setTimestamp();
}

function buildAsmaEmbed(name) {
  return new EmbedBuilder().setColor(0x1A237E)
    .setAuthor({ name: `✨  Asma ul Husna — Name #${name.number} of 99` })
    .setTitle(`${name.arabic}  •  ${name.transliteration}`)
    .setDescription(`**"${name.meaning}"**\n\n${name.description || ""}`)
    .addFields(
      { name: "🔢 Number",          value: `${name.number} / 99`, inline: true },
      { name: "🔤 Transliteration", value: name.transliteration,  inline: true },
      { name: "💬 Meaning",         value: name.meaning,          inline: true }
    )
    .setFooter({ text: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ — To Allah belong the best names (7:180)" }).setTimestamp();
}

function buildHijriEmbed(data) {
  const { hijri, gregorian: g } = data;
  return new EmbedBuilder().setColor(0x3E2723).setTitle("🌙  Today's Islamic Date")
    .addFields(
      { name: "🗓️ Hijri Date",     value: `**${hijri.day} ${hijri.month_name} ${hijri.year} AH**`, inline: false },
      { name: "📅 Gregorian Date", value: g.formatted || `${g.day}/${g.month}/${g.year}`,           inline: false }
    )
    .setFooter({ text: "UmmahAPI • Hijri Calendar" }).setTimestamp();
}

function buildErrorEmbed(msg) {
  return new EmbedBuilder().setColor(0xB71C1C).setTitle("⚠️  Could not load").setDescription(msg)
    .setFooter({ text: "Try a different number or name, and check your input" });
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENT BUILDERS
// ═══════════════════════════════════════════════════════════════
function buildCollectionMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("sc").setPlaceholder("Switch collection…")
      .addOptions(COLLECTION_KEYS.slice(0, 25).map(k => ({
        label: COLLECTIONS[k].name,
        description: `${COLLECTIONS[k].total.toLocaleString()} hadiths`,
        value: k, emoji: COLLECTIONS[k].emoji,
      })))
  );
}

// customId: {action}|{colKey}|{num}   pipe-separated (colKey can have hyphens)
function buildHadithNavButtons(colKey, num, showArabic = false) {
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

function buildTranslationMenu(curKey, surah, ayah, maxAyah) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId(`st_${surah}_${ayah}_${maxAyah}`)
      .setPlaceholder("Switch translation…")
      .addOptions(TRANSLATION_KEYS.map(k => ({
        label: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`,
        description: TRANSLATIONS[k].lang, value: k, default: k === curKey,
      })))
  );
}

function buildAyahNavButtons(surah, ayah, maxAyah, transKey) {
  const prev = Math.max(1, ayah - 1);
  const next = Math.min(maxAyah, ayah + 1);
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ap_${surah}_${prev}_${maxAyah}_${transKey}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(ayah <= 1),
    new ButtonBuilder().setCustomId(`an_${surah}_${next}_${maxAyah}_${transKey}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(ayah >= maxAyah),
    new ButtonBuilder().setCustomId(`ar_${transKey}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`to_${surah}_${ayah}`).setLabel("📚 Tafsir").setStyle(ButtonStyle.Success)
  );
}

function buildSurahNavButtons(surahNum, transKey) {
  const prev = Math.max(1, surahNum - 1);
  const next = Math.min(114, surahNum + 1);
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`sp_${prev}_${transKey}`).setLabel("◀ Prev Surah").setStyle(ButtonStyle.Secondary).setDisabled(surahNum <= 1),
    new ButtonBuilder().setCustomId(`sn_${next}_${transKey}`).setLabel("Next Surah ▶").setStyle(ButtonStyle.Secondary).setDisabled(surahNum >= 114),
    new ButtonBuilder().setCustomId(`sr_${transKey}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`sa1_${surahNum}_${transKey}`).setLabel("📖 First Ayah").setStyle(ButtonStyle.Success)
  );
}

function buildTafsirMenu(surah, ayah) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("stf").setPlaceholder("📚 Choose a Tafsir…")
      .addOptions(Object.entries(TAFSIR_EDITIONS).map(([k, v]) => ({
        label: `${v.flag} ${v.name}`, description: `${v.scholar} • ${v.lang}`, value: `${k}|${surah}|${ayah}`,
      })))
  );
}

function buildDuaCategoryMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("sdc").setPlaceholder("📂 Choose a category…")
      .addOptions(DUA_CATEGORY_KEYS.slice(0, 25).map(k => ({
        label: `${DUA_CATEGORIES[k].emoji} ${DUA_CATEGORIES[k].name}`, description: `${DUA_CATEGORIES[k].count} duas`, value: k,
      })))
  );
}

function buildDuaNavButtons(cat, idx, total) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`dp_${cat}_${Math.max(0, idx - 1)}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(idx <= 0),
    new ButtonBuilder().setCustomId(`dn_${cat}_${Math.min(total - 1, idx + 1)}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(idx >= total - 1),
    new ButtonBuilder().setCustomId("dr").setLabel("🎲 Random").setStyle(ButtonStyle.Primary)
  );
}

function buildAsmaNavButtons(num) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`xp_${Math.max(1, num - 1)}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(num <= 1),
    new ButtonBuilder().setCustomId(`xn_${Math.min(99, num + 1)}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(num >= 99),
    new ButtonBuilder().setCustomId(`xr_${Math.floor(Math.random() * 99) + 1}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary)
  );
}

// ═══════════════════════════════════════════════════════════════
//  SLASH COMMANDS
// ═══════════════════════════════════════════════════════════════
const commands = [
  new SlashCommandBuilder().setName("hadith").setDescription("Get a specific hadith by collection and number")
    .addStringOption(o => o.setName("collection").setDescription("Hadith collection").setRequired(true)
      .addChoices(...COLLECTION_KEYS.slice(0, 25).map(k => ({ name: COLLECTIONS[k].name, value: k }))))
    .addIntegerOption(o => o.setName("number").setDescription("Hadith number").setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName("random").setDescription("Get a random hadith")
    .addStringOption(o => o.setName("collection").setDescription("Collection (leave blank for any)")
      .addChoices(...COLLECTION_KEYS.slice(0, 25).map(k => ({ name: COLLECTIONS[k].name, value: k })))),

  new SlashCommandBuilder().setName("authentic").setDescription("Get a verified Sahih hadith with scholarly explanation (HadeethEnc.com)"),

  new SlashCommandBuilder().setName("ayah").setDescription("Get a Quran verse — surah can be a number OR name (e.g. 'Al-Baqarah' or 'Kahf')")
    .addStringOption(o => o.setName("surah").setDescription("Surah number (1–114) or name e.g. 'Kahf', 'Al-Baqarah'").setRequired(true))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANSLATION_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("surah").setDescription("Get info and first ayah of a surah — accepts number OR name")
    .addStringOption(o => o.setName("surah").setDescription("Surah number (1–114) or name e.g. 'Yasin', 'Al-Fatiha'").setRequired(true))
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANSLATION_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("randomayah").setDescription("Get a random Quran verse")
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANSLATION_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("tafsir").setDescription("Get scholarly commentary for a verse")
    .addStringOption(o => o.setName("surah").setDescription("Surah number or name").setRequired(true))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("scholar").setDescription("Tafsir scholar")
      .addChoices(...Object.entries(TAFSIR_EDITIONS).map(([k, v]) => ({ name: `${v.flag} ${v.name} (${v.lang})`, value: k })))),

  new SlashCommandBuilder().setName("dua").setDescription("Browse authentic duas")
    .addStringOption(o => o.setName("category").setDescription("Category (leave blank for random)")
      .addChoices(...DUA_CATEGORY_KEYS.slice(0, 25).map(k => ({ name: `${DUA_CATEGORIES[k].emoji} ${DUA_CATEGORIES[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("asmaallah").setDescription("Browse the 99 Names of Allah")
    .addIntegerOption(o => o.setName("number").setDescription("Name number 1–99").setMinValue(1).setMaxValue(99)),

  new SlashCommandBuilder().setName("hijri").setDescription("Get today's Islamic (Hijri) date"),
  new SlashCommandBuilder().setName("daily").setDescription("Daily reminder — hadith, ayah, and dua"),
  new SlashCommandBuilder().setName("collections").setDescription("List all hadith collections and their source APIs"),
  new SlashCommandBuilder().setName("explore").setDescription("Browse hadith collections interactively"),
].map(c => c.toJSON());

// ═══════════════════════════════════════════════════════════════
//  BOT READY
// ═══════════════════════════════════════════════════════════════
client.once("ready", async () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  const statusEnv = process.env.BOT_STATUS || "WATCHING:📖 Quran | /ayah /hadith /dua";
  const [typeRaw, ...parts] = statusEnv.split(":");
  const activityTypes = { PLAYING: 0, STREAMING: 1, LISTENING: 2, WATCHING: 3, COMPETING: 5, CUSTOM: 4 };
  client.user.setPresence({
    activities: [{ name: parts.join(":"), type: activityTypes[typeRaw.toUpperCase()] ?? 3 }],
    status: process.env.BOT_ONLINE_STATUS || "online",
  });
  console.log("✅ API stack: fawazahmed0 → HadithAPI.com → UmmahAPI");
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Slash commands registered globally");
  } catch (e) { console.error("Command registration error:", e); }
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
      const col    = COLLECTIONS[colKey];
      if (num > col.total)
        return interaction.editReply({ embeds: [buildErrorEmbed(`${col.name} only has up to #${col.total}.`)] });
      try {
        const h = await fetchHadith(colKey, num);
        await interaction.editReply({ embeds: [buildHadithEmbed(h)], components: [buildHadithNavButtons(colKey, num), buildCollectionMenu()] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load hadith #${num}.\n\`${e.message}\``)] });
      }
    }

    // /random
    else if (cmd === "random") {
      const colKey = interaction.options.getString("collection") || null;
      try {
        const h   = await fetchRandomHadith(colKey);
        const num = parseInt(h.number) || 1;
        await interaction.editReply({ embeds: [buildHadithEmbed(h)], components: [buildHadithNavButtons(h.key, num), buildCollectionMenu()] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a random hadith.")] });
      }
    }

    // /authentic
    else if (cmd === "authentic") {
      try {
        const h = await hadeethenc_random();
        await interaction.editReply({ embeds: [buildAuthenticEmbed(h)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch from HadeethEnc.com.")] });
      }
    }

    // /ayah
    else if (cmd === "ayah") {
      const surahInput = interaction.options.getString("surah");
      const ayahNum    = interaction.options.getInteger("ayah");
      const transKey   = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
      const surahNum   = resolveSurah(surahInput);
      if (!surahNum)
        return interaction.editReply({ embeds: [buildErrorEmbed(`Could not find surah **"${surahInput}"**.\nTry a number (1–114) or a name like \`Al-Baqarah\`, \`Kahf\`, \`Yasin\`.`)] });
      try {
        const data    = await fetchAyah(surahNum, ayahNum, transKey);
        const maxAyah = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, surahNum, ayahNum, maxAyah), buildAyahNavButtons(surahNum, ayahNum, maxAyah, transKey)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load ${surahNum}:${ayahNum}.\nCheck that the ayah number exists in this surah.`)] });
      }
    }

    // /surah
    else if (cmd === "surah") {
      const surahInput = interaction.options.getString("surah");
      const transKey   = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
      const surahNum   = resolveSurah(surahInput);
      if (!surahNum)
        return interaction.editReply({ embeds: [buildErrorEmbed(`Could not find surah **"${surahInput}"**.\nTry a number (1–114) or a name like \`Al-Baqarah\`, \`Kahf\`, \`Yasin\`.`)] });
      try {
        const info = await fetchSurah(surahNum, transKey);
        await interaction.editReply({ embeds: [buildSurahEmbed(info, transKey)], components: [buildSurahNavButtons(surahNum, transKey)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load Surah ${surahNum}.`)] });
      }
    }

    // /randomayah
    else if (cmd === "randomayah") {
      const transKey = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
      try {
        const data    = await fetchRandomAyah(transKey);
        const [s, a]  = (data.verse?.verse_key || "1:1").split(":").map(Number);
        const maxAyah = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, s, a, maxAyah), buildAyahNavButtons(s, a, maxAyah, transKey)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a random ayah.")] });
      }
    }

    // /tafsir
    else if (cmd === "tafsir") {
      const surahInput = interaction.options.getString("surah");
      const ayahNum    = interaction.options.getInteger("ayah");
      const tafsirKey  = interaction.options.getString("scholar") || "ibn_kathir";
      const surahNum   = resolveSurah(surahInput);
      if (!surahNum)
        return interaction.editReply({ embeds: [buildErrorEmbed(`Could not find surah **"${surahInput}"**.`)] });
      try {
        const data = await fetchTafsir(tafsirKey, surahNum, ayahNum);
        await interaction.editReply({ embeds: [buildTafsirEmbed(data, tafsirKey)], components: [buildTafsirMenu(surahNum, ayahNum)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load tafsir for ${surahNum}:${ayahNum}.`)] });
      }
    }

    // /dua
    else if (cmd === "dua") {
      const category = interaction.options.getString("category");
      try {
        if (category) {
          const resp = await fetchDuasByCategory(category);
          const duas = Array.isArray(resp) ? resp : (resp.duas || []);
          if (!duas.length) return interaction.editReply({ embeds: [buildErrorEmbed("No duas found.")] });
          await interaction.editReply({ embeds: [buildDuaEmbed(duas[0])], components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, 0, duas.length)] });
        } else {
          await interaction.editReply({ embeds: [buildDuaEmbed(await fetchRandomDua())], components: [buildDuaCategoryMenu()] });
        }
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a dua.")] });
      }
    }

    // /asmaallah
    else if (cmd === "asmaallah") {
      const num = interaction.options.getInteger("number") || 1;
      try {
        const resp  = await fetchAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [buildErrorEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [buildAsmaEmbed(name)], components: [buildAsmaNavButtons(num)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load Asma ul Husna.")] });
      }
    }

    // /hijri
    else if (cmd === "hijri") {
      try {
        await interaction.editReply({ embeds: [buildHijriEmbed(await fetchTodayHijri())] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch Hijri date.")] });
      }
    }

    // /daily
    else if (cmd === "daily") {
      try {
        const [hadith, ayahData, duaData, hijriData] = await Promise.all([
          fetchRandomHadith(null), fetchRandomAyah(DEFAULT_TRANSLATION),
          fetchRandomDua(), fetchTodayHijri().catch(() => null),
        ]);
        const hE = buildHadithEmbed(hadith); hE.setTitle("🌅  Daily Hadith");
        const aE = buildAyahEmbed(ayahData); aE.setTitle("📖  Daily Ayah");
        const dE = buildDuaEmbed(duaData);   dE.setTitle("🤲  Daily Dua");
        await interaction.editReply({ embeds: hijriData ? [buildHijriEmbed(hijriData), hE, aE, dE] : [hE, aE, dE] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load daily content.")] });
      }
    }

    // /collections
    else if (cmd === "collections") {
      const apiLabel = { fawaz: "fawazahmed0", hadithapi: "HadithAPI.com", ummah: "UmmahAPI" };
      const lines = COLLECTION_KEYS.map(k => {
        const c   = COLLECTIONS[k];
        const src = c.apis.map(a => apiLabel[a]).join(" → ");
        return `${c.emoji} **${c.name}** (${c.arabic})\n  ${c.total.toLocaleString()} hadiths  •  *${src}*`;
      });
      const total = Object.values(COLLECTIONS).reduce((s, c) => s + c.total, 0);
      await interaction.editReply({ embeds: [
        new EmbedBuilder().setColor(0x5C4033).setTitle("📚  All Hadith Collections")
          .setDescription(lines.join("\n") + `\n\n**Total: ${total.toLocaleString()} hadiths across ${COLLECTION_KEYS.length} collections**`)
          .setFooter({ text: "fawazahmed0 CDN → HadithAPI.com → UmmahAPI" })
      ]});
    }

    // /explore
    else if (cmd === "explore") {
      await interaction.editReply({ embeds: [
        new EmbedBuilder().setColor(0x4E342E).setTitle("📚  Islamic Knowledge Explorer")
          .setDescription(
            "Select a collection to start browsing.\n**◀ Prev / Next ▶** to navigate  •  **🎲 Random** to jump.\n\n" +
            COLLECTION_KEYS.slice(0, 13).map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** — ${COLLECTIONS[k].total.toLocaleString()} hadiths`).join("\n")
          )
          .setFooter({ text: "بسم الله الرحمن الرحيم" })
      ], components: [buildCollectionMenu()] });
    }
  }

  // ── SELECT MENUS ──────────────────────────────────────────
  else if (interaction.isStringSelectMenu()) {
    const cid = interaction.customId;

    if (cid === "sc") {
      await interaction.deferUpdate();
      const colKey = interaction.values[0];
      try {
        const h = await fetchHadith(colKey, 1);
        await interaction.editReply({ embeds: [buildHadithEmbed(h)], components: [buildHadithNavButtons(colKey, 1), buildCollectionMenu()] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load ${COLLECTIONS[colKey]?.name || colKey}.`)] });
      }
    }

    else if (cid.startsWith("st_")) {
      await interaction.deferUpdate();
      const segs    = cid.split("_");
      const surah   = parseInt(segs[1]), ayahNum = parseInt(segs[2]), maxAyah = parseInt(segs[3]) || 300;
      const transKey = interaction.values[0];
      try {
        const data = await fetchAyah(surah, ayahNum, transKey);
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, surah, ayahNum, maxAyah), buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not switch translation.")] });
      }
    }

    else if (cid === "stf") {
      await interaction.deferUpdate();
      const [tafsirKey, surahStr, ayahStr] = interaction.values[0].split("|");
      try {
        const data = await fetchTafsir(tafsirKey, parseInt(surahStr), parseInt(ayahStr));
        await interaction.editReply({ embeds: [buildTafsirEmbed(data, tafsirKey)], components: [buildTafsirMenu(parseInt(surahStr), parseInt(ayahStr))] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load tafsir for ${surahStr}:${ayahStr}.`)] });
      }
    }

    else if (cid === "sdc") {
      await interaction.deferUpdate();
      const category = interaction.values[0];
      try {
        const resp = await fetchDuasByCategory(category);
        const duas = Array.isArray(resp) ? resp : (resp.duas || []);
        if (!duas.length) return interaction.editReply({ embeds: [buildErrorEmbed("No duas found.")] });
        await interaction.editReply({ embeds: [buildDuaEmbed(duas[0])], components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, 0, duas.length)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that dua category.")] });
      }
    }
  }

  // ── BUTTONS ───────────────────────────────────────────────
  else if (interaction.isButton()) {
    const id = interaction.customId;

    // Hadith nav  hp|colKey|num  hn|..  hr|..  ha|..
    if (id.startsWith("hp|") || id.startsWith("hn|") || id.startsWith("hr|") || id.startsWith("ha|")) {
      await interaction.deferUpdate();
      const [action, colKey, numStr] = id.split("|");
      const num = parseInt(numStr);
      try {
        const h = await fetchHadith(colKey, num);
        const showArabic = action === "ha"
          ? !(interaction.message.embeds[0]?.fields?.some(f => f.name === "🕌 Arabic") || false)
          : false;
        await interaction.editReply({ embeds: [buildHadithEmbed(h, showArabic)], components: [buildHadithNavButtons(colKey, num, showArabic), buildCollectionMenu()] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load hadith #${num}.`)] });
      }
    }

    // Ayah prev/next  ap_{s}_{a}_{max}_{trans}  /  an_...
    else if (id.startsWith("ap_") || id.startsWith("an_")) {
      await interaction.deferUpdate();
      const parts    = id.split("_");
      const surah    = parseInt(parts[1]);
      const ayahNum  = parseInt(parts[2]);
      const maxAyah  = parseInt(parts[3]) || 300;
      const transKey = parts.slice(4).join("_") || DEFAULT_TRANSLATION;
      try {
        const data = await fetchAyah(surah, ayahNum, transKey);
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, surah, ayahNum, maxAyah), buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that ayah.")] });
      }
    }

    // Random ayah  ar_{trans}
    else if (id.startsWith("ar_")) {
      await interaction.deferUpdate();
      const transKey = id.slice(3) || DEFAULT_TRANSLATION;
      try {
        const data    = await fetchRandomAyah(transKey);
        const [s, a]  = (data.verse?.verse_key || "1:1").split(":").map(Number);
        const maxAyah = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, s, a, maxAyah), buildAyahNavButtons(s, a, maxAyah, transKey)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load a random ayah.")] });
      }
    }

    // Surah nav  sp_{n}_{trans}  sn_{n}_{trans}  sr_{trans}  sa1_{n}_{trans}
    else if (id.startsWith("sp_") || id.startsWith("sn_") || id.startsWith("sr_") || id.startsWith("sa1_")) {
      await interaction.deferUpdate();
      const parts    = id.split("_");
      const action   = parts[0];
      let surahNum, transKey;

      if (action === "sr") {
        surahNum = Math.floor(Math.random() * 114) + 1;
        transKey = parts.slice(1).join("_") || DEFAULT_TRANSLATION;
      } else if (action === "sa1") {
        surahNum = parseInt(parts[1]);
        transKey = parts.slice(2).join("_") || DEFAULT_TRANSLATION;
        // Navigate to first ayah of surah
        try {
          const data    = await fetchAyah(surahNum, 1, transKey);
          const maxAyah = data.verse?.surah_total_ayahs || 300;
          await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, surahNum, 1, maxAyah), buildAyahNavButtons(surahNum, 1, maxAyah, transKey)] });
        } catch {
          await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that ayah.")] });
        }
        return;
      } else {
        surahNum = parseInt(parts[1]);
        transKey = parts.slice(2).join("_") || DEFAULT_TRANSLATION;
      }

      try {
        const info = await fetchSurah(surahNum, transKey);
        await interaction.editReply({ embeds: [buildSurahEmbed(info, transKey)], components: [buildSurahNavButtons(surahNum, transKey)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load Surah ${surahNum}.`)] });
      }
    }

    // Tafsir open  to_{surah}_{ayah}
    else if (id.startsWith("to_")) {
      await interaction.deferUpdate();
      const [, surahStr, ayahStr] = id.split("_");
      const surah   = parseInt(surahStr);
      const ayahNum = parseInt(ayahStr);
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0x4A148C).setTitle("📚  Choose a Tafsir")
          .setDescription(`Select a Tafsir for **${surah}:${ayahNum}** from the dropdown.\n\n` +
            Object.entries(TAFSIR_EDITIONS).map(([, v]) => `${v.flag} **${v.name}** — *${v.scholar}* (${v.lang})`).join("\n"))
          .setFooter({ text: "تفسير القرآن الكريم — Powered by UmmahAPI" })],
        components: [buildTafsirMenu(surah, ayahNum)],
      });
    }

    // Dua prev/next  dp_{cat}_{idx}  /  dn_{cat}_{idx}
    else if (id.startsWith("dp_") || id.startsWith("dn_")) {
      await interaction.deferUpdate();
      const parts = id.split("_");
      const cat   = parts[1];
      const idx   = parseInt(parts[2]);
      try {
        const resp = await fetchDuasByCategory(cat);
        const duas = Array.isArray(resp) ? resp : (resp.duas || []);
        if (!duas[idx]) return interaction.editReply({ embeds: [buildErrorEmbed("Dua not found.")] });
        await interaction.editReply({ embeds: [buildDuaEmbed(duas[idx])], components: [buildDuaCategoryMenu(), buildDuaNavButtons(cat, idx, duas.length)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that dua.")] });
      }
    }

    // Random dua
    else if (id === "dr") {
      await interaction.deferUpdate();
      try {
        await interaction.editReply({ embeds: [buildDuaEmbed(await fetchRandomDua())], components: [buildDuaCategoryMenu()] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load a random dua.")] });
      }
    }

    // Asma nav  xp_{n}  xn_{n}  xr_{n}
    else if (id.startsWith("xp_") || id.startsWith("xn_") || id.startsWith("xr_")) {
      await interaction.deferUpdate();
      const num = parseInt(id.split("_")[1]);
      try {
        const resp  = await fetchAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [buildErrorEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [buildAsmaEmbed(name)], components: [buildAsmaNavButtons(num)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that name.")] });
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
