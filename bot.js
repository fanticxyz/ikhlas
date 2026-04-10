/**
 * ═══════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT — Full Hadith Collections
 *   Powered by fawazahmed0/hadith-api (no key needed)
 *   + AlQuran.cloud API for Quran
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
//  COLLECTION REGISTRY  (all free, no API key needed)
//  Source: cdn.jsdelivr.net/gh/fawazahmed0/hadith-api
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
const CDN      = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const QURAN_API = "https://api.alquran.cloud/v1";

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

async function fetchAyah(surah, ayah) {
  const res = await fetch(`${QURAN_API}/ayah/${surah}:${ayah}/en.asad`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchRandomAyah() {
  const surah = Math.floor(Math.random() * 114) + 1;
  const infoRes = await fetch(`${QURAN_API}/surah/${surah}`);
  const info = await infoRes.json();
  const ayahCount = info.data?.numberOfAyahs || 7;
  const ayah = Math.floor(Math.random() * ayahCount) + 1;
  return fetchAyah(surah, ayah);
}

// ─────────────────────────────────────────────────────
//  EMBED BUILDERS
// ─────────────────────────────────────────────────────
function buildHadithEmbed(collectionKey, hadithData, number, includeArabic = false, arabicData = null) {
  const col  = COLLECTIONS[collectionKey];
  const text = hadithData?.hadiths?.[0]?.text || hadithData?.text || "Text unavailable.";
  const section = hadithData?.metadata?.name || hadithData?.section?.title || null;

  const embed = new EmbedBuilder()
    .setColor(col.color)
    .setAuthor({ name: `${col.emoji}  ${col.name}  •  Hadith #${number}` })
    .setDescription(`*"${text}"*`)
    .addFields(
      { name: "📖 Collection", value: col.name,   inline: true },
      { name: "🔢 Number",     value: `#${number}`, inline: true }
    )
    .setFooter({ text: "No knowledge except what Allah has taught • لا علم إلا ما علَّم الله" })
    .setTimestamp();

  if (section) {
    embed.addFields({ name: "📂 Book/Chapter", value: section });
  }

  if (includeArabic && arabicData) {
    const arabicText = arabicData?.hadiths?.[0]?.text || arabicData?.text;
    if (arabicText) {
      embed.addFields({ name: "🕌 Arabic Text", value: `\`\`\`${arabicText.substring(0, 1000)}\`\`\`` });
    }
  }

  return embed;
}

function buildAyahEmbed(ayahData) {
  const a = ayahData?.data;
  if (!a) return new EmbedBuilder().setColor(0x1B5E20).setDescription("Could not fetch ayah.");

  return new EmbedBuilder()
    .setColor(0x2E7D32)
    .setAuthor({ name: `📖  Quran — ${a.surah?.englishName || ""} (${a.surah?.name || ""})` })
    .setDescription(`*"${a.text}"*`)
    .addFields(
      { name: "📍 Reference",   value: `Surah ${a.surah?.englishName} ${a.surah?.number}:${a.numberInSurah}`, inline: true },
      { name: "🌐 Translation", value: "Muhammad Asad",                                                        inline: true }
    )
    .setFooter({ text: "القرآن الكريم — The Noble Quran" })
    .setTimestamp();
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
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1)),

  new SlashCommandBuilder()
    .setName("randomayah")
    .setDescription("Get a random Quran verse"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Today's daily reminder — auto-selected hadith + ayah, changes every day"),

  new SlashCommandBuilder()
    .setName("collections")
    .setDescription("List all available hadith collections and their sizes"),

  new SlashCommandBuilder()
    .setName("explore")
    .setDescription("Open an interactive collection explorer with a dropdown menu"),

].map(c => c.toJSON());

// ─────────────────────────────────────────────────────
//  BOT EVENTS
// ─────────────────────────────────────────────────────
client.once("ready", async () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Slash commands registered globally");
  } catch (e) {
    console.error("Command registration error:", e);
  }
});

client.on("interactionCreate", async interaction => {

  // ── SLASH COMMANDS ─────────────────────────────────
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply();
    const cmd = interaction.commandName;

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

    else if (cmd === "ayah") {
      const surah = interaction.options.getInteger("surah");
      const ayah  = interaction.options.getInteger("ayah");
      try {
        const data = await fetchAyah(surah, ayah);
        await interaction.editReply({ embeds: [buildAyahEmbed(data)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed(`Could not load ${surah}:${ayah}. Check the ayah number.`)] });
      }
    }

    else if (cmd === "randomayah") {
      try {
        const data = await fetchRandomAyah();
        await interaction.editReply({ embeds: [buildAyahEmbed(data)] });
      } catch {
        await interaction.editReply({ embeds: [buildErrorEmbed("Could not fetch a random ayah.")] });
      }
    }

    else if (cmd === "daily") {
      const today  = new Date();
      const seed   = today.getFullYear() * 1000 + today.getMonth() * 31 + today.getDate();
      const colKey = COLLECTION_KEYS[seed % COLLECTION_KEYS.length];
      const col    = COLLECTIONS[colKey];
      const hNum   = (seed % col.totalHadiths) + 1;

      try {
        const [hData, aData] = await Promise.all([
          fetchHadith(col.edition, hNum),
          fetchRandomAyah()
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

    else if (cmd === "collections") {
      await interaction.editReply({ embeds: [buildCollectionListEmbed()] });
    }

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
  }

  // ── SELECT MENU ────────────────────────────────────
  else if (interaction.isStringSelectMenu() && interaction.customId === "select_collection") {
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

  // ── BUTTONS ────────────────────────────────────────
  else if (interaction.isButton()) {
    const parts    = interaction.customId.split("_");
    const action   = parts[0];
    const colKey   = parts[1];
    const num      = parseInt(parts[2]);

    if (action === "nav") {
      await interaction.deferUpdate();
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

    else if (action === "arabic") {
      await interaction.deferUpdate();
      const col = COLLECTIONS[colKey];
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
