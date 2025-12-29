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

export const dzikirPerjalanan: DzikirItem[] = [
    {
        id: 'safar-1',
        title: 'Doa Keluar Rumah',
        arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
        transliteration: 'Bismillaahi tawakkaltu ‘alalloh, laa hawla wa laa quwwata illaa billaah.',
        translation: 'Dengan nama Allah, aku bertawakal kepada-Nya; tidak ada daya dan kekuatan kecuali dengan-Nya.',
        count: 1,
        source: 'HR. Abu Daud no. 5095 & Tirmidzi no. 3426'
    },
    {
        id: 'safar-2',
        title: 'Doa Kepada yang Hendak Safar',
        arabic: 'أَسْتَوْدِعُ اللَّهَ دِينَكَ وَأَمَانَتَكَ وَخَوَاتِيمَ عَمَلِكَ',
        transliteration: 'Astawdi’ulloha diinaka, wa amaanataka, wa khowaatiima ‘amalik.',
        translation: 'Aku menitipkan agamamu, amanahmu, dan amal terakhirmu kepada Allah.',
        count: 1,
        source: 'HR. Abu Daud no. 2600 (Doa orang mukim kepada yang safar)',
        note: 'Diucapkan oleh orang yang ditinggalkan kepada yang bepergian.'
    },
    {
        id: 'safar-3',
        title: 'Doa Bekal Takwa',
        arabic: 'زَوَّدَكَ اللَّهُ التَّقْوَى وَغَفَرَ ذَنْبَكَ وَيَسَّرَ لَكَ الْخَيْرَ حَيْثُمَا كُنْتَ',
        transliteration: 'Zawwadakallohut taqwaa, wa ghofaro dzanbaka, wa yassaro lakal khoiro haitsumaa kunta.',
        translation: 'Semoga Allah membekalimu ketakwaan, mengampuni dosamu, dan memudahkan kebaikan untukmu di mana pun kamu berada.',
        count: 1,
        source: 'HR. Tirmidzi no. 3444'
    },
    {
        id: 'safar-4',
        title: 'Doa Naik Kendaraan',
        arabic: 'بِسْمِ اللَّهِ ... الحَمْدُ للِه ... سُبْحَانَ الَّذِى سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ ... الحَمْدُ للِه (x3) ... الله أَكْبَرُ (x3) ... سُبْحَانَكَ إِنِّى قَدْ ظَلَمْتُ نَفْسِى فَاغْفِرْ لِى فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
        transliteration: 'Bismillah (3x), Alhamdulillah. Subhaanalladzii sakh-khoro lanaa haadzaa wa maa kunnaa lahuu muqriniin. Wa innaa ilaa robbinaa lamun-qolibuun. Alhamdulillah (3x), Allahu Akbar (3x). Subhaanaka innii qod zholamtu nafsii, faghfirlii fa-innahuu laa yaghfirudz dzunuuba illaa anta.',
        translation: 'Dengan nama Allah (3x). Segala puji bagi Allah. Mahasuci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Rabb kami. Segala puji bagi Allah (3x), Allah Maha Besar (3x). Maha Suci Engkau, sesungguhnya aku telah menzalimi diriku sendiri maka ampunilah aku, karena tidak ada yang mengampuni dosa-dosa selain Engkau.',
        count: 1,
        source: 'HR. Abu Daud no. 2602'
    },
    {
        id: 'safar-5',
        title: 'Doa Safar (Perjalanan)',
        arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِى سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ اللَّهُمَّ أَنْتَ الصَّاحِبُ فِى السَّفَرِ وَالْخَلِيفَةُ فِى الأَهْلِ اللَّهُمَّ إِنِّى أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ وَكَآبَةِ الْمَنْظَرِ وَسُوءِ الْمُنْقَلَبِ فِى الْمَالِ وَالأَهْلِ',
        transliteration: 'Allohumma innaa nas-aluka fii safarinaa haadzaa al-birro wat taqwaa wa minal ‘amali maa tardhoo. Allohumma hawwin ‘alainaa safaronaa haadzaa, wathwi ‘annaa bu’dahuu. Allohumma antash shoohibu fis safar, wal kholiifatu fil ahli. Allohumma innii a’uudzubika min wa’tsaa-is safari wa ka-aabatil manzhori wa suu-il munqolabi fil maali wal ahli.',
        translation: 'Ya Allah, sesungguhnya kami memohon kepada-Mu kebaikan, ketakwaan, dan amal yang Engkau ridhai dalam perjalanan kami ini. Ya Allah, mudahkanlah perjalanan kami ini, dekatkanlah bagi kami jarak yang jauh. Ya Allah, Engkau adalah rekan dalam perjalanan dan pengganti di tengah keluarga. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kesukaran perjalanan, tempat kembali yang menyedihkan, dan pemandangan yang buruk pada harta dan keluarga.',
        count: 1,
        source: 'HR. Muslim no. 1342'
    },
    {
        id: 'safar-6',
        title: 'Doa Musafir kepada yang Ditinggalkan',
        arabic: 'أَسْتَوْدِعُكُمُ اللَّهَ الَّذِى لاَ تَضِيعُ وَدَائِعُهُ',
        transliteration: 'Astawdi’ukumullohalladzii laa tadhii’u wa daa-i’uhu.',
        translation: 'Aku menitipkan kalian kepada Allah yang tidak mungkin menyia-nyiakan titipan yang dititipkan kepada-Nya.',
        count: 1,
        source: 'HR. Ahmad 2/403'
    }
];
