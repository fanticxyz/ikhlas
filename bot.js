/**
 * ═══════════════════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT  (Remastered)
 *   Single file — no modules folder needed
 *   APIs: UmmahAPI | AlQuran Cloud | Sunnah.com (optional)
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
//  API CONFIGURATION
// ─────────────────────────────────────────────────────
const API       = "https://ummahapi.com/api";
const QURAN_API = "https://api.alquran.cloud/v1";

// Optional: Sunnah.com API (requires key from GitHub issue)
const SUNNAH_API = "https://api.sunnah.com/v1";
const SUNNAH_KEY = process.env.SUNNAH_API_KEY || null;

// ─────────────────────────────────────────────────────
//  HADITH COLLECTIONS  (UmmahAPI)
// ─────────────────────────────────────────────────────
const COLLECTIONS = {
  bukhari:  { name: "Sahih al-Bukhari",  arabic: "صحيح البخاري",  color: 0x1B5E20, emoji: "📗", total: 7589 },
  muslim:   { name: "Sahih Muslim",      arabic: "صحيح مسلم",     color: 0x0D47A1, emoji: "📘", total: 7563 },
  abudawud: { name: "Sunan Abu Dawud",   arabic: "سنن أبي داود",  color: 0x4A148C, emoji: "📙", total: 5274 },
  tirmidhi: { name: "Jami at-Tirmidhi",  arabic: "جامع الترمذي",  color: 0x880E4F, emoji: "📕", total: 3998 },
  ibnmajah: { name: "Sunan Ibn Majah",   arabic: "سنن ابن ماجه",  color: 0x004D40, emoji: "📒", total: 4343 },
  nasai:    { name: "Sunan an-Nasa'i",   arabic: "سنن النسائي",   color: 0x37474F, emoji: "📓", total: 5765 },
  malik:    { name: "Muwatta Malik",     arabic: "موطأ مالك",     color: 0x6D4C41, emoji: "📔", total: 1858 },
};
const COLLECTION_KEYS = Object.keys(COLLECTIONS);

// Extended metadata (Sunnah.com collections — future-proofing)
const EXTENDED_COLLECTIONS = {
  ...COLLECTIONS,
  // Add these if you get a Sunnah.com API key:
  // ahmad:    { name: "Musnad Ahmad",      arabic: "مسند أحمد",     color: 0x5D4037, emoji: "📜", total: 0 },
  // darimi:   { name: "Sunan ad-Darimi",   arabic: "سنن الدارمي",   color: 0x455A64, emoji: "📃", total: 0 },
};

// ─────────────────────────────────────────────────────
//  QURAN TRANSLATIONS
// ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  sahih_international: { name: "Saheeh International", flag: "🇬🇧", lang: "English", edition: "en.sahih" },
  pickthall:           { name: "Marmaduke Pickthall",  flag: "🇬🇧", lang: "English", edition: "en.pickthall" },
  yusuf_ali:           { name: "Yusuf Ali",            flag: "🇬🇧", lang: "English", edition: "en.yusufali" },
};
const TRANSLATION_KEYS = Object.keys(TRANSLATIONS);
const DEFAULT_TRANSLATION = "sahih_international";

// ─────────────────────────────────────────────────────
//  TAFSIR EDITIONS
// ─────────────────────────────────────────────────────
const TAFSIR_EDITIONS = {
  ibn_kathir:    { name: "Tafsir Ibn Kathir (Abridged)", scholar: "Hafiz Ibn Kathir",                          lang: "English", flag: "🇬🇧" },
  maarif:        { name: "Ma'arif al-Qur'an",            scholar: "Mufti Muhammad Shafi",                      lang: "English", flag: "🇬🇧" },
  muyassar:      { name: "Tafsir Muyassar",              scholar: "Ministry of Islamic Affairs, Saudi Arabia", lang: "Arabic",  flag: "🇸🇦" },
  ibn_kathir_ar: { name: "Tafsir Ibn Kathir (Arabic)",   scholar: "Hafiz Ibn Kathir",                          lang: "Arabic",  flag: "🇸🇦" },
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
//  UTILITIES
// ─────────────────────────────────────────────────────
function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]+>/g, "");
}

function truncate(str, len = 200) {
  if (!str) return "";
  const clean = String(str).trim();
  return clean.length > len ? clean.substring(0, len) + "…" : clean;
}

/**
 * Safe fetch with timeout and JSON parsing
 */
async function safeFetch(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─────────────────────────────────────────────────────
//  API HELPERS  (UmmahAPI)
// ─────────────────────────────────────────────────────
async function apiFetch(path) {
  const res = await safeFetch(`${API}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(`API error — ${path}`);
  return json.data;
}

// ── Hadith ──
async function fetchHadith(collection, number) {
  return apiFetch(`/hadith/${collection}/${number}`);
}
async function fetchRandomHadith(collection) {
  if (collection) return apiFetch(`/hadith/${collection}/random`);
  return apiFetch(`/hadith/random`);
}

// ── Quran (AlQuran Cloud) ──
async function fetchAyah(surah, ayah, translationKey = DEFAULT_TRANSLATION) {
  const edition = TRANSLATIONS[translationKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  const res = await safeFetch(`${QURAN_API}/ayah/${surah}:${ayah}/editions/quran-uthmani,${edition}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran Cloud error: ${json.status}`);

  const arabic = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const trans  = json.data.find(d => d.edition.identifier === edition);
  if (!arabic || !trans) throw new Error("Invalid Quran API response");

  return {
    surah: {
      name_english: arabic.surah.englishName,
      name_arabic: arabic.surah.name,
      number: arabic.surah.number,
    },
    verse: {
      verse_key: `${surah}:${ayah}`,
      arabic: arabic.text,
      text: stripHtml(trans.text),
      surah_total_ayahs: arabic.surah.numberOfAyahs,
    }
  };
}

async function fetchRandomAyah(translationKey = DEFAULT_TRANSLATION) {
  const edition = TRANSLATIONS[translationKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  const res = await safeFetch(`${QURAN_API}/ayah/random/editions/quran-uthmani,${edition}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran Cloud error: ${json.status}`);

  const arabic = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const trans  = json.data.find(d => d.edition.identifier === edition);
  if (!arabic || !trans) throw new Error("Invalid Quran API response");

  return {
    surah: {
      name_english: arabic.surah.englishName,
      name_arabic: arabic.surah.name,
      number: arabic.surah.number,
    },
    verse: {
      verse_key: `${arabic.surah.number}:${arabic.numberInSurah}`,
      arabic: arabic.text,
      text: stripHtml(trans.text),
      surah_total_ayahs: arabic.surah.numberOfAyahs,
    }
  };
}

// ── Tafsir ──
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
//  DUA SOURCE FIX — Normalizes messy API responses
// ─────────────────────────────────────────────────────
function normalizeDuaSource(dua) {
  // Try every possible field name the API might use
  const candidates = [
    dua?.source,
    dua?.reference,
    dua?.book,
    dua?.from,
    dua?.narrator,
    dua?.meta?.source,
    dua?.collection,
    dua?.hadith_reference,
  ];

  for (const val of candidates) {
    if (val == null) continue;

    // Handle nested objects
    if (typeof val === "object") {
      const extracted = val.name || val.title || val.book || val.source;
      if (extracted) return truncate(stripHtml(String(extracted)), 200);
      // Avoid [object Object]
      continue;
    }

    // Handle strings
    if (typeof val === "string" && val.trim()) {
      return truncate(stripHtml(val), 200);
    }
  }

  return "Not specified";
}

// ─────────────────────────────────────────────────────
//  EMBED BUILDERS
// ─────────────────────────────────────────────────────

function buildHadithEmbed(data, showArabic = false) {
  const col = COLLECTIONS[data.collection] || { name: data.collection_name, color: 0x1A237E, emoji: "📖" };
  const gradeMap = {
    Sahih: { label: "Sahih — Authentic", emoji: "🟢", color: 0x1B5E20 },
    Hasan: { label: "Hasan — Good",      emoji: "🟡", color: 0xF9A825 },
    Daif:  { label: "Da'if — Weak",      emoji: "🔴", color: 0xB71C1C },
    "Da'if": { label: "Da'if — Weak",    emoji: "🔴", color: 0xB71C1C },
  };
  const grade = data.grade || data.status;
  const g = grade ? (gradeMap[grade] || { label: grade, emoji: "⚪", color: null }) : null;

  const embed = new EmbedBuilder()
    .setColor(g?.color || col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${data.hadithnumber}` })
    .setDescription(`*"${truncate(data.english, 3900)}"*`)
    .setFooter({ text: "لا علم إلا ما علَّم الله — No knowledge except what Allah has taught" })
    .setTimestamp();

  if (g) embed.addFields({ name: "📊 Grade", value: `${g.emoji} **${g.label}**`, inline: true });
  embed.addFields(
    { name: "📖 Collection", value: col.name,                inline: true },
    { name: "🔢 Number",     value: `#${data.hadithnumber}`, inline: true }
  );

  if (showArabic && data.arabic) {
    embed.addFields({ name: "🕌 Arabic", value: `\`\`\`arab\n${truncate(data.arabic, 1000)}\n\`\`\`` });
  }
  return embed;
}

function buildAyahEmbed(data, translationKey = DEFAULT_TRANSLATION) {
  const surah = data.surah;
  const verse = data.verse;
  const trans = TRANSLATIONS[translationKey] || TRANSLATIONS[DEFAULT_TRANSLATION];

  const embed = new EmbedBuilder()
    .setColor(0x1B5E20)
    .setAuthor({ name: `📖  ${surah.name_english} (${surah.name_arabic})  •  Ayah ${verse.verse_key}` })
    .setDescription(`*"${truncate(verse.text, 3900)}"*`);

  if (verse.arabic) embed.addFields({ name: "🕌 Arabic", value: verse.arabic });

  embed.addFields(
    { name: "📍 Reference",   value: verse.verse_key,              inline: true },
    { name: "🌐 Translation", value: `${trans.flag} ${trans.name}`, inline: true },
    { name: "🗣️ Language",   value: trans.lang,                    inline: true }
  );

  embed.setFooter({ text: "القرآن الكريم — The Noble Quran" }).setTimestamp();
  return embed;
}

function buildTafsirEmbed(data, tafsirKey) {
  const info = TAFSIR_EDITIONS[tafsirKey] || { name: tafsirKey, scholar: "Unknown", lang: "Unknown", flag: "📚" };
  const rawText = data.tafsir?.text || "Tafsir text unavailable for this ayah.";
  const text = truncate(rawText, 3900);

  return new EmbedBuilder()
    .setColor(0x4A148C)
    .setAuthor({ name: `${info.flag}  ${info.name}  •  Ayah ${data.verse_key}` })
    .setTitle(`📚 Tafsir — ${info.scholar}`)
    .setDescription(text)
    .addFields(
      { name: "📖 Scholar",  value: info.scholar,   inline: true },
      { name: "🗣️ Language", value: info.lang,      inline: true },
      { name: "📍 Ayah",     value: data.verse_key, inline: true }
    )
    .setFooter({ text: "Tafsir via UmmahAPI • تفسير القرآن الكريم" })
    .setTimestamp();
}

function buildDuaEmbed(dua) {
  const cat  = DUA_CATEGORIES[dua.category] || { name: dua.category_info?.name || dua.category || "General", emoji: "🤲" };
  const reps = dua.repeat > 1 ? `\n\n*Repeat: **${dua.repeat}x***` : "";
  const source = normalizeDuaSource(dua);

  return new EmbedBuilder()
    .setColor(0x006064)
    .setAuthor({ name: `${cat.emoji}  ${cat.name}  •  Dua #${dua.id || "?"}` })
    .setTitle(dua.title || "Supplication")
    .setDescription(`**${dua.arabic || ""}**\n\n*${dua.transliteration || ""}*\n\n"${dua.translation || ""}"${reps}`)
    .addFields(
      { name: "📚 Source",   value: source,   inline: true },
      { name: "📂 Category", value: cat.name, inline: true }
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
      { name: "🔢 Number",          value: `${name.number} / 99`, inline: true },
      { name: "🔤 Transliteration", value: name.transliteration,  inline: true },
      { name: "💬 Meaning",         value: name.meaning,          inline: true }
    )
    .setFooter({ text: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ — To Allah belong the best names (Quran 7:180)" })
    .setTimestamp();
}

function buildHijriEmbed(data) {
  const hijri = data.hijri;
  const gregorian = data.gregorian;
  return new EmbedBuilder()
    .setColor(0x3E2723)
    .setTitle("🌙  Today's Islamic Date")
    .addFields(
      { name: "🗓️ Hijri Date",     value: `**${hijri.day} ${hijri.month_name} ${hijri.year} AH**`, inline: false },
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
    .setFooter({ text: "Try a different input or try again later" });
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
  if (!col) return new ActionRowBuilder(); // safety
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
      .setStyle(showArabic ? ButtonStyle.Primary : ButtonStyle.Secondary)
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
    console.log("✅ Slash commands registered globally");
  } catch (e) {
    console.error("❌ Command registration error:", e);
  }
});

// ─────────────────────────────────────────────────────
//  INTERACTION HANDLER
// ─────────────────────────────────────────────────────
client.on("interactionCreate", async interaction => {
  if (!interaction.guild) return; // DM safety

  // ══════════════════════════════════════════════════
  //  SLASH COMMANDS
  // ══════════════════════════════════════════════════
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply();
    const cmd = interaction.commandName;

    try {
      if (cmd === "hadith") {
        const colKey = interaction.options.getString("collection", true);
        const num    = interaction.options.getInteger("number", true);
        const col    = COLLECTIONS[colKey];
        if (!col) return interaction.editReply({ embeds: [buildErrorEmbed("Invalid collection.")] });
        if (num > col.total) {
          return interaction.editReply({ embeds: [buildErrorEmbed(`${col.name} only has up to #${col.total}.`)] });
        }
        const data = await fetchHadith(colKey, num);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, num), buildCollectionMenu()]
        });
      }

      else if (cmd === "random") {
        const colKey = interaction.options.getString("collection");
        const data = await fetchRandomHadith(colKey);
        const col  = data.collection || colKey || "bukhari";
        const num  = data.hadithnumber || 1;
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(col, num), buildCollectionMenu()]
        });
      }

      else if (cmd === "ayah") {
        const surah    = interaction.options.getInteger("surah", true);
        const ayahNum  = interaction.options.getInteger("ayah", true);
        const transKey = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
        const data     = await fetchAyah(surah, ayahNum, transKey);
        const maxAyah  = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, surah, ayahNum, maxAyah),
            buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)
          ]
        });
      }

      else if (cmd === "randomayah") {
        const transKey = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
        const data     = await fetchRandomAyah(transKey);
        const [s, a]   = (data.verse?.verse_key || "1:1").split(":").map(Number);
        const maxAyah  = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, s, a, maxAyah),
            buildAyahNavButtons(s, a, maxAyah, transKey)
          ]
        });
      }

      else if (cmd === "tafsir") {
        const surah     = interaction.options.getInteger("surah", true);
        const ayahNum   = interaction.options.getInteger("ayah", true);
        const tafsirKey = interaction.options.getString("scholar") || "ibn_kathir";
        const data      = await fetchTafsir(tafsirKey, surah, ayahNum);
        await interaction.editReply({
          embeds: [buildTafsirEmbed(data, tafsirKey)],
          components: [buildTafsirSelectMenu(surah, ayahNum)]
        });
      }

      else if (cmd === "dua") {
        const category = interaction.options.getString("category");
        if (category) {
          const resp = await fetchDuasByCategory(category);
          const duas = Array.isArray(resp) ? resp : (resp.duas || []);
          if (!duas.length) return interaction.editReply({ embeds: [buildErrorEmbed("No duas found in this category.")] });
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
      }

      else if (cmd === "asmaallah") {
        const num = interaction.options.getInteger("number") || 1;
        const resp  = await fetchAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [buildErrorEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [buildAsmaEmbed(name)], components: [buildAsmaNavButtons(num)] });
      }

      else if (cmd === "hijri") {
        const data = await fetchTodayHijri();
        await interaction.editReply({ embeds: [buildHijriEmbed(data)] });
      }

      else if (cmd === "daily") {
        const [hadithData, ayahData, duaData, hijriData] = await Promise.all([
          fetchRandomHadith(null),
          fetchRandomAyah(DEFAULT_TRANSLATION),
          fetchRandomDua(),
          fetchTodayHijri().catch(() => null),
        ]);

        const hEmbed = buildHadithEmbed(hadithData); hEmbed.setTitle("🌅  Daily Hadith");
        const aEmbed = buildAyahEmbed(ayahData, DEFAULT_TRANSLATION); aEmbed.setTitle("📖  Daily Ayah");
        const dEmbed = buildDuaEmbed(duaData); dEmbed.setTitle("🤲  Daily Dua");

        const embeds = hijriData
          ? [buildHijriEmbed(hijriData), hEmbed, aEmbed, dEmbed]
          : [hEmbed, aEmbed, dEmbed];

        await interaction.editReply({ embeds });
      }

      else if (cmd === "collections") {
        const total = Object.values(COLLECTIONS).reduce((s, c) => s + c.total, 0);
        const embed = new EmbedBuilder()
          .setColor(0x5C4033)
          .setTitle("📚  Available Hadith Collections")
          .setDescription(
            Object.entries(COLLECTIONS).map(([, v]) =>
              `${v.emoji} **${v.name}** (${v.arabic}) — ${v.total.toLocaleString()} hadiths`
            ).join("\n") +
            `\n\n**Total: ${total.toLocaleString()} hadiths** across ${COLLECTION_KEYS.length} collections`
          )
          .setFooter({ text: "Powered by UmmahAPI • ummahapi.com" });
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
    } catch (err) {
      console.error(`[Error in /${cmd}]:`, err);
      await interaction.editReply({ embeds: [buildErrorEmbed("Something went wrong. The API may be down or the item doesn't exist.")] });
    }
  }

  // ══════════════════════════════════════════════════
  //  SELECT MENUS
  // ══════════════════════════════════════════════════
  else if (interaction.isStringSelectMenu()) {
    const cid = interaction.customId;

    try {
      if (cid === "select_collection") {
        await interaction.deferUpdate();
        const colKey = interaction.values[0];
        const data   = await fetchHadith(colKey, 1);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, 1), buildCollectionMenu()]
        });
      }

      else if (cid.startsWith("select_translation_")) {
        await interaction.deferUpdate();
        const segments = cid.split("_");
        const surah    = parseInt(segments[2]);
        const ayahNum  = parseInt(segments[3]);
        const maxAyah  = parseInt(segments[4]) || 300;
        const transKey = interaction.values[0];
        const data     = await fetchAyah(surah, ayahNum, transKey);
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, surah, ayahNum, maxAyah),
            buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)
          ]
        });
      }

      else if (cid === "select_tafsir") {
        await interaction.deferUpdate();
        const [tafsirKey, surahStr, ayahStr] = interaction.values[0].split("|");
        const surah   = parseInt(surahStr);
        const ayahNum = parseInt(ayahStr);
        const data    = await fetchTafsir(tafsirKey, surah, ayahNum);
        await interaction.editReply({
          embeds: [buildTafsirEmbed(data, tafsirKey)],
          components: [buildTafsirSelectMenu(surah, ayahNum)]
        });
      }

      else if (cid === "select_dua_category") {
        await interaction.deferUpdate();
        const category = interaction.values[0];
        const resp     = await fetchDuasByCategory(category);
        const duas     = Array.isArray(resp) ? resp : (resp.duas || []);
        if (!duas.length) return interaction.editReply({ embeds: [buildErrorEmbed("No duas found.")] });
        await interaction.editReply({
          embeds: [buildDuaEmbed(duas[0])],
          components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, 0, duas.length)]
        });
      }
    } catch (err) {
      console.error("[Select Menu Error]:", err);
      await interaction.editReply({ embeds: [buildErrorEmbed("Failed to load selection.")] });
    }
  }

  // ══════════════════════════════════════════════════
  //  BUTTONS
  // ══════════════════════════════════════════════════
  else if (interaction.isButton()) {
    const id    = interaction.customId;
    const parts = id.split("_");

    try {
      // Hadith prev / next / rand
      if (id.startsWith("hadith_prev_") || id.startsWith("hadith_next_") || id.startsWith("hadith_rand_")) {
        await interaction.deferUpdate();
        const colKey = parts[2];
        const num    = parseInt(parts[3]);
        const data   = await fetchHadith(colKey, num);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, num), buildCollectionMenu()]
        });
      }

      // Hadith Arabic toggle
      else if (id.startsWith("hadith_arabic_")) {
        await interaction.deferUpdate();
        const colKey    = parts[2];
        const num       = parseInt(parts[3]);
        const data      = await fetchHadith(colKey, num);
        const hasArabic = interaction.message.embeds[0]?.fields?.some(f => f.name === "🕌 Arabic") || false;
        await interaction.editReply({
          embeds: [buildHadithEmbed(data, !hasArabic)],
          components: [buildHadithNavButtons(colKey, num, !hasArabic), buildCollectionMenu()]
        });
      }

      // Ayah prev / next
      else if (id.startsWith("ayah_prev_") || id.startsWith("ayah_next_")) {
        await interaction.deferUpdate();
        const surah    = parseInt(parts[2]);
        const ayahNum  = parseInt(parts[3]);
        const maxAyah  = parseInt(parts[4]) || 300;
        const transKey = parts.slice(5).join("_") || DEFAULT_TRANSLATION;
        const data     = await fetchAyah(surah, ayahNum, transKey);
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, surah, ayahNum, maxAyah),
            buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)
          ]
        });
      }

      // Random ayah
      else if (id.startsWith("ayah_rand_")) {
        await interaction.deferUpdate();
        const transKey = parts.slice(2).join("_") || DEFAULT_TRANSLATION;
        const data     = await fetchRandomAyah(transKey);
        const [s, a]   = (data.verse?.verse_key || "1:1").split(":").map(Number);
        const maxAyah  = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationMenu(transKey, s, a, maxAyah),
            buildAyahNavButtons(s, a, maxAyah, transKey)
          ]
        });
      }

      // Tafsir open
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
        const resp     = await fetchDuasByCategory(category);
        const duas     = Array.isArray(resp) ? resp : (resp.duas || []);
        if (!duas[index]) return interaction.editReply({ embeds: [buildErrorEmbed("Dua not found.")] });
        await interaction.editReply({
          embeds: [buildDuaEmbed(duas[index])],
          components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, index, duas.length)]
        });
      }

      // Random dua
      else if (id === "dua_rand") {
        await interaction.deferUpdate();
        const data = await fetchRandomDua();
        await interaction.editReply({
          embeds: [buildDuaEmbed(data)],
          components: [buildDuaCategoryMenu()]
        });
      }

      // Asma ul Husna nav
      else if (id.startsWith("asma_")) {
        await interaction.deferUpdate();
        const num    = parseInt(parts[2]);
        const resp   = await fetchAllAsma();
        const names  = Array.isArray(resp) ? resp : (resp.names || resp);
        const name   = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [buildErrorEmbed("Name not found.")] });
        await interaction.editReply({
          embeds: [buildAsmaEmbed(name)],
          components: [buildAsmaNavButtons(num)]
        });
      }
    } catch (err) {
      console.error("[Button Error]:", err);
      await interaction.editReply({ embeds: [buildErrorEmbed("Failed to process button action.")] });
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
