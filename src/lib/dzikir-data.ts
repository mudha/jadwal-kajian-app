export interface DzikirItem {
    id: string;
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
    count: number;
    source: string;
    note?: string;
}

export const dzikirPagi: DzikirItem[] = [
    {
        id: 'pagi-1',
        title: 'Ayat Kursi',
        arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
        transliteration: '',
        translation: 'Allah, tidak ada ilah (yang berhak disembah) melainkan Dia, yang hidup kekal lagi terus-menerus mengurus (makhluk-Nya). Dia tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang ada di langit dan di bumi. Tiada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka. Mereka tidak mengetahui sesuatu apa pun dari ilmu-Nya melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dia tidak merasa berat memelihara keduanya, dan Dia Maha Tinggi lagi Maha Besar.',
        count: 1,
        source: 'QS. Al-Baqarah: 255'
    },
    {
        id: 'pagi-2',
        title: 'Al-Ikhlas, Al-Falaq, An-Naas',
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. قُلْ هُوَ اللَّهُ أَحَدٌ... (3x)\nبِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... (3x)\nبِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ النَّاسِ... (3x)',
        transliteration: '',
        translation: 'Membaca Surah Al-Ikhlas, Al-Falaq, dan An-Naas masing-masing 3 kali.',
        count: 3,
        source: 'HR. Abu Daud no. 5082, Tirmidzi no. 3575'
    },
    {
        id: 'pagi-3',
        title: 'Dzikir Pagi',
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ وَسُوْءِ الْكِبَرِ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
        transliteration: 'Ash-bahnaa wa ash-bahal mulku lillah...',
        translation: 'Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada ilah yang berhak disembah kecuali Allah semesta, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Rabbku, aku mohon kepada-Mu kebaikan di hari ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan hari ini dan kejahatan sesudahnya. Wahai Rabbku, aku berlindung kepada-Mu dari kemalasan dan keburukan di hari tua. Wahai Rabbku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di kubur.',
        count: 1,
        source: 'HR. Muslim no. 2723'
    },
    {
        id: 'pagi-4',
        title: 'Dzikir Pagi (Singkat)',
        arabic: 'اَللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ وَإِلَيْكَ النُّشُوْرُ',
        transliteration: 'Allahumma bika ash-bahnaa wa bika amsaynaa...',
        translation: 'Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu petang. Dengan rahmat dan pertolongan-Mu kami hidup dan dengan kehendak-Mu kami mati. Dan kepada-Mu kebangkitan (bagi semua makhluk).',
        count: 1,
        source: 'HR. Tirmidzi no. 3391, Abu Daud no. 5068'
    },
    {
        id: 'pagi-5',
        title: 'Sayyidul Istighfar',
        arabic: 'اَللَّهُمَّ أَنْتَ رَبِّيْ لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوْءُ بِذَنْبِيْ فَاغْفِرْ لِيْ فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوْبَ إِلاَّ أَنْتَ',
        transliteration: 'Allahumma anta robbii laa ilaha illa anta...',
        translation: 'Ya Allah, Engkau adalah Rabbku, tidak ada ilah yang berhak disembah kecuali Engkau, Engkaulah yang menciptakanku. Aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang aku perbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, oleh karena itu ampunilah aku. Sesungguhnya tiada yang dapat mengampuni dosa kecuali Engkau.',
        count: 1,
        source: 'HR. Bukhari no. 6306'
    },
    {
        id: 'pagi-6',
        title: 'Persaksian Tauhid',
        arabic: 'اَللَّهُمَّ إِنِّيْ أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ وَجَمِيْعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَـهَ إِلاَّ أَنْتَ وَحْدَهُ لاَ شَرِيْكَ لَهُ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ',
        transliteration: 'Allahumma inni ash-bahtu usy-hiduka...',
        translation: 'Ya Allah, sesungguhnya aku di waktu pagi ini mempersaksikan Engkau, malaikat yang memikul ‘Arsy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, bahwa sesungguhnya Engkau adalah Allah, tiada ilah yang berhak disembah kecuali Engkau semata, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.',
        count: 4,
        source: 'HR. Abu Daud no. 5069'
    },
    {
        id: 'pagi-7',
        title: 'Mohon Keselamatan Dunia Akhirat',
        arabic: 'اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَاْلآخِرَةِ، اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِيْنِيْ وَدُنْيَايَ وَأَهْلِيْ وَمَالِيْ، اَللَّهُمَّ اسْتُرْ عَوْرَاتِيْ وَآمِنْ رَوْعَاتِيْ، اَللَّهُمَّ احْفَظْنِيْ مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِيْ، وَعَنْ يَمِيْنِيْ، وَعَنْ شِمَالِيْ، وَمِنْ فَوْقِيْ، وَأَعُوْذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيْ',
        transliteration: 'Allahumma innii as-alukal ‘afwa wal ‘aafiyah...',
        translation: 'Ya Allah, sesungguhnya aku memohon kebajikan dan keselamatan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon kebajikan dan keselamatan dalam agama, dunia, keluarga dan hartaku. Ya Allah, tutupilah auratku (aib dan kekurangan) dan tenangkanlah aku dari rasa takut. Ya Allah, peliharalah aku dari depan, belakang, kanan, kiri dan atasku. Aku berlindung dengan kebesaran-Mu, agar aku tidak disambar dari bawahku (oleh ular atau tenggelam dalam bumi dan lain-lain yang membuat aku jatuh).',
        count: 1,
        source: 'HR. Abu Daud no. 5074, Ibnu Majah no. 3871'
    },
    {
        id: 'pagi-8',
        title: 'Perlindungan Diri & Setan',
        arabic: 'اَللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَاْلأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيْكَهُ، أَشْهَدُ أَنْ لاَ إِلَـهَ إِلاَّ أَنْتَ، أَعُوْذُ بِكَ مِنْ شَرِّ نَفْسِيْ، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِيْ سُوْءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
        transliteration: 'Allahumma ‘aalimal ghoybi wasy shahaadah...',
        translation: 'Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata, wahai Rabb pencipta langit dan bumi, Rabb segala sesuatu dan yang merajainya. Aku bersaksi bahwa tidak ada ilah yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, kejahatan setan dan bala tentaranya (atau sekutu-sekutunya), dan aku berlindung kepada-Mu dari berbuat kejelekan terhadap diriku atau menyeretnya kepada seorang muslim.',
        count: 1,
        source: 'HR. Tirmidzi no. 3392, Abu Daud no. 5067'
    },
    {
        id: 'pagi-9',
        title: 'Perlindungan dari Bahaya',
        arabic: 'بِسْمِ اللَّهِ الَّذِى لاَ يَضُرُّ مَعَ اسْمِهِ شَىْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        transliteration: 'Bismillahilladzi laa yadhurru ma’asmihi...',
        translation: 'Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya, Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.',
        count: 3,
        source: 'HR. Abu Daud no. 5088, Tirmidzi no. 3388, Ibnu Majah no. 3869'
    },
    {
        id: 'pagi-10',
        title: 'Keridhaan Islam',
        arabic: 'رَضِيْتُ بِاللهِ رَبًّا، وَبِاْلإِسْلاَمِ دِيْنًا، وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
        transliteration: 'Rodhiitu billaahi robbaa wa bil-islaami diinaa...',
        translation: 'Aku ridha Allah sebagai Rabb, Islam sebagai agama dan Muhammad shallallahu ‘alaihi wa sallam sebagai nabi (yang diutus oleh Allah).',
        count: 3,
        source: 'HR. Abu Daud no. 5072, Tirmidzi no. 3389'
    },
    {
        id: 'pagi-11',
        title: 'Mohon Perbaikan Urusan',
        arabic: 'يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ، أَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ وَلاَ تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ',
        transliteration: 'Yaa Hayyu Yaa Qoyyum, bi-rohmatika...',
        translation: 'Wahai Rabb Yang Maha Hidup, wahai Rabb Yang Maha Berdiri Sendiri (tidak butuh segala sesuatu), dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan diserahkan kepadaku sekalipun sekejap mata (tanpa mendapat pertolongan dari-Mu).',
        count: 1,
        source: 'HR. Hakim'
    },
    {
        id: 'pagi-12',
        title: 'Fitrah Islam',
        arabic: 'أَصْبَحْنَا عَلَى فِطْرَةِ اْلإِسْلاَمِ وَعَلَى كَلِمَةِ اْلإِخْلاَصِ، وَعَلَى دِيْنِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ، حَنِيْفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِيْنَ',
        transliteration: 'Ash-bahnaa ‘ala fithrotil islaam...',
        translation: 'Di waktu pagi kami memegang agama Islam, kalimat ikhlas, agama Nabi kami Muhammad shallallahu ‘alaihi wa sallam, dan agama bapak kami Ibrahim yang hanif (lurus) dan muslim, dan ia bukan termasuk orang-orang musyrik.',
        count: 1,
        source: 'HR. Ahmad (3/406, 407)'
    },
    {
        id: 'pagi-13',
        title: 'Tasbih & Tahmid',
        arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
        transliteration: 'Subhanallah wa bi-hamdih',
        translation: 'Maha suci Allah, aku memuji-Nya.',
        count: 100,
        source: 'HR. Muslim no. 2692'
    },
    {
        id: 'pagi-14',
        title: 'Tahlil (10x)',
        arabic: 'لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ',
        transliteration: 'Laa ilaha illallah wahdahu laa syarika lah...',
        translation: 'Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala pujian. Dia-lah yang berkuasa atas segala sesuatu.',
        count: 10,
        source: 'HR. An-Nasa-i'
    },
    {
        id: 'pagi-15',
        title: 'Tasbih Penciptaan',
        arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
        transliteration: 'Subhanallah wa bi-hamdih, ‘adada kholqih...',
        translation: 'Maha Suci Allah, aku memuji-Nya sebanyak bilangan makhluk-Nya, sejauh kerelaan-Nya, seberat timbangan ‘Arsy-Nya dan sebanyak tinta tulisan kalimat-Nya.',
        count: 3,
        source: 'HR. Muslim no. 2726'
    },
    {
        id: 'pagi-16',
        title: 'Mohon Ilmu, Rizki & Amalan',
        arabic: 'اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً',
        transliteration: 'Allahumma innii as-aluka ‘ilman naafi’a...',
        translation: 'Ya Allah, sungguh aku memohon kepada-Mu ilmu yang bermanfaat, rizki yang baik dan amal yang diterima.',
        count: 1,
        source: 'HR. Ibnu Majah no. 925'
    },
    {
        id: 'pagi-17',
        title: 'Istighfar (100x)',
        arabic: 'أَسْتَغْفِرُ اللهَ وَأَتُوْبُ إِلَيْهِ',
        transliteration: 'Astagh-firullah wa atuubu ilaih',
        translation: 'Aku memohon ampun kepada Allah dan bertobat kepada-Nya.',
        count: 100,
        source: 'HR. Bukhari no. 6307, Muslim no. 2702'
    }
];

export const dzikirPetang: DzikirItem[] = [
    {
        id: 'petang-1',
        title: 'Ayat Kursi',
        arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
        transliteration: '',
        translation: 'Allah, tidak ada ilah (yang berhak disembah) melainkan Dia, yang hidup kekal lagi terus-menerus mengurus (makhluk-Nya). Dia tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang ada di langit dan di bumi. Tiada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka. Mereka tidak mengetahui sesuatu apa pun dari ilmu-Nya melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dia tidak merasa berat memelihara keduanya, dan Dia Maha Tinggi lagi Maha Besar.',
        count: 1,
        source: 'QS. Al-Baqarah: 255'
    },
    {
        id: 'petang-2',
        title: 'Al-Ikhlas, Al-Falaq, An-Naas',
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. قُلْ هُوَ اللَّهُ أَحَدٌ... (3x)\nبِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... (3x)\nبِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ النَّاسِ... (3x)',
        transliteration: '',
        translation: 'Membaca Surah Al-Ikhlas, Al-Falaq, dan An-Naas masing-masing 3 kali.',
        count: 3,
        source: 'HR. Abu Daud no. 5082, Tirmidzi no. 3575'
    },
    {
        id: 'petang-3',
        title: 'Dzikir Petang',
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ وَسُوْءِ الْكِبَرِ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
        transliteration: 'Amsaynaa wa amsal mulku lillah...',
        translation: 'Kami telah memasuki waktu sore dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada ilah yang berhak disembah kecuali Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Rabbku, aku mohon kepada-Mu kebaikan di malam ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan malam ini dan kejahatan sesudahnya. Wahai Rabbku, aku berlindung kepada-Mu dari kemalasan dan keburukan di hari tua. Wahai Rabbku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di kubur.',
        count: 1,
        source: 'HR. Muslim no. 2723'
    },
    {
        id: 'petang-4',
        title: 'Dzikir Petang (Singkat)',
        arabic: 'اَللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ وَإِلَيْكَ الْمَصِيْرُ',
        transliteration: 'Allahumma bika amsaynaa wa bika ash-bahnaa...',
        translation: 'Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu sore, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan pertolongan-Mu kami hidup dan dengan kehendak-Mu kami mati. Dan kepada-Mu tempat kembali.',
        count: 1,
        source: 'HR. Tirmidzi no. 3391, Abu Daud no. 5068'
    },
    {
        id: 'petang-5',
        title: 'Sayyidul Istighfar',
        arabic: 'اَللَّهُمَّ أَنْتَ رَبِّيْ لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوْءُ بِذَنْبِيْ فَاغْفِرْ لِيْ فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوْبَ إِلاَّ أَنْتَ',
        transliteration: 'Allahumma anta robbii laa ilaha illa anta...',
        translation: 'Ya Allah, Engkau adalah Rabbku, tidak ada ilah yang berhak disembah kecuali Engkau, Engkaulah yang menciptakanku. Aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang aku perbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, oleh karena itu ampunilah aku. Sesungguhnya tiada yang dapat mengampuni dosa kecuali Engkau.',
        count: 1,
        source: 'HR. Bukhari no. 6306'
    },
    {
        id: 'petang-6',
        title: 'Persaksian Tauhid',
        arabic: 'اَللَّهُمَّ إِنِّيْ أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ وَجَمِيْعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَـهَ إِلاَّ أَنْتَ وَحْدَهُ لاَ شَرِيْكَ لَهُ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ',
        transliteration: 'Allahumma inni amsaytu usy-hiduka...',
        translation: 'Ya Allah, sesungguhnya aku di waktu sore ini mempersaksikan Engkau, malaikat yang memikul ‘Arsy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, bahwa sesungguhnya Engkau adalah Allah, tiada ilah yang berhak disembah kecuali Engkau semata, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.',
        count: 4,
        source: 'HR. Abu Daud no. 5069'
    },
    {
        id: 'petang-7',
        title: 'Mohon Keselamatan Dunia Akhirat',
        arabic: 'اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَاْلآخِرَةِ، اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِيْنِيْ وَدُنْيَايَ وَأَهْلِيْ وَمَالِيْ، اَللَّهُمَّ اسْتُرْ عَوْرَاتِيْ وَآمِنْ رَوْعَاتِيْ، اَللَّهُمَّ احْفَظْنِيْ مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِيْ، وَعَنْ يَمِيْنِيْ، وَعَنْ شِمَالِيْ، وَمِنْ فَوْقِيْ، وَأَعُوْذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيْ',
        transliteration: 'Allahumma innii as-alukal ‘afwa wal ‘aafiyah...',
        translation: 'Ya Allah, sesungguhnya aku memohon kebajikan dan keselamatan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon kebajikan dan keselamatan dalam agama, dunia, keluarga dan hartaku. Ya Allah, tutupilah auratku (aib dan kekurangan) dan tenangkanlah aku dari rasa takut. Ya Allah, peliharalah aku dari depan, belakang, kanan, kiri dan atasku. Aku berlindung dengan kebesaran-Mu, agar aku tidak disambar dari bawahku (oleh ular atau tenggelam dalam bumi dan lain-lain yang membuat aku jatuh).',
        count: 1,
        source: 'HR. Abu Daud no. 5074, Ibnu Majah no. 3871'
    },
    {
        id: 'petang-8',
        title: 'Perlindungan Diri & Setan',
        arabic: 'اَللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَاْلأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيْكَهُ، أَشْهَدُ أَنْ لاَ إِلَـهَ إِلاَّ أَنْتَ، أَعُوْذُ بِكَ مِنْ شَرِّ نَفْسِيْ، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِيْ سُوْءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
        transliteration: 'Allahumma ‘aalimal ghoybi wasy shahaadah...',
        translation: 'Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata, wahai Rabb pencipta langit dan bumi, Rabb segala sesuatu dan yang merajainya. Aku bersaksi bahwa tidak ada ilah yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, kejahatan setan dan bala tentaranya (atau sekutu-sekutunya), dan aku berlindung kepada-Mu dari berbuat kejelekan terhadap diriku atau menyeretnya kepada seorang muslim.',
        count: 1,
        source: 'HR. Tirmidzi no. 3392, Abu Daud no. 5067'
    },
    {
        id: 'petang-9',
        title: 'Perlindungan dari Bahaya',
        arabic: 'بِسْمِ اللَّهِ الَّذِى لاَ يَضُرُّ مَعَ اسْمِهِ شَىْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        transliteration: 'Bismillahilladzi laa yadhurru ma’asmihi...',
        translation: 'Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya, Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.',
        count: 3,
        source: 'HR. Abu Daud no. 5088, Tirmidzi no. 3388, Ibnu Majah no. 3869'
    },
    {
        id: 'petang-10',
        title: 'Keridhaan Islam',
        arabic: 'رَضِيْتُ بِاللهِ رَبًّا، وَبِاْلإِسْلاَمِ دِيْنًا، وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
        transliteration: 'Rodhiitu billaahi robbaa wa bil-islaami diinaa...',
        translation: 'Aku ridha Allah sebagai Rabb, Islam sebagai agama dan Muhammad shallallahu ‘alaihi wa sallam sebagai nabi (yang diutus oleh Allah).',
        count: 3,
        source: 'HR. Abu Daud no. 5072, Tirmidzi no. 3389'
    },
    {
        id: 'petang-11',
        title: 'Perlindungan dari Kejahatan Makhluk',
        arabic: 'أَعُوْذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        transliteration: 'A’udzu bikalimaatillahit-taammaati min syarri maa kholaq',
        translation: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan-Nya.',
        count: 3,
        source: 'HR. Muslim no. 2709'
    },
    {
        id: 'petang-12',
        title: 'Mohon Perbaikan Urusan',
        arabic: 'يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ، أَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ وَلاَ تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ',
        transliteration: 'Yaa Hayyu Yaa Qoyyum, bi-rohmatika...',
        translation: 'Wahai Rabb Yang Maha Hidup, wahai Rabb Yang Maha Berdiri Sendiri (tidak butuh segala sesuatu), dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan diserahkan kepadaku sekalipun sekejap mata (tanpa mendapat pertolongan dari-Mu).',
        count: 1,
        source: 'HR. Hakim'
    },
    {
        id: 'petang-13',
        title: 'Fitrah Islam',
        arabic: 'أَمْسَيْنَا عَلَى فِطْرَةِ اْلإِسْلاَمِ وَعَلَى كَلِمَةِ اْلإِخْلاَصِ، وَعَلَى دِيْنِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ، حَنِيْفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِيْنَ',
        transliteration: 'Amsaynaa ‘ala fithrotil islaam...',
        translation: 'Di waktu sore kami memegang agama Islam, kalimat ikhlas, agama Nabi kami Muhammad shallallahu ‘alaihi wa sallam, dan agama bapak kami Ibrahim yang hanif (lurus) dan muslim, dan ia bukan termasuk orang-orang musyrik.',
        count: 1,
        source: 'HR. Ahmad (3/406, 407)'
    },
    {
        id: 'petang-14',
        title: 'Tasbih & Tahmid',
        arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
        transliteration: 'Subhanallah wa bi-hamdih',
        translation: 'Maha suci Allah, aku memuji-Nya.',
        count: 100,
        source: 'HR. Muslim no. 2692'
    },
    {
        id: 'petang-15',
        title: 'Tahlil (10x)',
        arabic: 'لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ',
        transliteration: 'Laa ilaha illallah wahdahu laa syarika lah...',
        translation: 'Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala pujian. Dia-lah yang berkuasa atas segala sesuatu.',
        count: 10,
        source: 'HR. An-Nasa-i'
    },
    {
        id: 'petang-16',
        title: 'Istighfar (100x)',
        arabic: 'أَسْتَغْفِرُ اللهَ وَأَتُوْبُ إِلَيْهِ',
        transliteration: 'Astagh-firullah wa atuubu ilaih',
        translation: 'Aku memohon ampun kepada Allah dan bertobat kepada-Nya.',
        count: 100,
        source: 'HR. Bukhari no. 6307, Muslim no. 2702'
    }
];
