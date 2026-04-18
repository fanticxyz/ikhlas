/**
 * ═══════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT — Full Hadith Collections
 *   Powered by fawazahmed0/hadith-api (no key needed)
 *   + AlQuran.cloud API for Quran + Tafsir
 *   Single-file — no modules folder needed
 * ═══════════════════════════════════════════════════
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
//  COLLECTION REGISTRY
// ─────────────────────────────────────────────────────
const COLLECTIONS = {
  bukhari:  { name: "Sahih al-Bukhari",     color: 0x1B5E20, emoji: "📗", edition: "eng-bukhari",  totalHadiths: 7563 },
  muslim:   { name: "Sahih Muslim",         color: 0x0D47A1, emoji: "📘", edition: "eng-muslim",   totalHadiths: 7563 },
  abudawud: { name: "Sunan Abu Dawud",      color: 0x4A148C, emoji: "📙", edition: "eng-abudawud", totalHadiths: 5274 },
  tirmidhi: { name: "Jami' al-Tirmidhi",   color: 0x880E4F, emoji: "📕", edition: "eng-tirmidhi", totalHadiths: 3956 },
  ibnmajah: { name: "Sunan Ibn Majah",      color: 0x004D40, emoji: "📒", edition: "eng-ibnmajah", totalHadiths: 4341 },
  nasai:    { name: "Sunan al-Nasai",       color: 0x37474F, emoji: "📓", edition: "eng-nasai",    totalHadiths: 5758 },
  malik:    { name: "Muwatta Imam Malik",   color: 0x6D4C41, emoji: "📔", edition: "eng-malik",    totalHadiths: 1832 },
  nawawi:   { name: "40 Hadith al-Nawawi",  color: 0x1A237E, emoji: "🌿", edition: "eng-nawawi",   totalHadiths: 42   },
  qudsi:    { name: "40 Hadith Qudsi",      color: 0x311B92, emoji: "✨", edition: "eng-qudsi",    totalHadiths: 40   },
};

const COLLECTION_KEYS = Object.keys(COLLECTIONS);
const CDN       = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const QURAN_API = "https://api.alquran.cloud/v1";

// ─────────────────────────────────────────────────────
//  QURAN TRANSLATION REGISTRY
// ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  "en.asad":        { name: "Muhammad Asad",              lang: "English",    flag: "🇬🇧" },
  "en.pickthall":   { name: "Marmaduke Pickthall",        lang: "English",    flag: "🇬🇧" },
  "en.sahih":       { name: "Saheeh International",       lang: "English",    flag: "🇬🇧" },
  "en.yusufali":    { name: "Yusuf Ali",                  lang: "English",    flag: "🇬🇧" },
  "en.hilali":      { name: "Al-Hilali & Khan",           lang: "English",    flag: "🇸🇦" },
  "en.itani":       { name: "Clear Quran (Talal Itani)",  lang: "English",    flag: "🇬🇧" },
  "ar.muyassar":    { name: "Al-Tafsir Al-Muyassar",      lang: "Arabic",     flag: "🇸🇦" },
  "fr.hamidullah":  { name: "Muhammad Hamidullah",        lang: "French",     flag: "🇫🇷" },
  "de.bubenheim":   { name: "Bubenheim & Elyas",          lang: "German",     flag: "🇩🇪" },
  "tr.diyanet":     { name: "Diyanet Isleri",             lang: "Turkish",    flag: "🇹🇷" },
  "ur.jalandhry":   { name: "Fateh Muhammad Jalandhry",   lang: "Urdu",       flag: "🇵🇰" },
  "ur.ahmedali":    { name: "Ahmed Ali",                  lang: "Urdu",       flag: "🇵🇰" },
  "ru.kuliev":      { name: "Elmir Kuliev",               lang: "Russian",    flag: "🇷🇺" },
  "bn.bengali":     { name: "Muhiuddin Khan",             lang: "Bengali",    flag: "🇧🇩" },
  "id.indonesian":  { name: "Indonesian Ministry",        lang: "Indonesian", flag: "🇮🇩" },
  "ms.basmeih":     { name: "Abdullah Muhammad Basmeih",  lang: "Malay",      flag: "🇲🇾" },
  "zh.majian":      { name: "Ma Jian",                    lang: "Chinese",    flag: "🇨🇳" },
  "es.cortes":      { name: "Julio Cortes",               lang: "Spanish",    flag: "🇪🇸" },
};

const TRANSLATION_KEYS = Object.keys(TRANSLATIONS);
const DEFAULT_TRANSLATION = "en.sahih";

// ─────────────────────────────────────────────────────
//  TAFSIR REGISTRY
//  Source: spa5k/tafsir_api via jsDelivr CDN (free, no key)
//  URL format: {TAFSIR_API}/{slug}/{surah}/{ayah}.json
// ─────────────────────────────────────────────────────
const TAFSIR_API = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir";

const TAFSIR_EDITIONS = {
  // ── English ──────────────────────────────────────────────────────────────────
  "en-tafsir-ibn-kathir":        { name: "Tafsir Ibn Kathir",       scholar: "Hafiz Ibn Kathir",        lang: "English", flag: "🇬🇧" },
  "en-al-jalalayn":              { name: "Tafsir al-Jalalayn",      scholar: "Al-Suyuti & Al-Mahalli",  lang: "English", flag: "🇬🇧" },
  "en-tafsir-maarif-ul-quran":   { name: "Maarif ul Quran",         scholar: "Mufti Muhammad Shafi",    lang: "English", flag: "🇬🇧" },
  "en-tafisr-al-tabari":         { name: "Tafsir al-Tabari",        scholar: "Imam al-Tabari",          lang: "English", flag: "🇬🇧" },
  // ── Arabic ───────────────────────────────────────────────────────────────────
  "ar-tafsir-ibn-kathir":        { name: "Tafsir Ibn Kathir (Ar)",  scholar: "Hafiz Ibn Kathir",        lang: "Arabic",  flag: "🇸🇦" },
  "ar-tafsir-al-tabari":         { name: "Tafsir al-Tabari (Ar)",   scholar: "Imam al-Tabari",          lang: "Arabic",  flag: "🇸🇦" },
  "ar-tafseer-al-saddi":         { name: "Tafseer al-Sa'di",        scholar: "Imam al-Sa'di",           lang: "Arabic",  flag: "🇸🇦" },
  "ar-tafsir-al-baghawi":        { name: "Tafseer al-Baghawi",      scholar: "Imam al-Baghawi",         lang: "Arabic",  flag: "🇸🇦" },
  "ar-tafsir-al-wasit":          { name: "Tafsir al-Wasit",         scholar: "Islamic Scholars",        lang: "Arabic",  flag: "🇸🇦" },
  "ar-tafseer-tanwir-al-miqbas": { name: "Tanwir al-Miqbas",        scholar: "Attr. Ibn Abbas",         lang: "Arabic",  flag: "🇸🇦" },
};

// ─────────────────────────────────────────────────────
//  ASMA UL HUSNA (99 Names of Allah) — INLINED
// ─────────────────────────────────────────────────────
const ASMA_NAMES = [
  { number: 1,  arabic: "الرَّحْمَنُ",    transliteration: "Ar-Rahman",       meaning: "The Most Gracious",         description: "The One who has plenty of mercy for the believers and the blasphemers in this world and especially for the believers in the Hereafter." },
  { number: 2,  arabic: "الرَّحِيمُ",    transliteration: "Ar-Raheem",        meaning: "The Most Merciful",         description: "The One who has plenty of mercy for the believers." },
  { number: 3,  arabic: "الْمَلِكُ",     transliteration: "Al-Malik",         meaning: "The King",                  description: "The One with the complete Dominion, the One whose Dominion is clear from imperfection." },
  { number: 4,  arabic: "الْقُدُّوسُ",   transliteration: "Al-Quddus",        meaning: "The Most Holy",             description: "The One who is pure from any imperfection and clear from children and adversaries." },
  { number: 5,  arabic: "السَّلَامُ",    transliteration: "As-Salam",         meaning: "The Source of Peace",       description: "The One who is free from every imperfection." },
  { number: 6,  arabic: "الْمُؤْمِنُ",   transliteration: "Al-Mu'min",        meaning: "The Guardian of Faith",     description: "The One who witnessed for Himself that no one is God but Him. And He witnessed for His believers that they are truthful in their belief." },
  { number: 7,  arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin",      meaning: "The Protector",             description: "The One who witnesses the saying and deeds of His creatures." },
  { number: 8,  arabic: "الْعَزِيزُ",    transliteration: "Al-Aziz",          meaning: "The Mighty",                description: "The Strong, The Defeater who is not defeated." },
  { number: 9,  arabic: "الْجَبَّارُ",   transliteration: "Al-Jabbar",        meaning: "The Compeller",             description: "The One that nothing happens in His Dominion except that which He willed." },
  { number: 10, arabic: "الْمُتَكَبِّرُ",transliteration: "Al-Mutakabbir",    meaning: "The Majestic",              description: "The One who is clear from the attributes of the creatures and from resembling them." },
  { number: 11, arabic: "الْخَالِقُ",    transliteration: "Al-Khaliq",        meaning: "The Creator",               description: "The One who brings everything from non-existence to existence." },
  { number: 12, arabic: "الْبَارِئُ",    transliteration: "Al-Bari'",         meaning: "The Evolver",               description: "The Creator who has the Power to turn the entities." },
  { number: 13, arabic: "الْمُصَوِّرُ",  transliteration: "Al-Musawwir",      meaning: "The Fashioner",             description: "The One who forms His creatures in different pictures." },
  { number: 14, arabic: "الْغَفَّارُ",   transliteration: "Al-Ghaffar",       meaning: "The Great Forgiver",        description: "The Forgiver, the One who forgives the sins of His slaves time and time again." },
  { number: 15, arabic: "الْقَهَّارُ",   transliteration: "Al-Qahhar",        meaning: "The Subduer",               description: "The Dominant, The One who has the perfect Power and is not unable over anything." },
  { number: 16, arabic: "الْوَهَّابُ",   transliteration: "Al-Wahhab",        meaning: "The Bestower",              description: "The One who is Generous in giving plenty without any return." },
  { number: 17, arabic: "الرَّزَّاقُ",   transliteration: "Ar-Razzaq",        meaning: "The Provider",              description: "The Provider, The One who gives everything that benefits whether Halal or Haram." },
  { number: 18, arabic: "الْفَتَّاحُ",   transliteration: "Al-Fattah",        meaning: "The Opener",                description: "The One who opens for His slaves the closed worldly and religious matters." },
  { number: 19, arabic: "الْعَلِيمُ",    transliteration: "Al-Alim",          meaning: "The All-Knowing",           description: "The Knowledgeable; The One nothing is absent from His knowledge." },
  { number: 20, arabic: "الْقَابِضُ",    transliteration: "Al-Qabid",         meaning: "The Withholder",            description: "The One who constricts the sustenance by His wisdom and His Generosity." },
  { number: 21, arabic: "الْبَاسِطُ",    transliteration: "Al-Basit",         meaning: "The Extender",              description: "The One who expands and widens the sustenance by His Generosity and Wisdom." },
  { number: 22, arabic: "الْخَافِضُ",    transliteration: "Al-Khafid",        meaning: "The Abaser",                description: "The One who lowers whoever He willed by His Destruction." },
  { number: 23, arabic: "الرَّافِعُ",    transliteration: "Ar-Rafi",          meaning: "The Exalter",               description: "The One who raises whoever He willed by His Endowment." },
  { number: 24, arabic: "الْمُعِزُّ",    transliteration: "Al-Mu'izz",        meaning: "The Bestower of Honour",    description: "He gives esteem to whoever He willed, hence there is no one to degrade Him." },
  { number: 25, arabic: "الْمُذِلُّ",    transliteration: "Al-Muzil",         meaning: "The Humiliator",            description: "He degrades whoever He willed, hence there is no one to give him esteem." },
  { number: 26, arabic: "السَّمِيعُ",    transliteration: "As-Sami",          meaning: "The All-Hearing",           description: "The One who Hears all things that are heard by His Eternal Hearing without an ear, instrument or organ." },
  { number: 27, arabic: "الْبَصِيرُ",    transliteration: "Al-Basir",         meaning: "The All-Seeing",            description: "The One who Sees all things that are seen by His Eternal Seeing without a pupil or any other instrument." },
  { number: 28, arabic: "الْحَكَمُ",     transliteration: "Al-Hakam",         meaning: "The Judge",                 description: "He is the Ruler and His judgment is His Word." },
  { number: 29, arabic: "الْعَدْلُ",     transliteration: "Al-Adl",           meaning: "The Just",                  description: "The One who is entitled to do what He does." },
  { number: 30, arabic: "اللَّطِيفُ",    transliteration: "Al-Latif",         meaning: "The Subtle One",            description: "The One who is kind to His believing slaves and endows upon them." },
  { number: 31, arabic: "الْخَبِيرُ",    transliteration: "Al-Khabir",        meaning: "The All-Aware",             description: "The One who knows the truth of things." },
  { number: 32, arabic: "الْحَلِيمُ",    transliteration: "Al-Halim",         meaning: "The Forbearing",            description: "The One who delays the punishment for those who deserve it and then He might forgive them." },
  { number: 33, arabic: "الْعَظِيمُ",    transliteration: "Al-Azim",          meaning: "The Magnificent",           description: "The One deserving the attributes of Exaltment, Glory, Extolment, and Purity from all imperfection." },
  { number: 34, arabic: "الْغَفُورُ",    transliteration: "Al-Ghafur",        meaning: "The Forgiving",             description: "The One who forgives a lot." },
  { number: 35, arabic: "الشَّكُورُ",    transliteration: "Ash-Shakur",       meaning: "The Appreciative",          description: "The One who gives a lot of reward for a little obedience." },
  { number: 36, arabic: "الْعَلِيُّ",    transliteration: "Al-Ali",           meaning: "The Most High",             description: "The One who is clear from the attributes of the creatures." },
  { number: 37, arabic: "الْكَبِيرُ",    transliteration: "Al-Kabir",         meaning: "The Greatest",              description: "The One who is greater than everything in status." },
  { number: 38, arabic: "الْحَفِيظُ",    transliteration: "Al-Hafiz",         meaning: "The Preserver",             description: "The One who protects whatever and whoever He willed to protect." },
  { number: 39, arabic: "الْمُقِيتُ",    transliteration: "Al-Muqit",         meaning: "The Maintainer",            description: "The One who has the Power." },
  { number: 40, arabic: "الْحَسِيبُ",    transliteration: "Al-Hasib",         meaning: "The Reckoner",              description: "The One who gives the satisfaction." },
  { number: 41, arabic: "الْجَلِيلُ",    transliteration: "Al-Jalil",         meaning: "The Majestic",              description: "The One who is attributed with greatness of Power and Glory of status." },
  { number: 42, arabic: "الْكَرِيمُ",    transliteration: "Al-Karim",         meaning: "The Most Generous",         description: "The One who is clear from abjectness." },
  { number: 43, arabic: "الرَّقِيبُ",    transliteration: "Ar-Raqib",         meaning: "The Watchful",              description: "The One that nothing is absent from Him. Hence it's meaning is related to the attribute of Knowledge." },
  { number: 44, arabic: "الْمُجِيبُ",    transliteration: "Al-Mujib",         meaning: "The Responsive",            description: "The One who answers the one in need if he asks Him and rescues the yearner if he calls upon Him." },
  { number: 45, arabic: "الْوَاسِعُ",    transliteration: "Al-Wasi",          meaning: "The All-Encompassing",      description: "The Ample, the One who is Generous and who encompasses everything with His knowledge." },
  { number: 46, arabic: "الْحَكِيمُ",    transliteration: "Al-Hakim",         meaning: "The Wise",                  description: "The One who is correct in His doings." },
  { number: 47, arabic: "الْوَدُودُ",    transliteration: "Al-Wadud",         meaning: "The Loving",                description: "The One who loves His believing slaves and His believing slaves love Him." },
  { number: 48, arabic: "الْمَجِيدُ",    transliteration: "Al-Majid",         meaning: "The Most Glorious",         description: "The One who is with perfect Power, High Status, Compassion, Generosity and Kindness." },
  { number: 49, arabic: "الْبَاعِثُ",    transliteration: "Al-Ba'ith",        meaning: "The Resurrector",           description: "The One who resurrects His slaves after death for reward and/or punishment." },
  { number: 50, arabic: "الشَّهِيدُ",    transliteration: "Ash-Shahid",       meaning: "The Witness",               description: "The One who nothing is absent from Him." },
  { number: 51, arabic: "الْحَقُّ",      transliteration: "Al-Haqq",          meaning: "The Truth",                 description: "The One who truly exists." },
  { number: 52, arabic: "الْوَكِيلُ",    transliteration: "Al-Wakil",         meaning: "The Trustee",               description: "The One who gives the satisfaction and is relied upon." },
  { number: 53, arabic: "الْقَوِيُّ",    transliteration: "Al-Qawiyy",        meaning: "The Most Strong",           description: "The One with the complete Power." },
  { number: 54, arabic: "الْمَتِينُ",    transliteration: "Al-Matin",         meaning: "The Firm",                  description: "The One with extreme Power which is un-interrupted and He does not get tired." },
  { number: 55, arabic: "الْوَلِيُّ",    transliteration: "Al-Waliyy",        meaning: "The Protector",             description: "The Supporter." },
  { number: 56, arabic: "الْحَمِيدُ",    transliteration: "Al-Hamid",         meaning: "The Praiseworthy",          description: "The praised One who deserves to be praised." },
  { number: 57, arabic: "الْمُحْصِي",    transliteration: "Al-Muhsi",         meaning: "The Reckoner",              description: "The One who the count of things are known to him." },
  { number: 58, arabic: "الْمُبْدِئُ",   transliteration: "Al-Mubdi",         meaning: "The Originator",            description: "The One who started the human being. That is, He created him." },
  { number: 59, arabic: "الْمُعِيدُ",    transliteration: "Al-Mu'id",         meaning: "The Restorer",              description: "The One who brings back the creatures after death." },
  { number: 60, arabic: "الْمُحْيِي",    transliteration: "Al-Muhyi",         meaning: "The Giver of Life",         description: "The One who took out a living human from semen that does not have a soul." },
  { number: 61, arabic: "الْمُمِيتُ",    transliteration: "Al-Mumit",         meaning: "The Creator of Death",      description: "The One who renders the living dead." },
  { number: 62, arabic: "الْحَيُّ",      transliteration: "Al-Hayy",          meaning: "The Ever Living",           description: "The One attributed with a life that is unlike our life and is not that of a combination of soul, flesh or blood." },
  { number: 63, arabic: "الْقَيُّومُ",   transliteration: "Al-Qayyum",        meaning: "The Self-Subsisting",       description: "The One who remains and does not end." },
  { number: 64, arabic: "الْوَاجِدُ",    transliteration: "Al-Wajid",         meaning: "The Perceiver",             description: "The Rich who is never poor. Al-Wajid is translated as the Perceiver." },
  { number: 65, arabic: "الْمَاجِدُ",    transliteration: "Al-Majid",         meaning: "The Noble",                 description: "The One who is Majid." },
  { number: 66, arabic: "الْوَاحِدُ",    transliteration: "Al-Wahid",         meaning: "The Unique",                description: "The One without a partner." },
  { number: 67, arabic: "الْأَحَدُ",     transliteration: "Al-Ahad",          meaning: "The One",                   description: "The One who has no partner." },
  { number: 68, arabic: "الصَّمَدُ",     transliteration: "As-Samad",         meaning: "The Eternal",               description: "The Master who is relied upon in matters and is resorted to in one's needs." },
  { number: 69, arabic: "الْقَادِرُ",    transliteration: "Al-Qadir",         meaning: "The Omnipotent",            description: "The One attributed with Power." },
  { number: 70, arabic: "الْمُقْتَدِرُ", transliteration: "Al-Muqtadir",      meaning: "The Powerful",              description: "The One with the Power that nothing is withheld from Him." },
  { number: 71, arabic: "الْمُقَدِّمُ",  transliteration: "Al-Muqaddim",      meaning: "The Expediter",             description: "The One who puts things in their right places." },
  { number: 72, arabic: "الْمُؤَخِّرُ",  transliteration: "Al-Mu'akhkhir",    meaning: "The Delayer",               description: "The One who puts things in their right places." },
  { number: 73, arabic: "الْأَوَّلُ",    transliteration: "Al-Awwal",         meaning: "The First",                 description: "The One whose Existence is without a beginning." },
  { number: 74, arabic: "الْآخِرُ",      transliteration: "Al-Akhir",         meaning: "The Last",                  description: "The One whose Existence is without an end." },
  { number: 75, arabic: "الظَّاهِرُ",    transliteration: "Az-Zahir",         meaning: "The Manifest",              description: "The One that nothing is above Him and nothing is underneath Him." },
  { number: 76, arabic: "الْبَاطِنُ",    transliteration: "Al-Batin",         meaning: "The Hidden",                description: "The One that nothing is above Him and nothing is underneath Him." },
  { number: 77, arabic: "الْوَالِي",     transliteration: "Al-Wali",          meaning: "The Governor",              description: "The One who owns things and manages them." },
  { number: 78, arabic: "الْمُتَعَالِي", transliteration: "Al-Muta'ali",      meaning: "The Self-Exalted",          description: "The One who is clear from the attributes of the creation." },
  { number: 79, arabic: "الْبَرُّ",      transliteration: "Al-Barr",          meaning: "The Source of Goodness",    description: "The One who is kind to His creatures, who covered them with His sustenance and specified whoever He willed among them." },
  { number: 80, arabic: "التَّوَّابُ",   transliteration: "At-Tawwab",        meaning: "The Ever-Pardoning",        description: "The One who grants repentance to whoever He willed among His creatures and accepts their repentance." },
  { number: 81, arabic: "الْمُنْتَقِمُ", transliteration: "Al-Muntaqim",      meaning: "The Avenger",               description: "The One who victoriously prevails over His enemies and punishes them for their sins." },
  { number: 82, arabic: "الْعَفُوُّ",    transliteration: "Al-Afuww",         meaning: "The Pardoner",              description: "The One with wide forgiveness." },
  { number: 83, arabic: "الرَّؤُوفُ",    transliteration: "Ar-Ra'uf",         meaning: "The Compassionate",         description: "The One with extreme Mercy. The Mercy of Allah is His will to endow upon whoever He willed among His creatures." },
  { number: 84, arabic: "مَالِكُ الْمُلْكِ", transliteration: "Malik-ul-Mulk", meaning: "Master of the Kingdom",    description: "The One who controls the Dominion and gives dominion to whoever He willed." },
  { number: 85, arabic: "ذُو الْجَلَالِ وَالْإِكْرَامِ", transliteration: "Dhul-Jalal wal-Ikram", meaning: "Lord of Majesty and Honour", description: "The One who deserves to be Exalted and not denied." },
  { number: 86, arabic: "الْمُقْسِطُ",   transliteration: "Al-Muqsit",        meaning: "The Equitable",             description: "The One who is Just in His judgment." },
  { number: 87, arabic: "الْجَامِعُ",    transliteration: "Al-Jami",          meaning: "The Gatherer",              description: "The One who gathers His creatures on a day that there is no doubt about, that is the Day of Judgment." },
  { number: 88, arabic: "الْغَنِيُّ",    transliteration: "Al-Ghani",         meaning: "The Self-Sufficient",       description: "The One who does not need the creation." },
  { number: 89, arabic: "الْمُغْنِي",    transliteration: "Al-Mughni",        meaning: "The Enricher",              description: "The One who satisfies the necessities of the creatures." },
  { number: 90, arabic: "الْمَانِعُ",    transliteration: "Al-Mani",          meaning: "The Withholder",            description: "The Supporter who protects and gives victory to His pious believers." },
  { number: 91, arabic: "الضَّارُّ",     transliteration: "Ad-Darr",          meaning: "The Distresser",            description: "The One who makes harm reach to whoever He willed and benefit to whoever He willed." },
  { number: 92, arabic: "النَّافِعُ",    transliteration: "An-Nafi",          meaning: "The Propitious",            description: "The One who gives benefits to whoever He willed." },
  { number: 93, arabic: "النُّورُ",      transliteration: "An-Nur",           meaning: "The Light",                 description: "The One who guides." },
  { number: 94, arabic: "الْهَادِي",     transliteration: "Al-Hadi",          meaning: "The Guide",                 description: "The One whom with His Guidance His believers were guided, and with His Guidance the living beings have been guided." },
  { number: 95, arabic: "الْبَدِيعُ",    transliteration: "Al-Badi",          meaning: "The Incomparable",          description: "The One who created the creation and formed it without any preceding example." },
  { number: 96, arabic: "الْبَاقِي",     transliteration: "Al-Baqi",          meaning: "The Ever-Lasting",          description: "The One that the state of non-existence is impossible for Him." },
  { number: 97, arabic: "الْوَارِثُ",    transliteration: "Al-Warith",        meaning: "The Inheritor",             description: "The One whose Existence remains." },
  { number: 98, arabic: "الرَّشِيدُ",    transliteration: "Ar-Rashid",        meaning: "The Guide to the Right Path", description: "The One who guides." },
  { number: 99, arabic: "الصَّبُورُ",    transliteration: "As-Sabur",         meaning: "The Timeless Patient",      description: "The One who does not quickly punish the sinners." },
];

// ─────────────────────────────────────────────────────
//  GRADE CONFIG
// ─────────────────────────────────────────────────────
const SAHIH_BY_DEFAULT = new Set(["bukhari", "muslim", "nawawi", "qudsi"]);
const GRADE_CONFIG = {
  sahih:           { label: "Sahih — Authentic",     emoji: "🟢", color: 0x1B5E20 },
  hasan:           { label: "Hasan — Good",          emoji: "🟡", color: 0xF9A825 },
  daif:            { label: "Da'if — Weak",          emoji: "🔴", color: 0xB71C1C },
  "daif ":         { label: "Da'if — Weak",          emoji: "🔴", color: 0xB71C1C },
  sahihdarussalam: { label: "Sahih (Darussalam)",    emoji: "🟢", color: 0x1B5E20 },
  hasandarussalam: { label: "Hasan (Darussalam)",    emoji: "🟡", color: 0xF9A825 },
  daifdarussalam:  { label: "Da'if (Darussalam)",    emoji: "🔴", color: 0xB71C1C },
  "hasan sahih":   { label: "Hasan Sahih",           emoji: "🟢", color: 0x2E7D32 },
  mawdu:           { label: "Mawdu' — Fabricated",   emoji: "⛔", color: 0x000000 },
  mursal:          { label: "Mursal",                emoji: "🟠", color: 0xE65100 },
};

function parseGrade(gradeStr) {
  if (!gradeStr) return null;
  const normalized = gradeStr.toLowerCase().replace(/\s+/g, " ").trim();
  if (GRADE_CONFIG[normalized]) return { raw: gradeStr, ...GRADE_CONFIG[normalized] };
  for (const [key, val] of Object.entries(GRADE_CONFIG)) {
    if (normalized.includes(key)) return { raw: gradeStr, ...val };
  }
  return { raw: gradeStr, label: gradeStr, emoji: "⚪", color: null };
}

// ─────────────────────────────────────────────────────
//  API HELPERS
// ─────────────────────────────────────────────────────
async function fetchHadith(edition, number) {
  const res = await fetch(`${CDN}/${edition}/${number}.min.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchRandomHadith(collectionKey) {
  const col = COLLECTIONS[collectionKey];
  const num = Math.floor(Math.random() * col.totalHadiths) + 1;
  try {
    const data = await fetchHadith(col.edition, num);
    return { data, number: num };
  } catch {
    const data = await fetchHadith(col.edition, 1);
    return { data, number: 1 };
  }
}

async function fetchAyah(surah, ayah, translationKey = DEFAULT_TRANSLATION) {
  const editions = [...new Set([translationKey, "quran-uthmani"])].join(",");
  const res = await fetch(`${QURAN_API}/ayah/${surah}:${ayah}/editions/${editions}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchRandomAyah(translationKey = DEFAULT_TRANSLATION) {
  const surah = Math.floor(Math.random() * 114) + 1;
  const infoRes = await fetch(`${QURAN_API}/surah/${surah}`);
  const info = await infoRes.json();
  const ayahCount = info.data?.numberOfAyahs || 7;
  const ayah = Math.floor(Math.random() * ayahCount) + 1;
  return fetchAyah(surah, ayah, translationKey);
}

async function fetchTafsir(surah, ayah, tafsirSlug) {
  // spa5k tafsir_api: /tafsir/{slug}/{surah}/{ayah}.json
  const res = await fetch(`${TAFSIR_API}/${tafsirSlug}/${surah}/${ayah}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────
//  EMBED BUILDERS
// ─────────────────────────────────────────────────────
function buildHadithEmbed(collectionKey, hadithData, number, includeArabic = false, arabicData = null) {
  const col    = COLLECTIONS[collectionKey];
  const hadith = hadithData?.hadiths?.[0] || {};
  const text   = hadith.text || hadithData?.text || "Text unavailable.";
  const section = hadithData?.metadata?.name || hadithData?.section?.title || null;

  let grade = null;
  if (SAHIH_BY_DEFAULT.has(collectionKey)) {
    grade = { label: "Sahih — Authentic", emoji: "🟢", color: 0x1B5E20 };
  } else {
    const rawGrade = hadith.grades?.[0]?.grade || hadith.grade || null;
    if (rawGrade) grade = parseGrade(rawGrade);
  }

  const embed = new EmbedBuilder()
    .setColor(grade?.color || col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${number}` })
    .setDescription(`*"${text}"*`)
    .setFooter({ text: "No knowledge except what Allah has taught • لا علم إلا ما علَّم الله" })
    .setTimestamp();

  if (grade) {
    embed.addFields({ name: "📊 Grade", value: `${grade.emoji}  **${grade.label}**`, inline: true });
  }
  embed.addFields(
    { name: "📖 Collection", value: col.name,    inline: true },
    { name: "🔢 Number",     value: `#${number}`, inline: true }
  );
  if (section) embed.addFields({ name: "📂 Chapter", value: section });
  if (includeArabic && arabicData) {
    const arabicText = arabicData?.hadiths?.[0]?.text || arabicData?.text;
    if (arabicText) embed.addFields({ name: "🕌 Arabic Text", value: `\`\`\`${arabicText.substring(0, 1000)}\`\`\`` });
  }
  return embed;
}

function buildAyahEmbed(ayahData, translationKey = DEFAULT_TRANSLATION) {
  const editions = ayahData?.data;
  if (!editions || !Array.isArray(editions)) {
    const a = ayahData?.data;
    if (!a) return new EmbedBuilder().setColor(0x2E7D32).setDescription("Could not fetch ayah.");
    return new EmbedBuilder().setColor(0x2E7D32).setDescription(`*"${a.text}"*`);
  }

  const transEdition  = editions.find(e => e.edition?.identifier === translationKey) || editions[0];
  const arabicEdition = editions.find(e => e.edition?.identifier === "quran-uthmani");

  const surahName   = transEdition?.surah?.englishName || "";
  const surahArabic = transEdition?.surah?.name || "";
  const surahNum    = transEdition?.surah?.number || "";
  const ayahNum     = transEdition?.numberInSurah || "";
  const transInfo   = TRANSLATIONS[translationKey] || { name: translationKey, flag: "🌐" };
  const transText   = transEdition?.text || "Translation unavailable.";
  const arabicText  = arabicEdition?.text || null;
  // Page number from the API
  const pageNum     = transEdition?.page || arabicEdition?.page || null;
  const juzNum      = transEdition?.juz || arabicEdition?.juz || null;

  const embed = new EmbedBuilder()
    .setColor(0x2E7D32)
    .setAuthor({ name: `📖  ${surahName} (${surahArabic})  •  Ayah ${surahNum}:${ayahNum}` })
    .setDescription(`*"${transText}"*`);

  if (arabicText) embed.addFields({ name: "🕌 Arabic", value: arabicText });

  const fields = [
    { name: "📍 Reference",   value: `${surahName} ${surahNum}:${ayahNum}`, inline: true },
    { name: "🌐 Translation", value: `${transInfo.flag} ${transInfo.name}`, inline: true },
    { name: "🗣️ Language",   value: transInfo.lang,                         inline: true },
  ];
  if (pageNum) fields.push({ name: "📄 Mushaf Page", value: `Page ${pageNum}`, inline: true });
  if (juzNum)  fields.push({ name: "📑 Juz",         value: `Juz ${juzNum}`,   inline: true });

  embed.addFields(...fields)
    .setFooter({ text: "القرآن الكريم — The Noble Quran" })
    .setTimestamp();

  return embed;
}

function buildTafsirEmbed(surah, ayah, tafsirSlug, tafsirData) {
  const info = TAFSIR_EDITIONS[tafsirSlug] || { name: tafsirSlug, scholar: "", lang: "Unknown", flag: "📚" };

  // spa5k API response: { text: "...", ayah: N, surah: N } or array
  // Handle both single object and array
  const entry = Array.isArray(tafsirData) ? tafsirData[0] : tafsirData;
  let rawText = entry?.text || "Tafsir text unavailable for this ayah.";

  // Strip HTML tags from the text (some tafsirs contain <p>, <b> etc.)
  const text = rawText.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();

  // Truncate long tafsir to fit Discord's 4096 char embed description limit
  const truncated = text.length > 3900
    ? text.substring(0, 3900) + "\n\n*(Tafsir truncated — see full commentary in a Quran resource)*"
    : text;

  return new EmbedBuilder()
    .setColor(0x4A148C)
    .setAuthor({ name: `${info.flag}  ${info.name}  •  Surah ${surah}:${ayah}` })
    .setTitle(`📚 Tafsir — ${info.scholar}`)
    .setDescription(truncated || "No text available for this ayah in this tafsir.")
    .addFields(
      { name: "📖 Scholar",  value: info.scholar,       inline: true },
      { name: "🗣️ Language", value: info.lang,          inline: true },
      { name: "📍 Ayah",     value: `${surah}:${ayah}`, inline: true }
    )
    .setFooter({ text: "Tafsir via spa5k/tafsir_api • تفسير القرآن الكريم" })
    .setTimestamp();
}

function buildTranslationSelectMenu(currentKey = DEFAULT_TRANSLATION) {
  const options = TRANSLATION_KEYS.slice(0, 25).map(k => ({
    label: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`,
    description: TRANSLATIONS[k].lang,
    value: k,
    default: k === currentKey,
  }));
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_translation")
      .setPlaceholder("Switch translation...")
      .addOptions(options)
  );
}

function buildTafsirSelectMenu(surah, ayah) {
  const options = Object.entries(TAFSIR_EDITIONS).map(([k, v]) => ({
    label: `${v.flag} ${v.name}`,
    description: `${v.scholar} • ${v.lang}`,
    value: `${k}|${surah}|${ayah}`,
  }));
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_tafsir")
      .setPlaceholder("📚 Choose a Tafsir...")
      .addOptions(options)
  );
}

function buildAyahNavButtons(surah, ayahNum, maxAyah, translationKey) {
  const prev = Math.max(1, ayahNum - 1);
  const next = Math.min(maxAyah, ayahNum + 1);
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ayahnav_${surah}_${prev}_${translationKey}`)
      .setLabel("◀ Prev Ayah")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(ayahNum <= 1),
    new ButtonBuilder()
      .setCustomId(`ayahnav_${surah}_${next}_${translationKey}`)
      .setLabel("Next Ayah ▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(ayahNum >= maxAyah),
    new ButtonBuilder()
      .setCustomId(`ayahrandom_${translationKey}`)
      .setLabel("🎲 Random")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`tafsir_open_${surah}_${ayahNum}`)
      .setLabel("📚 Tafsir")
      .setStyle(ButtonStyle.Success)
  );
}

function buildCollectionListEmbed() {
  const totalHadiths = Object.values(COLLECTIONS).reduce((s, c) => s + c.totalHadiths, 0);
  return new EmbedBuilder()
    .setColor(0x5C4033)
    .setTitle("📚  Available Hadith Collections")
    .setDescription(
      Object.entries(COLLECTIONS).map(([k, v]) =>
        `${v.emoji} **${v.name}** — ${v.totalHadiths.toLocaleString()} hadiths`
      ).join("\n") +
      `\n\n**Total: ${totalHadiths.toLocaleString()} hadiths** across ${COLLECTION_KEYS.length} collections\n` +
      `📖 **Quran** — 6,236 ayahs across 114 surahs`
    )
    .setFooter({ text: "All sourced from fawazahmed0/hadith-api + alquran.cloud — no key required" });
}

function buildNavButtons(collectionKey, currentNum) {
  const col  = COLLECTIONS[collectionKey];
  const prev = Math.max(1, currentNum - 1);
  const next = Math.min(col.totalHadiths, currentNum + 1);
  const rand = Math.floor(Math.random() * col.totalHadiths) + 1;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`nav_${collectionKey}_${prev}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(currentNum <= 1),
    new ButtonBuilder().setCustomId(`nav_${collectionKey}_${next}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(currentNum >= col.totalHadiths),
    new ButtonBuilder().setCustomId(`nav_${collectionKey}_${rand}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`arabic_${collectionKey}_${currentNum}`).setLabel("🕌 Show Arabic").setStyle(ButtonStyle.Secondary)
  );
}

function buildCollectionMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_collection")
      .setPlaceholder("Switch collection...")
      .addOptions(
        COLLECTION_KEYS.map(k => ({
          label: COLLECTIONS[k].name,
          description: `${COLLECTIONS[k].totalHadiths.toLocaleString()} hadiths`,
          value: k,
          emoji: COLLECTIONS[k].emoji,
        }))
      )
  );
}

function buildErrorEmbed(msg) {
  return new EmbedBuilder()
    .setColor(0xB71C1C)
    .setTitle("⚠️  Could not load")
    .setDescription(msg)
    .setFooter({ text: "Try a different number or collection" });
}

// ─────────────────────────────────────────────────────
//  ASMA UL HUSNA HELPERS (inlined)
// ─────────────────────────────────────────────────────
function buildAsmaEmbed(name) {
  return new EmbedBuilder()
    .setColor(0x1A237E)
    .setAuthor({ name: `✨  Asma ul Husna — Name #${name.number} of 99` })
    .setTitle(`${name.arabic}  •  ${name.transliteration}`)
    .setDescription(`**"${name.meaning}"**\n\n${name.description}`)
    .addFields(
      { name: "🔢 Number",          value: `${name.number} / 99`,    inline: true },
      { name: "🔤 Transliteration", value: name.transliteration,     inline: true },
      { name: "💬 Meaning",         value: name.meaning,             inline: true }
    )
    .setFooter({ text: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ — To Allah belong the best names (Quran 7:180)" })
    .setTimestamp();
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
    .setDescription("Get a specific hadith by number")
    .addStringOption(o =>
      o.setName("collection").setDescription("The hadith collection").setRequired(true)
        .addChoices(...COLLECTION_KEYS.map(k => ({ name: COLLECTIONS[k].name, value: k })))
    )
    .addIntegerOption(o =>
      o.setName("number").setDescription("Hadith number").setRequired(true).setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName("random")
    .setDescription("Get a random hadith from any or a specific collection")
    .addStringOption(o =>
      o.setName("collection").setDescription("Pick a collection (leave blank for any)")
        .addChoices(...COLLECTION_KEYS.map(k => ({ name: COLLECTIONS[k].name, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("browse")
    .setDescription("Browse a collection interactively with prev/next buttons")
    .addStringOption(o =>
      o.setName("collection").setDescription("The hadith collection").setRequired(true)
        .addChoices(...COLLECTION_KEYS.map(k => ({ name: COLLECTIONS[k].name, value: k })))
    )
    .addIntegerOption(o =>
      o.setName("start").setDescription("Start at hadith number (default 1)").setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName("ayah")
    .setDescription("Get a Quran verse by surah and ayah number")
    .addIntegerOption(o => o.setName("surah").setDescription("Surah number (1–114)").setRequired(true).setMinValue(1).setMaxValue(114))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o =>
      o.setName("translation").setDescription("Translation to use (default: Saheeh International)")
        .addChoices(...TRANSLATION_KEYS.slice(0, 25).map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name} (${TRANSLATIONS[k].lang})`, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("randomayah")
    .setDescription("Get a random Quran verse")
    .addStringOption(o =>
      o.setName("translation").setDescription("Translation to use (default: Saheeh International)")
        .addChoices(...TRANSLATION_KEYS.slice(0, 25).map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name} (${TRANSLATIONS[k].lang})`, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("tafsir")
    .setDescription("Get Tafsir (commentary) for a Quran verse")
    .addIntegerOption(o => o.setName("surah").setDescription("Surah number (1–114)").setRequired(true).setMinValue(1).setMaxValue(114))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o =>
      o.setName("scholar").setDescription("Choose the Tafsir / scholar")
        .addChoices(...Object.entries(TAFSIR_EDITIONS).map(([k, v]) => ({ name: `${v.flag} ${v.name} (${v.lang})`, value: k })))
    ),

  new SlashCommandBuilder()
    .setName("translations")
    .setDescription("List all available Quran translations"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Today's daily reminder — auto-selected hadith + ayah, changes every day"),

  new SlashCommandBuilder()
    .setName("collections")
    .setDescription("List all available hadith collections and their sizes"),

  new SlashCommandBuilder()
    .setName("explore")
    .setDescription("Open an interactive collection explorer with a dropdown menu"),

  new SlashCommandBuilder()
    .setName("asmaallah")
    .setDescription("Browse the 99 Names of Allah (Asma ul Husna)")
    .addIntegerOption(o =>
      o.setName("number").setDescription("Name number (1–99). Leave blank for a random name.").setMinValue(1).setMaxValue(99)
    ),

].map(c => c.toJSON());

// ─────────────────────────────────────────────────────
//  BOT EVENTS
// ─────────────────────────────────────────────────────
client.once("ready", async () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);

  // ── Bot Status ───────────────────────────────────────
  // Set BOT_STATUS in Railway/env as "TYPE:TEXT"
  // e.g. "WATCHING:📖 Quran | /hadith /ayah /tafsir"
  const statusEnv = process.env.BOT_STATUS || "WATCHING:📖 Quran | /hadith /ayah /tafsir";
  const [typeRaw, ...textParts] = statusEnv.split(":");
  const statusText = textParts.join(":");
  const activityTypes = { PLAYING: 0, STREAMING: 1, LISTENING: 2, WATCHING: 3, COMPETING: 5, CUSTOM: 4 };
  const activityType  = activityTypes[typeRaw.toUpperCase()] ?? 3;
  client.user.setPresence({
    activities: [{ name: statusText, type: activityType }],
    status: process.env.BOT_ONLINE_STATUS || "online",
  });
  console.log(`✅ Status set: [${typeRaw}] ${statusText}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Slash commands registered globally");
  } catch (e) {
    console.error("Command registration error:", e);
  }
});

client.on("interactionCreate", async interaction => {

  // ── SLASH COMMANDS ──────────────────────────────────
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply();
    const cmd = interaction.commandName;

    // ── /hadith ─────────────────────────────────────
    if (cmd === "hadith") {
      const colKey = interaction.options.getString("collection");
      const num    = interaction.options.getInteger("number");
      const col    = COLLECTIONS[colKey];
      if (num > col.totalHadiths) {
        return interaction.editReply({ embeds: [buildErrorEmbed(`${col.name} only goes up to #${col.totalHadiths}.`)] });
      }
      try {
        const data = await fetchHadith(col.edition, num);
        await interaction.editReply({
          embeds: [buildHadithEmbed(colKey, data, num)],
          components: [buildNavButtons(colKey, num), buildCollectionMenu()]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Hadith #${num} could not be loaded.`)] });
      }
    }

    // ── /random ─────────────────────────────────────
    else if (cmd === "random") {
      const colKey = interaction.options.getString("collection")
        || COLLECTION_KEYS[Math.floor(Math.random() * COLLECTION_KEYS.length)];
      try {
        const { data, number } = await fetchRandomHadith(colKey);
        await interaction.editReply({
          embeds: [buildHadithEmbed(colKey, data, number)],
          components: [buildNavButtons(colKey, number), buildCollectionMenu()]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a random hadith. Try again.")] });
      }
    }

    // ── /browse ─────────────────────────────────────
    else if (cmd === "browse") {
      const colKey = interaction.options.getString("collection");
      const start  = interaction.options.getInteger("start") || 1;
      try {
        const data = await fetchHadith(COLLECTIONS[colKey].edition, start);
        await interaction.editReply({
          embeds: [buildHadithEmbed(colKey, data, start)],
          components: [buildNavButtons(colKey, start), buildCollectionMenu()]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that hadith.")] });
      }
    }

    // ── /ayah ────────────────────────────────────────
    else if (cmd === "ayah") {
      const surah    = interaction.options.getInteger("surah");
      const ayahNum  = interaction.options.getInteger("ayah");
      const transKey = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
      try {
        const data      = await fetchAyah(surah, ayahNum, transKey);
        const surahInfo = await fetch(`${QURAN_API}/surah/${surah}`).then(r => r.json());
        const maxAyah   = surahInfo?.data?.numberOfAyahs || 286;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationSelectMenu(transKey),
            buildAyahNavButtons(surah, ayahNum, maxAyah, transKey)
          ]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load ${surah}:${ayahNum}. Check the ayah number.`)] });
      }
    }

    // ── /randomayah ──────────────────────────────────
    else if (cmd === "randomayah") {
      const transKey = interaction.options.getString("translation") || DEFAULT_TRANSLATION;
      try {
        const data     = await fetchRandomAyah(transKey);
        const editions = data?.data;
        const first    = Array.isArray(editions) ? editions[0] : editions;
        const surahNum = first?.surah?.number || 1;
        const ayahNum  = first?.numberInSurah || 1;
        const maxAyah  = first?.surah?.numberOfAyahs || 7;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [
            buildTranslationSelectMenu(transKey),
            buildAyahNavButtons(surahNum, ayahNum, maxAyah, transKey)
          ]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a random ayah.")] });
      }
    }

    // ── /tafsir ──────────────────────────────────────
    else if (cmd === "tafsir") {
      const surah         = interaction.options.getInteger("surah");
      const ayahNum       = interaction.options.getInteger("ayah");
      const tafsirEdition = interaction.options.getString("scholar") || "en-tafsir-ibn-kathir";
      try {
        const data = await fetchTafsir(surah, ayahNum, tafsirEdition);
        await interaction.editReply({
          embeds: [buildTafsirEmbed(surah, ayahNum, tafsirEdition, data)],
          components: [buildTafsirSelectMenu(surah, ayahNum)]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load Tafsir for ${surah}:${ayahNum}.`)] });
      }
    }

    // ── /translations ────────────────────────────────
    else if (cmd === "translations") {
      const embed = new EmbedBuilder()
        .setColor(0x2E7D32)
        .setTitle("🌍  Available Quran Translations")
        .setDescription(
          Object.entries(TRANSLATIONS).map(([k, v]) =>
            `${v.flag} **${v.name}** — ${v.lang} \`${k}\``
          ).join("\n")
        )
        .addFields({ name: "Usage", value: "Use `/ayah` or `/randomayah` and pick a translation from the dropdown, or pass it as an option." })
        .setFooter({ text: "All translations via alquran.cloud — free, no key required" });
      await interaction.editReply({ embeds: [embed] });
    }

    // ── /daily ───────────────────────────────────────
    else if (cmd === "daily") {
      const today  = new Date();
      const seed   = today.getFullYear() * 1000 + today.getMonth() * 31 + today.getDate();
      const colKey = COLLECTION_KEYS[seed % COLLECTION_KEYS.length];
      const col    = COLLECTIONS[colKey];
      const hNum   = (seed % col.totalHadiths) + 1;
      try {
        const [hData, aData] = await Promise.all([
          fetchHadith(col.edition, hNum),
          fetchRandomAyah(DEFAULT_TRANSLATION)
        ]);
        const hEmbed = buildHadithEmbed(colKey, hData, hNum);
        hEmbed.setTitle(`🌅  Daily Hadith — ${today.toDateString()}`);
        const aEmbed = buildAyahEmbed(aData);
        aEmbed.setTitle("📖  Daily Ayah");
        await interaction.editReply({ embeds: [hEmbed, aEmbed] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load daily content.")] });
      }
    }

    // ── /collections ─────────────────────────────────
    else if (cmd === "collections") {
      await interaction.editReply({ embeds: [buildCollectionListEmbed()] });
    }

    // ── /explore ─────────────────────────────────────
    else if (cmd === "explore") {
      const embed = new EmbedBuilder()
        .setColor(0x4E342E)
        .setTitle("📚  Islamic Knowledge Explorer")
        .setDescription(
          "Select a collection from the dropdown to start browsing.\nUse **◀ Prev / Next ▶** to go hadith by hadith, or **🎲 Random** to jump.\n\n" +
          COLLECTION_KEYS.map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** — ${COLLECTIONS[k].totalHadiths.toLocaleString()} hadiths`).join("\n")
        )
        .setFooter({ text: "بسم الله الرحمن الرحيم • In the name of Allah" });
      await interaction.editReply({ embeds: [embed], components: [buildCollectionMenu()] });
    }

    // ── /asmaallah ───────────────────────────────────
    else if (cmd === "asmaallah") {
      const num  = interaction.options.getInteger("number") || Math.floor(Math.random() * 99) + 1;
      const name = ASMA_NAMES[num - 1];
      if (!name) return interaction.editReply({ embeds: [buildErrorEmbed("Name not found. Pick a number between 1 and 99.")] });
      await interaction.editReply({
        embeds: [buildAsmaEmbed(name)],
        components: [buildAsmaNavButtons(num)]
      });
    }

    else {
      await interaction.editReply({ embeds: [buildErrorEmbed(`Unknown command: ${cmd}`)] });
    }
  }

  // ── SELECT MENUS ────────────────────────────────────
  else if (interaction.isStringSelectMenu()) {
    const cid = interaction.customId;

    // Switch hadith collection
    if (cid === "select_collection") {
      await interaction.deferUpdate();
      const colKey = interaction.values[0];
      try {
        const data = await fetchHadith(COLLECTIONS[colKey].edition, 1);
        await interaction.editReply({
          embeds: [buildHadithEmbed(colKey, data, 1)],
          components: [buildNavButtons(colKey, 1), buildCollectionMenu()]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that collection.")] });
      }
    }

    // Switch Quran translation
    else if (cid === "select_translation") {
      await interaction.deferUpdate();
      const transKey     = interaction.values[0];
      const currentEmbed = interaction.message.embeds[0];
      const authorName   = currentEmbed?.author?.name || "";
      const match        = authorName.match(/Ayah\s+(\d+):(\d+)/);
      const surahNum     = match ? parseInt(match[1]) : 1;
      const ayahNum      = match ? parseInt(match[2]) : 1;
      try {
        const data      = await fetchAyah(surahNum, ayahNum, transKey);
        const surahInfo = await fetch(`${QURAN_API}/surah/${surahNum}`).then(r => r.json());
        const maxAyah   = surahInfo?.data?.numberOfAyahs || 286;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [buildTranslationSelectMenu(transKey), buildAyahNavButtons(surahNum, ayahNum, maxAyah, transKey)]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not switch translation.")] });
      }
    }

    // Select tafsir from dropdown (both from /tafsir command and from 📚 Tafsir button)
    else if (cid === "select_tafsir") {
      await interaction.deferUpdate();
      // value format: "edition|surah|ayah"
      const [tafsirEdition, surahStr, ayahStr] = interaction.values[0].split("|");
      const surah   = parseInt(surahStr);
      const ayahNum = parseInt(ayahStr);
      try {
        const data = await fetchTafsir(surah, ayahNum, tafsirEdition);
        await interaction.editReply({
          embeds: [buildTafsirEmbed(surah, ayahNum, tafsirEdition, data)],
          components: [buildTafsirSelectMenu(surah, ayahNum)]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load Tafsir for ${surah}:${ayahNum}.`)] });
      }
    }
  }

  // ── BUTTONS ─────────────────────────────────────────
  else if (interaction.isButton()) {
    const id     = interaction.customId;
    const parts  = id.split("_");
    const action = parts[0];

    // Hadith nav
    if (action === "nav") {
      await interaction.deferUpdate();
      const colKey = parts[1];
      const num    = parseInt(parts[2]);
      try {
        const data = await fetchHadith(COLLECTIONS[colKey].edition, num);
        await interaction.editReply({
          embeds: [buildHadithEmbed(colKey, data, num)],
          components: [buildNavButtons(colKey, num), buildCollectionMenu()]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load hadith #${num}.`)] });
      }
    }

    // Show Arabic
    else if (action === "arabic") {
      await interaction.deferUpdate();
      const colKey       = parts[1];
      const num          = parseInt(parts[2]);
      const col          = COLLECTIONS[colKey];
      const arabicEdition = col.edition.replace(/^eng-/, "ara-");
      try {
        const [engData, araData] = await Promise.all([
          fetchHadith(col.edition, num),
          fetchHadith(arabicEdition, num).catch(() => null)
        ]);
        await interaction.editReply({
          embeds: [buildHadithEmbed(colKey, engData, num, true, araData)],
          components: [buildNavButtons(colKey, num), buildCollectionMenu()]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load Arabic text for #${num}.`)] });
      }
    }

    // Ayah nav
    else if (id.startsWith("ayahnav_")) {
      await interaction.deferUpdate();
      const surahNum = parseInt(parts[1]);
      const ayahNum  = parseInt(parts[2]);
      const transKey = parts[3] || DEFAULT_TRANSLATION;
      try {
        const data      = await fetchAyah(surahNum, ayahNum, transKey);
        const surahInfo = await fetch(`${QURAN_API}/surah/${surahNum}`).then(r => r.json());
        const maxAyah   = surahInfo?.data?.numberOfAyahs || 286;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [buildTranslationSelectMenu(transKey), buildAyahNavButtons(surahNum, ayahNum, maxAyah, transKey)]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load that ayah.")] });
      }
    }

    // Random ayah
    else if (id.startsWith("ayahrandom_")) {
      await interaction.deferUpdate();
      const transKey = parts[1] || DEFAULT_TRANSLATION;
      try {
        const data     = await fetchRandomAyah(transKey);
        const editions = data?.data;
        const first    = Array.isArray(editions) ? editions[0] : editions;
        const surahNum = first?.surah?.number || 1;
        const ayahNum  = first?.numberInSurah || 1;
        const maxAyah  = first?.surah?.numberOfAyahs || 7;
        await interaction.editReply({
          embeds: [buildAyahEmbed(data, transKey)],
          components: [buildTranslationSelectMenu(transKey), buildAyahNavButtons(surahNum, ayahNum, maxAyah, transKey)]
        });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not load a random ayah.")] });
      }
    }

    // 📚 Tafsir button on ayah — opens tafsir scholar selector
    // customId: "tafsir_open_<surah>_<ayah>"
    else if (id.startsWith("tafsir_open_")) {
      await interaction.deferUpdate();
      const surah   = parseInt(parts[2]);
      const ayahNum = parseInt(parts[3]);
      const embed   = new EmbedBuilder()
        .setColor(0x4A148C)
        .setTitle("📚  Choose a Tafsir")
        .setDescription(`Select a scholar's Tafsir for **${surah}:${ayahNum}** from the dropdown below.\n\nAvailable:\n` +
          Object.entries(TAFSIR_EDITIONS).map(([, v]) => `${v.flag} **${v.name}** — *${v.scholar}* (${v.lang})`).join("\n")
        )
        .setFooter({ text: "تفسير القرآن الكريم" });
      await interaction.editReply({
        embeds: [embed],
        components: [buildTafsirSelectMenu(surah, ayahNum)]
      });
    }

    // Asma ul Husna nav
    else if (id.startsWith("asma_")) {
      await interaction.deferUpdate();
      const num  = parseInt(parts[2]);
      const name = ASMA_NAMES[num - 1];
      if (!name) return interaction.editReply({ embeds: [buildErrorEmbed("Name not found.")] });
      await interaction.editReply({
        embeds: [buildAsmaEmbed(name)],
        components: [buildAsmaNavButtons(num)]
      });
    }
  }
});

// ─────────────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────────────
if (!process.env.DISCORD_TOKEN) {
  console.error("❌  DISCORD_TOKEN not set. Create a .env file with your token.");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
