/**
 * ══════════════════════════════════════════
 *  SEERAH — Life of the Prophet ﷺ
 *  Key events organized chronologically
 * ══════════════════════════════════════════
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");

const PERIODS = {
  before_prophethood: { label: "Before Prophethood",       emoji: "🌱", color: 0x2E7D32,  years: "570–610 CE" },
  early_mecca:        { label: "Early Meccan Period",      emoji: "🌙", color: 0x4A148C,  years: "610–615 CE" },
  middle_mecca:       { label: "Middle Meccan Period",     emoji: "⚡", color: "0x880E4F", years: "615–619 CE" },
  late_mecca:         { label: "Late Meccan Period",       emoji: "🌟", color: 0x37474F,  years: "619–622 CE" },
  madinah_early:      { label: "Early Madinan Period",     emoji: "🕌", color: 0x1B5E20,  years: "622–625 CE" },
  madinah_middle:     { label: "Middle Madinan Period",    emoji: "⚔️", color: 0xB71C1C,  years: "625–628 CE" },
  madinah_late:       { label: "Late Madinan Period",      emoji: "🌸", color: 0x0D47A1,  years: "628–632 CE" },
};

const EVENTS = [
  // ── BEFORE PROPHETHOOD ───────────────────────
  {
    id: "s_001", period: "before_prophethood",
    year: "570 CE / 53 BH", title: "Birth of the Prophet ﷺ",
    detail: "Muhammad ibn Abdullah ﷺ was born in Mecca in the Year of the Elephant (Am al-Fil), when Abraha's army came to destroy the Ka'bah and was destroyed by Allah through the birds (Surah Al-Feel). He was born on a Monday in the month of Rabi' al-Awwal. His father Abdullah had died before his birth. His grandfather Abd al-Muttalib named him Muhammad — a name unprecedented among the Arabs at that time.",
    lesson: "Allah prepared the world for His Prophet ﷺ before his birth — the destruction of Abraha's army was a sign of the sanctity of what was coming.",
    source: "Sahih al-Bukhari 3554, Ibn Hisham's Seerah",
  },
  {
    id: "s_002", period: "before_prophethood",
    year: "575 CE / 48 BH", title: "Death of Aminah — The Prophet's Mother",
    detail: "When the Prophet ﷺ was around 6 years old, his mother Aminah bint Wahb passed away at a place called Al-Abwa', between Mecca and Madinah, while returning from visiting her husband's grave in Madinah. The young Muhammad ﷺ witnessed his mother's death. He was then placed under the care of his grandfather Abd al-Muttalib.",
    lesson: "The Prophet ﷺ experienced profound loss from a young age — Allah was preparing him with patience, resilience, and dependence on Him alone.",
    source: "Ibn Hisham's Seerah, Ibn Sa'd's Tabaqat",
  },
  {
    id: "s_003", period: "before_prophethood",
    year: "594 CE / 16 BH", title: "Marriage to Khadijah (رضي الله عنها)",
    detail: "At age 25, Muhammad ﷺ married Khadijah bint Khuwaylid, a respected and wealthy businesswoman of Quraysh who was 40 years old. She had employed him to manage her trade caravan to Syria, and was deeply impressed by his honesty and character. She proposed the marriage. Khadijah was the first to believe in him when revelation came, and she comforted him during the most difficult moments of prophethood. She bore him six children: Qasim, Zaynab, Ruqayyah, Umm Kulthum, Fatimah, and Abdullah.",
    lesson: "Khadijah (رضي الله عنها) showed that a strong, righteous woman is a pillar of support for the mission of faith.",
    source: "Sahih al-Bukhari 3818, Ibn Hisham's Seerah",
  },
  {
    id: "s_004", period: "before_prophethood",
    year: "605 CE / 5 BH", title: "Rebuilding the Ka'bah & the Black Stone",
    detail: "The Quraysh rebuilt the Ka'bah after it had been damaged by floods. When it came time to replace the Black Stone (al-Hajar al-Aswad) in its corner, the tribes nearly came to war over who had the honor of placing it. They agreed that the next man to enter the mosque would judge. That man was Muhammad ﷺ — before prophethood. He placed the stone on a cloth, had each tribe's leader hold an edge, and lifted it himself into place. All were satisfied. This was one of many signs of his exceptional wisdom.",
    lesson: "Wisdom and justice can resolve what force and pride cannot.",
    source: "Ibn Hisham's Seerah Vol. 1",
  },

  // ── EARLY MECCAN PERIOD ───────────────────────
  {
    id: "s_005", period: "early_mecca",
    year: "610 CE / 1 BH (40 years old)", title: "The First Revelation — Beginning of Prophethood",
    detail: "While in seclusion in the Cave of Hira on Jabal al-Nur, the Angel Jibreel (عليه السلام) came to Muhammad ﷺ and said 'Iqra' (Read/Recite). The Prophet ﷺ said: 'I cannot read.' Jibreel embraced him tightly three times, then recited the first verses of Surah Al-Alaq (96:1-5). The Prophet ﷺ returned home trembling and told Khadijah what had happened. She wrapped him in a cloak and said: 'By Allah, Allah will never disgrace you.' She took him to her cousin Waraqah ibn Nawfal, a Christian scholar, who recognized the signs of prophethood.",
    lesson: "Prophethood begins with 'Read' — knowledge is the foundation of Islam.",
    source: "Sahih al-Bukhari 3, Sahih Muslim 160",
  },
  {
    id: "s_006", period: "early_mecca",
    year: "610 CE", title: "The First Muslims",
    detail: "The first to embrace Islam were: Khadijah (رضي الله عنها) — the first adult woman; Ali ibn Abi Talib (رضي الله عنه) — the first child; Zayd ibn Harithah (رضي الله عنه) — the freed slave; and Abu Bakr al-Siddiq (رضي الله عنه) — the first free adult man. Abu Bakr then called others to Islam including Uthman, Zubayr, Abd al-Rahman ibn Awf, and others. These were among the first generation of Muslims in history.",
    lesson: "The first Muslims came from diverse backgrounds — man and woman, young and old, free and enslaved — showing Islam's universal message.",
    source: "Ibn Hisham's Seerah, Tabaqat Ibn Sa'd",
  },
  {
    id: "s_007", period: "early_mecca",
    year: "613 CE", title: "Public Preaching — Da'wah Goes Open",
    detail: "For the first three years, the Prophet ﷺ called to Islam secretly. Then Allah revealed: 'Warn your nearest kinsfolk' (26:214) and 'Proclaim what you are commanded' (15:94). The Prophet ﷺ climbed Mount Safa and called all of Quraysh. He asked: 'If I told you an army is behind this mountain, would you believe me?' They said: 'Yes — we have never known you to lie.' He said: 'Then I warn you of a severe punishment before you.' Abu Lahab cursed him, and Surah Al-Masad was revealed.",
    lesson: "Truth must be proclaimed openly even when it is unwelcome.",
    source: "Sahih al-Bukhari 4770, 4971",
  },

  // ── MIDDLE MECCAN PERIOD ──────────────────────
  {
    id: "s_008", period: "middle_mecca",
    year: "615 CE", title: "First Migration to Abyssinia",
    detail: "As persecution intensified in Mecca, the Prophet ﷺ instructed a group of companions to migrate to Abyssinia (Ethiopia) under the Christian King Negus (Al-Najashi), saying: 'There is a king there who wrongs no one.' A group of 12 men and 4 women made the first hijrah in Islam. The Quraysh sent emissaries to demand their return. Ja'far ibn Abi Talib (رضي الله عنه) recited Surah Maryam to the king, who declared: 'The difference between what you say about Jesus and what we say is no more than this line' — drawing a line on the ground. He refused to hand them over.",
    lesson: "Seeking a land of safety when persecuted is a prophetic sunnah, not an abandonment of faith.",
    source: "Musnad Ahmad, Ibn Hisham's Seerah",
  },
  {
    id: "s_009", period: "middle_mecca",
    year: "619 CE", title: "The Year of Grief (Am al-Huzn)",
    detail: "Within the same year, the Prophet ﷺ lost his beloved wife Khadijah (رضي الله عنها) and his uncle and protector Abu Talib. Khadijah had been his greatest support for 25 years. Abu Talib's death removed political protection from the Prophet ﷺ in Mecca, emboldening the Quraysh. The Prophet ﷺ named this year 'Am al-Huzn' — the Year of Grief. He traveled to Ta'if seeking support, but was mocked and driven out with stones. He bled but refused the angel's offer to destroy the town, saying: 'Perhaps from their descendants will come those who worship Allah alone.'",
    lesson: "The greatest character is shown in the deepest pain — mercy for those who harm you is the highest station.",
    source: "Sahih al-Bukhari 3231, Sahih Muslim 1795",
  },

  // ── LATE MECCAN PERIOD ───────────────────────
  {
    id: "s_010", period: "late_mecca",
    year: "620 CE", title: "Al-Isra' wal-Mi'raj — The Night Journey and Ascension",
    detail: "The Prophet ﷺ was taken by night from Masjid al-Haram to Masjid al-Aqsa in Jerusalem (Al-Isra'), then ascended through the heavens to the highest point (Al-Mi'raj). He met the prophets in each heaven, saw Paradise and the Hellfire, and received the obligation of the five daily prayers — originally 50, reduced to 5 through the intercession of Musa (عليه السلام)'s advice. When the Prophet ﷺ informed the Quraysh the next morning, most mocked him. Abu Bakr said: 'If he says it, it is true' — earning the title 'Al-Siddiq' (the Truthbearer).",
    lesson: "The five daily prayers were given directly in the heavens — their importance is beyond all other acts of worship.",
    source: "Sahih al-Bukhari 349, Sahih Muslim 163, Al-Isra' 17:1",
  },
  {
    id: "s_011", period: "late_mecca",
    year: "622 CE", title: "The Hijrah — Migration to Madinah",
    detail: "After 13 years of persecution in Mecca, with the Quraysh plotting to assassinate the Prophet ﷺ, Allah permitted the migration (hijrah) to Yathrib (Madinah). The Prophet ﷺ left his home with Abu Bakr, while Ali (رضي الله عنه) slept in his bed as a decoy. They hid in the Cave of Thawr for 3 days while search parties passed. The Prophet ﷺ told Abu Bakr, who was afraid: 'What do you think of two when Allah is their third?' They arrived in Quba and then Madinah. The Islamic calendar (Hijri) begins from this event.",
    lesson: "Trust in Allah transforms even a cave into safety. The Hijri calendar begins here — signifying that building a community of faith is the foundation of Islamic civilization.",
    source: "Sahih al-Bukhari 3653, At-Tawbah 9:40",
  },

  // ── EARLY MADINAN PERIOD ─────────────────────
  {
    id: "s_012", period: "madinah_early",
    year: "622 CE", title: "Arrival in Madinah — Building the First Mosque",
    detail: "Upon arriving in Madinah, the Prophet ﷺ let his camel Qaswa walk freely and wherever it knelt, that would be the site of the mosque. It knelt at a plot owned by two orphan boys — he paid for it. The Prophet ﷺ and his companions built Masjid al-Nabawi with their own hands. He also established the Brotherhood (Mu'akhat) between the Muhajirun (migrants) and Ansar (helpers) — pairing each migrant with an Ansari who shared his wealth and home. This was an unprecedented social bond in human history.",
    lesson: "The first act of building an Islamic community was a mosque — the center of spiritual and social life.",
    source: "Sahih al-Bukhari 428, Ibn Hisham's Seerah",
  },
  {
    id: "s_013", period: "madinah_early",
    year: "624 CE / 2 AH", title: "Battle of Badr — The Day of Criterion",
    detail: "The first major battle of Islam. 313 ill-equipped Muslims faced over 1,000 Quraysh warriors. Allah sent angels to assist. The Muslims were victorious, killing 70 Quraysh leaders including Abu Jahl, and capturing 70 more. Allah called this battle 'Yawm al-Furqan' — The Day of Criterion (Surah Al-Anfal 8:41). The Prophet ﷺ instructed that captured prisoners be treated kindly, and offered freedom to those who could teach 10 Muslim children to read.",
    lesson: "Victory comes through trust in Allah, not through numbers. Education was valued over ransom — Islam elevated knowledge from its very beginning.",
    source: "Sahih al-Bukhari 3986, Al-Anfal 8:9",
  },

  // ── MIDDLE MADINAN PERIOD ────────────────────
  {
    id: "s_014", period: "madinah_middle",
    year: "625 CE / 3 AH", title: "Battle of Uhud — A Lesson in Obedience",
    detail: "The Quraysh returned with 3,000 soldiers. The Muslims were winning until archers disobeyed the Prophet's ﷺ command to not leave their position on the mountain, thinking the battle was won. The Quraysh cavalry exploited this and turned the tide. The Prophet ﷺ himself was wounded — his face was struck, a tooth broken. 70 companions were martyred including Hamzah ibn Abd al-Muttalib (رضي الله عنه), the 'Lion of Allah.' The Prophet ﷺ said about Hamzah: 'He is the master of the martyrs.' Allah revealed Surah Al-Imran extensively about this day.",
    lesson: "Obedience to the Prophet ﷺ is not optional. Partial obedience can undo an entire victory.",
    source: "Sahih al-Bukhari 4557, Sahih Muslim 1789",
  },
  {
    id: "s_015", period: "madinah_middle",
    year: "627 CE / 5 AH", title: "Battle of the Trench (Al-Khandaq)",
    detail: "The Quraysh assembled a coalition of 10,000 soldiers for a final assault on Madinah. The Persian companion Salman al-Farisi (رضي الله عنه) suggested digging a trench around Madinah — a Persian military tactic unknown to the Arabs. The Prophet ﷺ dug alongside the companions. The coalition was held at bay for weeks, then dispersed by a fierce wind sent by Allah. A treacherous act by Banu Qurayza on the inside was also dealt with. This was a turning point — after this, the Quraysh never threatened Madinah again.",
    lesson: "Taking advice from anyone — regardless of origin — is a strength, not a weakness. Salman is 'of us, the family of the Prophet' ﷺ said.",
    source: "Sahih al-Bukhari 2835, Al-Ahzab 33:9-27",
  },

  // ── LATE MADINAN PERIOD ──────────────────────
  {
    id: "s_016", period: "madinah_late",
    year: "628 CE / 6 AH", title: "Treaty of Hudaybiyyah",
    detail: "The Prophet ﷺ and 1,400 companions set out for Mecca for Umrah. Stopped at Hudaybiyyah, a treaty was signed with the Quraysh. Its terms seemed unfavorable — Muslims could not enter Mecca that year, anyone from Mecca who came to Madinah would be returned, but anyone from Madinah who went to Mecca would not be returned. Umar (رضي الله عنه) was deeply troubled. But Allah called it 'a clear victory' (Surah Al-Fath). Within 2 years, more people entered Islam in the time of peace than in all the years of war.",
    lesson: "What looks like defeat may be Allah's greatest victory. Patience with apparently unfavorable terms is a form of worship.",
    source: "Sahih al-Bukhari 2731, Al-Fath 48:1",
  },
  {
    id: "s_017", period: "madinah_late",
    year: "630 CE / 8 AH", title: "The Conquest of Mecca",
    detail: "After the Quraysh violated the treaty, the Prophet ﷺ marched on Mecca with 10,000 companions. He entered without fighting. At the Ka'bah, he destroyed the 360 idols while reciting: 'Truth has come, and falsehood has perished. Indeed falsehood is bound to perish.' (17:81). He then asked the Quraysh: 'What do you think I will do to you?' They said: 'A generous brother and son of a generous brother.' He replied: 'Go — you are free.' The man who had persecuted, tortured, and killed his companions for 20 years — he forgave them all.",
    lesson: "The greatest conqueror is one who conquers his own desire for revenge. This is the most powerful da'wah act in history.",
    source: "Sahih al-Bukhari 4280, Sunan Abu Dawud 3022",
  },
  {
    id: "s_018", period: "madinah_late",
    year: "632 CE / 10 AH", title: "The Farewell Hajj & Final Sermon",
    detail: "The Prophet ﷺ performed his only Hajj — the Hajj al-Wada' (Farewell Pilgrimage) — with over 100,000 companions. On the plain of Arafah, he delivered the Farewell Sermon (Khutbat al-Wada'), declaring: 'O people — your blood, your wealth, your honor are sacred among you.' 'I have left among you two things — if you hold to them you will never go astray: the Book of Allah and my Sunnah.' Allah then revealed: 'Today I have perfected your religion for you and completed My favor upon you.' (5:3). The Prophet ﷺ then asked: 'Have I conveyed?' The crowd replied: 'Yes!' He said: 'O Allah, bear witness.'",
    lesson: "The final message of the Prophet ﷺ was about human dignity, unity, and holding fast to the Quran and Sunnah.",
    source: "Sahih al-Bukhari 1741, Sahih Muslim 1218, Al-Ma'idah 5:3",
  },
  {
    id: "s_019", period: "madinah_late",
    year: "632 CE / 11 AH", title: "The Death of the Prophet ﷺ",
    detail: "On Monday, 12 Rabi' al-Awwal, 11 AH — the Prophet ﷺ passed away at the age of 63, in the arms of his wife Aisha (رضي الله عنها), with his head resting on her lap. His last words were: 'O Allah, the Highest Companion.' When the news spread, Umar (رضي الله عنه) stood up and said he had not died. Abu Bakr (رضي الله عنه) came, uncovered the Prophet's face, kissed him, and said: 'As for the one who worshipped Muhammad ﷺ — Muhammad has died. But as for the one who worships Allah — Allah is Ever-Living and never dies.' He then recited: 'Muhammad is not but a messenger.' (3:144). Umar's legs gave way.",
    lesson: "The Prophet ﷺ left us, but the Quran and his Sunnah remain. Our worship is for Allah — the Ever-Living.",
    source: "Sahih al-Bukhari 4462, 3668, Al-Imran 3:144",
  },
];

const PERIOD_KEYS = Object.keys(PERIODS);

function buildEventEmbed(event) {
  const period = PERIODS[event.period];
  return new EmbedBuilder()
    .setColor(period.color)
    .setAuthor({ name: `${period.emoji}  Seerah — ${period.label}  (${period.years})` })
    .setTitle(`📅  ${event.year}  —  ${event.title}`)
    .setDescription(event.detail)
    .addFields(
      { name: "💡 Lesson",  value: event.lesson  },
      { name: "📖 Source",  value: event.source  },
    )
    .setFooter({ text: "السيرة النبوية • Biography of the Prophet Muhammad ﷺ" })
    .setTimestamp();
}

function buildNavButtons(eventId, periodFilter = "all") {
  const pool = periodFilter === "all" ? EVENTS : EVENTS.filter(e => e.period === periodFilter);
  const idx  = pool.findIndex(e => e.id === eventId);
  const prev = pool[idx - 1];
  const next = pool[idx + 1];
  const row  = new ActionRowBuilder();
  if (prev) row.addComponents(new ButtonBuilder().setCustomId(`seerah_nav_${prev.id}_${periodFilter}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary));
  if (next) row.addComponents(new ButtonBuilder().setCustomId(`seerah_nav_${next.id}_${periodFilter}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary));
  row.addComponents(new ButtonBuilder().setCustomId(`seerah_rand_all`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary));
  return row;
}

function buildPeriodMenu(current = "all") {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_seerah_period")
      .setPlaceholder("Jump to a period...")
      .addOptions([
        { label: "All Events (Chronological)", value: "all", emoji: "📜" },
        ...PERIOD_KEYS.map(k => ({
          label: `${PERIODS[k].emoji} ${PERIODS[k].label}`,
          description: PERIODS[k].years,
          value: k,
          default: k === current,
        }))
      ])
  );
}

const command = new SlashCommandBuilder()
  .setName("seerah")
  .setDescription("Explore key events from the life of the Prophet Muhammad ﷺ")
  .addStringOption(o =>
    o.setName("period").setDescription("Filter by period of the Seerah")
      .addChoices(
        { name: "All Events", value: "all" },
        ...PERIOD_KEYS.map(k => ({ name: `${PERIODS[k].emoji} ${PERIODS[k].label} (${PERIODS[k].years})`, value: k }))
      )
  );

async function handleSeerah(interaction) {
  await interaction.deferReply();
  const period = interaction.options.getString("period") || "all";
  const pool   = period === "all" ? EVENTS : EVENTS.filter(e => e.period === period);
  const event  = pool[0];
  await interaction.editReply({
    embeds: [buildEventEmbed(event)],
    components: [buildPeriodMenu(period), buildNavButtons(event.id, period)]
  });
}

async function handleSelectPeriod(interaction) {
  await interaction.deferUpdate();
  const period = interaction.values[0];
  const pool   = period === "all" ? EVENTS : EVENTS.filter(e => e.period === period);
  const event  = pool[0];
  await interaction.editReply({
    embeds: [buildEventEmbed(event)],
    components: [buildPeriodMenu(period), buildNavButtons(event.id, period)]
  });
}

async function handleButton(interaction) {
  await interaction.deferUpdate();
  const parts  = interaction.customId.split("_");
  const action = parts[1];
  if (action === "rand") {
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    await interaction.editReply({
      embeds: [buildEventEmbed(event)],
      components: [buildPeriodMenu("all"), buildNavButtons(event.id, "all")]
    });
  } else {
    const eventId = parts[2];
    const period  = parts[3] || "all";
    const event   = EVENTS.find(e => e.id === eventId);
    if (!event) return;
    await interaction.editReply({
      embeds: [buildEventEmbed(event)],
      components: [buildPeriodMenu(period), buildNavButtons(event.id, period)]
    });
  }
}

module.exports = {
  EVENTS, PERIODS,
  commands: [command.toJSON()],
  handlers: { seerah: handleSeerah },
  selectHandler: handleSelectPeriod,
  buttonHandler: handleButton,
};
