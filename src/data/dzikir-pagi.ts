export interface DzikirItem {
    id: number;
    title: string;
    arabic: string;
    latin: string;
    translation: string;
    faedah?: string;
    source: string;
    repeat: number;
}

export const dzikirPagi: DzikirItem[] = [
    {
        id: 1,
        title: "Ayat Kursi",
        arabic: "اَللّٰهُ لَآ اِلٰهَ اِلَّا هُوَۚ اَلْحَيُّ الْقَيُّوْمُ ەۚ لَا تَأْخُذُهٗ سِنَةٌ وَّلَا نَوْمٌۗ لَهٗ مَا فِى السَّمٰوٰتِ وَمَا فِى الْاَرْضِۗ مَنْ ذَا الَّذِيْ يَشْفَعُ عِنْدَهٗٓ اِلَّا بِاِذْنِهٖۗ يَعْلَمُ مَا بَيْنَ اَيْدِيْهِمْ وَمَا خَلْفَهُمْۚ وَلَا يُحِيْطُوْنَ بِشَيْءٍ مِّنْ عِلْمِهٖٓ اِلَّا بِمَا شَاۤءَۚ وَسِعَ كُرْسِيُّهُ السَّمٰوٰتِ وَالْاَرْضَۚ وَلَا يَـُٔوْدُهٗ حِفْظُهُمَاۚ وَهُوَ الْعَلِيُّ الْعَظِيْمُ",
        latin: "Allāhu lā ilāha illā huw, al-ḥayyul-qayyūm, lā ta'khużuhū sinatuw wa lā naum, lahū mā fis-samāwāti wa mā fil-arḍ, man żallażī yasyfa'u 'indahū illā bi żnih, ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bisyai'im min 'ilmihī illā bimā syā', wasi'a kursiyyuhus-samāwāti wa l-arḍ, wa lā ya'ūduhū ḥifẓuhumā, wa huwal-'aliyyul-'aẓīm.",
        translation: "Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang Terus-menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Mahatinggi, Mahabesar.",
        faedah: "Siapa yang membacanya ketika pagi, maka ia akan dilindungi dari (gangguan) jin hingga sore. Dan siapa yang membacanya ketika sore, maka ia akan dilindungi dari (gangguan) jin hingga pagi.",
        source: "HR. Al-Hakim (1/562), dishahihkan oleh Al-Albani dalam Shahih At-Targhib wa At-Tarhib (1/273)",
        repeat: 1
    },
    {
        id: 2,
        title: "Surah Al-Ikhlas",
        arabic: "قُلْ هُوَ اللّٰهُ اَحَدٌۚ (١) اَللّٰهُ الصَّمَدُۚ (٢) لَمْ يَلِدْ وَلَمْ يُوْلَدْۙ (٣) وَلَمْ يَكُنْ لَّهٗ كُفُوًا اَحَدٌ ࣖ (٤)",
        latin: "Qul huwallāhu aḥad. Allāhus-ṣamad. Lam yalid wa lam yūlad. Wa lam yakul lahū kufuwan aḥad.",
        translation: "Katakanlah (Muhammad), 'Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. (Allah) tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.'",
        faedah: "Barangsiapa membacanya (Al-Ikhlas, Al-Falaq, An-Nas) tiga kali di waktu pagi dan sore, maka itu akan mencukupinya dari segala sesuatu.",
        source: "HR. Abu Dawud (4/322), At-Tirmidzi (5/567), dishahihkan Al-Albani.",
        repeat: 3
    },
    {
        id: 3,
        title: "Surah Al-Falaq",
        arabic: "قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِۙ (١) مِنْ شَرِّ مَا خَلَقَۙ (٢) وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَۙ (٣) وَمِنْ شَرِّ النَّفّٰثٰتِ فِى الْعُقَدِۙ (٤) وَمِنْ شَرِّ حَاسِدٍ اِذَا حَسَدَ ࣖ (٥)",
        latin: "Qul a'ūżu birabbil-falaq. Min syarri mā khalaq. Wa min syarri gāsiqin iżā waqab. Wa min syarrin-naffāṡāti fil-'uqad. Wa min syarri ḥāsidin iżā ḥasad.",
        translation: "Katakanlah, 'Aku berlindung kepada Tuhan yang menguasai subuh (fajar), dari kejahatan (makhluk yang) Dia ciptakan, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya), dan dari kejahatan orang yang dengki apabila dia dengki.'",
        faedah: "Barangsiapa membacanya (Al-Ikhlas, Al-Falaq, An-Nas) tiga kali di waktu pagi dan sore, maka itu akan mencukupinya dari segala sesuatu.",
        source: "HR. Abu Dawud (4/322), At-Tirmidzi (5/567), dishahihkan Al-Albani.",
        repeat: 3
    },
    {
        id: 4,
        title: "Surah An-Nas",
        arabic: "قُلْ اَعُوْذُ بِرَبِّ النَّاسِۙ (١) مَلِكِ النَّاسِۙ (٢) اِلٰهِ النَّاسِۙ (٣) مِنْ شَرِّ الْوَسْوَاسِ ەۙ الْخَنَّاسِۖ (٤) الَّذِيْ يُوَسْوِسُ فِيْ صُدُوْرِ النَّاسِۙ (٥) مِنَ الْجِنَّةِ وَالنَّاسِ ࣖ (٦)",
        latin: "Qul a'ūżu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Allażī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.",
        translation: "Katakanlah, 'Aku berlindung kepada Tuhannya manusia, Raja manusia, Sembahan manusia, dari kejahatan (bisikan) setan yang bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia.'",
        faedah: "Barangsiapa membacanya (Al-Ikhlas, Al-Falaq, An-Nas) tiga kali di waktu pagi dan sore, maka itu akan mencukupinya dari segala sesuatu.",
        source: "HR. Abu Dawud (4/322), At-Tirmidzi (5/567), dishahihkan Al-Albani.",
        repeat: 3
    },
    {
        id: 5,
        title: "Sayyidul Istighfar",
        arabic: "اَللّٰهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ خَلَقْتَنِيْ وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوْءُ بِذَنْبِيْ فَاغْفِرْ لِيْ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ",
        latin: "Allāhumma anta rabbī lā ilāha illā anta khalaqtanī wa anā 'abduka wa anā 'alā 'ahdika wa wa'dika mastaṭa'tu, a'ūżu bika min syarri mā ṣana'tu, abū'u laka bini'matika 'alayya wa abū'u biżambī, fagfir lī fa innahū lā yagfiruż-żunūba illā ant.",
        translation: "Ya Allah, Engkau adalah Rabbku, tidak ada tuhan selain Engkau. Engkau telah menciptakanku dan aku adalah hamba-Mu. Aku menetapi perjanjian-Mu dan janji-Mu sesuai dengan kemampuanku. Aku berlindung kepada-Mu dari keburukan perbuatanku, aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku. Sebab tidak ada yang dapat mengampuni dosa selain Engkau.",
        faedah: "Barangsiapa mengucapkannya di siang hari dengan penuh keyakinan lalu meninggal pada hari itu sebelum sore, maka ia termasuk penghuni surga. Dan barangsiapa mengucapkannya di malam hari dengan penuh keyakinan lalu meninggal sebelum pagi, maka ia termasuk penghuni surga.",
        source: "HR. Bukhari (7/150)",
        repeat: 1
    },
    {
        id: 6,
        title: "Doa Pagi",
        arabic: "اَللّٰهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ، وَإِلَيْكَ النُّشُوْرُ",
        latin: "Allāhumma bika aṣbaḥnā, wa bika amsainā, wa bika naḥyā, wa bika namūtu, wa ilaykan-nusyūr.",
        translation: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu sore. Dengan rahmat dan pertolongan-Mu kami hidup, dan dengan kehendak-Mu kami mati. Dan kepada-Mu kebangkitan (bagi semua makhluk).",
        source: "HR. At-Tirmidzi (3/142), dishahihkan oleh Al-Albani.",
        repeat: 1
    },
    {
        id: 7,
        title: "Dzikir Pagi 1",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْ هٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ وَسُوْءِ الْكِبَرِ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        latin: "Aṣbaḥnā wa aṣbaḥal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr. Rabbi as'aluka khaira mā fī hāżal-yaum wa khaira mā ba'dah, wa a'ūżu bika min syarri mā fī hāżal-yaum wa syarri mā ba'dah. Rabbi a'ūżu bika minal-kasali wa sū'il-kibar, Rabbi a'ūżu bika min 'ażābin fin-nāri wa 'ażābin fil-qabr.",
        translation: "Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Rabbku, aku mohon kepada-Mu kebaikan di hari ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan hari ini dan kejahatan sesudahnya. Wahai Rabbku, aku berlindung kepada-Mu dari kemalasan dan kejelekan di hari tua. Wahai Rabbku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di kubur.",
        source: "HR. Muslim (4/2088)",
        repeat: 1
    },
    {
        id: 8,
        title: "Doa Memohon Ilmu dan Rezeki",
        arabic: "اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        latin: "Allāhumma innī as'aluka 'ilman nāfi'ā, wa rizqan ṭayyibā, wa 'amalan mutaqabbalā.",
        translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
        faedah: "Dibaca setelah salam shalat Subuh.",
        source: "HR. Ibnu Majah (1/298), dishahihkan oleh Al-Albani.",
        repeat: 1
    },
    {
        id: 9,
        title: "Subhanallah wa Bihamdihi",
        arabic: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ",
        latin: "Subḥānallāhi wa biḥamdih.",
        translation: "Mahasuci Allah dan segala puji bagi-Nya.",
        faedah: "Barangsiapa mengucapkannya 100 kali dalam sehari, maka dosa-dosanya akan diampuni meskipun sebanyak buih di lautan. (Juga dibaca pagi dan petang)",
        source: "HR. Bukhari (7/168) dan Muslim (4/2071)",
        repeat: 100
    }
];
