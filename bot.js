/**
 * ═══════════════════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT  —  v3.0
 *
 *   Quran  → AlQuran Cloud  (api.alquran.cloud/v1)
 *   Hadith → sunnah.com API (api.sunnah.com/v1)  ← ALL collections
 *            Al-Silsila Al-Sahiha → UmmahAPI (not on sunnah.com)
 *   Tafsir → UmmahAPI
 *   Duas   → UmmahAPI  (source display fully fixed)
 *   Asma   → UmmahAPI
 *   Hijri  → UmmahAPI
 *
 *   Confirmed sunnah.com slugs (verified from sunnah.com URLs):
 *     bukhari · muslim · abudawud · tirmidhi · ibnmajah · nasai
 *     malik · ahmad · darimi · nawawi40 · riyadussalihin
 *     adab · shamail · bulugh
 *
 *   .env keys needed:
 *     DISCORD_TOKEN=...
 *     SUNNAH_API_KEY=...   (free key → github.com/sunnah-com/api/issues/new)
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
const UMMAH_API  = "https://ummahapi.com/api";
const QURAN_API  = "https://api.alquran.cloud/v1";
const SUNNAH_API = "https://api.sunnah.com/v1";

// ─────────────────────────────────────────────────────
//  HADITH COLLECTIONS
//  slug   = sunnah.com collection identifier
//           (matches sunnah.com/<slug> URLs exactly)
//  source = "sunnah" | "ummah"
// ─────────────────────────────────────────────────────
const COLLECTIONS = {
  // ── The Six (Kutub as-Sittah) ──
  bukhari:        { name: "Sahih al-Bukhari",              arabic: "صحيح البخاري",      color: 0x1B5E20, emoji: "📗", total: 7563, source: "sunnah", slug: "bukhari"         },
  muslim:         { name: "Sahih Muslim",                  arabic: "صحيح مسلم",         color: 0x0D47A1, emoji: "📘", total: 7470, source: "sunnah", slug: "muslim"          },
  abudawud:       { name: "Sunan Abu Dawud",               arabic: "سنن أبي داود",      color: 0x4A148C, emoji: "📙", total: 5274, source: "sunnah", slug: "abudawud"        },
  tirmidhi:       { name: "Jami at-Tirmidhi",              arabic: "جامع الترمذي",      color: 0x880E4F, emoji: "📕", total: 3956, source: "sunnah", slug: "tirmidhi"        },
  ibnmajah:       { name: "Sunan Ibn Majah",               arabic: "سنن ابن ماجه",      color: 0x004D40, emoji: "📒", total: 4341, source: "sunnah", slug: "ibnmajah"        },
  nasai:          { name: "Sunan an-Nasa'i",               arabic: "سنن النسائي",       color: 0x37474F, emoji: "📓", total: 5758, source: "sunnah", slug: "nasai"           },
  // ── Muwatta ──
  malik:          { name: "Muwatta Malik",                 arabic: "موطأ مالك",         color: 0x6D4C41, emoji: "📔", total: 1858, source: "sunnah", slug: "malik"           },
  // ── Musnad / Sunan ──
  ahmad:          { name: "Musnad Ahmad",                  arabic: "مسند أحمد",         color: 0x4E342E, emoji: "📋", total: 4305, source: "sunnah", slug: "ahmad"           },
  darimi:         { name: "Sunan ad-Darimi",               arabic: "سنن الدارمي",       color: 0x1A237E, emoji: "📰", total: 3367, source: "sunnah", slug: "darimi"          },
  // ── Secondary Sources ──
  riyadussalihin: { name: "Riyad as-Salihin",              arabic: "رياض الصالحين",     color: 0x006064, emoji: "🌿", total: 1896, source: "sunnah", slug: "riyadussalihin"  },
  adab:           { name: "Al-Adab Al-Mufrad",             arabic: "الأدب المفرد",      color: 0x558B2F, emoji: "🌱", total: 1322, source: "sunnah", slug: "adab"            },
  shamail:        { name: "Ash-Shama'il Al-Muhammadiyah",  arabic: "الشمائل المحمدية",  color: 0x7B1FA2, emoji: "🌙", total: 397,  source: "sunnah", slug: "shamail"         },
  bulugh:         { name: "Bulugh al-Maram",               arabic: "بلوغ المرام",       color: 0x4527A0, emoji: "⚖️", total: 1597, source: "sunnah", slug: "bulugh"          },
  nawawi40:       { name: "An-Nawawi's 40 Hadith",         arabic: "الأربعون النووية",  color: 0x00695C, emoji: "🕌", total: 42,   source: "sunnah", slug: "nawawi40"        },
  // ── UmmahAPI only (not on sunnah.com) ──
  silsila:        { name: "Al-Silsila Al-Sahiha",          arabic: "السلسلة الصحيحة",   color: 0xBF360C, emoji: "✅", total: 4035, source: "ummah",  slug: null              },
};
const COLLECTION_KEYS = Object.keys(COLLECTIONS);

// ─────────────────────────────────────────────────────
//  QURAN TRANSLATIONS
// ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  sahih_international: { name: "Saheeh International", flag: "🇬🇧", lang: "English", edition: "en.sahih"     },
  pickthall:           { name: "Marmaduke Pickthall",  flag: "🇬🇧", lang: "English", edition: "en.pickthall" },
  yusuf_ali:           { name: "Yusuf Ali",            flag: "🇬🇧", lang: "English", edition: "en.yusufali"  },
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
  marriage:         { name: "Marriage & Family",   emoji: "👨‍👩‍👧", count: 4  },
  hajj:             { name: "Hajj & Umrah",        emoji: "🕋", count: 4  },
  grief:            { name: "Grief & Loss",        emoji: "🤲", count: 4  },
  children:         { name: "Children",            emoji: "👶", count: 4  },
  night_prayer:     { name: "Night Prayer",        emoji: "⭐", count: 4  },
  quran_recitation: { name: "Quran Recitation",    emoji: "📜", count: 3  },
};
const DUA_CATEGORY_KEYS = Object.keys(DUA_CATEGORIES);

// ─────────────────────────────────────────────────────
//  OLD-STYLE CITATION RESOLVER
// ─────────────────────────────────────────────────────
const CITATION_MAP = {
  "Abu Dawud 2:39":    "Sunan Abi Dawud 1425",
  "At-Tirmidhi 1:464": "Jami at-Tirmidhi 464",
  "Tirmidhi 1:464":    "Jami at-Tirmidhi 464",
};

function resolveSource(raw) {
  if (!raw) return null;
  const cleaned = stripHtml(raw).trim();
  if (!cleaned || cleaned.toLowerCase() === "null" || cleaned === "undefined") return null;
  const resolved = cleaned.replace(/([A-Za-z\s\-.'']+)\s+(\d+):(\d+)/g, m => CITATION_MAP[m.trim()] || m);
  return resolved.length > 200 ? resolved.substring(0, 200) + "…" : resolved;
}

// ─────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────
function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .trim();
}
function cap(str, max = 4000) {
  if (!str) return "";
  return str.length > max ? str.substring(0, max) + "…" : str;
}

// ─────────────────────────────────────────────────────
//  API HELPERS
// ─────────────────────────────────────────────────────
async function ummahFetch(path) {
  const res = await fetch(`${UMMAH_API}${path}`);
  if (!res.ok) throw new Error(`UmmahAPI HTTP ${res.status} — ${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(`UmmahAPI error — ${path}`);
  return json.data;
}

async function sunnahFetch(path) {
  const key = process.env.SUNNAH_API_KEY;
  if (!key) throw new Error("SUNNAH_API_KEY not set");
  const res = await fetch(`${SUNNAH_API}${path}`, {
    headers: { "Accept": "application/json", "X-API-Key": key },
  });
  if (!res.ok) throw new Error(`sunnah.com HTTP ${res.status} — ${path}`);
  return res.json();
}

function normaliseSunnah(item, colKey) {
  const col      = COLLECTIONS[colKey] || {};
  const enH      = Array.isArray(item.hadith) ? item.hadith.find(h => h.lang === "en") || item.hadith[0] : null;
  const arH      = Array.isArray(item.hadith) ? item.hadith.find(h => h.lang === "ar") : null;
  return {
    collection:      colKey,
    collection_name: col.name || colKey,
    hadithnumber:    item.hadithnumber ?? item.hadithNumber ?? item.number ?? "?",
    english:         stripHtml(enH?.body || item.text || item.english || ""),
    arabic:          stripHtml(arH?.body || item.arabic || ""),
    grade:           enH?.grades?.[0]?.grade || item.grade || null,
  };
}

async function fetchHadith(colKey, number) {
  const col = COLLECTIONS[colKey];
  if (!col) throw new Error(`Unknown collection: ${colKey}`);
  if (col.source === "sunnah" && col.slug) {
    try {
      const data = await sunnahFetch(`/collections/${col.slug}/hadiths/${number}`);
      return normaliseSunnah(data, colKey);
    } catch (e) {
      console.warn(`sunnah.com failed (${colKey}/${number}): ${e.message} — trying UmmahAPI`);
    }
  }
  return ummahFetch(`/hadith/${colKey}/${number}`);
}

async function fetchRandomHadith(colKey) {
  if (colKey) {
    const col = COLLECTIONS[colKey];
    if (col?.source === "sunnah" && col.slug) {
      try {
        const num  = Math.floor(Math.random() * col.total) + 1;
        const data = await sunnahFetch(`/collections/${col.slug}/hadiths/${num}`);
        return normaliseSunnah(data, colKey);
      } catch (e) {
        console.warn(`sunnah.com random failed (${colKey}): ${e.message}`);
      }
    }
    return ummahFetch(`/hadith/${colKey}/random`);
  }
  // No collection — pick random from sunnah collections
  const sunnahKeys = COLLECTION_KEYS.filter(k => COLLECTIONS[k].source === "sunnah");
  const rKey = sunnahKeys[Math.floor(Math.random() * sunnahKeys.length)];
  const col  = COLLECTIONS[rKey];
  try {
    const num  = Math.floor(Math.random() * col.total) + 1;
    const data = await sunnahFetch(`/collections/${col.slug}/hadiths/${num}`);
    return normaliseSunnah(data, rKey);
  } catch {
    return ummahFetch(`/hadith/random`);
  }
}

// ── Quran ──
async function fetchAyah(surah, ayah, transKey = DEFAULT_TRANSLATION) {
  const edition = TRANSLATIONS[transKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  const res = await fetch(`${QURAN_API}/ayah/${surah}:${ayah}/editions/quran-uthmani,${edition}`);
  if (!res.ok) throw new Error(`AlQuran HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran error: ${json.status}`);
  const ar = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const tr = json.data.find(d => d.edition.identifier === edition);
  if (!ar || !tr) throw new Error("Invalid AlQuran response");
  return {
    surah: { name_english: ar.surah.englishName, name_arabic: ar.surah.name, number: ar.surah.number },
    verse: { verse_key: `${surah}:${ayah}`, arabic: ar.text, text: stripHtml(tr.text), surah_total_ayahs: ar.surah.numberOfAyahs },
  };
}

async function fetchRandomAyah(transKey = DEFAULT_TRANSLATION) {
  const edition = TRANSLATIONS[transKey]?.edition || TRANSLATIONS[DEFAULT_TRANSLATION].edition;
  const res = await fetch(`${QURAN_API}/ayah/random/editions/quran-uthmani,${edition}`);
  if (!res.ok) throw new Error(`AlQuran HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran error: ${json.status}`);
  const ar = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const tr = json.data.find(d => d.edition.identifier === edition);
  if (!ar || !tr) throw new Error("Invalid AlQuran response");
  return {
    surah: { name_english: ar.surah.englishName, name_arabic: ar.surah.name, number: ar.surah.number },
    verse: { verse_key: `${ar.surah.number}:${ar.numberInSurah}`, arabic: ar.text, text: stripHtml(tr.text), surah_total_ayahs: ar.surah.numberOfAyahs },
  };
}

// ── Other ──
async function fetchTafsir(k, s, a)  { return ummahFetch(`/tafsir/${k}/surah/${s}/ayah/${a}`); }
async function fetchRandomDua()       { return ummahFetch(`/duas/random`); }
async function fetchDuasByCategory(c) { return ummahFetch(`/duas/category/${c}`); }
async function fetchAllAsma()         { return ummahFetch(`/asma-ul-husna`); }
async function fetchTodayHijri()      { return ummahFetch(`/today-hijri`); }

// ─────────────────────────────────────────────────────
//  EMBED BUILDERS
// ─────────────────────────────────────────────────────
function buildHadithEmbed(data, showArabic = false) {
  const col = COLLECTIONS[data.collection] || { name: data.collection_name || "Hadith", color: 0x1A237E, emoji: "📖" };
  const GRADES = {
    "Sahih":           { label: "Sahih — Authentic",  emoji: "🟢", color: 0x1B5E20 },
    "Hasan":           { label: "Hasan — Good",        emoji: "🟡", color: 0xF9A825 },
    "Hasan Sahih":     { label: "Hasan Sahih",          emoji: "🟢", color: 0x2E7D32 },
    "Sahih Lighayrih": { label: "Sahih Lighayrih",      emoji: "🟢", color: 0x388E3C },
    "Daif":            { label: "Da'if — Weak",          emoji: "🔴", color: 0xB71C1C },
    "Da'if":           { label: "Da'if — Weak",          emoji: "🔴", color: 0xB71C1C },
    "Mawdu":           { label: "Mawdu' — Fabricated",   emoji: "⛔", color: 0x880000 },
  };
  const g = data.grade ? (GRADES[data.grade] || { label: data.grade, emoji: "⚪", color: null }) : null;

  const embed = new EmbedBuilder()
    .setColor(g?.color || col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${data.hadithnumber}` })
    .setDescription(`*"${cap(data.english || "No text available.", 3900)}"*`)
    .setFooter({ text: "لا علم إلا ما علَّم الله — No knowledge except what Allah has taught" })
    .setTimestamp();

  if (g) embed.addFields({ name: "📊 Grade", value: `${g.emoji} **${g.label}**`, inline: true });
  embed.addFields(
    { name: "📖 Collection", value: col.name,                inline: true },
    { name: "🔢 Number",     value: `#${data.hadithnumber}`, inline: true },
  );
  if (showArabic && data.arabic) {
    embed.addFields({ name: "🕌 Arabic", value: `\`\`\`${cap(data.arabic, 1000)}\`\`\`` });
  }
  return embed;
}

function buildAyahEmbed(data, transKey = DEFAULT_TRANSLATION) {
  const surah = data.surah, verse = data.verse;
  const trans = TRANSLATIONS[transKey] || TRANSLATIONS[DEFAULT_TRANSLATION];
  const embed = new EmbedBuilder()
    .setColor(0x1B5E20)
    .setAuthor({ name: `📖  ${surah.name_english} (${surah.name_arabic})  •  Ayah ${verse.verse_key}` })
    .setDescription(`*"${cap(verse.text || "Translation unavailable.", 2000)}"*`);
  if (verse.arabic) embed.addFields({ name: "🕌 Arabic", value: cap(verse.arabic, 1000) });
  embed.addFields(
    { name: "📍 Reference",   value: verse.verse_key,               inline: true },
    { name: "🌐 Translation", value: `${trans.flag} ${trans.name}`, inline: true },
    { name: "🗣️ Language",   value: trans.lang,                     inline: true },
  );
  embed.setFooter({ text: "القرآن الكريم — The Noble Quran" }).setTimestamp();
  return embed;
}

function buildTafsirEmbed(data, tafsirKey) {
  const info = TAFSIR_EDITIONS[tafsirKey] || { name: tafsirKey, scholar: "", lang: "Unknown", flag: "📚" };
  const raw  = data.tafsir?.text || "Tafsir text unavailable for this ayah.";
  const text = raw.length > 3900 ? raw.substring(0, 3900) + "\n\n*(Truncated)*" : raw;
  return new EmbedBuilder()
    .setColor(0x4A148C)
    .setAuthor({ name: `${info.flag}  ${info.name}  •  Ayah ${data.verse_key}` })
    .setTitle(`📚 Tafsir — ${info.scholar}`)
    .setDescription(text)
    .addFields(
      { name: "📖 Scholar",  value: info.scholar || "—",  inline: true },
      { name: "🗣️ Language", value: info.lang,             inline: true },
      { name: "📍 Ayah",     value: data.verse_key || "—", inline: true },
    )
    .setFooter({ text: "Tafsir via UmmahAPI • تفسير القرآن الكريم" })
    .setTimestamp();
}

function buildDuaEmbed(dua) {
  const cat    = DUA_CATEGORIES[dua.category] || { name: dua.category_info?.name || dua.category || "Du'a", emoji: "🤲" };
  const reps   = dua.repeat > 1 ? `\n\n*Repeat: **${dua.repeat}x***` : "";
  const source = resolveSource(dua.source || dua.reference || dua.hadith_source || dua.hadith_ref || dua.citation || "") || "Authentic Sunnah";
  const body   = cap(`**${dua.arabic || ""}**\n\n*${dua.transliteration || ""}*\n\n"${dua.translation || ""}"${reps}`, 4000);
  return new EmbedBuilder()
    .setColor(0x006064)
    .setAuthor({ name: `${cat.emoji}  ${cat.name}  •  Du'a #${dua.id}` })
    .setTitle(cap(dua.title || "Du'a", 256))
    .setDescription(body)
    .addFields(
      { name: "📚 Source",   value: source,   inline: true },
      { name: "📂 Category", value: cat.name, inline: true },
    )
    .setFooter({ text: "ادْعُونِي أَسْتَجِبْ لَكُمْ — Call upon Me; I will respond to you. (Quran 40:60)" })
    .setTimestamp();
}

function buildAsmaEmbed(name) {
  return new EmbedBuilder()
    .setColor(0x1A237E)
    .setAuthor({ name: `✨  Asma ul Husna — Name #${name.number} of 99` })
    .setTitle(`${name.arabic}  •  ${name.transliteration}`)
    .setDescription(cap(`**"${name.meaning}"**\n\n${name.description || ""}`, 4000))
    .addFields(
      { name: "🔢 Number",          value: `${name.number} / 99`, inline: true },
      { name: "🔤 Transliteration", value: name.transliteration,  inline: true },
      { name: "💬 Meaning",         value: name.meaning,           inline: true },
    )
    .setFooter({ text: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ — To Allah belong the best names (Quran 7:180)" })
    .setTimestamp();
}

function buildHijriEmbed(data) {
  const h = data.hijri, g = data.gregorian;
  return new EmbedBuilder()
    .setColor(0x3E2723)
    .setTitle("🌙  Today's Islamic Date")
    .addFields(
      { name: "🗓️ Hijri Date",     value: `**${h.day} ${h.month_name} ${h.year} AH**`,              inline: false },
      { name: "📅 Gregorian Date", value: g.formatted || `${g.day}/${g.month}/${g.year}`, inline: false },
    )
    .setFooter({ text: "UmmahAPI • Hijri Calendar" }).setTimestamp();
}

function buildErrorEmbed(msg) {
  return new EmbedBuilder()
    .setColor(0xB71C1C)
    .setTitle("⚠️  Could not load")
    .setDescription(cap(msg, 1000))
    .setFooter({ text: "Try a different number or check your input" });
}

// ─────────────────────────────────────────────────────
//  COMPONENT BUILDERS
// ─────────────────────────────────────────────────────
function buildCollectionMenus() {
  const rows = [];
  for (let i = 0; i < COLLECTION_KEYS.length; i += 25) {
    const slice  = COLLECTION_KEYS.slice(i, i + 25);
    const rowNum = Math.floor(i / 25) + 1;
    rows.push(new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`select_col_${rowNum}`)
        .setPlaceholder(rowNum === 1 ? "Switch collection…" : "More collections…")
        .addOptions(slice.map(k => ({
          label:       COLLECTIONS[k].name,
          description: `${COLLECTIONS[k].total.toLocaleString()} hadiths`,
          value:       k,
          emoji:       COLLECTIONS[k].emoji,
        })))
    ));
  }
  return rows;
}

function buildHadithNavButtons(colKey, num, showArabic = false) {
  const col  = COLLECTIONS[colKey] || { total: 9999 };
  const prev = Math.max(1, num - 1);
  const next = Math.min(col.total, num + 1);
  const rand = Math.floor(Math.random() * col.total) + 1;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`hadith_prev_${colKey}_${prev}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(num <= 1),
    new ButtonBuilder().setCustomId(`hadith_next_${colKey}_${next}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(num >= col.total),
    new ButtonBuilder().setCustomId(`hadith_rand_${colKey}_${rand}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`hadith_arabic_${colKey}_${num}`).setLabel(showArabic ? "Hide Arabic" : "🕌 Arabic").setStyle(ButtonStyle.Secondary),
  );
}

function buildTranslationMenu(currentKey, surah, ayah, maxAyah) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select_translation_${surah}_${ayah}_${maxAyah}`)
      .setPlaceholder("Switch translation…")
      .addOptions(TRANSLATION_KEYS.map(k => ({
        label: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, description: TRANSLATIONS[k].lang, value: k, default: k === currentKey,
      })))
  );
}

function buildAyahNavButtons(surah, ayah, maxAyah, transKey) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ayah_prev_${surah}_${Math.max(1,ayah-1)}_${maxAyah}_${transKey}`).setLabel("◀ Prev Ayah").setStyle(ButtonStyle.Secondary).setDisabled(ayah<=1),
    new ButtonBuilder().setCustomId(`ayah_next_${surah}_${Math.min(maxAyah,ayah+1)}_${maxAyah}_${transKey}`).setLabel("Next Ayah ▶").setStyle(ButtonStyle.Secondary).setDisabled(ayah>=maxAyah),
    new ButtonBuilder().setCustomId(`ayah_rand_${transKey}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`tafsir_open_${surah}_${ayah}`).setLabel("📚 Tafsir").setStyle(ButtonStyle.Success),
  );
}

function buildTafsirSelectMenu(surah, ayah) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_tafsir")
      .setPlaceholder("📚 Choose a Tafsir…")
      .addOptions(Object.entries(TAFSIR_EDITIONS).map(([k, v]) => ({
        label: `${v.flag} ${v.name}`, description: `${v.scholar} • ${v.lang}`, value: `${k}|${surah}|${ayah}`,
      })))
  );
}

function buildDuaCategoryMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_dua_category")
      .setPlaceholder("📂 Choose a category…")
      .addOptions(DUA_CATEGORY_KEYS.slice(0, 25).map(k => ({
        label: `${DUA_CATEGORIES[k].emoji} ${DUA_CATEGORIES[k].name}`, description: `${DUA_CATEGORIES[k].count} duas`, value: k,
      })))
  );
}

function buildDuaNavButtons(category, index, total) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`dua_prev_${category}_${Math.max(0,index-1)}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(index<=0),
    new ButtonBuilder().setCustomId(`dua_next_${category}_${Math.min(total-1,index+1)}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(index>=total-1),
    new ButtonBuilder().setCustomId("dua_rand").setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
  );
}

function buildAsmaNavButtons(num) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`asma_prev_${Math.max(1,num-1)}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(num<=1),
    new ButtonBuilder().setCustomId(`asma_next_${Math.min(99,num+1)}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(num>=99),
    new ButtonBuilder().setCustomId(`asma_rand_${Math.floor(Math.random()*99)+1}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
  );
}

// ─────────────────────────────────────────────────────
//  SLASH COMMANDS
// ─────────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName("hadith").setDescription("Get a specific hadith by collection and number")
    .addStringOption(o => o.setName("collection").setDescription("Hadith collection").setRequired(true)
      .addChoices(...COLLECTION_KEYS.map(k => ({ name: COLLECTIONS[k].name, value: k }))))
    .addIntegerOption(o => o.setName("number").setDescription("Hadith number").setRequired(true).setMinValue(1)),

  new SlashCommandBuilder()
    .setName("random").setDescription("Get a random hadith (optionally from a specific collection)")
    .addStringOption(o => o.setName("collection").setDescription("Collection (leave blank for any)")
      .addChoices(...COLLECTION_KEYS.map(k => ({ name: COLLECTIONS[k].name, value: k })))),

  new SlashCommandBuilder()
    .setName("ayah").setDescription("Get a Quran verse by surah and ayah number")
    .addIntegerOption(o => o.setName("surah").setDescription("Surah number (1–114)").setRequired(true).setMinValue(1).setMaxValue(114))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("translation").setDescription("Translation (default: Saheeh International)")
      .addChoices(...TRANSLATION_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder()
    .setName("randomayah").setDescription("Get a random Quran verse")
    .addStringOption(o => o.setName("translation").setDescription("Translation (default: Saheeh International)")
      .addChoices(...TRANSLATION_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder()
    .setName("tafsir").setDescription("Get Tafsir (scholarly commentary) for a Quran verse")
    .addIntegerOption(o => o.setName("surah").setDescription("Surah number (1–114)").setRequired(true).setMinValue(1).setMaxValue(114))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("scholar").setDescription("Choose the tafsir (default: Ibn Kathir)")
      .addChoices(...Object.entries(TAFSIR_EDITIONS).map(([k, v]) => ({ name: `${v.flag} ${v.name} (${v.lang})`, value: k })))),

  new SlashCommandBuilder()
    .setName("dua").setDescription("Browse authentic duas by category or get a random one")
    .addStringOption(o => o.setName("category").setDescription("Dua category (leave blank for random)")
      .addChoices(...DUA_CATEGORY_KEYS.slice(0, 25).map(k => ({ name: `${DUA_CATEGORIES[k].emoji} ${DUA_CATEGORIES[k].name}`, value: k })))),

  new SlashCommandBuilder()
    .setName("asmaallah").setDescription("Browse the 99 Names of Allah (Asma ul Husna)")
    .addIntegerOption(o => o.setName("number").setDescription("Name number 1–99, leave blank to start from 1").setMinValue(1).setMaxValue(99)),

  new SlashCommandBuilder().setName("hijri").setDescription("Get today's Islamic (Hijri) date"),
  new SlashCommandBuilder().setName("daily").setDescription("Today's daily reminder — hadith, ayah, and dua"),
  new SlashCommandBuilder().setName("collections").setDescription("List all available hadith collections"),
  new SlashCommandBuilder().setName("explore").setDescription("Open an interactive hadith collection explorer"),
].map(c => c.toJSON());

// ─────────────────────────────────────────────────────
//  BOT READY
// ─────────────────────────────────────────────────────
client.once("ready", async () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);

  const statusEnv = process.env.BOT_STATUS || "WATCHING:📖 Quran | /ayah /hadith /dua";
  const [typeRaw, ...parts] = statusEnv.split(":");
  const TYPES = { PLAYING: 0, STREAMING: 1, LISTENING: 2, WATCHING: 3, COMPETING: 5, CUSTOM: 4 };
  client.user.setPresence({
    activities: [{ name: parts.join(":"), type: TYPES[typeRaw.toUpperCase()] ?? 3 }],
    status: process.env.BOT_ONLINE_STATUS || "online",
  });

  if (process.env.SUNNAH_API_KEY) {
    console.log("✅ SUNNAH_API_KEY found — sunnah.com is primary hadith source");
  } else {
    console.warn("⚠️  SUNNAH_API_KEY not set — hadiths will fall back to UmmahAPI");
  }

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Slash commands registered globally");
  } catch (e) { console.error("Command registration error:", e); }
});

// ─────────────────────────────────────────────────────
//  INTERACTION HANDLER
// ─────────────────────────────────────────────────────
client.on("interactionCreate", async interaction => {

  // ── SLASH COMMANDS ──
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply();
    const cmd = interaction.commandName;

    if (cmd === "hadith") {
      const colKey = interaction.options.getString("collection");
      const num    = interaction.options.getInteger("number");
      const col    = COLLECTIONS[colKey];
      if (col && num > col.total)
        return interaction.editReply({ embeds: [buildErrorEmbed(`${col.name} only has up to #${col.total}.`)] });
      try {
        const data = await fetchHadith(colKey, num);
        await interaction.editReply({ embeds: [buildHadithEmbed(data)], components: [buildHadithNavButtons(colKey, num), ...buildCollectionMenus()] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load hadith #${num} from ${COLLECTIONS[colKey]?.name || colKey}.`)] });
      }
    }

    else if (cmd === "random") {
      const colKey = interaction.options.getString("collection") || null;
      try {
        const data        = await fetchRandomHadith(colKey);
        const resolvedKey = data.collection || colKey || COLLECTION_KEYS[0];
        await interaction.editReply({ embeds: [buildHadithEmbed(data)], components: [buildHadithNavButtons(resolvedKey, data.hadithnumber || 1), ...buildCollectionMenus()] });
      } catch (e) {
        console.error(e);
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
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, surah, ayahNum, maxAyah), buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load ${surah}:${ayahNum}.`)] });
      }
    }

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

    else if (cmd === "tafsir") {
      const surah     = interaction.options.getInteger("surah");
      const ayahNum   = interaction.options.getInteger("ayah");
      const tafsirKey = interaction.options.getString("scholar") || "ibn_kathir";
      try {
        const data = await fetchTafsir(tafsirKey, surah, ayahNum);
        await interaction.editReply({ embeds: [buildTafsirEmbed(data, tafsirKey)], components: [buildTafsirSelectMenu(surah, ayahNum)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load tafsir for ${surah}:${ayahNum}.`)] });
      }
    }

    else if (cmd === "dua") {
      const category = interaction.options.getString("category");
      try {
        if (category) {
          const resp = await fetchDuasByCategory(category);
          const duas = Array.isArray(resp) ? resp : (resp.duas || []);
          if (!duas.length) return interaction.editReply({ embeds: [buildErrorEmbed("No duas found for that category.")] });
          await interaction.editReply({ embeds: [buildDuaEmbed(duas[0])], components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, 0, duas.length)] });
        } else {
          const data = await fetchRandomDua();
          await interaction.editReply({ embeds: [buildDuaEmbed(data)], components: [buildDuaCategoryMenu()] });
        }
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a du'a.")] });
      }
    }

    else if (cmd === "asmaallah") {
      const num = interaction.options.getInteger("number") || 1;
      try {
        const resp  = await fetchAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [buildErrorEmbed(`Name #${num} not found.`)] });
        await interaction.editReply({ embeds: [buildAsmaEmbed(name)], components: [buildAsmaNavButtons(num)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load Asma ul Husna.")] });
      }
    }

    else if (cmd === "hijri") {
      try {
        await interaction.editReply({ embeds: [buildHijriEmbed(await fetchTodayHijri())] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch Hijri date.")] });
      }
    }

    else if (cmd === "daily") {
      try {
        const [hadithData, ayahData, duaData, hijriData] = await Promise.all([
          fetchRandomHadith(null), fetchRandomAyah(DEFAULT_TRANSLATION), fetchRandomDua(), fetchTodayHijri().catch(() => null),
        ]);
        const hE = buildHadithEmbed(hadithData); hE.setTitle("🌅  Daily Hadith");
        const aE = buildAyahEmbed(ayahData, DEFAULT_TRANSLATION); aE.setTitle("📖  Daily Ayah");
        const dE = buildDuaEmbed(duaData); dE.setTitle("🤲  Daily Du'a");
        await interaction.editReply({ embeds: hijriData ? [buildHijriEmbed(hijriData), hE, aE, dE] : [hE, aE, dE] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load daily content.")] });
      }
    }

    else if (cmd === "collections") {
      const total = Object.values(COLLECTIONS).reduce((s, c) => s + c.total, 0);
      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0x5C4033).setTitle("📚  Available Hadith Collections")
          .setDescription(
            Object.entries(COLLECTIONS).map(([, v]) => `${v.emoji} **${v.name}** (${v.arabic}) — ${v.total.toLocaleString()} hadiths`).join("\n") +
            `\n\n**Total: ${total.toLocaleString()} hadiths** across ${COLLECTION_KEYS.length} collections`
          )
          .setFooter({ text: "sunnah.com API + UmmahAPI" })],
      });
    }

    else if (cmd === "explore") {
      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0x4E342E).setTitle("📚  Islamic Knowledge Explorer")
          .setDescription(
            "Select a collection from the dropdown to start browsing.\n" +
            "Use **◀ Prev / Next ▶** to navigate, or **🎲 Random** to jump.\n\n" +
            Object.entries(COLLECTIONS).map(([, v]) => `${v.emoji} **${v.name}** — ${v.total.toLocaleString()} hadiths`).join("\n")
          )
          .setFooter({ text: "بسم الله الرحمن الرحيم • In the name of Allah" })],
        components: buildCollectionMenus(),
      });
    }

    else {
      await interaction.editReply({ embeds: [buildErrorEmbed(`Unknown command: /${cmd}`)] });
    }
  }

  // ── SELECT MENUS ──
  else if (interaction.isStringSelectMenu()) {
    const cid = interaction.customId;

    if (/^select_col_\d+$/.test(cid)) {
      await interaction.deferUpdate();
      const colKey = interaction.values[0];
      try {
        const data = await fetchHadith(colKey, 1);
        await interaction.editReply({ embeds: [buildHadithEmbed(data)], components: [buildHadithNavButtons(colKey, 1), ...buildCollectionMenus()] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that collection.")] });
      }
    }

    else if (cid.startsWith("select_translation_")) {
      await interaction.deferUpdate();
      const segs = cid.split("_");
      const surah = parseInt(segs[2]), ayahNum = parseInt(segs[3]), maxAyah = parseInt(segs[4]) || 300;
      const transKey = interaction.values[0];
      try {
        const data = await fetchAyah(surah, ayahNum, transKey);
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, surah, ayahNum, maxAyah), buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not switch translation.")] });
      }
    }

    else if (cid === "select_tafsir") {
      await interaction.deferUpdate();
      const [tafsirKey, surahS, ayahS] = interaction.values[0].split("|");
      const surah = parseInt(surahS), ayahNum = parseInt(ayahS);
      try {
        const data = await fetchTafsir(tafsirKey, surah, ayahNum);
        await interaction.editReply({ embeds: [buildTafsirEmbed(data, tafsirKey)], components: [buildTafsirSelectMenu(surah, ayahNum)] });
      } catch (e) {
        console.error(e);
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
        await interaction.editReply({ embeds: [buildDuaEmbed(duas[0])], components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, 0, duas.length)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that du'a category.")] });
      }
    }
  }

  // ── BUTTONS ──
  else if (interaction.isButton()) {
    const id = interaction.customId, parts = id.split("_");

    if (id.startsWith("hadith_prev_") || id.startsWith("hadith_next_") || id.startsWith("hadith_rand_")) {
      await interaction.deferUpdate();
      const colKey = parts[2], num = parseInt(parts[3]);
      try {
        const data = await fetchHadith(colKey, num);
        await interaction.editReply({ embeds: [buildHadithEmbed(data)], components: [buildHadithNavButtons(colKey, num), ...buildCollectionMenus()] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load hadith #${num}.`)] });
      }
    }

    else if (id.startsWith("hadith_arabic_")) {
      await interaction.deferUpdate();
      const colKey = parts[2], num = parseInt(parts[3]);
      const hasAr  = interaction.message.embeds[0]?.fields?.some(f => f.name === "🕌 Arabic") || false;
      try {
        const data = await fetchHadith(colKey, num);
        await interaction.editReply({ embeds: [buildHadithEmbed(data, !hasAr)], components: [buildHadithNavButtons(colKey, num, !hasAr), ...buildCollectionMenus()] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load Arabic text.")] });
      }
    }

    else if (id.startsWith("ayah_prev_") || id.startsWith("ayah_next_")) {
      await interaction.deferUpdate();
      const surah = parseInt(parts[2]), ayahNum = parseInt(parts[3]), maxAyah = parseInt(parts[4]) || 300;
      const transKey = parts.slice(5).join("_") || DEFAULT_TRANSLATION;
      try {
        const data = await fetchAyah(surah, ayahNum, transKey);
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, surah, ayahNum, maxAyah), buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that ayah.")] });
      }
    }

    else if (id.startsWith("ayah_rand_")) {
      await interaction.deferUpdate();
      const transKey = parts.slice(2).join("_") || DEFAULT_TRANSLATION;
      try {
        const data = await fetchRandomAyah(transKey);
        const [s, a] = (data.verse?.verse_key || "1:1").split(":").map(Number);
        const maxAyah = data.verse?.surah_total_ayahs || 300;
        await interaction.editReply({ embeds: [buildAyahEmbed(data, transKey)], components: [buildTranslationMenu(transKey, s, a, maxAyah), buildAyahNavButtons(s, a, maxAyah, transKey)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load a random ayah.")] });
      }
    }

    else if (id.startsWith("tafsir_open_")) {
      await interaction.deferUpdate();
      const surah = parseInt(parts[2]), ayahNum = parseInt(parts[3]);
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0x4A148C).setTitle("📚  Choose a Tafsir")
          .setDescription(`Select a Tafsir for **${surah}:${ayahNum}** from the dropdown below.\n\n` +
            Object.entries(TAFSIR_EDITIONS).map(([,v]) => `${v.flag} **${v.name}** — *${v.scholar}* (${v.lang})`).join("\n"))
          .setFooter({ text: "تفسير القرآن الكريم — Powered by UmmahAPI" })],
        components: [buildTafsirSelectMenu(surah, ayahNum)],
      });
    }

    else if (id.startsWith("dua_prev_") || id.startsWith("dua_next_")) {
      await interaction.deferUpdate();
      const category = parts[2], index = parseInt(parts[3]);
      try {
        const resp = await fetchDuasByCategory(category);
        const duas = Array.isArray(resp) ? resp : (resp.duas || []);
        if (!duas[index]) return interaction.editReply({ embeds: [buildErrorEmbed("Du'a not found.")] });
        await interaction.editReply({ embeds: [buildDuaEmbed(duas[index])], components: [buildDuaCategoryMenu(), buildDuaNavButtons(category, index, duas.length)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that du'a.")] });
      }
    }

    else if (id === "dua_rand") {
      await interaction.deferUpdate();
      try {
        const data = await fetchRandomDua();
        await interaction.editReply({ embeds: [buildDuaEmbed(data)], components: [buildDuaCategoryMenu()] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load a random du'a.")] });
      }
    }

    else if (id.startsWith("asma_")) {
      await interaction.deferUpdate();
      const num = parseInt(parts[2]);
      try {
        const resp  = await fetchAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [buildErrorEmbed(`Name #${num} not found.`)] });
        await interaction.editReply({ embeds: [buildAsmaEmbed(name)], components: [buildAsmaNavButtons(num)] });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that name.")] });
      }
    }
  }
});

// ─────────────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────────────
if (!process.env.DISCORD_TOKEN) {
  console.error("❌  DISCORD_TOKEN not set in .env");
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
