// ──────────────────────────────────────────────────────────────────────────────
// ADIWIRA MINDA — Questions Engine
// Generates 10 questions per level for each bundle × age group.
// Arithmetic bundles use a seeded RNG for reproducibility.
// ──────────────────────────────────────────────────────────────────────────────

// Seeded pseudo-random (mulberry32) so the same level always gives same Qs
function seededRng(seed) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// Fisher-Yates shuffle using seeded RNG
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle options of a hand-crafted question and update correct index
function shuffleQuestion(q, rng) {
  const paired = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correct }));
  const shuffled = shuffle(paired, rng);
  return {
    ...q,
    options: shuffled.map(p => p.opt),
    correct: shuffled.findIndex(p => p.isCorrect),
  };
}

// 4 wrong options for a given correct answer, ensuring no duplicates and no negatives
function makeOptions(rng, correct, min, max) {
  const opts = new Set([correct]);
  while (opts.size < 4) {
    const delta = randInt(rng, 1, Math.max(3, Math.floor(correct * 0.4) + 2));
    const sign = rng() > 0.5 ? 1 : -1;
    const candidate = correct + sign * delta;
    if (candidate !== correct && candidate >= 0 && candidate <= max * 2) opts.add(candidate);
  }
  // Fisher-Yates shuffle — no more B-bias
  const arr = shuffle([...opts], rng);
  return { options: arr.map(String), correctIndex: arr.indexOf(correct) };
}

// ─── STORY POOLS ──────────────────────────────────────────────────────────────

const stories = {
  tambah: [
    (a, b) => `Mega Wira mengumpul ${a} kristal kuasa di hutan magik. Kemudian dia jumpa lagi ${b} kristal di gua rahsia.`,
    (a, b) => `${a} robot musuh menyerang kampung! Lepas tu, datang pula ${b} lagi robot dari utara.`,
    (a, b) => `Puteri Bijak mempunyai ${a} epal ajaib. Pak Cik Penjaga memberinya lagi ${b} epal.`,
    (a, b) => `Terdapat ${a} bintang di langit malam. Selepas ribut berlalu, muncul lagi ${b} bintang baru!`,
    (a, b) => `Kapten Zara mengumpul ${a} syiling emas. Rakan sepasukannya pula menyumbang ${b} syiling lagi.`,
  ],
  tolak: [
    (a, b) => `Mega Wira ada ${a} kristal kuasa. Dia guna ${b} kristal untuk mengalahkan musuh.`,
    (a, b) => `Ada ${a} robot musuh. Mega Wira berjaya kalahkan ${b} daripadanya dengan satu pukulan!`,
    (a, b) => `Puteri Bijak ada ${a} epal ajaib. Dia kongsikan ${b} epal dengan kawan-kawannya.`,
    (a, b) => `${a} bintang bersinar di langit. Tiba-tiba ${b} bintang terpadam apabila musuh menyerang.`,
    (a, b) => `Kapten Zara ada ${a} peluru laser. Dia tembak dan guna ${b} peluru untuk menyelamatkan bandar.`,
  ],
  sifir: [
    (a, b) => `Ada ${a} pasukan wira, setiap pasukan ada ${b} orang ahli. Berapa ramai wira semuanya?`,
    (a, b) => `${a} kapal angkasa musuh datang menyerang. Setiap kapal ada ${b} robot tempur.`,
    (a, b) => `Mega Wira perlu menyusun ${a} baris kristal. Setiap baris ada ${b} kristal.`,
    (a, b) => `Ada ${a} kotak hadiah. Setiap kotak mengandungi ${b} coklat magik.`,
    (a, b) => `Kapten Zara terbang ${a} pusingan. Setiap pusingan dia ambil ${b} bintang.`,
  ],
  bahagi: [
    (total, b) => `${total} kristal kuasa perlu dibahagikan sama rata kepada ${b} orang wira.`,
    (total, b) => `Mega Wira ada ${total} peluru laser. Dia nak bahagikan kepada ${b} pasukan yang sama besar.`,
    (total, b) => `${total} epal ajaib perlu dimasukkan sama banyak ke dalam ${b} bakul.`,
    (total, b) => `Ada ${total} bintang untuk diberikan sama rata kepada ${b} kanak-kanak yang menang.`,
    (total, b) => `Kapten Zara ada ${total} keping coklat. Dia nak kongsi sama banyak dengan ${b} rakannya.`,
  ],
  pecahan: [
    (n, d) => `Pizza magik dipotong kepada ${d} bahagian yang sama. Mega Wira makan ${n} bahagian.`,
    (n, d) => `Tali ajaib dibahagikan kepada ${d} bahagian sama panjang. Puteri Bijak ambil ${n} bahagian.`,
    (n, d) => `Kek ulang tahun Mega Wira ada ${d} hirisan. Dia kongsikan ${n} hirisan dengan rakannya.`,
  ],
  bentuk: [], // hand-crafted below
  kbat: [],   // hand-crafted below
};

// ─── HAND-CRAFTED: Bentuk ─────────────────────────────────────────────────────

const bentukQuestions = {
  1: [ // age 5-6
    { story: "Mega Wira nampak sebuah bentuk di tembok rahsia. Ia ada 4 sisi yang sama panjang dan 4 bucu.", question: "Apakah nama bentuk itu?", options: ["Segitiga", "Segi empat sama", "Bulatan", "Segilima"], correct: 1 },
    { story: "Puteri Bijak jumpa bola kristal yang bulat licin.", question: "Bola itu berbentuk apa?", options: ["Kiub", "Silinder", "Sfera", "Kon"], correct: 2 },
    { story: "Robot musuh membawa perisai berbentuk tiga sisi.", question: "Berapa sudut yang ada pada perisai itu?", options: ["2", "3", "4", "5"], correct: 1 },
    { story: "Mega Wira melukis bentuk yang ada tiada sudut dan tiada sisi.", question: "Bentuk apakah itu?", options: ["Segiempat", "Segitiga", "Bulatan", "Pentagon"], correct: 2 },
    { story: "Ada kotak hadiah berbentuk kubus ajaib.", question: "Berapa MUKA yang ada pada kubus itu?", options: ["4", "5", "6", "8"], correct: 2 },
    { story: "Puteri Bijak nampak bentuk bintang. Ia ada 5 mata yang runcing.", question: "Berapa banyak sudut luar pada bintang 5 mata?", options: ["3", "4", "5", "6"], correct: 2 },
    { story: "Mega Wira pegang sebuah bentuk yang ada 0 bucu dan 0 sisi lurus.", question: "Itu bentuk apa?", options: ["Bulatan", "Segitiga", "Segi Empat", "Bintang"], correct: 0 },
    { story: "Kapten Zara jumpa papan tanda berbentuk segi tiga sama kaki.", question: "Berapa SISI pada segitiga?", options: ["2", "3", "4", "5"], correct: 1 },
    { story: "Ada bekas sup berbentuk silinder.", question: "Berapa MUKA bulat pada silinder?", options: ["1", "2", "3", "4"], correct: 1 },
    { story: "Mega Wira lukis bentuk yang ada 4 sisi tetapi bukan segi empat sama — sisi panjang dan pendek berselang-seli.", question: "Bentuk apakah itu?", options: ["Segi empat tepat", "Segi empat sama", "Segitiga", "Segilima"], correct: 0 },
  ],
  2: [ // age 7-9
    { story: "Mega Wira mengira tepi gelanggang segi empat tepat berukuran 8cm × 5cm.", question: "Berapakah PERIMETER gelanggang itu?", options: ["13 cm", "26 cm", "40 cm", "20 cm"], correct: 1 },
    { story: "Puteri Bijak nak tahu luas taman berbentuk segi empat sama, sisi = 6m.", question: "Berapakah LUAS taman itu?", options: ["12 m²", "24 m²", "36 m²", "48 m²"], correct: 2 },
    { story: "Robot musuh berbentuk silinder, tinggi 10cm, diameter 4cm.", question: "Berapa MUKA yang ada pada silinder?", options: ["1", "2", "3", "4"], correct: 1 },
    { story: "Ada sebuah bentuk dengan 5 sisi dan 5 sudut.", question: "Apakah nama bentuk itu?", options: ["Segiempat", "Pentagon", "Heksagon", "Oktagon"], correct: 1 },
    { story: "Kapten Zara kira perimeter gelanggang segi tiga: sisi 3cm, 4cm, 5cm.", question: "Berapakah perimeter segitiga itu?", options: ["10 cm", "11 cm", "12 cm", "13 cm"], correct: 2 },
    { story: "Mega Wira nampak bentuk 6 sisi.", question: "Apakah nama bentuk yang ada 6 sisi?", options: ["Pentagon", "Heksagon", "Oktagon", "Dekagon"], correct: 1 },
    { story: "Puteri Bijak ada petak segi empat tepat 9m × 4m.", question: "Berapakah LUAS petak itu?", options: ["26 m²", "36 m²", "40 m²", "52 m²"], correct: 1 },
    { story: "Kotak kiub ajaib Mega Wira ada sisi 3cm.", question: "Berapa JUMLAH semua sisi (12 tepi) kiub itu?", options: ["9 cm", "27 cm", "36 cm", "12 cm"], correct: 2 },
    { story: "Segitiga sama sisi mempunyai perimeter 18cm.", question: "Berapakah PANJANG satu sisinya?", options: ["3 cm", "6 cm", "9 cm", "12 cm"], correct: 1 },
    { story: "Kapten Zara lukis segi empat tepat berperimeter 24cm dan lebar 4cm.", question: "Berapakah PANJANG segi empat tepat itu?", options: ["6 cm", "8 cm", "10 cm", "12 cm"], correct: 2 },
  ],
  3: [ // age 10-12
    { story: "Padang segi empat tepat berukuran 15m × 8m.", question: "Berapakah LUAS padang itu?", options: ["46 m²", "90 m²", "120 m²", "130 m²"], correct: 2 },
    { story: "Kawasan segi tiga mempunyai tapak 12cm dan tinggi 7cm.", question: "Berapakah LUAS segitiga? (L = ½ × tapak × tinggi)", options: ["84 cm²", "42 cm²", "40 cm²", "48 cm²"], correct: 1 },
    { story: "Mega Wira membina kubu pertahanan berbentuk kiub bersisi 5m.", question: "Berapakah ISIPADU kubu itu? (I = s³)", options: ["15 m³", "25 m³", "75 m³", "125 m³"], correct: 3 },
    { story: "Sebuah silinder mempunyai jejari 7cm dan tinggi 10cm. (π ≈ 22/7)", question: "Berapakah LUAS tapak silinder?", options: ["44 cm²", "154 cm²", "176 cm²", "220 cm²"], correct: 1 },
    { story: "Kawasan berbentuk L — gabungan dua segi empat tepat: 10×4 dan 3×5.", question: "Berapakah jumlah LUAS kawasan itu?", options: ["40 m²", "55 m²", "55 m²", "55 m²"].map((v,i)=>i===0?"40 m²":i===1?"55 m²":i===2?"45 m²":"60 m²"), correct: 2 },
    { story: "Bentuk oktagon malar mempunyai 8 sisi yang sama.", question: "Berapakah jumlah sudut dalam oktagon? (formula: (n−2)×180°)", options: ["720°", "900°", "1080°", "1260°"], correct: 2 },
    { story: "Sebuah segi empat sama berperimeter 36cm.", question: "Berapakah LUAS segi empat sama itu?", options: ["36 cm²", "72 cm²", "81 cm²", "144 cm²"], correct: 2 },
    { story: "Kolam renang berbentuk segi empat tepat 25m × 10m. Air sedalam 2m.", question: "Berapakah ISIPADU air dalam kolam?", options: ["250 m³", "350 m³", "500 m³", "700 m³"], correct: 2 },
    { story: "Segitiga bersudut tegak dengan kaki 6cm dan 8cm.", question: "Berapakah panjang HIPOTENUS? (Teorem Pythagoras)", options: ["10 cm", "12 cm", "14 cm", "16 cm"], correct: 0 },
    { story: "Segi empat tepat mempunyai luas 84 cm² dan lebar 7cm.", question: "Berapakah PANJANGNYA?", options: ["8 cm", "10 cm", "12 cm", "14 cm"], correct: 2 },
  ],
};

// ─── HAND-CRAFTED: Soalan Cerita (KBAT) ──────────────────────────────────────

const kbatQuestions = {
  1: [ // age 5-6
    { story: "Mega Wira ada 3 balon merah dan 4 balon biru.", question: "Berapa jumlah balon Mega Wira?", options: ["5", "6", "7", "8"], correct: 2 },
    { story: "Ada 10 ekor arnab dalam kandang. 3 ekor lari keluar.", question: "Berapa ekor arnab yang masih dalam kandang?", options: ["5", "6", "7", "8"], correct: 2 },
    { story: "Puteri Bijak susun 5 blok merah dan 3 blok biru dalam barisan.", question: "Berapa jumlah blok semuanya?", options: ["6", "7", "8", "9"], correct: 2 },
    { story: "Ada 6 buku di rak. Cikgu tambah 4 lagi.", question: "Berapa buku sekarang?", options: ["8", "9", "10", "11"], correct: 2 },
    { story: "Mega Wira kumpul 9 bintang. Adiknya dapat 5 bintang.", question: "Berapa lebih banyak bintang Mega Wira daripada adiknya?", options: ["3", "4", "5", "6"], correct: 1 },
    { story: "Ada 7 ayam. 3 lagi datang dari ladang.", question: "Berapa ekor ayam sekarang?", options: ["8", "9", "10", "11"], correct: 2 },
    { story: "Puteri Bijak ada 12 guli. Dia bagi 4 kepada rakannya.", question: "Berapa guli yang tinggal?", options: ["6", "7", "8", "9"], correct: 2 },
    { story: "Kapten Zara ada 5 epal. Emak beri lagi 6 epal.", question: "Berapa epal semuanya?", options: ["9", "10", "11", "12"], correct: 2 },
    { story: "Ada 15 kanak-kanak. 7 pergi balik.", question: "Berapa kanak-kanak yang masih ada?", options: ["6", "7", "8", "9"], correct: 2 },
    { story: "Mega Wira ada 8 pencil. 3 hilang.", question: "Berapa pencil yang ada sekarang?", options: ["3", "4", "5", "6"], correct: 2 },
  ],
  2: [ // age 7-9
    { story: "Mega Wira beli 3 pek robot mainan. Setiap pek ada 12 robot. Dia bagi 10 robot kepada adiknya.", question: "Berapa robot yang Mega Wira ada sekarang?", options: ["26 robot", "28 robot", "36 robot", "46 robot"], correct: 0 },
    { story: "Puteri Bijak menabung RM5 sehari selama 2 minggu. Dia belanja RM18 untuk buku.", question: "Berapa wang yang tinggal?", options: ["RM42", "RM52", "RM64", "RM70"], correct: 1 },
    { story: "Ada 48 murid dibahagikan kepada 6 kumpulan. Setiap kumpulan pula dibahagikan kepada 2 pasukan.", question: "Berapa orang dalam setiap pasukan?", options: ["3 orang", "4 orang", "5 orang", "6 orang"], correct: 1 },
    { story: "Kapten Zara terbang 9 pusingan. Setiap pusingan jauhnya 7km. Tapi dia terpaksa balik 12km selepas itu.", question: "Berapa jauh Kapten Zara dari titik mula?", options: ["51 km", "63 km", "55 km", "75 km"], correct: 0 },
    { story: "Kedai mainan jual 5 jenis robot. Harga setiap robot RM8. Pada hari raya, diskaun RM2 untuk setiap robot.", question: "Berapa harga satu robot selepas diskaun?", options: ["RM4", "RM5", "RM6", "RM7"], correct: 2 },
    { story: "Mega Wira ada 72 butir gula-gula. Dia bagi kepada 8 orang kawan, masing-masing dapat sama banyak.", question: "Berapa gula-gula setiap kawan dapat?", options: ["7", "8", "9", "10"], correct: 2 },
    { story: "Kelas Darjah 3 ada 35 murid. ¼ daripada mereka pergi lawatan. Yang lain belajar di sekolah.", question: "Berapa murid yang tinggal di sekolah?", options: ["25", "26", "27", "28"], correct: 1 },
    { story: "Puteri Bijak beli 4 tin cat, setiap tin RM7. Dia bayar dengan RM50.", question: "Berapa baki yang dia terima?", options: ["RM18", "RM20", "RM22", "RM24"], correct: 2 },
    { story: "Kilang membuat 60 coklat sejam. Beroperasi selama 3 jam.", question: "Berapa coklat dibuat semuanya?", options: ["120", "150", "180", "210"], correct: 2 },
    { story: "Ada 5 pokok, setiap pokok ada 8 cawangan, setiap cawangan ada 3 daun baru.", question: "Berapa jumlah daun baru?", options: ["100", "110", "120", "130"], correct: 2 },
  ],
  3: [ // age 10-12
    { story: "Sebuah kilang menghasilkan 1,250 unit produk sehari. Selama 5 hari bekerja, 320 unit rosak dan dibuang.", question: "Berapa unit produk yang baik dijual?", options: ["5,930", "6,000", "5,880", "5,750"], correct: 0 },
    { story: "Mega Wira ada RM500. Dia belanja ⅖ untuk pakaian, ¼ untuk buku, selebihnya disimpan.", question: "Berapa ringgit yang disimpan?", options: ["RM175", "RM220", "RM275", "RM300"], correct: 0 },
    { story: "Sebuah kereta bergerak 120 km/j selama 2.5 jam, kemudian perlahan kepada 80 km/j selama 1 jam.", question: "Berapakah jumlah jarak perjalanan?", options: ["350 km", "360 km", "380 km", "400 km"], correct: 2 },
    { story: "Ladang menghasilkan 2,400 kg buah-buahan. ⅓ dijual di pasar, ¼ dieksport, bakinya diproses.", question: "Berapa kg buah yang diproses?", options: ["800 kg", "1,000 kg", "1,200 kg", "1,400 kg"], correct: 1 },
    { story: "Kapten Zara beli 24 kotak biskut pada harga RM3.50 sekotak. Dia jual semula pada RM5.00 sekotak.", question: "Berapakah keuntungan bersih?", options: ["RM24", "RM36", "RM48", "RM60"], correct: 1 },
    { story: "Sekolah ada 840 murid. Nisbah lelaki kepada perempuan adalah 3:4.", question: "Berapa murid perempuan di sekolah itu?", options: ["360", "420", "480", "540"], correct: 2 },
    { story: "Mega Wira berlari mengelilingi taman berbentuk segi empat tepat 80m × 50m sebanyak 3 pusingan.", question: "Berapa jumlah jarak berlari?", options: ["390 m", "650 m", "780 m", "1,000 m"], correct: 2 },
    { story: "Harga asal sebuah tablet ialah RM800. Diskaun 15% diberi semasa jualan.", question: "Berapakah harga tablet selepas diskaun?", options: ["RM640", "RM660", "RM680", "RM720"], correct: 2 },
    { story: "Sebuah tangki penuh mengandungi 1,500 liter air. ⅗ digunakan pada hari Isnin, dan ¼ daripada baki digunakan pada hari Selasa.", question: "Berapa liter yang tinggal selepas hari Selasa?", options: ["300 ℓ", "450 ℓ", "540 ℓ", "600 ℓ"], correct: 1 },
    { story: "Murid kelas A dapat purata 78 markah dalam 5 subjek. Skor mereka ialah 80, 75, 82, 70, dan satu lagi.", question: "Berapakah markah subjek kelima?", options: ["79", "81", "83", "85"], correct: 2 },
  ],
};

// ─── PECAHAN (hand-crafted) ───────────────────────────────────────────────────

const pecahanQuestions = {
  1: [ // age 5-6 — basic intro only
    { story: "Pizza ajaib dipotong 2 bahagian sama. Mega Wira makan 1 bahagian.", question: "Berapa PECAHAN pizza yang dia makan?", options: ["½", "⅓", "¼", "⅔"], correct: 0 },
    { story: "Coklat dibahagi 4. Puteri Bijak dapat 1 bahagian.", question: "Berapa bahagian yang dia dapat?", options: ["¼", "½", "¾", "⅓"], correct: 0 },
    { story: "Roti dipotong 2 bahagian sama. Kapten Zara makan 1 bahagian.", question: "Satu bahagian sama dengan?", options: ["½", "⅓", "¼", "⅕"], correct: 0 },
    { story: "Terdapat 4 guli sama warna. Mega Wira ambil 2.", question: "Berapa PECAHAN guli yang diambil?", options: ["¼", "½", "¾", "⅓"], correct: 1 },
    { story: "Kek dipotong kepada 4 bahagian. 1 bahagian diberi kepada adik.", question: "Berapa pecahan yang diberi?", options: ["½", "⅓", "¼", "⅔"], correct: 2 },
    { story: "Puteri Bijak warna ½ daripada gambarnya biru. Selebihnya merah.", question: "Berapa bahagian yang MERAH?", options: ["¼", "½", "¾", "⅓"], correct: 1 },
    { story: "Terdapat 2 epal. Mega Wira makan 1.", question: "Berapa pecahan epal yang dimakan?", options: ["¼", "⅓", "½", "¾"], correct: 2 },
    { story: "Riben dipotong 4 sama panjang. Kapten Zara ambil 3 bahagian.", question: "Berapa pecahan riben yang diambil?", options: ["¼", "½", "¾", "⅔"], correct: 2 },
    { story: "Puteri Bijak ada 4 ikan, 1 ikan merah.", question: "Berapa pecahan ikan yang MERAH?", options: ["¼", "½", "¾", "⅓"], correct: 0 },
    { story: "Balang ada 4 biskut. Mega Wira makan 2.", question: "Berapa pecahan biskut yang dimakan?", options: ["¼", "½", "¾", "⅓"], correct: 1 },
  ],
  2: [ // age 7-9
    { story: "Mega Wira ada ½ botol jus. Dia minum ¼ lagi.", question: "Berapa banyak jus yang diminum SEMUANYA?", options: ["¼", "½", "¾", "1"], correct: 2 },
    { story: "Puteri Bijak habiskan ⅓ daripada tugasnya sebelum rehat dan ⅓ lagi selepas rehat.", question: "Berapa BAKI tugasnya?", options: ["⅓", "½", "⅔", "1"], correct: 0 },
    { story: "Tali berukuran ¾ meter. Kapten Zara potong ¼ meter.", question: "Berapa meter tali yang tinggal?", options: ["¼ m", "½ m", "¾ m", "1 m"], correct: 1 },
    { story: "Mega Wira berlari ⅔ daripada laluan dan rehat. Kemudian berlari ⅙ lagi.", question: "Berapa bahagian laluan yang telah dilari?", options: ["⅚", "⅔", "⅓", "½"], correct: 0 },
    { story: "Pizza dipotong 8. Kelas makan 5 hirisan.", question: "Berapa PECAHAN pizza yang dimakan?", options: ["⅜", "⅝", "½", "¾"], correct: 1 },
    { story: "Puteri Bijak ada ¾ tin cat. Dia guna ⅛ tin.", question: "Berapa cat yang tinggal?", options: ["⅝", "¾", "⅜", "½"], correct: 0 },
    { story: "Kapten Zara minum ⅓ gelas air, kemudian ¼ gelas lagi.", question: "Berapa jumlah air yang diminum? (dalam per-12)", options: ["7/12", "5/12", "6/12", "8/12"], correct: 0 },
    { story: "⅖ daripada 20 murid suka matematik. Yang lain suka sains.", question: "Berapa orang suka sains?", options: ["10", "11", "12", "13"], correct: 2 },
    { story: "Mega Wira habis baca ¾ buku setebal 80 muka surat.", question: "Berapa muka surat yang sudah dibaca?", options: ["50 ms", "55 ms", "60 ms", "65 ms"], correct: 2 },
    { story: "Ladang ada 36 pokok. ⅓ pokok berbuah, ¼ pokok berbunga.", question: "Berapa pokok yang berbuah?", options: ["9", "12", "15", "18"], correct: 1 },
  ],
  3: [ // age 10-12
    { story: "Mega Wira ada 2⅔ kg gula. Dia guna 1¾ kg.", question: "Berapa kg gula yang tinggal?", options: ["¾ kg", "11/12 kg", "1 kg", "1⅓ kg"], correct: 1 },
    { story: "Nisbah murid lelaki kepada perempuan ialah 3:5. Sekolah ada 240 murid.", question: "Berapa murid LELAKI?", options: ["80", "90", "100", "110"], correct: 1 },
    { story: "Puteri Bijak habiskan ⅖ wang untuk buku, ⅓ untuk makanan.", question: "Berapa PECAHAN wang yang dibelanjakan?", options: ["7/15", "11/15", "½", "¾"], correct: 1 },
    { story: "Kapten Zara isi ¾ tangki minyak berjumlah 60 liter.", question: "Berapa liter muat satu tangki penuh?", options: ["70 ℓ", "75 ℓ", "80 ℓ", "90 ℓ"], correct: 2 },
    { story: "Mega Wira berlari 3½ km pagi dan 2¾ km petang.", question: "Berapa km jumlah berlari?", options: ["5¾ km", "6 km", "6¼ km", "6½ km"], correct: 2 },
    { story: "Sebuah bekas mengandungi 4⅕ liter air. ⅗ daripada air itu digunakan.", question: "Berapa liter air yang digunakan?", options: ["2.52 ℓ", "2.36 ℓ", "2.45 ℓ", "2.60 ℓ"], correct: 0 },
    { story: "Ladang menghasilkan 480 kg buah. ¼ dijual, ⅓ diproses, bakinya disimpan.", question: "Berapa kg buah yang disimpan?", options: ["160 kg", "200 kg", "220 kg", "240 kg"], correct: 1 },
    { story: "Puteri Bijak jual ⅔ daripada 90 kek. Kemudian buat 15 kek baru.", question: "Berapa kek yang ada sekarang?", options: ["40", "42", "44", "45"], correct: 3 },
    { story: "Mega Wira ada 5¼ m kain. Dia guna 2⅗ m.", question: "Berapa meter kain yang tinggal?", options: ["2⅗ m", "2 13/20 m", "3 m", "2½ m"], correct: 1 },
    { story: "Kumpulan A selesaikan ⅗ projek, Kumpulan B selesaikan ½ projek berbeza.", question: "Berapakah min bahagian yang diselesaikan?", options: ["9/20", "11/20", "½", "⅗"], correct: 1 },
  ],
};

// ─── MAIN GENERATOR ───────────────────────────────────────────────────────────

export function getQuestions(bundleId, ageGroup, level) {
  const seed = (bundleId.length * 31 + ageGroup * 7 + level) * 1000;
  const rng = seededRng(seed);

  if (bundleId === 'bentuk')  return shuffle([...bentukQuestions[ageGroup]], rng).slice(0, 10).map(q => shuffleQuestion(q, rng));
  if (bundleId === 'kbat')    return shuffle([...kbatQuestions[ageGroup]], rng).slice(0, 10).map(q => shuffleQuestion(q, rng));
  if (bundleId === 'pecahan') return shuffle([...pecahanQuestions[ageGroup]], rng).slice(0, 10).map(q => shuffleQuestion(q, rng));

  // Arithmetic bundles — generate dynamically
  const questions = [];
  for (let i = 0; i < 10; i++) {
    const q = generateArithmetic(bundleId, ageGroup, level, rng, i);
    questions.push(q);
  }
  return questions;
}

function generateArithmetic(bundleId, ageGroup, level, rng, idx) {
  // Difficulty scaling: level 1-3 easy, 4-7 medium, 8-10 hard
  const diff = level <= 3 ? 0 : level <= 7 ? 1 : 2;

  // Ranges per age group × difficulty
  const ranges = {
    tambah: {
      1: [[1,10],[1,15],[5,20]], // age5-6: easy/med/hard
      2: [[5,30],[10,50],[20,99]],
      3: [[50,200],[100,500],[200,9999]],
    },
    tolak: {
      1: [[2,10],[3,15],[5,20]],
      2: [[5,30],[10,50],[20,99]],
      3: [[50,200],[100,500],[200,9999]],
    },
    sifir: {
      1: [[1,5],[1,5],[2,6]],
      2: [[2,9],[3,12],[4,12]],
      3: [[6,12],[7,15],[8,20]],
    },
    bahagi: {
      1: [[2,10],[2,20],[2,20]],
      2: [[2,9],[2,12],[3,12]],
      3: [[4,12],[5,15],[6,20]],
    },
  };

  let a, b, answer, storyFn, question;
  const [min, max] = ranges[bundleId][ageGroup][diff];

  if (bundleId === 'tambah') {
    a = randInt(rng, min, max);
    b = randInt(rng, min, max);
    answer = a + b;
    storyFn = stories.tambah[idx % stories.tambah.length];
    question = `${a} + ${b} = ?`;
  } else if (bundleId === 'tolak') {
    b = randInt(rng, min, max);
    a = b + randInt(rng, min, max); // ensure a > b
    answer = a - b;
    storyFn = stories.tolak[idx % stories.tolak.length];
    question = `${a} − ${b} = ?`;
  } else if (bundleId === 'sifir') {
    a = randInt(rng, min, max);
    b = randInt(rng, min, max);
    answer = a * b;
    storyFn = stories.sifir[idx % stories.sifir.length];
    question = `${a} × ${b} = ?`;
  } else { // bahagi
    b = randInt(rng, min, max);
    answer = randInt(rng, min, max);
    a = b * answer; // ensure clean division
    storyFn = stories.bahagi[idx % stories.bahagi.length];
    question = `${a} ÷ ${b} = ?`;
  }

  const { options, correctIndex } = makeOptions(rng, answer, 0, max * max);

  return {
    story: storyFn(a, b),
    question,
    options,
    correct: correctIndex,
  };
}

// ─── BUNDLE META ──────────────────────────────────────────────────────────────

export const BUNDLES = [
  { id: 'tambah',  label: 'Tambah & Tolak', icon: '➕', color: '#FF6B6B', bg: '#FFF0F0', desc: 'Tambah dan tolak nombor dengan seronok!' },
  { id: 'sifir',   label: 'Sifir',           icon: '✖️', color: '#A29BFE', bg: '#F3F0FF', desc: 'Kuasai sifir 1 hingga 12 seperti adiwira!' },
  { id: 'bahagi',  label: 'Bahagi',           icon: '➗', color: '#FD9B63', bg: '#FFF5EE', desc: 'Bahagi dengan tepat dan pantas!' },
  { id: 'pecahan', label: 'Pecahan',          icon: '🍕', color: '#26D07C', bg: '#EDFFF6', desc: 'Fahami pengangka dan penyebut!' },
  { id: 'bentuk',  label: 'Bentuk',           icon: '🔷', color: '#74B9FF', bg: '#EEF6FF', desc: 'Kenali bentuk 2D dan 3D!' },
  { id: 'kbat',    label: 'Soalan Cerita',    icon: '📖', color: '#F9CA24', bg: '#FFFBEE', desc: 'Selesaikan masalah kehidupan nyata!' },
];

export const AGE_GROUPS = [
  { id: 1, label: '5–6 Tahun', sublabel: 'Prasekolah', icon: '🌟', color: '#FF9FF3', bg: '#FFF0FD', desc: 'Nombor asas & bentuk mudah' },
  { id: 2, label: '7–9 Tahun', sublabel: 'Darjah 1–3', icon: '🚀', color: '#54A0FF', bg: '#EEF6FF', desc: 'Sifir, pecahan & soalan ringkas' },
  { id: 3, label: '10–12 Tahun', sublabel: 'Darjah 4–6', icon: '🏆', color: '#5F27CD', bg: '#F3EEFF', desc: 'KBAT, pecahan kompleks & geometri' },
];

export const TOTAL_LEVELS = 10;
export const QUESTIONS_PER_LEVEL = 10;
export const STARS_PER_CORRECT = 10;
export const BONUS_STARS_PERFECT = 50;
