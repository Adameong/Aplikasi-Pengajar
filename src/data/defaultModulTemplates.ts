import { ModulAjarData, FaseDClass } from '../types';
import { CP_ATP_DATABASE } from './cpAtpDatabase';

export function createDefaultModulAjar(params: {
  subjectName: string;
  kelas: FaseDClass;
  tp: string;
  materiPokok?: string;
  subMateri?: string;
  elemen?: string;
  capaianPembelajaran?: string;
  alurTujuanPembelajaran?: string;
  dimensiP3?: string[];
  fokusDiferensiasi?: string;
  metodeSpesifik?: string;
  modelPembelajaran?: string;
  namaGuru?: string;
  namaSekolah?: string;
  alokasiWaktu?: string;
}): ModulAjarData {
  const subject = params.subjectName || 'Ilmu Pengetahuan Alam (IPA)';
  const kelas = params.kelas || 'Kelas VII';
  const tp = params.tp || 'Peserta didik dapat menganalisis konsep dan penerapannya dalam kehidupan sehari-hari melalui penyelidikan terpandu.';
  const elemen = params.elemen || 'Pemahaman Konsep & Keterampilan Proses';
  const model = params.modelPembelajaran || 'Problem-Based Learning (PBL)';
  const guru = params.namaGuru || 'Guru Pengampu, S.Pd.';
  const sekolah = params.namaSekolah || 'SMP Negeri 1 Merdeka Belajar';
  const alokasi = params.alokasiWaktu || '2 x 40 Menit (1 Pertemuan)';
  const materi = params.materiPokok || tp.split(' ').slice(0, 5).join(' ');
  const subMateri = params.subMateri || '';
  const cpText = params.capaianPembelajaran || `Pada akhir Fase D, peserta didik memiliki kemampuan ${elemen} yang komprehensif, mencakup pemahaman konsep esensial, kemampuan memecahkan masalah kontekstual, serta menunjukkan sikap saintifik yang berorientasi pada Profil Pelajar Pancasila.`;
  const atpText = params.alurTujuanPembelajaran || `Mengidentifikasi konsep dasar -> Menganalisis hubungan sebab-akibat fenomena -> Melakukan investigasi terpandu -> Menyajikan solusi alternatif.`;

  const p3List = params.dimensiP3 && params.dimensiP3.length > 0
    ? params.dimensiP3.map(d => `${d}: Menunjukkan sikap konsisten dalam kegiatan pembelajaran, investigasi kelompok, dan penyusunan karya.`)
    : [
      'Bernalar Kritis: Menganalisis informasi, memverifikasi hipotesis, dan menarik kesimpulan berdasarkan data.',
      'Bergotong Royong: Berkolaborasi aktif dalam menyelesaikan Lembar Kerja Peserta Didik (LKPD).',
      'Mandiri: Bertanggung jawab terhadap proses dan hasil belajarnya sendiri.',
    ];

  const judulMateri = subMateri ? `${materi} - ${subMateri}` : materi;
  const metodeList = params.metodeSpesifik
    ? [params.metodeSpesifik, 'Diskusi Kelompok Terbimbing', 'Tanya Jawab Eksploratif', 'Presentasi Hasil Kerja']
    : ['Diskusi Kelompok Kolaboratif', 'Penyelidikan / Eksplorasi Terpandu', 'Tanya Jawab Bermakna', 'Presentasi Hasil Kerja'];

  const pendekatanText = params.fokusDiferensiasi
    ? `Pembelajaran Berdiferensiasi (${params.fokusDiferensiasi}). Memberikan akomodasi bertingkat sesuai tingkat kesiapan belajar, profil belajar, dan minat peserta didik.`
    : 'Pembelajaran Berdiferensiasi (Konten berjenjang, Proses berbasis gaya belajar visual/auditori/kinestetik, Produk variatif sesuai minat).';

  const id = `modul-${Date.now()}`;

  return {
    id,
    judul: `Modul Ajar ${subject} - ${kelas} (${judulMateri})`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    identitas: {
      namaPenyusun: guru,
      namaSekolah: sekolah,
      tahunPelajaran: '2024/2025',
      jenjangSekolah: 'Sekolah Menengah Pertama (SMP)',
      fase: 'Fase D',
      kelas: kelas,
      mataPelajaran: subject,
      alokasiWaktu: alokasi,
      elemen: elemen,
      namaKepsek: 'Kepala Sekolah, M.Pd.',
      nipPenyusun: '19850115 201001 1 012',
      nipKepsek: '19760820 200212 1 003',
    },
    kompetensiAwal: [
      `Peserta didik telah memahami konsep dasar prasyarat terkait ${materi}${subMateri ? ` khususnya ${subMateri}` : ''}.`,
      'Peserta didik mampu mengamati fenomena kontekstual di lingkungan sekitar dan mengajukan pertanyaan ilmiah.',
      'Peserta didik memiliki keterampilan dasar berdiskusi kelompok dan mencatat data sederhana.',
    ],
    profilPelajarPancasila: p3List,
    saranaPrasarana: {
      media: ['Slide Presentasi Interaktif / Infografis', 'Video Pembelajaran Kontekstual', 'Papan Tulis / Smartboard'],
      alatDanBahan: ['Lembar Kerja Peserta Didik (LKPD)', 'Sticky Notes / Papan Refleksi', 'Perangkat Laptop / Proyektor'],
      sumberBelajar: [
        'Buku Guru dan Buku Siswa Kemendikbudristek Kurikulum Merdeka SMP Fase D.',
        'Modul ajar digital & artikel sumber referensi terverifikasi BSKAP 032/H/KR/2024.',
        'Lingkungan sekitar sekolah sebagai laboratorium pembelajaran kontekstual.',
      ],
    },
    targetPesertaDidik: 'Peserta didik reguler/tipikal (umum), tidak ada kesulitan dalam mencerna dan memahami materi ajar, dengan penyesuaian bimbingan untuk kelompok afirmasi dan tantangan lanjutan bagi pencapaian tinggi.',
    modelPembelajaran: model,
    metodePembelajaran: metodeList,
    pendekatan: pendekatanText,

    // B. KOMPONEN INTI
    capaianPembelajaran: cpText,
    alurTujuanPembelajaran: atpText,
    tujuanPembelajaran: [
      tp,
      `Melalui diskusi kelompok dan pengerjaan LKPD mengenai ${subMateri || materi}, peserta didik mampu mengomunikasikan argumentasi secara sistematis dengan bahasa yang santun.`,
      `Peserta didik mampu merefleksikan pentingnya Profil Pelajar Pancasila dalam menyelesaikan persoalan nyata.`,
    ],
    pemahamanBermakna: `Pemahaman mendalam tentang ${judulMateri} membantu peserta didik menyadari keteraturan, meningkatkan kemampuan berpikir kritis, serta melatih daya analisis dalam memecahkan masalah kontekstual sehari-hari secara rasional.`,
    pertanyaanPemantik: [
      `Mengapa materi ${subMateri || materi} penting kita pelajari dan bagaimana kaitannya dengan kehidupan sehari-hari?`,
      `Apa saja permasalahan atau fenomena di lingkungan kita yang dapat dijelaskan menggunakan konsep ini?`,
      `Bagaimana cara kalian menguji kebenaran pemahaman tentang topik ini melalui penyelidikan nyata?`,
    ],
    persiapanPembelajaran: [
      'Guru menyiapkan ruangan kelas dengan penataan tempat duduk kelompok (4-5 siswa per kelompok).',
      'Guru mencetak Lembar Kerja Peserta Didik (LKPD) sejumlah kelompok belajar.',
      'Guru menyiapkan video pengantar atau media visual sebagai stimulus apersepsi.',
      'Guru menyiapkan instrumen asesmen diagnostik awal dan rubrik penilaian formatif.',
    ],

    kegiatanPembelajaran: {
      pendahuluan: {
        durasi: '15 Menit',
        kegiatan: [
          'Guru membuka pembelajaran dengan salam hangat, doa bersama, dan presensi kehadiran siswa (Beriman & Bertakwa).',
          'Guru mengajak siswa melakukan ice breaking singkat untuk membangun fokus dan kesiapan belajar (KSE: Kesadaran Diri).',
          'Apersepsi: Guru mengaitkan materi sebelumnya dengan materi yang akan dipelajari melalui pertanyaan pemantik.',
          'Motivasi: Guru menyampaikan manfaat praktis mempelajari materi ini dalam kehidupan sehari-hari.',
          'Guru menyampaikan Tujuan Pembelajaran, alur kegiatan, dan kriteria penilaian yang akan digunakan.',
        ],
      },
      inti: {
        durasi: '50 Menit',
        sintaks: [
          {
            faseSintaks: 'Fase 1: Orientasi Siswa pada Masalah Kontekstual',
            kegiatanGuru: 'Guru menampilkan video/kasus nyata terkait topik pembelajaran dan memantik rasa ingin tahu siswa dengan pertanyaan investigatif.',
            kegiatanSiswa: 'Siswa mengamati tayangan, mencatat kata kunci penting, dan mengajukan tanggapan awal secara kritis.',
            diferensiasi: 'Diferensiasi Konten: Disediakan infografis bagi pemelajar visual, rekaman narasi bagi auditori, dan benda konkret/kartu masalah bagi kinestetik.',
          },
          {
            faseSintaks: 'Fase 2: Mengorganisasikan Siswa untuk Belajar',
            kegiatanGuru: 'Guru membagi siswa ke dalam kelompok heterogen (4-5 siswa) dan membagikan Lembar Kerja Peserta Didik (LKPD).',
            kegiatanSiswa: 'Siswa berkumpul dalam kelompok, menentukan peran masing-masing (ketua, pencatat, juru bicara, pengatur waktu), dan membaca petunjuk LKPD.',
            diferensiasi: 'Diferensiasi Proses: Siswa yang butuh bimbingan didampingi secara intensif (scaffolding), sedangkan siswa mahir diberikan pertanyaan pemandu level tinggi (HOTS).',
          },
          {
            faseSintaks: 'Fase 3: Membimbing Penyelidikan Mandiri dan Kelompok',
            kegiatanGuru: 'Guru berkeliling memfasilitasi jalannya investigasi, memberikan umpan balik langsung, dan menilai keaktifan melalui lembar observasi.',
            kegiatanSiswa: 'Siswa aktif berdiskusi, menggali data dari buku teks maupun sumber digital, dan menguji solusi permasalahan dalam LKPD.',
            diferensiasi: 'Siswa diperbolehkan memilih cara eksplorasi data: membaca modul cetak, browsing terarah, atau wawancara antar teman.',
          },
          {
            faseSintaks: 'Fase 4: Mengembangkan dan Menyajikan Hasil Karya',
            kegiatanGuru: 'Guru memfasilitasi sesi presentasi kelompok dan mengatur alur tanya jawab antarkelompok dengan aturan saling menghargai.',
            kegiatanSiswa: 'Perwakilan kelompok mempresentasikan hasil diskusi/solusi di depan kelas, kelompok lain menyimak dan memberikan tanggapan apresiatif.',
            diferensiasi: 'Diferensiasi Produk: Laporan hasil kerja dapat berupa poster mini, peta konsep (mind map), atau ringkasan tertulis sesuai minat kelompok.',
          },
          {
            faseSintaks: 'Fase 5: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah',
            kegiatanGuru: 'Guru memberikan klarifikasi, penguatan konsep yang benar, serta meluruskan miskonsepsi yang muncul selama presentasi.',
            kegiatanSiswa: 'Siswa menyimpulkan konsep utama yang telah dipelajari dan menyelaraskan pemahaman kelompok dengan materi penguatan dari guru.',
          },
        ],
      },
      penutup: {
        durasi: '15 Menit',
        kegiatan: [
          'Siswa bersama guru merumuskan rangkuman pokok-pokok pembelajaran hari ini.',
          'Refleksi: Guru meminta siswa mengisi lembar refleksi 3-2-1 (3 hal baru yang dipelajari, 2 hal yang menarik, 1 pertanyaan yang masih tersisa).',
          'Guru memberikan asesmen formatif akhir singkat (kuis kilat / exit ticket 3 butir soal).',
          'Guru menyampaikan rencana tindak lanjut, pengayaan, remedial, dan materi untuk pertemuan berikutnya.',
          'Pembelajaran ditutup dengan doa syukur dan salam penutup yang santun.',
        ],
      },
    },

    asesmen: {
      diagnostik: {
        nonKognitif: [
          'Bagaimana perasaan kalian menjelang pembelajaran hari ini? (Emotikon Bahagia / Netral / Lelah)',
          'Gaya belajar mana yang paling kalian sukai: melihat gambar/video, mendengar penjelasan, atau langsung praktik?',
          'Apa harapan terbesar kalian setelah mempelajari topik ini?',
        ],
        kognitif: [
          `Sebutkan 1 contoh fenomena yang berkaitan dengan ${materi} di lingkungan rumahmu!`,
          'Menurut pendapatmu, apa yang terjadi jika salah satu unsur dalam sistem tersebut tidak bekerja?',
        ],
      },
      formatif: {
        teknik: 'Observasi Sikap Ilmiah, Penilaian Kinerja Diskusi, dan Penilaian Lembar Kerja Peserta Didik (LKPD)',
        rubrik: [
          {
            aspek: 'Penguasaan Konsep',
            skor4: 'Mampu menganalisis seluruh konsep dengan sangat tepat, runtut, dan mengaitkannya dengan fenomena nyata.',
            skor3: 'Mampu menjelaskan konsep pokok dengan tepat dan runtut tanpa kesalahan signifikan.',
            skor2: 'Mampu menjelaskan konsep namun masih terdapat beberapa kekeliruan kecil pada istilah teknis.',
            skor1: 'Belum mampu menjelaskan konsep pokok dan membutuhkan bimbingan intensif dari guru.',
          },
          {
            aspek: 'Kolaborasi & Gotong Royong',
            skor4: 'Sangat aktif berbagi tugas, menghargai pendapat rekan, dan berinisiatif memimpin penyelesaian tugas bersama.',
            skor3: 'Aktif berpartisipasi dan menjalankan tugas kelompok yang diberikan dengan penuh tanggung jawab.',
            skor2: 'Cukup terlibat dalam diskusi kelompok namun pasif dalam mengemukakan ide baru.',
            skor1: 'Cenderung pasif, tidak berkontribusi pada pengerjaan tugas kelompok, atau menyendiri.',
          },
          {
            aspek: 'Kemampuan Komunikasi & Presentasi',
            skor4: 'Menyampaikan hasil kerja dengan suara lantang, bahasa baku yang santun, runtut, dan percaya diri.',
            skor3: 'Menyampaikan hasil kerja dengan jelas, santun, dan mampu menjawab pertanyaan penguji dengan baik.',
            skor2: 'Menyampaikan hasil kerja cukup jelas namun intonasi monoton dan kurang kontak mata.',
            skor1: 'Terbata-bata saat mempresentasikan hasil dan belum mampu menjelaskan alur LKPD.',
          },
        ],
      },
      sumatif: {
        teknik: 'Tes Tertulis Objektif (Pilihan Ganda Berbobot) dan Uraian Analitis (HOTS)',
        kisiKisi: `Menguji pencapaian TP: Kemampuan menganalisis ${materi}, mengidentifikasi variabel pendukung, serta menyelesaikan studi kasus kontekstual berstandar PISA / Asesmen Nasional.`,
        soal: [
          {
            nomor: 1,
            pertanyaan: `Berdasarkan pembelajaran mengenai ${materi}, manakah pernyataan berikut yang paling tepat menggambarkan mekanisme utamanya?`,
            opsi: [
              'A. Terjadi secara acak tanpa adanya keteraturan atau aturan ilmiah.',
              'B. Terjadi akibat adanya interaksi terstruktur antara komponen-komponen penyusunnya.',
              'C. Hanya dapat berlangsung apabila diberi perlakuan suhu tinggi secara terus menerus.',
              'D. Tidak dipengaruhi oleh kondisi lingkungan sekitar sama sekali.',
            ],
            kunciJawaban: 'B',
            pembahasan: 'Mekanisme konsep ini selalu dilandasi oleh interaksi teratur dan sistemik antarkomponen yang saling memengaruhi.',
            levelKognitif: 'C3',
          },
          {
            nomor: 2,
            pertanyaan: `Sekelompok peserta didik melakukan pengamatan terkait ${materi}. Dari data yang diperoleh, terjadi penurunan efisiensi ketika variabel X dinaikkan dua kali lipat. Kesimpulan hipotesis yang paling logis adalah...`,
            opsi: [
              'A. Variabel X berbanding terbalik dengan efisiensi sistem.',
              'B. Variabel X berbanding lurus dengan efisiensi sistem.',
              'C. Variabel X tidak memiliki korelasi dengan efisiensi.',
              'D. Alat ukur yang digunakan mengalami kerusakan total.',
            ],
            kunciJawaban: 'A',
            pembahasan: 'Ketika suatu variabel dinaikkan dan hasil output menurun, hubungan yang terbentuk adalah berbanding terbalik.',
            levelKognitif: 'C4/HOTS',
          },
          {
            nomor: 3,
            pertanyaan: `Jelaskan secara analitis bagaimana penerapan prinsip ${materi} dapat dimanfaatkan sebagai solusi alternatif pemecahan masalah lingkungan di lingkungan sekolahmu!`,
            kunciJawaban: 'Peserta didik menguraikan minimal 2 langkah konkret: (1) Identifikasi sumber masalah, (2) Penerapan prinsip ilmiah materi secara terukur dan berkelanjutan.',
            pembahasan: 'Soal uraian HOTS mengukur kemampuan transfer pengetahuan ke konteks dunia nyata.',
            levelKognitif: 'C4/HOTS',
          },
        ],
      },
    },

    pengayaanDanRemedial: {
      pengayaan: `Bagi peserta didik dengan capaian tinggi (skor > 85), diberikan tugas eksploratif: Membuat kajian literatur mini atau proyek mini perancangan model simulasi digital / infografis edukatif untuk dipajang di mading kelas.`,
      remedial: `Bagi peserta didik yang belum mencapai KKTP (skor < 75), diberikan bimbingan perorangan (re-teaching) pada indikator yang belum tuntas, didampingi tutor sebaya, dan mengerjakan kembali instrumen asesmen setara.`,
    },

    refleksi: {
      guru: [
        'Apakah seluruh sintaks model pembelajaran terlaksana sesuai dengan alokasi waktu yang direncanakan?',
        'Berapa persentase peserta didik yang aktif berkolaborasi dan mencapai ketuntasan TP hari ini?',
        'Bagian kegiatan mana yang paling menarik antusiasme siswa dan bagian mana yang memerlukan perbaikan teknik penyampaian?',
      ],
      siswa: [
        'Hal apa yang paling menarik dan membuka wawasan baru yang kamu pelajari hari ini?',
        'Tantangan apa yang kamu hadapi saat menyelesaikan tugas kelompok dalam LKPD?',
        'Berapa bintang (1-5) yang kamu berikan untuk usahamu sendiri dalam pembelajaran hari ini?',
      ],
    },

    lkpd: {
      judul: `Lembar Kerja Peserta Didik (LKPD): Penyelidikan Konsep ${materi}`,
      tujuan: `Melalui kegiatan investigasi ini, peserta didik dapat membuktikan dan menganalisis hubungan konsep ${materi} secara kolaboratif.`,
      alatBahan: [
        'Alat tulis dan kertas lembar kerja',
        'Bahan bacaan / lembar kasus terlampir',
        'Format tabel pengamatan',
      ],
      langkahKerja: [
        'Tuliskan nama anggota kelompok dan kelas pada kolom identitas LKPD.',
        'Bacalah wacana stimulus atau amati simulasi yang disajikan oleh guru dengan cermat.',
        'Rumuskan 1 rumusan masalah utama berdasarkan fenomena yang diamati.',
        'Diskusikan bersama kelompok dan isikan data pengamatan ke dalam tabel analisis.',
        'Jawablah pertanyaan penuntun dengan berlandaskan bukti data dan literatur ilmiah.',
        'Rumuskan kesimpulan akhir kelompok dan persiapkan satu juru bicara untuk presentasi.',
      ],
      tugasAktivitas: [
        'Aktivitas 1: Analisis Kasus - Bacalah studi kasus yang tertera pada LKPD dan identifikasi variabel kuncinya!',
        'Aktivitas 2: Diskusi Solusi - Rancanglah bagan alur pemecahan masalah bersama kelompokmu!',
        'Aktivitas 3: Refleksi Kelompok - Tuliskan 2 poin penting kesimpulan dari investigasi yang telah kalian lakukan!',
      ],
      kesimpulanPanduan: `Berdasarkan hasil penyelidikan dan diskusi, dapat disimpulkan bahwa ${materi} terbukti memiliki keterkaitan erat dengan kondisi lingkungan, di mana setiap perubahan variabel akan berdampak langsung pada keseimbangan sistem secara keseluruhan.`,
    },

    bahanBacaan: {
      siswa: `Rangkuman Materi: ${materi} merupakan salah satu konsep esensial dalam pembelajaran ${subject} Fase D. Memahami materi ini memberikan bekal bagi siswa untuk memiliki nalar logis, kemampuan memverifikasi informasi faktual, serta mengasah kepekaan terhadap fenomena alam dan sosial di sekitarnya.`,
      guru: `Panduan Pedagogis: Guru disarankan mengedepankan pendekatan scaffolding yang adaptif terhadap keberagaman profil belajar siswa. Hindari pembelajaran satu arah; berikan ruang bagi siswa untuk bertanya, berdebat secara sehat, dan menemukan sendiri konsep inti materi.`,
    },

    glosarium: [
      { istilah: 'Capaian Pembelajaran (CP)', arti: 'Kompetensi pembelajaran yang harus dicapai peserta didik pada setiap fase perkembangan.' },
      { istilah: 'Alur Tujuan Pembelajaran (ATP)', arti: 'Rangkaian tujuan pembelajaran yang tersusun secara sistematis dan logis di dalam fase secara utuh.' },
      { istilah: 'Diferensiasi Pembelajaran', arti: 'Upaya menyesuaikan proses pembelajaran di kelas untuk memenuhi kebutuhan belajar individu murid.' },
      { istilah: 'HOTS (Higher Order Thinking Skills)', arti: 'Kemampuan berpikir kritis, logis, reflektif, metakognitif, dan berpikir kreatif.' },
      { istilah: 'KKTP', arti: 'Kriteria Ketercapaian Tujuan Pembelajaran yang diturunkan dari indikator asesmen.' },
    ],

    daftarPustaka: [
      'Badan Standar, Kurikulum, dan Asesmen Pendidikan. (2024). Keputusan Kepala BSKAP Nomor 032/H/KR/2024 tentang Capaian Pembelajaran Kurikulum Merdeka. Jakarta: Kemendikbudristek.',
      'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2023). Panduan Pembelajaran dan Asesmen Kurikulum Merdeka. Jakarta: Pusat Kurikulum dan Perbelajaran.',
      'Buku Panduan Guru dan Siswa SMP Fase D Kurikulum Merdeka. Jakarta: Balai Pustaka & Kemendikbudristek.',
    ],
  };
}
