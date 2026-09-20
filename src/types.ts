export type SubjectId =
  | 'ipa'
  | 'matematika'
  | 'bahasa-indonesia'
  | 'bahasa-inggris'
  | 'ips'
  | 'informatika'
  | 'pendidikan-pancasila'
  | 'pjok'
  | 'seni-budaya'
  | 'pai';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  iconName: string;
  elements: string[];
}

export type FaseDClass = 'Kelas VII' | 'Kelas VIII' | 'Kelas IX';

export interface CpAtpItem {
  id: string;
  subjectId: SubjectId;
  kelas: FaseDClass;
  semester?: 'Semester 1 (Ganjil)' | 'Semester 2 (Genap)';
  elemen: string;
  capaianPembelajaran: string;
  alurTujuanPembelajaran: string[];
  tujuanPembelajaranDefault: string;
  materiPokok: string;
  subMateriList?: string[];
  alokasiWaktuDefault: string;
  dimensiP3Default?: string[];
}

export interface GenerateModulPayload {
  subjectName: string;
  kelas: FaseDClass;
  tp: string;
  materiPokok: string;
  subMateri?: string;
  elemen: string;
  capaianPembelajaran?: string;
  alurTujuanPembelajaran?: string;
  dimensiP3?: string[];
  fokusDiferensiasi?: string;
  metodeSpesifik?: string;
  modelPembelajaran: string;
  namaGuru: string;
  namaSekolah: string;
  alokasiWaktu: string;
}

export interface RubrikItem {
  aspek: string;
  skor4: string; // Sangat Baik
  skor3: string; // Baik
  skor2: string; // Cukup
  skor1: string; // Perlu Bimbingan
}

export interface SoalEvaluasi {
  nomor: number;
  pertanyaan: string;
  opsi?: string[];
  kunciJawaban: string;
  pembahasan: string;
  levelKognitif: 'C1/C2' | 'C3' | 'C4/HOTS';
}

export interface ModulAjarData {
  id: string;
  judul: string;
  createdAt: string;
  updatedAt: string;
  
  // A. IDENTITAS UMUM
  identitas: {
    namaPenyusun: string;
    namaSekolah: string;
    tahunPelajaran: string;
    jenjangSekolah: string;
    fase: string; // "Fase D"
    kelas: FaseDClass;
    mataPelajaran: string;
    alokasiWaktu: string;
    elemen: string;
    namaKepsek: string;
    nipPenyusun: string;
    nipKepsek: string;
  };
  kompetensiAwal: string[];
  profilPelajarPancasila: string[];
  saranaPrasarana: {
    media: string[];
    alatDanBahan: string[];
    sumberBelajar: string[];
  };
  targetPesertaDidik: string;
  modelPembelajaran: string; // PBL, PjBL, Inkuiri, Discovery
  metodePembelajaran: string[]; // Diskusi, Eksperimen, Presentasi, Tanya Jawab
  pendekatan: string; // Pembelajaran Berdiferensiasi (Konten, Proses, Produk)

  // B. KOMPONEN INTI
  capaianPembelajaran: string;
  alurTujuanPembelajaran: string;
  tujuanPembelajaran: string[];
  pemahamanBermakna: string;
  pertanyaanPemantik: string[];
  persiapanPembelajaran: string[];
  
  kegiatanPembelajaran: {
    pendahuluan: {
      durasi: string;
      kegiatan: string[];
    };
    inti: {
      durasi: string;
      sintaks: {
        faseSintaks: string;
        kegiatanGuru: string;
        kegiatanSiswa: string;
        diferensiasi?: string;
      }[];
    };
    penutup: {
      durasi: string;
      kegiatan: string[];
    };
  };

  // C. ASESMEN
  asesmen: {
    diagnostik: {
      nonKognitif: string[];
      kognitif: string[];
    };
    formatif: {
      teknik: string;
      rubrik: RubrikItem[];
    };
    sumatif: {
      teknik: string;
      kisiKisi: string;
      soal: SoalEvaluasi[];
    };
  };

  pengayaanDanRemedial: {
    pengayaan: string;
    remedial: string;
  };

  refleksi: {
    guru: string[];
    siswa: string[];
  };

  // D. LAMPIRAN
  lkpd: {
    judul: string;
    tujuan: string;
    alatBahan: string[];
    langkahKerja: string[];
    tugasAktivitas: string[];
    kesimpulanPanduan: string;
  };
  bahanBacaan: {
    siswa: string;
    guru: string;
  };
  glosarium: { istilah: string; arti: string }[];
  daftarPustaka: string[];
  
  // Sinkronisasi status
  isSyncedToDrive?: boolean;
  driveFileId?: string;
  driveFileUrl?: string;
}

export interface StudentRecord {
  id: string;
  nisn: string;
  nis?: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  rombel?: string; // contoh: "Kelas VII-A", "VII-B"
  tempatLahir?: string;
  tanggalLahir?: string;
  nik?: string;
  nilaiDiagnostik: number;
  nilaiLKPD: number;
  nilaiSumatif: number;
  nilaiAkhir: number;
  kktpStatus: 'Tuntas' | 'Remedial';
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';
  catatanCapaian: string;
  jawabanKuis?: Record<number, string>;
}

export interface DriveSyncItem {
  id: string;
  docTitle: string;
  modulId: string;
  syncedAt: string;
  driveFolder: string;
  status: 'Tersinkron' | 'Gagal' | 'Proses';
  fileSize: string;
  webLink?: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  statusSekolah: 'Negeri' | 'Swasta';
  akreditasi: 'A' | 'B' | 'C' | 'Belum Terakreditasi';
  jenjang: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  namaKepsek: string;
  nipKepsek: string;
  tahunPelajaran: string;
  semesterAktif: 'Ganjil' | 'Genap';
  titimangsaKota: string;
  dinasPendidikanKop: string;
  nomorSuratFormat: string;
  logoUrl?: string;
}

export type TeacherRole = 'Admin' | 'Kepala Sekolah' | 'Guru Mapel' | 'Koordinator Kurikulum';

export interface TeacherUser {
  id: string;
  nama: string;
  nip: string;
  nuptk?: string;
  email: string;
  role: TeacherRole;
  subjectId: SubjectId;
  subjectName: string;
  kelasList: FaseDClass[];
  phone: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
  modulCount: number;
  lastActive: string;
  avatarColor?: string;
}

export interface SupervisionLog {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectName: string;
  kelas: FaseDClass;
  judulModul: string;
  tanggalSupervisi: string;
  status: 'Disetujui' | 'Perlu Perbaikan' | 'Menunggu Telaah';
  skorKelayakan: number; // 1-100
  catatanPengawas: string;
  penelaah: string;
}

export interface CurriculumSubjectConfig {
  subjectId: SubjectId;
  name: string;
  alokasiJpPerMinggu: number;
  kktpStandar: number;
}

