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
        title: "Membaca Ayat Kursi",
        arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. اَللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūmu, lā ta'khużuhū sinatuw wa lā naum(un), lahū mā fis-samāwāti wa mā fil-arḍ(i), man żallażī yasyfa'u 'indahū illā bi'iżnih(ī), ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bisyai'im min 'ilmihī illā bimā syā'(a), wasi'a kursiyyuhus-samāwāti wal-arḍ(a), wa lā ya'ūduhū ḥifẓuhumā wa huwal-'aliyyul-'aẓīm(u).",
        translation: "Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang Terus-menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Mahatinggi, Mahabesar.",
        faedah: "Siapa yang membacanya ketika pagi, maka ia akan dilindungi dari (gangguan) jin hingga petang.",
        source: "HR. Al-Hakim (1/562). Lihat Shahihut Targhib wat Tarhib (1/273)",
        repeat: 1
    },
    {
        id: 2,
        title: "Al-Ikhlas, Al-Falaq, An-Nas",
        arabic: "بِسْم. قُلْ هُوَ اللَّهُ أَحَدٌ... (3x)\nبِسْم. قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... (3x)\nبِسْم. قُلْ أَعُوذُ بِرَبِّ النَّاسِ... (3x)",
        latin: "Qul huwallāhu aḥad... (3x)\nQul a'ūżu birabbil-falaq... (3x)\nQul a'ūżu birabbin-nās... (3x)",
        translation: "Membaca Surah Al-Ikhlas, Al-Falaq, dan An-Nas.",
        faedah: "Barangsiapa yang membacanya sebanyak tiga kali ketika pagi dan petang, maka baginya akan dicukupkan segala sesuatu.",
        source: "HR. Abu Dawud (4/322) dan At-Tirmidzi (5/567). Lihat Shahihut Tirmidzi (3/182)",
        repeat: 3
    },
    {
        id: 3,
        title: "Dzikir Pagi (Keagungan Allah)",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        latin: "Aṣbaḥnā wa aṣbaḥal-mulku lillāhi, wal-ḥamdu lillāhi, lā ilāha illallāhu waḥdahū lā syarīka lah(u), lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr. Rabbi as'aluka khaira mā fī hāżalyau-mi wa khaira mā ba'dah(ū), wa a'ūżu bika min syarri mā fī hāżalyau-mi wa syarri mā ba'dah(ū). Rabbi a'ūżu bika minal-kasali wa sū'il-kibar(i), Rabbi a'ūżu bika min 'ażābin fin-nāri wa 'ażābin fil-qabr(i).",
        translation: "Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Rabb-ku, aku mohon kepada-Mu kebaikan di hari ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan hari ini dan kejahatan sesudahnya. Wahai Rabb-ku, aku berlindung kepada-Mu dari kemalasan dan kejelekan di hari tua. Wahai Rabb-ku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di kubur.",
        source: "HR. Muslim (4/2088)",
        repeat: 1
    },
    {
        id: 4,
        title: "Sayyidul Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        latin: "Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā 'abduka, wa anā 'alā 'ahdika wa wa'dika mastaṭa'tu, a'ūżu bika min syarri mā ṣana'tu, abū'u laka bini'matika 'alayya, wa abū'u biżanbī fagfir lī fa'innahū lā yagfiruż-żunūba illā anta.",
        translation: "Ya Allah, Engkau adalah Rabb-ku, tidak ada tuhan selain Engkau. Engkau-lah yang menciptakan aku dan aku adalah hamba-Mu. Aku menetapi perjanjian-Mu dan janji-Mu sesuai dengan kemampuanku. Aku berlindung kepada-Mu dari keburukan perbuatanku, aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku. Sebab tidak ada yang dapat mengampuni dosa selain Engkau.",
        faedah: "Barangsiapa membacanya di siang hari dengan penuh keyakinan kemudian ia meninggal pada hari itu sebelum petang, maka ia termasuk penghuni Surga.",
        source: "HR. Al-Bukhari (7/150)",
        repeat: 1
    },
    {
        id: 5,
        title: "Perlindungan Bagi Keluarga",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ: فِي دِينِي وَدُنْيَايَ وَأَهْلِي، وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
        latin: "Allāhumma innī as'alukal-'afwa wal-'āfiyata fid-dun-yā wal-ākhirah, Allāhumma innī as'alukal-'afwa wal-'āfiyata fī dīnī wa dun-yāya wa ahlī wa mālī. Allāhummas-tur 'aurātī wa āmin rau'ātī. Allāhummaḥ-faẓnī min baini yadayya wa min khalfī wa 'an yamīnī wa 'an syimālī wa min fauqī, wa a'ūżu bi'aẓamatika an ughtāla min taḥtī.",
        translation: "Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan di dunia dan di akhirat. Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan dalam agamaku, duniaku, keluargaku, dan hartaku. Ya Allah, tutupilah auratku (aib dan kekurangan) dan berilah ketenteraman di hatiku. Ya Allah, jagalah aku dari arah depan, belakang, kanan, kiri, dan dari atasku. Aku berlindung dengan keagungan-Mu agar aku tidak disambar dari bawahku (dibenamkan ke dalam bumi).",
        source: "HR. Abu Dawud dan Ibnu Majah. Lihat Shahih Ibnu Majah (2/332)",
        repeat: 1
    },
    {
        id: 6,
        title: "Dua Kalimat Pelindung (3x)",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        latin: "Bismillāhillażī lā yaḍurru ma'asmihī syai'un fil-arḍi wa lā fis-samā'i wa huwas-samī'ul-'alīm.",
        translation: "Dengan nama Allah yang bila hal itu disebut, tidak ada sesuatu pun di bumi dan di langit yang dapat membahayakan, dan Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.",
        faedah: "Barangsiapa membacanya sebanyak tiga kali ketika pagi dan petang, maka tidak ada sesuatu pun yang membahayakannya.",
        source: "HR. Abu Dawud (4/323), At-Tirmidzi (5/465). Lihat Shahih Ibnu Majah (2/332)",
        repeat: 3
    },
    {
        id: 7,
        title: "Ridha Kepada Allah (3x)",
        arabic: "رَضِيتُ بِاللَّهِ رَبّاً، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيّاً",
        latin: "Raḍītu billāhi rabbaw wa bil-islāmi dīnaw wa bi muḥammadin ṣallallāhu 'alaihi wa sallama nabiyyā.",
        translation: "Aku rela Allah sebagai Rabb-ku, Islam sebagai agamaku, dan Muhammad sebagai Nabiku.",
        faedah: "Barangsiapa yang mengucapkannya sebanyak tiga kali ketika pagi dan petang, maka adalah hak bagi Allah untuk menyenangkannya (meridhainya) pada hari Kiamat kelak.",
        source: "HR. Abu Dawud (4/318), At-Tirmidzi (5/465). Lihat Shahihut Tirmidzi (3/141)",
        repeat: 3
    },
    {
        id: 8,
        title: "Ya Hayyu Ya Qayyum",
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شأنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        latin: "Yā ḥayyu yā qayyūm, bi raḥmatika astaghītsu, aṣliḥ lī sya'nī kullahū wa lā takilnī ilā nafsī ṭarfata 'ain(in).",
        translation: "Wahai Yang Mahahidup, Wahai Yang Terus-menerus mengurus (makhluk-Nya), dengan rahmat-Mu aku memohon pertolongan, perbaikilah urusanku semuanya dan janganlah Engkau serahkan aku kepada diriku sendiri walau sekejap mata pun.",
        source: "HR. Al-Hakim (1/545). Lihat Shahihut Targhib wat Tarhib (1/273)",
        repeat: 1
    },
    {
        id: 10,
        title: "Tasbih dan Tahmid (100x)",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        latin: "Subḥānallāhi wa biḥamdih.",
        translation: "Mahasuci Allah dan segala puji bagi-Nya.",
        faedah: "Barangsiapa mengucapkannya sebanyak 100 kali ketika pagi dan petang, maka tidak ada seorang pun yang datang pada hari Kiamat dengan membawa yang lebih baik...",
        source: "HR. Muslim (4/2071)",
        repeat: 100
    },
    {
        id: 11,
        title: "Memohon Ilmu dan Rezeki",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        latin: "Allāhumma innī as'aluka 'ilman nāfi'ā, wa rizqan ṭayyibā, wa 'amalan mutaqabbalā.",
        translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
        source: "HR. Ibnu Majah. Lihat Shahih Ibnu Majah (1/152)",
        repeat: 1
    },
    {
        id: 12,
        title: "Dzikir Fitrah Islam",
        arabic: "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِيماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
        latin: "Aṣbaḥnā 'alā fiṭratil-islām, wa 'alā kalimatil-ikhlāṣ, wa 'alā dīni nabiyyinā muḥammadin ṣallallāhu 'alaihi wa sallam, wa 'alā millati abīnā ibrāhīma ḥanīfam muslimaw wa mā kāna minal-musyrikīn.",
        translation: "Kami memasuki pagi hari di atas fitrah Islam, di atas kalimat ikhlas, di atas agama Nabi kami Muhammad shallallahu 'alaihi wa sallam, dan di atas millah bapak kami Ibrahim yang lurus (hanif) lagi berserah diri kepada Allah (muslim), dan dia bukanlah termasuk orang-orang musyrik.",
        source: "HR. Ahmad (3/406-407)",
        repeat: 1
    }
];
