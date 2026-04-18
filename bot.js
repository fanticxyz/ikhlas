/**
 * ═══════════════════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT
 *   Quran via AlQuran Cloud (api.alquran.cloud/v1)
 *   Hadith · Tafsir · Duas · Asma ul Husna · Hijri via UmmahAPI
 *   Extended Hadith via hadith-json (AhmedBaset)
 *   Al-Silsila Sahiha via hadithapi.com
 *   Single file — no modules folder needed
 * ═══════════════════════════════════════════════════════════════
 */

require("dotenv").config();
const {
  Client, GatewayIntentBits, EmbedBuilder,
  SlashCommandBuilder, REST, Routes,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ─────────────────────────────────────────────────────
//  API BASES
// ─────────────────────────────────────────────────────
const API            = "https://ummahapi.com/api";
const QURAN_API      = "https://api.alquran.cloud/v1";
const HADITHAPI_BASE = "https://hadithapi.com/api/hadiths";

// ─────────────────────────────────────────────────────
//  HADITH COLLECTIONS
//  source: "ummah"         → UmmahAPI
//  source: "json"          → hadith-json dataset
//  source: "hadithapi_com" → hadithapi.com (needs key)
// ═════════════════════════════════════════════════════
const COLLECTIONS = {
  // ── UmmahAPI ──
  bukhari:  { name: "Sahih al-Bukhari",  arabic: "صحيح البخاري",  color: 0x1B5E20, emoji: "📗", total: 7589,  source: "ummah" },
  muslim:   { name: "Sahih Muslim",      arabic: "صحيح مسلم",     color: 0x0D47A1, emoji: "📘", total: 7563,  source: "ummah" },
  abudawud: { name: "Sunan Abu Dawud",   arabic: "سنن أبي داود",  color: 0x4A148C, emoji: "📙", total: 5274,  source: "ummah" },
  tirmidhi: { name: "Jami at-Tirmidhi",  arabic: "جامع الترمذي",  color: 0x880E4F, emoji: "📕", total: 3998,  source: "ummah" },
  ibnmajah: { name: "Sunan Ibn Majah",   arabic: "سنن ابن ماجه",  color: 0x004D40, emoji: "📒", total: 4343,  source: "ummah" },
  nasai:    { name: "Sunan an-Nasa'i",   arabic: "سنن النسائي",   color: 0x37474F, emoji: "📓", total: 5765,  source: "ummah" },
  malik:    { name: "Muwatta Malik",     arabic: "موطأ مالك",     color: 0x6D4C41, emoji: "📔", total: 1858,  source: "ummah" },

  // ── Extended (hadith-json via jsDelivr) ──
  ahmad:    { name: "Musnad Ahmad",               arabic: "مسند أحمد",              color: 0x795548, emoji: "📚", total: 26363, source: "json", path: "the_9_books/ahmad.json" },
  darimi:   { name: "Sunan ad-Darimi",            arabic: "سنن الدارمي",            color: 0x5D4037, emoji: "📜", total: 3367,  source: "json", path: "the_9_books/darimi.json" },
  nawawi40: { name: "40 Hadith of Nawawi",        arabic: "الأربعون النووية",       color: 0xE65100, emoji: "📝", total: 42,    source: "json", path: "forties/nawawi40.json" },
  qudsi40:  { name: "40 Hadith Qudsi",            arabic: "الأربعون القدسية",       color: 0x00695C, emoji: "✨", total: 40,    source: "json", path: "forties/qudsi40.json" },
  shahwaliullah40: { name: "40 Hadith of Shah Waliullah", arabic: "أربعون الشاه ولي الله", color: 0x546E7A, emoji: "🕌", total: 40, source: "json", path: "forties/shahwaliullah40.json" },
  riyadsalihin: { name: "Riyad as-Salihin",       arabic: "رياض الصالحين",          color: 0x2E7D32, emoji: "🌿", total: 1900,  source: "json", path: "other_books/riyadsalihin.json" },
  shamail:  { name: "Shamail al-Muhammadiyah",    arabic: "الشمائل المحمدية",       color: 0xAD1457, emoji: "🕊️", total: 400,   source: "json", path: "other_books/shamail.json" },
  bulugh:   { name: "Bulugh al-Maram",            arabic: "بلوغ المرام",             color: 0x4527A0, emoji: "⚖️", total: 1500,  source: "json", path: "other_books/bulugh.json" },
  adab:     { name: "Al-Adab al-Mufrad",          arabic: "الأدب المفرد",            color: 0x1565C0, emoji: "🤝", total: 1300,  source: "json", path: "other_books/adab.json" },
  mishkat:  { name: "Mishkat al-Masabih",         arabic: "مشكاة المصابيح",          color: 0xC62828, emoji: "💡", total: 5900,  source: "json", path: "other_books/mishkat.json" },

  // ── hadithapi.com ──
  silsila:  { name: "Al-Silsila Sahiha",          arabic: "سلسلة الأحاديث الصحيحة", color: 0x00838F, emoji: "🔗", total: 900,   source: "hadithapi_com", slug: "al-silsila-sahiha" },
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
const TRANSLATION_KEYS = Object.keys(TRANSLATIONS);
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
  morning:          { name: "Morning Adhkar",        emoji: "🌅", count: 7  },
  evening:          { name: "Evening Adhkar",        emoji: "🌆", count: 5  },
  prayer:           { name: "During Prayer",         emoji: "🙏", count: 8  },
  after_prayer:     { name: "After Prayer",          emoji: "📿", count: 8  },
  sleep:            { name: "Sleep",                 emoji: "🌙", count: 6  },
  food:             { name: "Food & Drink",          emoji: "🍽️", count: 6  },
  travel:           { name: "Travel",                emoji: "✈️", count: 6  },
  distress:         { name: "Distress & Anxiety",    emoji: "💙", count: 7  },
  forgiveness:      { name: "Forgiveness",           emoji: "🤍", count: 5  },
  illness:          { name: "Illness & Healing",     emoji: "💊", count: 5  },
  guidance:         { name: "Guidance",              emoji: "🧭", count: 3  },
  protection:       { name: "Protection",            emoji: "🛡️", count: 4  },
  dhikr:            { name: "Dhikr",                 emoji: "📖", count: 6  },
  knowledge:        { name: "Knowledge",             emoji: "📚", count: 3  },
  gratitude:        { name: "Gratitude",             emoji: "🌸", count: 3  },
  marriage:         { name: "Marriage & Family",     emoji: "👨‍👩‍👧", count: 4  },
  hajj:             { name: "Hajj & Umrah",          emoji: "🕋", count: 4  },
  grief:            { name: "Grief & Loss",          emoji: "🤲", count: 4  },
  children:         { name: "Children",              emoji: "👶", count: 4  },
  night_prayer:     { name: "Night Prayer",          emoji: "⭐", count: 4  },
  quran_recitation: { name: "Quran Recitation",      emoji: "📜", count: 3  },
};
const DUA_CATEGORY_KEYS = Object.keys(DUA_CATEGORIES);

// ─────────────────────────────────────────────────────
//  API HELPERS
// ─────────────────────────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(`API error — ${path}`);
  return json.data;
}

function stripHtml(html) {
  return html?.replace(/<[^>]+>/g, "") || "";
}

// ── Extended Hadith JSON Loader (jsDelivr) ──
const HADITH_JSON_BASE = "https://cdn.jsdelivr.net/gh/AhmedBaset/hadith-json@1.2.0/db/by_book";
const hadithJsonCache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 2; // 2 hours

async function fetchHadithJsonCollection(key) {
  const now = Date.now();
  const cached = hadithJsonCache.get(key);
  if (cached && (now - cached.ts) < CACHE_TTL) return cached.data;

  const col = COLLECTIONS[key];
  if (!col || col.source !== "json") throw new Error(`Not a JSON-backed collection: ${key}`);

  const url = `${HADITH_JSON_BASE}/${col.path}`;
  console.log(`[hadith-json] Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Invalid hadith JSON structure (expected array)");

  console.log(`[hadith-json] Loaded ${data.length} hadiths for ${key}`);
  hadithJsonCache.set(key, { data, ts: now });
  return data;
}

// ── hadithapi.com Helper ──
const HADITHAPI_KEY = process.env.HADITHAPI_KEY || null;

async function fetchHadithCom(collectionSlug, number) {
  if (!HADITHAPI_KEY) throw new Error("HADITHAPI_KEY not configured in .env");
  const url = new URL(HADITHAPI_BASE);
  url.searchParams.set("apiKey", HADITHAPI_KEY);
  url.searchParams.set("book", collectionSlug);
  url.searchParams.set("hadithNumber", String(number));
  url.searchParams.set("paginate", "1");

  console.log(`[hadithapi.com] Fetching ${url.toString().replace(HADITHAPI_KEY, "***")}`);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status} — hadithapi.com`);
  const json = await res.json();

  // Try multiple possible response wrappers
  const hadiths = json.hadiths?.data || json.data?.hadiths || json.hadiths || json.data || [];
  const hadith = Array.isArray(hadiths) ? hadiths[0] : hadiths;
  if (!hadith) throw new Error("Hadith not found on hadithapi.com (empty response)");

  return normalizeHadithCom(hadith, collectionSlug, number);
}

async function fetchRandomHadithCom(collectionSlug) {
  if (!HADITHAPI_KEY) throw new Error("HADITHAPI_KEY not configured in .env");
  const col = Object.values(COLLECTIONS).find(c => c.slug === collectionSlug);
  const total = col?.total || 900;
  const rand = Math.floor(Math.random() * total) + 1;
  return fetchHadithCom(collectionSlug, rand);
}

function normalizeHadithCom(raw, slug, number) {
  const colEntry = Object.entries(COLLECTIONS).find(([, v]) => v.slug === slug);
  const colKey = colEntry ? colEntry[0] : slug;
  const col = COLLECTIONS[colKey] || { name: slug, color: 0x00838F, emoji: "📖" };

  const isnad = raw.isnad || raw.chain || raw.narrators || raw.narrator || raw.header || raw.rawi || null;

  return {
    collection: colKey,
    collection_name: col.name,
    hadithnumber: raw.hadithNumber || raw.number || raw.id || number,
    english: raw.hadithEnglish || raw.english || raw.text || "Translation unavailable.",
    arabic: raw.hadithArabic || raw.arabic || null,
    urdu: raw.hadithUrdu || raw.urdu || null,
    grade: raw.status || raw.grade || null,
    isnad: isnad,
    book: raw.book || null,
    chapter: raw.chapter || null,
  };
}

function normalizeHadithJson(raw, collectionKey, number) {
  const col = COLLECTIONS[collectionKey];
  const narrator = raw.english?.narrator || raw.narrator || "";
  const text = raw.english?.text || raw.english || "Translation unavailable.";

  // For hadith-json, the narrator field is often the chain/isnad
  const isnad = narrator || raw.isnad || raw.chain || raw.narrators || raw.header || null;

  return {
    collection: collectionKey,
    collection_name: col?.name || collectionKey,
    hadithnumber: number || raw.id || raw.hadithNumber || 1,
    english: narrator ? `${narrator}\n\n${text}` : text,
    arabic: raw.arabic || null,
    grade: raw.grade || null,
    isnad: isnad,
  };
}

// ── Hadith ──
async function fetchHadith(collection, number) {
  const col = COLLECTIONS[collection];
  if (!col) throw new Error(`Unknown collection: ${collection}`);

  if (col.source === "ummah") {
    const data = await apiFetch(`/hadith/${collection}/${number}`);
    data.isnad = data.isnad || data.chain || data.narrators || data.header || data.rawi || null;
    return data;
  }

  if (col.source === "hadithapi_com") {
    return fetchHadithCom(col.slug, number);
  }

  // JSON source
  const hadiths = await fetchHadithJsonCollection(collection);
  const hadith = hadiths[number - 1];
  if (!hadith) throw new Error(`Hadith #${number} not found in ${col.name} (max ${hadiths.length})`);
  return normalizeHadithJson(hadith, collection, number);
}

async function fetchRandomHadith(collection) {
  if (!collection) return apiFetch(`/hadith/random`);

  const col = COLLECTIONS[collection];
  if (!col) throw new Error(`Unknown collection: ${collection}`);

  if (col.source === "ummah") {
    return apiFetch(`/hadith/${collection}/random`);
  }

  if (col.source === "hadithapi_com") {
    return fetchRandomHadithCom(col.slug);
  }

  const hadiths = await fetchHadithJsonCollection(collection);
  const idx = Math.floor(Math.random() * hadiths.length);
  const hadith = hadiths[idx];
  return normalizeHadithJson(hadith, collection, idx + 1);
}

// ── Quran (AlQuran Cloud) ──
async function fetchAyah(surah, ayah, translationKey = DEFAULT_TRANSLATION) {
  const transEdition = TRANSLATIONS[translationKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  const res = await fetch(`${QURAN_API}/ayah/${surah}:${ayah}/editions/quran-uthmani,${transEdition}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran Cloud error: ${json.status}`);

  const arabicData = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const transData  = json.data.find(d => d.edition.identifier === transEdition);
  if (!arabicData || !transData) throw new Error("Invalid Quran API response");

  return {
    surah: {
      name_english: arabicData.surah.englishName,
      name_arabic: arabicData.surah.name,
      number: arabicData.surah.number,
    },
    verse: {
      verse_key: `${surah}:${ayah}`,
      arabic: arabicData.text,
      text: stripHtml(transData.text),
      surah_total_ayahs: arabicData.surah.numberOfAyahs,
    }
  };
}

async function fetchRandomAyah(translationKey = DEFAULT_TRANSLATION) {
  const transEdition = TRANSLATIONS[translationKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  const res = await fetch(`${QURAN_API}/ayah/random/editions/quran-uthmani,${transEdition}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran Cloud error: ${json.status}`);

  const arabicData = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const transData  = json.data.find(d => d.edition.identifier === transEdition);
  if (!arabicData || !transData) throw new Error("Invalid Quran API response");

  return {
    surah: {
      name_english: arabicData.surah.englishName,
      name_arabic: arabicData.surah.name,
      number: arabicData.surah.number,
    },
    verse: {
      verse_key: `${arabicData.surah.number}:${arabicData.numberInSurah}`,
      arabic: arabicData.text,
      text: stripHtml(transData.text),
      surah_total_ayahs: arabicData.surah.numberOfAyahs,
    }
  };
}

// ── Tafsir (UmmahAPI) ──
async function fetchTafsir(tafsirKey, surah, ayah) {
  return apiFetch(`/tafsir/${tafsirKey}/surah/${surah}/ayah/${ayah}`);
}

// ── Dua ──
async function fetchRandomDua() {
  return apiFetch(`/duas/random`);
}
async function fetchDuasByCategory(category) {
  return apiFetch(`/duas/category/${category}`);
}

// ── Asma ──
async function fetchAllAsma() {
  return apiFetch(`/asma-ul-husna`);
}
async function fetchRandomAsma() {
  return apiFetch(`/asma-ul-husna/random`);
}

// ── Hijri ──
async function fetchTodayHijri() {
  return apiFetch(`/today-hijri`);
}

// ─────────────────────────────────────────────────────
//  EMBED BUILDERS
// ─────────────────────────────────────────────────────

function buildHadithEmbed(data, showArabic = false) {
  const col = COLLECTIONS[data.collection] || { name: data.collection_name, color: 0x1A237E, emoji: "📖" };
  const grade = data.grade;
  const gradeMap = {
    Sahih: { label: "Sahih — Authentic", emoji: "🟢", color: 0x1B5E20 },
    Hasan: { label: "Hasan — Good",      emoji: "🟡", color: 0xF9A825 },
    Daif:  { label: "Da'if — Weak",      emoji: "🔴", color: 0xB71C1C },
  };
  const g = grade ? (gradeMap[grade] || { label: grade, emoji: "⚪", color: null }) : null;

  const embed = new EmbedBuilder()
    .setColor(g?.color || col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${data.hadithnumber}` })
    .setDescription(`*"${data.english}"*`)
    .setFooter({ text: "لا علم إلا ما علَّم الله — No knowledge except what Allah has taught" })
    .setTimestamp();

  if (g) embed.addFields({ name: "📊 Grade", value: `${g.emoji} **${g.label}**`, inline: true });
  embed.addFields(
    { name: "📖 Collection", value: col.name,                inline: true },
    { name: "🔢 Number",     value: `#${data.hadithnumber}`, inline: true }
  );

  // Isnad (chain of narration) — show if available
  if (data.isnad && String(data.isnad).trim().length > 0) {
    let chainText = String(data.isnad).trim();
    if (chainText.length > 900) chainText = chainText.substring(0, 900) + "…";
    embed.addFields({ name: "🔗 Isnad", value: `\`\`\`${chainText}\`\`\``, inline: false });
  }

  if (showArabic && data.arabic) {
    embed.addFields({ name: "🕌 Arabic", value: `\`\`\`${data.arabic.substring(0, 1000)}\`\`\`` });
  }
  return embed;
}

function buildAyahEmbed(data, translationKey = DEFAULT_TRANSLATION) {
  const surah  = data.surah;
  const verse  = data.verse;
  const trans  = TRANSLATIONS[translationKey] || TRANSLATIONS[DEFAULT_TRANSLATION];
  const text   = verse.text || "Translation unavailable.";

  const embed = new EmbedBuilder()
    .setColor(0x1B5E20)
    .setAuthor({ name: `📖  ${surah.name_english} (${surah.name_arabic})  •  Ayah ${verse.verse_key}` })
    .setDescription(`*"${text}"*`);

  if (verse.arabic) embed.addFields({ name: "🕌 Arabic", value: verse.arabic });

  embed.addFields(
    { name: "📍 Reference",   value: verse.verse_key,               inline: true },
    { name: "🌐 Translation", value: `${trans.flag} ${trans.name}`, inline: true },
    { name: "🗣️ Language",   value: trans.lang,                     inline: true }
  );

  embed.setFooter({ text: "القرآن الكريم — The Noble Quran" }).setTimestamp();
  return embed;
}

function buildTafsirEmbed(data, tafsirKey) {
  const info   = TAFSIR_EDITIONS[tafsirKey] || { name: tafsirKey, scholar: "", lang: "Unknown", flag: "📚" };
  const tafsir = data.tafsir;
  const rawText = tafsir?.text || "Tafsir text unavailable for this ayah.";
  const text   = rawText.length > 3900
    ? rawText.substring(0, 3900) + "\n\n*(Truncated — see full commentary in a Quran resource)*"
    : rawText;

  return new EmbedBuilder()
    .setColor(0x4A148C)
    .setAuthor({ name: `${info.flag}  ${info.name}  •  Ayah ${data.verse_key}` })
    .setTitle(`📚 Tafsir — ${info.scholar}`)
    .setDescription(text || "No tafsir text available for this ayah.")
    .addFields(
      { name: "📖 Scholar",  value: info.scholar,   inline: true },
      { name: "🗣️ Language", value: info.lang,      inline: true },
      { name: "📍 Ayah",     value: data.verse_key, inline: true }
    )
    .setFooter({ text: "Tafsir via UmmahAPI • تفسير القرآن الكريم" })
    .setTimestamp();
}

function buildDuaEmbed(dua) {
  const cat  = DUA_CATEGORIES[dua.category] || { name: dua.category_info?.name || dua.category, emoji: "🤲" };
  const reps = dua.repeat > 1 ? `\n\n*Repeat: **${dua.repeat}x***` : "";

  return new EmbedBuilder()
    .setColor(0x006064)
    .setAuthor({ name: `${cat.emoji}  ${cat.name}  •  Dua #${dua.id}` })
    .setTitle(dua.title)
    .setDescription(`**${dua.arabic}**\n\n*${dua.transliteration}*\n\n"${dua.translation}"${reps}`)
    .addFields(
      { name: "📚 Source",   value: dua.source, inline: true },
      { name: "📂 Category", value: cat.name,   inline: true }
    )
    .setFooter({ text: "ادْعُونِي أَسْتَجِبْ لَكُمْ — Call upon Me; I will respond to you. (Quran 40:60)" })
    .setTimestamp();
}

function buildAsmaEmbed(name) {
  return new EmbedBuilder()
    .setColor(0x1A237E)
    .setAuthor({ name: `✨  Asma ul Husna — Name #${name.number} of 99` })
    .setTitle(`${name.arabic}  •  ${name.transliteration}`)
    .setDescription(`**"${name.meaning}"**\n\n${name.description || ""}`)
    .addFields(
      { name: "🔢 Number",          value: `${name.number} / 99`,  inline: true },
      { name: "🔤 Transliteration", value: name.transliteration,   inline: true },
      { name: "💬 Meaning",         value: name.meaning,           inline: true }
    )
    .setFooter({ text: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ — To Allah belong the best names (Quran 7:180)" })
    .setTimestamp();
}

function buildHijriEmbed(data) {
  const hijri     = data.hijri;
  const gregorian = data.gregorian;
  return new EmbedBuilder()
    .setColor(0x3E2723)
    .setTitle("🌙  Today's Islamic Date")
    .addFields(
      { name: "🗓️ Hijri Date",     value: `**${hijri.day} ${hijri.month_name} ${hijri.year} AH**`,    inline: false },
      { name: "📅 Gregorian Date", value: gregorian.formatted || `${gregorian.day}/${gregorian.month}/${gregorian.year}`, inline: false }
    )
    .setFooter({ text: "UmmahAPI • Hijri Calendar" })
    .setTimestamp();
}

function buildErrorEmbed(msg) {
  return new EmbedBuilder()
    .setColor(0xB71C1C)
    .setTitle("⚠️  Could not load")
    .setDescription(msg)
    .setFooter({ text: "Try a different number or check your input" });
}

// ─────────────────────────────────────────────────────
//  COMPONENT BUILDERS
// ─────────────────────────────────────────────────────

function buildCollectionMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_collection")
      .setPlaceholder("Switch collection...")
      .addOptions(COLLECTION_KEYS.map(k => ({
        label: COLLECTIONS[k].name,
        description: `${COLLECTIONS[k].total.toLocaleString()} hadiths`,
        value: k,
        emoji: COLLECTIONS[k].emoji,
      })))
  );
}

function buildHadithNavButtons(collection, num, showArabic = false) {
  const col  = COLLECTIONS[collection];
  if (!col) {
    console.error(`[nav] Missing collection: ${collection}`);
    return new ActionRowBuilder();
  }
  const prev = Math.max(1, num - 1);
  const next = Math.min(col.total, num + 1);
  const rand = Math.floor(Math.random() * col.total) + 1;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`hadith_prev_${collection}_${prev}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(num <= 1),
    new ButtonBuilder().setCustomId(`hadith_next_${collection}_${next}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(num >= col.total),
    new ButtonBuilder().setCustomId(`hadith_rand_${collection}_${rand}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`hadith_arabic_${collection}_${num}`)
      .setLabel(showArabic ? "Hide Arabic" : "🕌 Arabic")
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildTranslationMenu(currentKey, surah, ayah, maxAyah) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select_translation_${surah}_${ayah}_${maxAyah}`)
      .setPlaceholder("Switch translation...")
      .addOptions(TRANSLATION_KEYS.map(k => ({
        label: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`,
        description: TRANSLATIONS[k].lang,
        value: k,
        default: k === currentKey,
      })))
  );
}

function buildAyahNavButtons(surah, ayah, maxAyah, transKey) {
  const prev = Math.max(1, ayah - 1);
  const next = Math.min(maxAyah, ayah + 1);
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ayah_prev_${surah}_${prev}_${maxAyah}_${transKey}`).setLabel("◀ Prev Ayah").setStyle(ButtonStyle.Secondary).setDisabled(ayah <= 1),
    new ButtonBuilder().setCustomId(`ayah_next_${surah}_${next}_${maxAyah}_${transKey}`).setLabel("Next Ayah ▶").setStyle(ButtonStyle.Secondary).setDisabled(ayah >= maxAyah),
    new ButtonBuilder().setCustomId(`ayah_rand_${transKey}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`tafsir_open_${surah}_${ayah}`).setLabel("📚 Tafsir").setStyle(ButtonStyle.Success)
  );
}

function buildTafsirSelectMenu(surah, ayah) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_tafsir")
      .setPlaceholder("📚 Choose a Tafsir...")
      .addOptions(Object.entries(TAFSIR_EDITIONS).map(([k, v]) => ({
        label: `${v.flag} ${v.name}`,
        description: `${v.scholar} • ${v.lang}`,
        value: `${k}|${surah}|${ayah}`,
      })))
  );
}

function buildDuaCategoryMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_dua_category")
      .setPlaceholder("📂 Choose a category...")
      .addOptions(DUA_CATEGORY_KEYS.slice(0, 25).map(k => ({
        label: `${DUA_CATEGORIES[k].emoji} ${DUA_CATEGORIES[k].name}`,
        description: `${DUA_CATEGORIES[k].count} duas`,
        value: k,
      })))
  );
}

function buildDuaNavButtons(category, index, total) {
  const prev = Math.max(0, index - 1);
  const next = Math.min(total - 1, index + 1);
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`dua_prev_${category}_${prev}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(index <= 0),
    new ButtonBuilder().setCustomId(`dua_next_${category}_${next}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(index >= total - 1),
    new ButtonBuilder().setCustomId(`dua_rand`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary)
  );
}

function buildAsmaNavButtons(num) {
  const prev = Math.max(1, num - 1);
  const next = Math.min(99, num + 1);
  const rand = Math.floor(Math.random() * 99) + 1;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`asma_prev_${prev}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(num <= 1),
    new ButtonBuilder().setCustomId(`asma_next_${next}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(num >= 99),
    new ButtonBuilder().setCustomId(`asma_rand_${rand}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary)
  );
}

// ─────────────────────────────────────────────────────
//  SLASH COMMAND DEFINITIONS
// ─────────────────────────────────────────────────────
const commands = [

  new SlashCommandBuilder()
    .setName("hadith")
    .setDescription("Get a specific hadith by collection and number")
    .addStringOption(o =>
      o.setName("collection").setDescription("Hadith collection").setRequired(true)
        .addChoices(...COLLECTION_KEYS.map(k => ({ name: COLLECTIONS[k].name, value: k })))
    )
    .addIntegerOption(o =>
      o.setName("number").setDescription("Hadith number").setRequired(true).setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName("random")
    .setDescription("Get a random hadith (optionally from a specific collection)")
    .addStringOption(o =>
      o.setName("collection").setDescription("Collection (leave blank for any)")
        .addChoices(...COLLECTION_KEYS.map(k => ({ name: COLLECTIONS[k].name, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("ayah")
    .setDescription("Get a Quran verse by surah and ayah number")
    .addIntegerOption(o => o.setName("surah").setDescription("Surah number (1–114)").setRequired(true).setMinValue(1).setMaxValue(114))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o =>
      o.setName("translation").setDescription("Translation (default: Saheeh International)")
        .addChoices(...TRANSLATION_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("randomayah")
    .setDescription("Get a random Quran verse")
    .addStringOption(o =>
      o.setName("translation").setDescription("Translation (default: Saheeh International)")
        .addChoices(...TRANSLATION_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("tafsir")
    .setDescription("Get Tafsir (scholarly commentary) for a Quran verse")
    .addIntegerOption(o => o.setName("surah").setDescription("Surah number (1–114)").setRequired(true).setMinValue(1).setMaxValue(114))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o =>
      o.setName("scholar").setDescription("Choose the tafsir (default: Ibn Kathir)")
        .addChoices(...Object.entries(TAFSIR_EDITIONS).map(([k, v]) => ({ name: `${v.flag} ${v.name} (${v.lang})`, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("dua")
    .setDescription("Browse authentic duas by category or get a random one")
    .addStringOption(o =>
      o.setName("category").setDescription("Dua category (leave blank for random)")
        .addChoices(...DUA_CATEGORY_KEYS.slice(0, 25).map(k => ({ name: `${DUA_CATEGORIES[k].emoji} ${DUA_CATEGORIES[k].name}`, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("asmaallah")
    .setDescription("Browse the 99 Names of Allah (Asma ul Husna)")
    .addIntegerOption(o =>
      o.setName("number").setDescription("Name number 1–99, leave blank to start from 1").setMinValue(1).setMaxValue(99)
    ),

  new SlashCommandBuilder()
    .setName("hijri")
    .setDescription("Get today's Islamic (Hijri) date"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Today's daily reminder — hadith, ayah, and dua"),

  new SlashCommandBuilder()
    .setName("collections")
    .setDescription("List all available hadith collections"),

  new SlashCommandBuilder()
    .setName("explore")
    .setDescription("Open an interactive hadith collection explorer"),

].map(c => c.toJSON());

// ─────────────────────────────────────────────────────
//  BOT READY
// ─────────────────────────────────────────────────────
client.once("ready", async () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  console.log(`📚 Registered ${COLLECTION_KEYS.length} hadith collections in slash commands`);

  const statusEnv  = process.env.BOT_STATUS || "WATCHING:📖 Quran | /ayah /hadith /dua";
  const [typeRaw, ...parts] = statusEnv.split(":");
  const statusText = parts.join(":");
  const activityTypes = { PLAYING: 0, STREAMING: 1, LISTENING: 2, WATCHING: 3, COMPETING: 5, CUSTOM: 4 };
  client.user.setPresence({
    activities: [{ name: statusText, type: activityTypes[typeRaw.toUpperCase()] ?? 3 }],
    status: process.env.BOT_ONLINE_STATUS || "online",
  });
  console.log(`✅ Status: [${typeRaw}] ${statusText}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log(`✅ Slash commands registered globally (${commands.length} commands)`);
  } catch (e) {
    console.error("❌ Command registration error:", e);
  }
});

// ─────────────────────────────────────────────────────
//  INTERACTION HANDLER
// ─────────────────────────────────────────────────────
client.on("interactionCreate", async interaction => {

  // ══════════════════════════════════════════════════
  //  SLASH COMMANDS
  // ══════════════════════════════════════════════════
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply();
    const cmd = interaction.commandName;

    if (cmd === "hadith") {
      const colKey = interaction.options.getString("collection");
      const num    = interaction.options.getInteger("number");
      const col    = COLLECTIONS[colKey];

      if (!col) {
        return interaction.editReply({ embeds: [buildErrorEmbed(`Unknown collection: ${colKey}`)] });
      }

      if (col.source === "hadithapi_com" && !HADITHAPI_KEY) {
        return interaction.editReply({
          embeds: [buildErrorEmbed(`Al-Silsila Sahiha requires a hadithapi.com API key.\nAdd \`HADITHAPI_KEY\` to your .env file.`)]
        });
      }

      if (num > col.total) {
        return interaction.editReply({ embeds: [buildErrorEmbed(`${col.name} only has up to #${col.total}.`)] });
      }
      try {
        const data = await fetchHadith(colKey, num);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, num), buildCollectionMenu()]
        });
      } catch (err) {
        console.error(`[hadith] Error loading ${colKey} #${num}:`, err);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load hadith #${num} from ${col.name}.`)] });
      }
    }

    else if (cmd === "random") {
      const colKey = interaction.options.getString("collection") || null;
      try {
        const data = await fetchRandomHadith(colKey);
        const col  = data.collection || colKey || "bukhari";
        const num  = data.hadithnumber || 1;
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(col, num), buildCollectionMenu()]
        });
      } catch (err) {
        console.error("[random] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a random hadith.")] });
      }
    }

    else if (cmd === "ayah") {
      const surah    = interaction.options.getInteger("surah");
      const ayahNum  = interaction.options.getInteger("ayah");
      const transKey = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
      try {
        const data    = await fetchAyah(surah, ayahNum, transKey);
        const maxAyah = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, surah, ayahNum, maxAyah),
            buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)
          ]
        });
      } catch (err) {
        console.error(`[ayah] Error loading ${surah}:${ayahNum}:`, err);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load ${surah}:${ayahNum}.`)] });
      }
    }

    else if (cmd === "randomayah") {
      const transKey = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
      try {
        const data    = await fetchRandomAyah(transKey);
        const [s, a]  = (data.verse?.verse_key || "1:1").split(":").map(Number);
        const maxAyah = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, s, a, maxAyah),
            buildAyahNavButtons(s, a, maxAyah, transKey)
          ]
        });
      } catch (err) {
        console.error("[randomayah] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a random ayah.")] });
      }
    }

    else if (cmd === "tafsir") {
      const surah     = interaction.options.getInteger("surah");
      const ayahNum   = interaction.options.getInteger("ayah");
      const tafsirKey = interaction.options.getString("scholar") || "ibn_kathir";
      try {
        const data = await fetchTafsir(tafsirKey, surah, ayahNum);
        await interaction.editReply({
          embeds: [buildTafsirEmbed(data, tafsirKey)],
          components: [buildTafsirSelectMenu(surah, ayahNum)]
        });
      } catch (err) {
        console.error(`[tafsir] Error loading ${surah}:${ayahNum}:`, err);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load tafsir for ${surah}:${ayahNum}.`)] });
      }
    }

    else if (cmd === "dua") {
      const category = interaction.options.getString("category");
      try {
        if (category) {
          const resp = await fetchDuasByCategory(category);
          const duas = Array.isArray(resp) ? resp : (resp.duas || []);
          if (!duas.length) return interaction.editReply({ embeds: [buildErrorEmbed("No duas found.")] });
          await interaction.editReply({
            embeds: [buildDuaEmbed(duas[0])],
            components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, 0, duas.length)]
          });
        } else {
          const data = await fetchRandomDua();
          await interaction.editReply({
            embeds: [buildDuaEmbed(data)],
            components: [buildDuaCategoryMenu()]
          });
        }
      } catch (err) {
        console.error("[dua] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a dua.")] });
      }
    }

    else if (cmd === "asmaallah") {
      const num = interaction.options.getInteger("number") || 1;
      try {
        const resp  = await fetchAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [buildErrorEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [buildAsmaEmbed(name)], components: [buildAsmaNavButtons(num)] });
      } catch (err) {
        console.error("[asmaallah] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load Asma ul Husna.")] });
      }
    }

    else if (cmd === "hijri") {
      try {
        const data = await fetchTodayHijri();
        await interaction.editReply({ embeds: [buildHijriEmbed(data)] });
      } catch (err) {
        console.error("[hijri] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch Hijri date.")] });
      }
    }

    else if (cmd === "daily") {
      try {
        const [hadithData, ayahData, duaData, hijriData] = await Promise.all([
          fetchRandomHadith(null),
          fetchRandomAyah(DEFAULT_TRANSLATION),
          fetchRandomDua(),
          fetchTodayHijri().catch(() => null),
        ]);

        const hEmbed = buildHadithEmbed(hadithData);
        hEmbed.setTitle("🌅  Daily Hadith");
        const aEmbed = buildAyahEmbed(ayahData, DEFAULT_TRANSLATION);
        aEmbed.setTitle("📖  Daily Ayah");
        const dEmbed = buildDuaEmbed(duaData);
        dEmbed.setTitle("🤲  Daily Dua");

        const embeds = hijriData
          ? [buildHijriEmbed(hijriData), hEmbed, aEmbed, dEmbed]
          : [hEmbed, aEmbed, dEmbed];

        await interaction.editReply({ embeds });
      } catch (err) {
        console.error("[daily] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load daily content.")] });
      }
    }

    else if (cmd === "collections") {
      const total = Object.values(COLLECTIONS).reduce((s, c) => s + c.total, 0);
      const ummahCols = COLLECTION_KEYS.filter(k => COLLECTIONS[k].source === "ummah");
      const jsonCols  = COLLECTION_KEYS.filter(k => COLLECTIONS[k].source === "json");
      const comCols   = COLLECTION_KEYS.filter(k => COLLECTIONS[k].source === "hadithapi_com");

      let desc = "";
      if (ummahCols.length) desc += `**UmmahAPI (${ummahCols.length})**\n` + ummahCols.map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** (${COLLECTIONS[k].arabic}) — ${COLLECTIONS[k].total.toLocaleString()}`).join("\n") + "\n\n";
      if (jsonCols.length) desc += `**Extended via hadith-json (${jsonCols.length})**\n` + jsonCols.map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** (${COLLECTIONS[k].arabic}) — ${COLLECTIONS[k].total.toLocaleString()}`).join("\n") + "\n\n";
      if (comCols.length) desc += `**hadithapi.com (${comCols.length})**\n` + comCols.map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** (${COLLECTIONS[k].arabic}) — ${COLLECTIONS[k].total.toLocaleString()}`).join("\n") + "\n\n";

      desc += `**Total: ${total.toLocaleString()} hadiths** across ${COLLECTION_KEYS.length} collections`;

      const embed = new EmbedBuilder()
        .setColor(0x5C4033)
        .setTitle("📚  Available Hadith Collections")
        .setDescription(desc)
        .setFooter({ text: "Powered by UmmahAPI, hadith-json & hadithapi.com" });
      await interaction.editReply({ embeds: [embed] });
    }

    else if (cmd === "explore") {
      const embed = new EmbedBuilder()
        .setColor(0x4E342E)
        .setTitle("📚  Islamic Knowledge Explorer")
        .setDescription(
          "Select a collection from the dropdown to start browsing.\n" +
          "Use **◀ Prev / Next ▶** to navigate hadith by hadith, or **🎲 Random** to jump.\n\n" +
          Object.entries(COLLECTIONS).map(([, v]) =>
            `${v.emoji} **${v.name}** — ${v.total.toLocaleString()} hadiths`
          ).join("\n")
        )
        .setFooter({ text: "بسم الله الرحمن الرحيم • In the name of Allah" });
      await interaction.editReply({ embeds: [embed], components: [buildCollectionMenu()] });
    }

    else {
      await interaction.editReply({ embeds: [buildErrorEmbed(`Unknown command: /${cmd}`)] });
    }
  }

  // ══════════════════════════════════════════════════
  //  SELECT MENUS
  // ══════════════════════════════════════════════════
  else if (interaction.isStringSelectMenu()) {
    const cid = interaction.customId;

    if (cid === "select_collection") {
      await interaction.deferUpdate();
      const colKey = interaction.values[0];
      const col = COLLECTIONS[colKey];

      if (!col) {
        return interaction.editReply({ embeds: [buildErrorEmbed(`Unknown collection: ${colKey}`)] });
      }

      if (col.source === "hadithapi_com" && !HADITHAPI_KEY) {
        return interaction.editReply({
          embeds: [buildErrorEmbed(`Al-Silsila Sahiha requires a hadithapi.com API key.\nAdd \`HADITHAPI_KEY\` to your .env file.`)]
        });
      }

      try {
        const data = await fetchHadith(colKey, 1);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, 1), buildCollectionMenu()]
        });
      } catch (err) {
        console.error(`[select_collection] Error loading ${colKey} #1:`, err);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load ${col.name}. ${err.message}`)] });
      }
    }

    else if (cid.startsWith("select_translation_")) {
      await interaction.deferUpdate();
      const segments = cid.split("_");
      const surah    = parseInt(segments[2]);
      const ayahNum  = parseInt(segments[3]);
      const maxAyah  = parseInt(segments[4]) || 300;
      const transKey = interaction.values[0];
      try {
        const data = await fetchAyah(surah, ayahNum, transKey);
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, surah, ayahNum, maxAyah),
            buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)
          ]
        });
      } catch (err) {
        console.error("[select_translation] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not switch translation.")] });
      }
    }

    else if (cid === "select_tafsir") {
      await interaction.deferUpdate();
      const [tafsirKey, surahStr, ayahStr] = interaction.values[0].split("|");
      const surah   = parseInt(surahStr);
      const ayahNum = parseInt(ayahStr);
      try {
        const data = await fetchTafsir(tafsirKey, surah, ayahNum);
        await interaction.editReply({
          embeds: [buildTafsirEmbed(data, tafsirKey)],
          components: [buildTafsirSelectMenu(surah, ayahNum)]
        });
      } catch (err) {
        console.error("[select_tafsir] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load tafsir for ${surah}:${ayahNum}.`)] });
      }
    }

    else if (cid === "select_dua_category") {
      await interaction.deferUpdate();
      const category = interaction.values[0];
      try {
        const resp = await fetchDuasByCategory(category);
        const duas = Array.isArray(resp) ? resp : (resp.duas || []);
        if (!duas.length) return interaction.editReply({ embeds: [buildErrorEmbed("No duas found.")] });
        await interaction.editReply({
          embeds: [buildDuaEmbed(duas[0])],
          components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, 0, duas.length)]
        });
      } catch (err) {
        console.error("[select_dua_category] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that dua category.")] });
      }
    }
  }

  // ══════════════════════════════════════════════════
  //  BUTTONS
  // ══════════════════════════════════════════════════
  else if (interaction.isButton()) {
    const id    = interaction.customId;
    const parts = id.split("_");

    // Hadith prev / next / rand
    if (id.startsWith("hadith_prev_") || id.startsWith("hadith_next_") || id.startsWith("hadith_rand_")) {
      await interaction.deferUpdate();
      const colKey = parts[2];
      const num    = parseInt(parts[3]);
      try {
        const data = await fetchHadith(colKey, num);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, num), buildCollectionMenu()]
        });
      } catch (err) {
        console.error(`[hadith_nav] Error loading ${colKey} #${num}:`, err);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load hadith #${num}.`)] });
      }
    }

    // Hadith Arabic toggle
    else if (id.startsWith("hadith_arabic_")) {
      await interaction.deferUpdate();
      const colKey = parts[2];
      const num    = parseInt(parts[3]);
      try {
        const data      = await fetchHadith(colKey, num);
        const hasArabic = interaction.message.embeds[0]?.fields?.some(f => f.name === "🕌 Arabic") || false;
        await interaction.editReply({
          embeds: [buildHadithEmbed(data, !hasArabic)],
          components: [buildHadithNavButtons(colKey, num, !hasArabic), buildCollectionMenu()]
        });
      } catch (err) {
        console.error("[hadith_arabic] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load Arabic text.")] });
      }
    }

    // Ayah prev / next
    else if (id.startsWith("ayah_prev_") || id.startsWith("ayah_next_")) {
      await interaction.deferUpdate();
      const surah    = parseInt(parts[2]);
      const ayahNum  = parseInt(parts[3]);
      const maxAyah  = parseInt(parts[4]) || 300;
      const transKey = parts.slice(5).join("_") || DEFAULT_TRANSLATION;
      try {
        const data = await fetchAyah(surah, ayahNum, transKey);
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, surah, ayahNum, maxAyah),
            buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)
          ]
        });
      } catch (err) {
        console.error("[ayah_nav] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that ayah.")] });
      }
    }

    // Random ayah
    else if (id.startsWith("ayah_rand_")) {
      await interaction.deferUpdate();
      const transKey = parts.slice(2).join("_") || DEFAULT_TRANSLATION;
      try {
        const data    = await fetchRandomAyah(transKey);
        const [s, a]  = (data.verse?.verse_key || "1:1").split(":").map(Number);
        const maxAyah = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, s, a, maxAyah),
            buildAyahNavButtons(s, a, maxAyah, transKey)
          ]
        });
      } catch (err) {
        console.error("[ayah_rand] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load a random ayah.")] });
      }
    }

    // Tafsir open (from 📚 button on ayah)
    else if (id.startsWith("tafsir_open_")) {
      await interaction.deferUpdate();
      const surah   = parseInt(parts[2]);
      const ayahNum = parseInt(parts[3]);
      const embed   = new EmbedBuilder()
        .setColor(0x4A148C)
        .setTitle("📚  Choose a Tafsir")
        .setDescription(
          `Select a Tafsir for **${surah}:${ayahNum}** from the dropdown below.\n\n` +
          Object.entries(TAFSIR_EDITIONS).map(([, v]) =>
            `${v.flag} **${v.name}** — *${v.scholar}* (${v.lang})`
          ).join("\n")
        )
        .setFooter({ text: "تفسير القرآن الكريم — Powered by UmmahAPI" });
      await interaction.editReply({
        embeds: [embed],
        components: [buildTafsirSelectMenu(surah, ayahNum)]
      });
    }

    // Dua prev / next
    else if (id.startsWith("dua_prev_") || id.startsWith("dua_next_")) {
      await interaction.deferUpdate();
      const category = parts[2];
      const index    = parseInt(parts[3]);
      try {
        const resp = await fetchDuasByCategory(category);
        const duas = Array.isArray(resp) ? resp : (resp.duas || []);
        if (!duas[index]) return interaction.editReply({ embeds: [buildErrorEmbed("Dua not found.")] });
        await interaction.editReply({
          embeds: [buildDuaEmbed(duas[index])],
          components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, index, duas.length)]
        });
      } catch (err) {
        console.error("[dua_nav] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that dua.")] });
      }
    }

    // Random dua
    else if (id === "dua_rand") {
      await interaction.deferUpdate();
      try {
        const data = await fetchRandomDua();
        await interaction.editReply({
          embeds: [buildDuaEmbed(data)],
          components: [buildDuaCategoryMenu()]
        });
      } catch (err) {
        console.error("[dua_rand] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load a random dua.")] });
      }
    }

    // Asma ul Husna nav
    else if (id.startsWith("asma_")) {
      await interaction.deferUpdate();
      const num = parseInt(parts[2]);
      try {
        const resp  = await fetchAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [buildErrorEmbed("Name not found.")] });
        await interaction.editReply({
          embeds: [buildAsmaEmbed(name)],
          components: [buildAsmaNavButtons(num)]
        });
      } catch (err) {
        console.error("[asma_nav] Error:", err);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that name.")] });
      }
    }
  }
});

// ─────────────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────────────
if (!process.env.DISCORD_TOKEN) {
  console.error("❌  DISCORD_TOKEN not set. Add it to your .env file.");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
