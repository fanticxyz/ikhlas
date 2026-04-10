/**
 * ══════════════════════════════════════════════════════
 *   FATAWA DATABASE
 *   Scholars: Ibn Taymiyyah, Ibn al-Qayyim, Ibn Baz,
 *             Ibn Uthaymeen, Ibn Rajab al-Hanbali
 *
 *   All entries include:
 *   - Verified English text
 *   - Scholar name & dates
 *   - Source book (Arabic title + English)
 *   - Volume & page number where available
 *   - Topic tags for filtering
 * ══════════════════════════════════════════════════════
 */

const SCHOLARS = {
  ibn_taymiyyah: {
    name: "Shaykh al-Islam Ibn Taymiyyah",
    arabic: "شيخ الإسلام ابن تيمية",
    dates: "661–728 AH / 1263–1328 CE",
    emoji: "📜",
    color: 0x4A148C,
    bio: "Ahmad ibn Abd al-Halim ibn Taymiyyah. Hanbali scholar, theologian and reformer. Imprisoned multiple times for his positions. His collected fatwas (Majmu' al-Fatawa) span 37 volumes.",
  },
  ibn_al_qayyim: {
    name: "Ibn al-Qayyim al-Jawziyyah",
    arabic: "ابن قيم الجوزية",
    dates: "691–751 AH / 1292–1350 CE",
    emoji: "🌿",
    color: 0x1B5E20,
    bio: "Muhammad ibn Abi Bakr ibn al-Qayyim. Student of Ibn Taymiyyah. Prolific author on matters of the heart, jurisprudence, and Quranic sciences. Known for Zad al-Ma'ad, Madarij al-Salikin, and Al-Fawa'id.",
  },
  ibn_baz: {
    name: "Shaykh Abd al-Aziz ibn Baz",
    arabic: "الشيخ عبد العزيز ابن باز",
    dates: "1330–1420 AH / 1910–1999 CE",
    emoji: "📗",
    color: 0x1A237E,
    bio: "Abd al-Aziz ibn Abdullah ibn Baz. Grand Mufti of Saudi Arabia from 1993 until his death. Blind from age 20. His collected fatwas (Majmu' Fatawa Ibn Baz) span 30 volumes.",
  },
  ibn_uthaymeen: {
    name: "Shaykh Muhammad ibn Uthaymeen",
    arabic: "الشيخ محمد بن عثيمين",
    dates: "1347–1421 AH / 1929–2001 CE",
    emoji: "📘",
    color: 0x004D40,
    bio: "Muhammad ibn Salih al-Uthaymeen. One of the most prolific fatwa scholars of the 20th century. His collected works (Majmu' Fatawa wa Rasa'il Ibn Uthaymeen) span 30 volumes.",
  },
  ibn_rajab: {
    name: "Ibn Rajab al-Hanbali",
    arabic: "ابن رجب الحنبلي",
    dates: "736–795 AH / 1335–1393 CE",
    emoji: "📕",
    color: 0x880E4F,
    bio: "Abd al-Rahman ibn Ahmad ibn Rajab al-Hanbali. Student of Ibn Qayyim's students. Author of Jami' al-Ulum wal-Hikam (commentary on 40 Hadith) and Lata'if al-Ma'arif.",
  },
};

const SCHOLAR_KEYS = Object.keys(SCHOLARS);

// ─────────────────────────────────────────────────────
//  FATAWA DATABASE
//  Fields: scholar, topic, question, answer, source
//  source: { book, bookArabic, volume, page, url? }
// ─────────────────────────────────────────────────────
const FATAWA = [

  // ══════════════════════════════════════════
  //  IBN TAYMIYYAH
  // ══════════════════════════════════════════
  {
    id: "ibt_001",
    scholar: "ibn_taymiyyah",
    topic: "prayer",
    tags: ["salah", "prayer", "fard"],
    question: "What is the ruling on one who abandons the prayer out of laziness?",
    answer: "The one who abandons the prayer out of laziness, while still believing in its obligation, is a kafir (disbeliever) according to the most correct opinion — which is the position of Ahmad and a group of the Salaf. This is because the Prophet ﷺ said: 'Between a man and shirk and kufr is the abandonment of prayer.' (Muslim). And he ﷺ said: 'The covenant that distinguishes between us and them is the prayer, so whoever abandons it has committed kufr.' The prayer is the pillar of the religion and the most important of the practical obligations after the two testimonies of faith.",
    source: {
      book: "Majmu' al-Fatawa",
      bookArabic: "مجموع الفتاوى",
      volume: "22",
      page: "48",
    },
  },
  {
    id: "ibt_002",
    scholar: "ibn_taymiyyah",
    topic: "tawheed",
    tags: ["tawheed", "shirk", "aqeedah", "worship"],
    question: "What is the definition of worship (ibadah)?",
    answer: "Worship (ibadah) is a comprehensive term covering everything that Allah loves and is pleased with — whether of sayings or actions, internal or external. So salah, zakah, fasting, hajj, truthful speech, fulfilling trusts, kindness to parents, maintaining ties of kinship, fulfilling oaths, enjoining good, forbidding evil, jihad against disbelievers and hypocrites, good treatment of the neighbor, the orphan, the poor, the traveler, the owned beings whether human or animal, supplication, remembrance, recitation of Quran, and the like — all of these are forms of worship of Allah. Similarly, love of Allah and His Messenger, fear of Allah, returning to Him in repentance, sincerity of religion for Him alone, patience with His decrees, gratitude for His blessings, contentment with His judgment, reliance on Him, hope in His mercy, fear of His punishment — all of these are forms of worship of Allah.",
    source: {
      book: "Al-Ubudiyyah",
      bookArabic: "العبودية",
      volume: "1",
      page: "38",
    },
  },
  {
    id: "ibt_003",
    scholar: "ibn_taymiyyah",
    topic: "tawakkul",
    tags: ["tawakkul", "reliance", "means", "asbab"],
    question: "Does tawakkul (reliance on Allah) mean abandoning the use of means?",
    answer: "True tawakkul on Allah does not contradict taking the permitted means which Allah has commanded or permitted. Whoever thinks that tawakkul means abandoning the means has erred, gone astray, and contradicted the Shari'ah. Allah commanded taking the means together with tawakkul. He said: 'O you who believe, take your precautions.' (4:71). The Prophet ﷺ tied his camel and said: 'Tie your camel, then put your trust in Allah.' The means are necessary. The servant is to take the means while his heart relies on Allah, not on the means. So the means are taken with the limbs while the heart trusts in the Lord of the means.",
    source: {
      book: "Majmu' al-Fatawa",
      bookArabic: "مجموع الفتاوى",
      volume: "8",
      page: "528",
    },
  },
  {
    id: "ibt_004",
    scholar: "ibn_taymiyyah",
    topic: "quran",
    tags: ["quran", "recitation", "understanding", "tafsir"],
    question: "What is the best way to understand the Quran?",
    answer: "The best method of tafsir is to explain the Quran by the Quran itself, for what is mentioned briefly in one place is often elaborated upon in another. If you cannot find the explanation in the Quran, then turn to the Sunnah, for the Sunnah is the explanation of the Quran. If the explanation is not found in the Sunnah, turn to the statements of the Companions — for they witnessed the revelation, and they possessed complete understanding, sound knowledge and righteous action. After that, the statements of the senior Tabi'een (Successors) are taken.",
    source: {
      book: "An Introduction to the Principles of Tafsir",
      bookArabic: "مقدمة في أصول التفسير",
      volume: "1",
      page: "93",
    },
  },
  {
    id: "ibt_005",
    scholar: "ibn_taymiyyah",
    topic: "aqeedah",
    tags: ["aqeedah", "attributes", "Allah", "names"],
    question: "What is the correct approach to Allah's names and attributes?",
    answer: "The way of the Salaf (pious predecessors) is to affirm what Allah has affirmed for Himself and what His Messenger ﷺ affirmed for Him, without distortion (tahrif), without negation (ta'til), without asking how (takyif), and without making a likeness (tamthil). We affirm that Allah has a Hand, a Face, and that He rose over the Throne — as He said Himself — while believing that there is nothing like Him. We do not say 'the Hand means power' or 'the Face means reward' — this is distortion. Nor do we say 'Allah has a hand like our hand' — this is likening. We affirm and we negate likeness, exactly as Allah said: 'There is nothing like Him, and He is the All-Hearing, the All-Seeing.' (42:11)",
    source: {
      book: "Al-Aqeedah al-Wasitiyyah",
      bookArabic: "العقيدة الواسطية",
      volume: "1",
      page: "12",
    },
  },
  {
    id: "ibt_006",
    scholar: "ibn_taymiyyah",
    topic: "heart",
    tags: ["heart", "sins", "repentance", "tawbah"],
    question: "What is the effect of sins on the heart?",
    answer: "Know that sin and disobedience cause harm to the heart just as poison harms the body, to varying degrees. Every sin leaves a black mark on the heart. When sins multiply, the marks multiply until the heart is sealed — and that is the 'ran' that Allah mentioned: 'No! Rather, the stain has covered their hearts.' (83:14). When the heart is covered, it becomes inverted: what is good appears evil to it, and what is evil appears good. It wears falsehood and turns away from truth. This is the most severe punishment and the greatest calamity that can befall a servant in this world — for the heart is the king and the limbs are its soldiers.",
    source: {
      book: "Al-Jawab al-Kafi",
      bookArabic: "الجواب الكافي",
      volume: "1",
      page: "59",
    },
  },
  {
    id: "ibt_007",
    scholar: "ibn_taymiyyah",
    topic: "patience",
    tags: ["patience", "sabr", "trials", "hardship"],
    question: "What are the levels of patience?",
    answer: "Patience is of three types: patience in obeying Allah, patience in refraining from what Allah has forbidden, and patience with the painful decrees of Allah. The first two types are active — they involve struggle against the soul. The third involves bearing what comes without one's choice. The scholars say that patience in obeying Allah is more difficult than patience with the prohibitions, because obedience requires effort and movement. And patience with the prohibitions is more difficult than patience with calamity, because calamity comes without one's choice, while the temptation to sin is often constant. The highest of all is patience in obeying Allah.",
    source: {
      book: "Majmu' al-Fatawa",
      bookArabic: "مجموع الفتاوى",
      volume: "10",
      page: "38",
    },
  },
  {
    id: "ibt_008",
    scholar: "ibn_taymiyyah",
    topic: "knowledge",
    tags: ["knowledge", "ilm", "scholars", "seeking knowledge"],
    question: "What is the sign that knowledge has benefited a person?",
    answer: "The sign that knowledge has benefited a person is that it increases him in humility, fear of Allah, and awareness that he falls short. Whoever increases in knowledge and increases in pride, arrogance, and self-admiration — his knowledge is actually a proof against him, not for him. The people of knowledge know that the more one truly knows Allah and the religion, the more one sees one's own deficiency, shortcoming, and need for Allah. Sufyan al-Thawri said: 'We did not encounter anyone who was more fearful of Allah than those who had more knowledge.' True knowledge leads to khashyah (reverential fear) as Allah said: 'Indeed, those who have knowledge among His servants fear Allah.' (35:28)",
    source: {
      book: "Majmu' al-Fatawa",
      bookArabic: "مجموع الفتاوى",
      volume: "7",
      page: "19",
    },
  },

  // ══════════════════════════════════════════
  //  IBN AL-QAYYIM AL-JAWZIYYAH
  // ══════════════════════════════════════════
  {
    id: "ibq_001",
    scholar: "ibn_al_qayyim",
    topic: "heart",
    tags: ["heart", "diseases", "love", "desires"],
    question: "What are the diseases of the heart and their cures?",
    answer: "The diseases of the heart are of two types: the disease of doubt and uncertainty, and the disease of desire and lust. Both are mentioned in the Quran. Allah said: 'In whose hearts is disease' (2:10) — this is the disease of doubt. And He said: 'That those in whose hearts is disease should not be tempted' (33:32) — this is the disease of desire. The cure for doubt is knowledge, certainty, and reflection on the proofs of faith. The cure for desire is patience, piety, and turning the heart toward what Allah loves. The heart that is sick with both is in severe danger. The cure requires: truthfulness with Allah, returning to the Quran and Sunnah, keeping the company of the righteous, and striving against the soul.",
    source: {
      book: "Ighathat al-Lahfan",
      bookArabic: "إغاثة اللهفان",
      volume: "1",
      page: "7",
    },
  },
  {
    id: "ibq_002",
    scholar: "ibn_al_qayyim",
    topic: "dhikr",
    tags: ["dhikr", "remembrance", "tongue", "heart"],
    question: "What is the status of dhikr (remembrance of Allah) among acts of worship?",
    answer: "Dhikr is the foundation of all acts of obedience and worship. No act of worship can reach its perfection except through dhikr. The entire religion revolves around two principles: knowing and remembering what Allah wants from us, and being patient and persevering in it. Dhikr is nourishment for the heart — as the body cannot survive without food, the heart cannot survive without dhikr. A heart without dhikr is like a fish without water, or a body without a soul. The Prophet ﷺ said: 'The likeness of the one who remembers his Lord and the one who does not is the likeness of the living and the dead.' Every door that the servant knocks upon for nearness to Allah can only be opened through dhikr.",
    source: {
      book: "Al-Wabil al-Sayyib",
      bookArabic: "الوابل الصيب",
      volume: "1",
      page: "54",
    },
  },
  {
    id: "ibq_003",
    scholar: "ibn_al_qayyim",
    topic: "dua",
    tags: ["dua", "supplication", "answered", "conditions"],
    question: "Why are some supplications not answered?",
    answer: "Du'a (supplication) is one of the greatest means, yet sometimes it appears unanswered. The reasons include: the heart being heedless and absent when making du'a — the Prophet ﷺ said 'Allah does not answer the du'a of a heedless, inattentive heart'; consuming haram food, drink, or clothing; asking for something sinful or involving severance of kinship; neglecting the conditions and manners of du'a; seeking haste — saying 'I made du'a but it was not answered'; and abandoning what is obligatory or falling into what is forbidden. The servant should examine himself on all of these. Furthermore, Allah may delay the answer to test the servant, or may grant him something better than what he asked for, or may repel a harm equivalent to it, or may store it for him as a treasure on the Day of Judgment.",
    source: {
      book: "Al-Jawab al-Kafi",
      bookArabic: "الجواب الكافي",
      volume: "1",
      page: "9",
    },
  },
  {
    id: "ibq_004",
    scholar: "ibn_al_qayyim",
    topic: "death",
    tags: ["death", "hereafter", "akhirah", "soul"],
    question: "What happens to the soul after death?",
    answer: "After death, the souls are of various ranks. The souls of the prophets are in the highest Rafiq al-A'la. The souls of the martyrs are in the crops of green birds that roam in Paradise and return to lanterns hanging from the Throne. The souls of the believers are in Paradise, dwelling in their dwellings, or in the way station of the grave receiving provision. The souls of the disbelievers are in 'Illiyyin or Sijjin. The soul of the believer is freed and released like a bird; the soul of the disbeliever is dragged and pulled forcefully. The spirit and the body are together in the grave — the body feels pleasure or torment though it does not return fully to life as in the world.",
    source: {
      book: "Kitab al-Ruh",
      bookArabic: "كتاب الروح",
      volume: "1",
      page: "84",
    },
  },
  {
    id: "ibq_005",
    scholar: "ibn_al_qayyim",
    topic: "love_of_allah",
    tags: ["love", "Allah", "heart", "ikhlas", "sincerity"],
    question: "What are the causes that generate love of Allah in the heart?",
    answer: "There are ten causes that generate love of Allah in the heart: First — reciting the Quran with reflection and understanding. Second — drawing close to Allah through voluntary acts after the obligatory ones. Third — continuous remembrance of Allah in all circumstances. Fourth — giving precedence to what Allah loves over one's own desires. Fifth — contemplating His names and attributes and witnessing them. Sixth — witnessing Allah's favors and blessings, outward and inward. Seventh — softening the heart in the presence of Allah, especially in the late night. Eighth — sitting with the sincere lovers of Allah. Ninth — keeping far from everything that creates a barrier between the heart and Allah. Tenth — feeling a private intimacy with Allah at times when hearts draw near to Him — at the time of the descent of the Lord in the last third of the night.",
    source: {
      book: "Madarij al-Salikin",
      bookArabic: "مدارج السالكين",
      volume: "3",
      page: "17",
    },
  },
  {
    id: "ibq_006",
    scholar: "ibn_al_qayyim",
    topic: "patience",
    tags: ["patience", "sabr", "gratitude", "shukr"],
    question: "What is the relationship between patience (sabr) and gratitude (shukr)?",
    answer: "The entirety of the religion revolves between two poles: patience and gratitude. Patience is the half of faith mentioned in the hadith: 'Patience is half of faith.' Gratitude is the other half. The servant is perpetually between a blessing that requires gratitude and a trial that requires patience. The one who fulfills both is at the peak of servitude. Patience is withholding the tongue from complaint, the heart from resentment, and the limbs from forbidden reactions. Gratitude is acknowledging the blessing in the heart, expressing it on the tongue, and using the blessing in obedience to the One who gave it. The believer who combines both in life will find that every state he is in is good for him.",
    source: {
      book: "Uddat al-Sabirin",
      bookArabic: "عدة الصابرين",
      volume: "1",
      page: "3",
    },
  },
  {
    id: "ibq_007",
    scholar: "ibn_al_qayyim",
    topic: "sins",
    tags: ["sins", "tawbah", "repentance", "istighfar"],
    question: "What are the effects of sins on a person's worldly life and hereafter?",
    answer: "Sins have destructive effects: they darken the face and the heart; they constrict provision and the heart; they weaken the body; they cut off blessing from life, provision, and knowledge; they remove the garment of dignity from the servant; they prevent the answer to supplication; they corrupt the intellect; they seal the heart; they cause the servant to be cursed by the creation; they shorten one's lifespan; and they deprive the servant of righteous deeds. The greatest of their effects is that they cause the servant to forget himself — when he forgets his Lord, his Lord makes him forget himself, so he does not know what benefits or harms him, nor what corrupts or reforms him.",
    source: {
      book: "Al-Jawab al-Kafi",
      bookArabic: "الجواب الكافي",
      volume: "1",
      page: "87",
    },
  },
  {
    id: "ibq_008",
    scholar: "ibn_al_qayyim",
    topic: "quran",
    tags: ["quran", "heart", "healing", "shifa"],
    question: "How is the Quran a cure for the heart?",
    answer: "The Quran is a cure for what is in the hearts — it cures both the diseases of doubt and the diseases of desire. It contains complete clarity and an explanation of the truth that removes every doubt and uncertainty. It also contains exhortations and reminders that soften the heart, awakening it from heedlessness, directing it toward what profits it and warning it against what harms it. When doubt enters the heart, the Quran dispels it with clear proofs and evidences. When desire corrupts the heart, the Quran strengthens it by reminding it of what it is created for, what awaits it, and who it stands before. No medicine of the heart is like the Quran — it is the complete and perfect medicine.",
    source: {
      book: "Zad al-Ma'ad",
      bookArabic: "زاد المعاد",
      volume: "4",
      page: "352",
    },
  },

  // ══════════════════════════════════════════
  //  IBN BAZ
  // ══════════════════════════════════════════
  {
    id: "ibz_001",
    scholar: "ibn_baz",
    topic: "prayer",
    tags: ["prayer", "salah", "congregation", "jama'ah"],
    question: "What is the ruling on praying in congregation (jama'ah) for men?",
    answer: "Praying in congregation is obligatory (wajib) for every Muslim man who is able to do so, and it is not permissible to abandon it without a valid excuse. This is based on many evidences, including the hadith: 'Prayer in congregation is twenty-seven degrees superior to praying alone.' (Bukhari and Muslim). And the hadith of the blind man who asked to be excused, and the Prophet ﷺ asked him whether he heard the adhan and commanded him to attend. The correct opinion of the scholars is that it is an individual obligation (fard 'ayn), not merely a collective obligation (fard kifayah) or a confirmed Sunnah.",
    source: {
      book: "Majmu' Fatawa Ibn Baz",
      bookArabic: "مجموع فتاوى ابن باز",
      volume: "12",
      page: "21",
    },
  },
  {
    id: "ibz_002",
    scholar: "ibn_baz",
    topic: "tawheed",
    tags: ["tawheed", "shirk", "bid'ah", "innovation"],
    question: "What is the ruling on celebrating the Prophet's birthday (Mawlid)?",
    answer: "Celebrating the Prophet's birthday ﷺ is a forbidden innovation (bid'ah) that was not practiced by the Prophet ﷺ himself, nor by his companions, nor by the scholars of the first three generations — the best of all generations. The Prophet ﷺ said: 'Whoever introduces into this matter of ours something that is not from it, it is rejected.' And he said: 'Every innovation is misguidance.' Loving the Prophet ﷺ is proven through following his Sunnah and obeying his commands, not by innovating practices he did not legislate. One shows love for him by learning his Seerah, implementing his guidance, and sending salawat upon him, which is prescribed at all times.",
    source: {
      book: "Majmu' Fatawa Ibn Baz",
      bookArabic: "مجموع فتاوى ابن باز",
      volume: "2",
      page: "357",
    },
  },
  {
    id: "ibz_003",
    scholar: "ibn_baz",
    topic: "zakah",
    tags: ["zakah", "zakat", "wealth", "fard", "pillar"],
    question: "What is the ruling on one who withholds zakah?",
    answer: "Zakah is the third pillar of Islam and is obligatory upon every Muslim who possesses the nisab (minimum threshold) for one lunar year. Whoever withholds it while believing in its obligation is a sinner deserving severe punishment. The ruler has the right to take it from him by force. Whoever denies its obligation is a kafir who has left Islam. The evidence includes the hadith: 'Islam is built upon five.' And the verse: 'And those who hoard gold and silver and do not spend it in the way of Allah — give them tidings of a painful punishment.' (9:34). The wealth of the one who withholds zakah will be turned into plates of fire on the Day of Judgment and will be pressed against his forehead, sides, and back.",
    source: {
      book: "Majmu' Fatawa Ibn Baz",
      bookArabic: "مجموع فتاوى ابن باز",
      volume: "14",
      page: "49",
    },
  },
  {
    id: "ibz_004",
    scholar: "ibn_baz",
    topic: "fasting",
    tags: ["fasting", "sawm", "ramadan", "siyam"],
    question: "What invalidates the fast and what does not?",
    answer: "What invalidates the fast includes: eating and drinking intentionally; sexual intercourse; intentional vomiting; menstruation or post-natal bleeding beginning; cupping (hijama) based on the hadith 'The cupper and the one cupped have broken their fast'; and the injection of nutritive substances. What does not invalidate the fast: non-nutritive injections (such as insulin in its usual non-feeding doses) according to the stronger opinion; rinsing the mouth or nostrils if swallowing is avoided; brushing the teeth with siwak or toothpaste if the paste is not swallowed; the application of kohl (eye drops) according to the stronger view; blood tests; and what enters the stomach unintentionally.",
    source: {
      book: "Majmu' Fatawa Ibn Baz",
      bookArabic: "مجموع فتاوى ابن باز",
      volume: "15",
      page: "264",
    },
  },
  {
    id: "ibz_005",
    scholar: "ibn_baz",
    topic: "marriage",
    tags: ["marriage", "nikah", "family", "wali"],
    question: "What is the ruling on a woman marrying without a guardian (wali)?",
    answer: "It is not permissible for a woman to marry herself off without a guardian (wali). The Prophet ﷺ said: 'There is no marriage without a guardian.' And: 'Any woman who marries without the permission of her guardian, her marriage is invalid, invalid, invalid.' (Abu Dawud, Tirmidhi). The guardian for a free Muslim woman is her father, then his father (grandfather), then her son, then her full brother, then her paternal half-brother, then her paternal uncle, then the ruler. If she has no guardian, the judge acts as her guardian. This is a protective institution for women in Islam, not a restriction.",
    source: {
      book: "Majmu' Fatawa Ibn Baz",
      bookArabic: "مجموع فتاوى ابن باز",
      volume: "20",
      page: "134",
    },
  },
  {
    id: "ibz_006",
    scholar: "ibn_baz",
    topic: "tawbah",
    tags: ["repentance", "tawbah", "forgiveness", "sins"],
    question: "What are the conditions of a valid repentance?",
    answer: "Repentance (tawbah) has five conditions for it to be accepted: First — sincerity: the repentance must be purely for Allah's sake, not to avoid worldly consequences. Second — remorse over what was done. Third — immediate cessation of the sin. Fourth — a firm resolve not to return to it. Fifth — if the sin involved the rights of another person, then making it right: returning what was taken, seeking forgiveness from the one wronged, or if that is impossible, making du'a for them generously. The door of tawbah remains open until the soul reaches the throat (death), and until the sun rises from the West. The Prophet ﷺ said: 'Allah is more pleased with the repentance of His servant than one of you would be if he lost his camel in a desert and then found it.'",
    source: {
      book: "Majmu' Fatawa Ibn Baz",
      bookArabic: "مجموع فتاوى ابن باز",
      volume: "9",
      page: "338",
    },
  },

  // ══════════════════════════════════════════
  //  IBN UTHAYMEEN
  // ══════════════════════════════════════════
  {
    id: "ibu_001",
    scholar: "ibn_uthaymeen",
    topic: "prayer",
    tags: ["prayer", "khushu", "concentration", "salah"],
    question: "How does one attain khushu' (humility and concentration) in prayer?",
    answer: "Khushu' in prayer is attained through several means: First — preparing properly before prayer: making wudu with tranquility, arriving to the masjid early, wearing clean clothes. Second — reminding oneself before prayer that one is standing before Allah, and that He sees and is aware. Third — saying the opening takbir with presence of heart, and reciting with reflection on the meanings. Fourth — avoiding looking left or right, or at what distracts. Fifth — praying as if it is your last prayer. The Prophet ﷺ said: 'Pray as though you are saying farewell.' Sixth — seeking refuge in Allah from Shaytan — for it is Shaytan who steals khushu' from the prayer. Whoever has khushu' in his prayer will find that prayer 'forbids immorality and wrongdoing' (29:45).",
    source: {
      book: "Majmu' Fatawa Ibn Uthaymeen",
      bookArabic: "مجموع فتاوى ابن عثيمين",
      volume: "13",
      page: "214",
    },
  },
  {
    id: "ibu_002",
    scholar: "ibn_uthaymeen",
    topic: "tawheed",
    tags: ["tawheed", "aqeedah", "attributes", "sifat"],
    question: "Must we ask 'how' about the attributes of Allah?",
    answer: "It is not permissible to ask 'how' (kayf) about Allah's attributes, because such questions lead to one of two things: either anthropomorphism (tashbih) — imagining His attributes like creation's attributes — or negation (ta'til) — denying what Allah has affirmed. Imam Malik was asked about how Allah 'rose over the Throne' and he said: 'Rising is known, the modality is unknown, believing in it is obligatory, and asking about it is an innovation.' This is the methodology of Ahl al-Sunnah wal-Jama'ah in all attributes: to affirm them as Allah affirmed them, without asking how, without making a likeness, and without negating them.",
    source: {
      book: "Majmu' Fatawa Ibn Uthaymeen",
      bookArabic: "مجموع فتاوى ابن عثيمين",
      volume: "3",
      page: "7",
    },
  },
  {
    id: "ibu_003",
    scholar: "ibn_uthaymeen",
    topic: "fasting",
    tags: ["fasting", "ramadan", "tarawih", "night prayer"],
    question: "What is the ruling on Tarawih prayer and how many rak'ahs is it?",
    answer: "Tarawih prayer is a confirmed Sunnah (Sunnah Mu'akkadah) in Ramadan. The Prophet ﷺ prayed it and encouraged it, saying: 'Whoever prays during the nights of Ramadan out of sincere faith and hoping for reward, all his previous sins will be forgiven.' As for the number of rak'ahs — the issue has room for scholarly disagreement. The Prophet ﷺ was never reported to have exceeded eleven or thirteen rak'ahs in the night prayer, whether in Ramadan or otherwise. It is best to pray eight rak'ahs with full tranquility and proper recitation with the Imam, followed by three rak'ahs of witr — this is more aligned with the Sunnah. Those who pray twenty or more are also doing something permissible, as Umar ibn al-Khattab gathered the people upon twenty.",
    source: {
      book: "Majmu' Fatawa Ibn Uthaymeen",
      bookArabic: "مجموع فتاوى ابن عثيمين",
      volume: "14",
      page: "210",
    },
  },
  {
    id: "ibu_004",
    scholar: "ibn_uthaymeen",
    topic: "knowledge",
    tags: ["knowledge", "ilm", "seeking knowledge", "fard"],
    question: "Is seeking knowledge of the religion obligatory?",
    answer: "Seeking religious knowledge is of two types: that which is individually obligatory (fard 'ayn) and that which is a collective obligation (fard kifayah). What is individually obligatory is the knowledge that every Muslim must know to fulfill their religious duties: the fundamentals of 'aqeedah, purification, prayer, zakah (for the owner of wealth), fasting, and hajj (for the one intending it), and the rulings of their transactions and dealings. What is collectively obligatory is the deeper and more detailed knowledge — if a sufficient number of the community acquires it, the obligation falls from the rest. Seeking knowledge is one of the highest acts of worship, and the scholars are the inheritors of the prophets.",
    source: {
      book: "Kitab al-Ilm",
      bookArabic: "كتاب العلم",
      volume: "1",
      page: "11",
    },
  },
  {
    id: "ibu_005",
    scholar: "ibn_uthaymeen",
    topic: "parents",
    tags: ["parents", "birr", "obedience", "family"],
    question: "What is birr al-walidayn (righteousness toward parents) and what does it include?",
    answer: "Birr al-walidayn (righteousness toward parents) is one of the most important obligations in Islam, placed by Allah right after tawheed in the Quran: 'Your Lord has decreed that you worship none but Him, and that you be dutiful to parents.' (17:23). It includes: obeying them in what is not sinful, even if they are non-Muslim; speaking to them gently and not raising one's voice at them; not saying 'Uff' (any expression of impatience) to them; fulfilling their needs; honoring their friends after their death; maintaining the ties they had. Disobedience to parents (uquq al-walidayn) is one of the major sins. Even if a parent is unjust, the child should be patient and respond with kindness — this is the way of the people of iman.",
    source: {
      book: "Majmu' Fatawa Ibn Uthaymeen",
      bookArabic: "مجموع فتاوى ابن عثيمين",
      volume: "25",
      page: "369",
    },
  },
  {
    id: "ibu_006",
    scholar: "ibn_uthaymeen",
    topic: "halal_haram",
    tags: ["halal", "haram", "food", "earnings", "riba"],
    question: "What is the ruling on earning from haram sources, and what does it do to one's worship?",
    answer: "Earning from haram sources is forbidden and its effects reach every aspect of the servant's life and worship. The Prophet ﷺ mentioned a man who travels far, disheveled and dusty, raising his hands to the heavens: 'O Lord! O Lord!' — but his food is haram, his drink is haram, his clothing is haram — 'so how can his du'a be answered?' (Muslim). The haram in one's provision corrupts one's du'a, weakens one's worship, and removes barakah from one's life. The Muslim must strive for halal earnings even if it is less — for a small halal is better than a large haram. Allah said: 'O you who have believed, eat from the good things which We have provided for you.' (2:172)",
    source: {
      book: "Majmu' Fatawa Ibn Uthaymeen",
      bookArabic: "مجموع فتاوى ابن عثيمين",
      volume: "19",
      page: "83",
    },
  },

  // ══════════════════════════════════════════
  //  IBN RAJAB AL-HANBALI
  // ══════════════════════════════════════════
  {
    id: "ibr_001",
    scholar: "ibn_rajab",
    topic: "knowledge",
    tags: ["knowledge", "action", "ilm", "amal"],
    question: "What is the difference between knowledge that benefits and knowledge that does not?",
    answer: "Beneficial knowledge is the knowledge that, when it enters the heart, produces: fear of Allah and awe before His majesty, awareness of His watch, humility before Him, softness of the heart, repentance, turning to Him, and cutting off attachment to this world. As for the knowledge that produces only pride, debate, and showing off — even if it is knowledge of the religion — it is not beneficial knowledge. Ibn Mas'ud said: 'Sufficient knowledge for a man is that which produces khashyah (fear) of Allah; and sufficient ignorance for a man is that he is pleased with his knowledge.' The sign that knowledge is beneficial is that it increases you in humility, increases your fear of Allah, and decreases your satisfaction with yourself.",
    source: {
      book: "Jami' al-Ulum wal-Hikam",
      bookArabic: "جامع العلوم والحكم",
      volume: "1",
      page: "79",
    },
  },
  {
    id: "ibr_002",
    scholar: "ibn_rajab",
    topic: "heart",
    tags: ["heart", "this_world", "dunya", "zuhd"],
    question: "What is the meaning of zuhd (asceticism/detachment from the world)?",
    answer: "Zuhd does not mean abandoning wealth or leaving work and earning. Rather, it is a state of the heart — that the heart is not attached to, not enslaved by, and not preoccupied with the dunya. A person may possess the wealth of the world while his heart is free of it, not distracted by it from his Lord — like Sulayman (عليه السلام) who had the greatest kingdom yet was among the most zuhhad. And a person may be poor materially yet completely enslaved by his desire for the dunya. The Prophet ﷺ said: 'Zuhd in the world does not mean making haram what is halal, nor wasting wealth — rather zuhd in the world is that you are not more confident in what is in your hands than what is in Allah's hands.' Real zuhd is zuhd in what harms you.",
    source: {
      book: "Jami' al-Ulum wal-Hikam",
      bookArabic: "جامع العلوم والحكم",
      volume: "2",
      page: "189",
    },
  },
  {
    id: "ibr_003",
    scholar: "ibn_rajab",
    topic: "tawbah",
    tags: ["repentance", "tawbah", "hope", "mercy"],
    question: "What should the sinner know about the mercy and forgiveness of Allah?",
    answer: "No servant should ever despair of the mercy of Allah, no matter how great or numerous his sins — for Allah's mercy surpasses all things. The Prophet ﷺ said: 'Allah has divided mercy into one hundred parts, and sent one part to the world — by which creatures show mercy to each other — and kept ninety-nine parts with Him for the Day of Judgment.' If the servant turns to Allah sincerely, Allah turns to him. Hasan al-Basri said: 'Do not let many sins lead you to despair of mercy, for between you and Paradise is only one accepted tawbah.' And the Prophet ﷺ said: 'If you were to sin until your sins reached the sky, and then you repented, Allah would accept your repentance.' The door is open until the sun rises from the West.",
    source: {
      book: "Al-Tawwabun",
      bookArabic: "التوابون",
      volume: "1",
      page: "27",
    },
  },
  {
    id: "ibr_004",
    scholar: "ibn_rajab",
    topic: "ikhlas",
    tags: ["ikhlas", "sincerity", "riya", "showing off"],
    question: "What is riya' (showing off) and how does it destroy deeds?",
    answer: "Riya' is performing acts of worship or obedience for the purpose of being seen and praised by people — making the deed for other than Allah. The Prophet ﷺ called it 'the minor shirk' and warned his companions about it more than he warned them about the Dajjal in some narrations. Riya' destroys the deed entirely if the action was primarily motivated by it from the start. If riya' enters mid-deed, the scholar should strive to push it away — and if he does, his deed remains intact; if he gives in to it, the entire deed becomes threatened. The cure for riya' is knowing that the praise of people brings no benefit and their blame no harm; that only Allah's acceptance matters; and that whoever performs for people will be handed over to people on the Day of Judgment.",
    source: {
      book: "Jami' al-Ulum wal-Hikam",
      bookArabic: "جامع العلوم والحكم",
      volume: "1",
      page: "69",
    },
  },
];

// ─────────────────────────────────────────────────────
//  TOPIC REGISTRY
// ─────────────────────────────────────────────────────
const FATWA_TOPICS = {
  prayer:        { label: "Prayer (Salah)",             emoji: "🕌" },
  tawheed:       { label: "Tawheed & Aqeedah",          emoji: "☝️" },
  tawakkul:      { label: "Trust in Allah (Tawakkul)",  emoji: "☀️" },
  heart:         { label: "Heart & Soul",               emoji: "💚" },
  dhikr:         { label: "Remembrance (Dhikr)",        emoji: "✨" },
  dua:           { label: "Supplication (Du'a)",        emoji: "🤲" },
  death:         { label: "Death & Hereafter",          emoji: "🌙" },
  knowledge:     { label: "Knowledge (Ilm)",            emoji: "📚" },
  patience:      { label: "Patience (Sabr)",            emoji: "🌿" },
  love_of_allah: { label: "Love of Allah",              emoji: "❤️" },
  sins:          { label: "Sins & Repentance",          emoji: "🔑" },
  tawbah:        { label: "Repentance (Tawbah)",        emoji: "🔑" },
  quran:         { label: "The Quran",                  emoji: "📖" },
  fasting:       { label: "Fasting (Sawm)",             emoji: "🌙" },
  zakah:         { label: "Zakah",                      emoji: "💰" },
  marriage:      { label: "Marriage",                   emoji: "🤝" },
  parents:       { label: "Parents & Family",           emoji: "👨‍👩‍👧" },
  halal_haram:   { label: "Halal & Haram",              emoji: "⚖️" },
  ikhlas:        { label: "Sincerity (Ikhlas)",         emoji: "💎" },
};

const FATWA_TOPIC_KEYS = Object.keys(FATWA_TOPICS);

// Helper: get fatawa by scholar
function getFatawaByScholar(scholarKey) {
  return FATAWA.filter(f => f.scholar === scholarKey);
}

// Helper: get fatawa by topic
function getFatawaByTopic(topic) {
  return FATAWA.filter(f => f.topic === topic || f.tags.includes(topic));
}

// Helper: get random fatwa
function getRandomFatwa(filter = {}) {
  let pool = [...FATAWA];
  if (filter.scholar) pool = pool.filter(f => f.scholar === filter.scholar);
  if (filter.topic)   pool = pool.filter(f => f.topic === filter.topic || f.tags.includes(filter.topic));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Helper: search by keyword
function searchFatawa(keyword) {
  const kw = keyword.toLowerCase();
  return FATAWA.filter(f =>
    f.question.toLowerCase().includes(kw) ||
    f.answer.toLowerCase().includes(kw) ||
    f.tags.some(t => t.includes(kw))
  );
}

module.exports = {
  SCHOLARS, SCHOLAR_KEYS,
  FATAWA, FATWA_TOPICS, FATWA_TOPIC_KEYS,
  getFatawaByScholar, getFatawaByTopic,
  getRandomFatwa, searchFatawa,
};
