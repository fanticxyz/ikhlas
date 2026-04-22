/**
 * ═══════════════════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT
 *   Hadith via hadith-json (github.com/AhmedBaset/hadith-json)
 *   Quran via AlQuran Cloud (api.alquran.cloud/v1)
 *   Hadith · Tafsir · Duas · Asma ul Husna · Hijri via UmmahAPI
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
const API       = "https://ummahapi.com/api";
const QURAN_API = "https://api.alquran.cloud/v1";
const HADITH_JSON_BASE = "https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/by_book";

// ─────────────────────────────────────────────────────
//  HADITH COLLECTIONS  (17 books from hadith-json)
// ─────────────────────────────────────────────────────
const COLLECTIONS = {
  // The 9 Books
  bukhari:           { name: "Sahih al-Bukhari",               arabic: "صحيح البخاري",           color: 0x1B5E20, emoji: "📗", path: "the_9_books/bukhari.json" },
  muslim:            { name: "Sahih Muslim",                   arabic: "صحيح مسلم",              color: 0x0D47A1, emoji: "📘", path: "the_9_books/muslim.json" },
  abudawud:          { name: "Sunan Abi Dawud",                arabic: "سنن أبي داود",           color: 0x4A148C, emoji: "📙", path: "the_9_books/abudawud.json" },
  tirmidhi:          { name: "Jami` at-Tirmidhi",              arabic: "جامع الترمذي",           color: 0x880E4F, emoji: "📕", path: "the_9_books/tirmidhi.json" },
  nasai:             { name: "Sunan an-Nasa'i",                arabic: "سنن النسائي",            color: 0x37474F, emoji: "📓", path: "the_9_books/nasai.json" },
  ibnmajah:          { name: "Sunan Ibn Majah",                arabic: "سنن ابن ماجه",           color: 0x004D40, emoji: "📒", path: "the_9_books/ibnmajah.json" },
  malik:             { name: "Muwatta Malik",                  arabic: "موطأ مالك",              color: 0x6D4C41, emoji: "📔", path: "the_9_books/malik.json" },
  ahmed:             { name: "Musnad Ahmad",                   arabic: "مسند أحمد",              color: 0x263238, emoji: "📚", path: "the_9_books/ahmed.json" },
  darimi:            { name: "Sunan ad-Darimi",                arabic: "سنن الدارمي",            color: 0x5D4037, emoji: "📜", path: "the_9_books/darimi.json" },

  // The Forties
  nawawi40:          { name: "The Forty Hadith of al-Nawawi",  arabic: "الأربعون النووية",       color: 0x1A237E, emoji: "📝", path: "forties/nawawi40.json" },
  qudsi40:           { name: "The Forty Hadith Qudsi",         arabic: "الأربعون القدسية",       color: 0x4A148C, emoji: "✨", path: "forties/qudsi40.json" },
  shahwaliullah40:   { name: "The Forty Hadith of Shah Waliullah", arabic: "أربعون الشاه ولي الله", color: 0x3E2723, emoji: "🕌", path: "forties/shahwaliullah40.json" },

  // Other Books
  riyad_assalihin:   { name: "Riyad as-Salihin",               arabic: "رياض الصالحين",          color: 0x2E7D32, emoji: "🌿", path: "other_books/riyad_assalihin.json" },
  shamail_muhammadiyah: { name: "Shamail al-Muhammadiyah",    arabic: "الشمائل المحمدية",       color: 0xE65100, emoji: "🕊️", path: "other_books/shamail_muhammadiyah.json" },
  bulugh_almaram:    { name: "Bulugh al-Maram",                arabic: "بلوغ المرام",            color: 0x006064, emoji: "⚖️", path: "other_books/bulugh_almaram.json" },
  aladab_almufrad:   { name: "Al-Adab Al-Mufrad",              arabic: "الأدب المفرد",           color: 0xC62828, emoji: "🤝", path: "other_books/aladab_almufrad.json" },
  mishkat_almasabih: { name: "Mishkat al-Masabih",             arabic: "مشكاة المصابيح",         color: 0xF9A825, emoji: "🏮", path: "other_books/mishkat_almasabih.json" },
};
const COLLECTION_KEYS = Object.keys(COLLECTIONS);

// In-memory cache for loaded hadith books
const hadithCache = new Map();

// ─────────────────────────────────────────────────────
//  QURAN TRANSLATIONS  (AlQuran Cloud editions)
// ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  sahih_international: { name: "Saheeh International", flag: "🇬🇧", lang: "English", edition: "en.sahih" },
  pickthall:           { name: "Marmaduke Pickthall",  flag: "🇬🇧", lang: "English", edition: "en.pickthall" },
  yusuf_ali:           { name: "Yusuf Ali",             flag: "🇬🇧", lang: "English", edition: "en.yusufali" },
};
const TRANSLATION_KEYS = Object.keys(TRANSLATIONS);
const DEFAULT_TRANSLATION = "sahih_international";

// ─────────────────────────────────────────────────────
//  TAFSIR EDITIONS  (UmmahAPI)
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

// ── Hadith (hadith-json) ──
async function loadCollection(key) {
  if (hadithCache.has(key)) return hadithCache.get(key);
  const col = COLLECTIONS[key];
  if (!col) throw new Error(`Unknown collection: ${key}`);

  const url = `${HADITH_JSON_BASE}/${col.path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);

  const data = await res.json();
  const bookData = {
    hadiths: data.hadiths || [],
    metadata: data.metadata || {},
    chapters: data.chapters || [],
  };

  col.total = bookData.hadiths.length;
  hadithCache.set(key, bookData);
  return bookData;
}

async function fetchHadith(collection, number) {
  const book = await loadCollection(collection);
  const idx = number - 1;
  if (idx < 0 || idx >= book.hadiths.length) {
    throw new Error(`${COLLECTIONS[collection].name} has ${book.hadiths.length} hadiths.`);
  }
  const h = book.hadiths[idx];
  return {
    collection,
    hadithnumber: h.idInBook || number,
    english: h.english.text,
    narrator: h.english.narrator,
    arabic: h.arabic,
  };
}

async function fetchRandomHadith(collection) {
  if (collection) {
    const book = await loadCollection(collection);
    const idx = Math.floor(Math.random() * book.hadiths.length);
    const h = book.hadiths[idx];
    return {
      collection,
      hadithnumber: h.idInBook || (idx + 1),
      english: h.english.text,
      narrator: h.english.narrator,
      arabic: h.arabic,
    };
  }
  const key = COLLECTION_KEYS[Math.floor(Math.random() * COLLECTION_KEYS.length)];
  return fetchRandomHadith(key);
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
  const col = COLLECTIONS[data.collection] || { name: data.collection, color: 0x1A237E, emoji: "📖" };

  const embed = new EmbedBuilder()
    .setColor(col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${data.hadithnumber}` })
    .setDescription(`*"${data.english}"*`)
    .setFooter({ text: "لا علم إلا ما علَّم الله — No knowledge except what Allah has taught" })
    .setTimestamp();

  if (data.narrator) {
    embed.addFields({ name: "🎙️ Narrator", value: data.narrator, inline: false });
  }

  embed.addFields(
    { name: "📖 Collection", value: col.name,                inline: true },
    { name: "🔢 Number",     value: `#${data.hadithnumber}`, inline: true }
  );

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
        description: `${(COLLECTIONS[k].total || 0).toLocaleString()} hadiths`,
        value: k,
        emoji: COLLECTIONS[k].emoji,
      })))
  );
}

function buildHadithNavButtons(collection, num, total, showArabic = false) {
  const prev = Math.max(1, num - 1);
  const next = Math.min(total, num + 1);
  const rand = Math.floor(Math.random() * total) + 1;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`hadith_prev_${collection}_${prev}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(num <= 1),
    new ButtonBuilder().setCustomId(`hadith_next_${collection}_${next}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(num >= total),
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
    console.error("Command registration error:", e);
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
      try {
        const book = await loadCollection(colKey);
        if (num > book.hadiths.length) {
          return interaction.editReply({ embeds: [buildErrorEmbed(`${COLLECTIONS[colKey].name} has ${book.hadiths.length} hadiths.`)] });
        }
        const data = await fetchHadith(colKey, num);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, num, book.hadiths.length), buildCollectionMenu()]
        });
      } catch (e) {
        await interaction.editReply({ embeds: [buildErrorEmbed(e.message || `Could not load hadith #${num}.`)] });
      }
    }

    else if (cmd === "random") {
      const colKey = interaction.options.getString("collection") || null;
      try {
        const data = await fetchRandomHadith(colKey);
        const book = await loadCollection(data.collection);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(data.collection, data.hadithnumber, book.hadiths.length), buildCollectionMenu()]
        });
      } catch (e) {
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
      } catch {
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
      } catch {
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
      } catch {
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
      } catch {
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
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load Asma ul Husna.")] });
      }
    }

    else if (cmd === "hijri") {
      try {
        const data = await fetchTodayHijri();
        await interaction.editReply({ embeds: [buildHijriEmbed(data)] });
      } catch {
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
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load daily content.")] });
      }
    }

    else if (cmd === "collections") {
      try {
        await Promise.all(COLLECTION_KEYS.map(k => loadCollection(k).catch(() => null)));
        const total = COLLECTION_KEYS.reduce((s, k) => s + (COLLECTIONS[k].total || 0), 0);
        const embed = new EmbedBuilder()
          .setColor(0x5C4033)
          .setTitle("📚  Available Hadith Collections")
          .setDescription(
            Object.entries(COLLECTIONS).map(([, v]) =>
              `${v.emoji} **${v.name}** (${v.arabic}) — ${(v.total || 0).toLocaleString()} hadiths`
            ).join("\n") +
            `\n\n**Total: ${total.toLocaleString()} hadiths** across ${COLLECTION_KEYS.length} collections`
          )
          .setFooter({ text: "Powered by hadith-json • github.com/AhmedBaset/hadith-json" });
        await interaction.editReply({ embeds: [embed] });
      } catch (e) {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load collection data.")] });
      }
    }

    else if (cmd === "explore") {
      try {
        await Promise.all(COLLECTION_KEYS.map(k => loadCollection(k).catch(() => null)));
        const embed = new EmbedBuilder()
          .setColor(0x4E342E)
          .setTitle("📚  Islamic Knowledge Explorer")
          .setDescription(
            "Select a collection from the dropdown to start browsing.\n" +
            "Use **◀ Prev / Next ▶** to navigate hadith by hadith, or **🎲 Random** to jump.\n\n" +
            Object.entries(COLLECTIONS).map(([, v]) =>
              `${v.emoji} **${v.name}** — ${(v.total || 0).toLocaleString()} hadiths`
            ).join("\n")
          )
          .setFooter({ text: "بسم الله الرحمن الرحيم • In the name of Allah" });
        await interaction.editReply({ embeds: [embed], components: [buildCollectionMenu()] });
      } catch (e) {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load explorer.")] });
      }
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
      try {
        const book = await loadCollection(colKey);
        const data = await fetchHadith(colKey, 1);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, 1, book.hadiths.length), buildCollectionMenu()]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that collection.")] });
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
      } catch {
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
      } catch {
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
      } catch {
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
        const book = await loadCollection(colKey);
        const data = await fetchHadith(colKey, num);
        await interaction.editReply({
          embeds: [buildHadithEmbed(data)],
          components: [buildHadithNavButtons(colKey, num, book.hadiths.length), buildCollectionMenu()]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load hadith #${num}.`)] });
      }
    }

    // Hadith Arabic toggle
    else if (id.startsWith("hadith_arabic_")) {
      await interaction.deferUpdate();
      const colKey = parts[2];
      const num    = parseInt(parts[3]);
      try {
        const book      = await loadCollection(colKey);
        const data      = await fetchHadith(colKey, num);
        const hasArabic = interaction.message.embeds[0]?.fields?.some(f => f.name === "🕌 Arabic") || false;
        await interaction.editReply({
          embeds: [buildHadithEmbed(data, !hasArabic)],
          components: [buildHadithNavButtons(colKey, num, book.hadiths.length, !hasArabic), buildCollectionMenu()]
        });
      } catch {
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
      } catch {
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
      } catch {
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
      } catch {
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
      } catch {
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
      } catch {
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
