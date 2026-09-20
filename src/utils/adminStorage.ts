import { SchoolProfile, TeacherUser, SupervisionLog, CurriculumSubjectConfig } from '../types';

const STORAGE_KEYS = {
  SCHOOL_PROFILE: 'gurumerdeka_school_profile_v1',
  TEACHERS: 'gurumerdeka_teachers_v1',
  ACTIVE_TEACHER_ID: 'gurumerdeka_active_teacher_id_v1',
  SUPERVISION_LOGS: 'gurumerdeka_supervision_logs_v1',
  CURRICULUM_CONFIG: 'gurumerdeka_curriculum_cfg_v1',
};

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  namaSekolah: 'SMP Negeri 1 Merdeka Belajar',
  npsn: '20104521',
  statusSekolah: 'Negeri',
  akreditasi: 'A',
  jenjang: 'Sekolah Menengah Pertama (SMP)',
  alamat: 'Jl. Pendidikan Nusantara No. 45',
  desaKelurahan: 'Merdeka Jaya',
  kecamatan: 'Coblong',
  kabupatenKota: 'Kota Bandung',
  provinsi: 'Jawa Barat',
  kodePos: '40132',
  telepon: '(022) 2501234',
  email: 'info@smpn1merdekabelajar.sch.id',
  website: 'https://smpn1merdekabelajar.sch.id',
  namaKepsek: 'Dr. Hj. Siti Nurhasanah, M.Pd.',
  nipKepsek: '19760820 200212 2 003',
  tahunPelajaran: '2024/2025',
  semesterAktif: 'Ganjil',
  titimangsaKota: 'Bandung',
  dinasPendidikanKop: 'PEMERINTAH PROVINSI JAWA BARAT\nDINAS PENDIDIKAN DAN KEBUDAYAAN\nCABANG DINAS PENDIDIKAN WILAYAH VII',
  nomorSuratFormat: '421.3/MA-{MAPEL}/SMPN1/{TAHUN}',
};

export const INITIAL_TEACHERS: TeacherUser[] = [
  {
    id: 'guru-001',
    nama: 'Rahmat Hidayat, S.Pd.',
    nip: '19850115 201001 1 012',
    nuptk: '3445763665200012',
    email: 'rahmat.hidayat@guru.smp.belajar.id',
    role: 'Guru Mapel',
    subjectId: 'ipa',
    subjectName: 'Ilmu Pengetahuan Alam (IPA)',
    kelasList: ['Kelas VII', 'Kelas VIII'],
    phone: '0812-3456-7890',
    status: 'Aktif',
    modulCount: 5,
    lastActive: 'Hari ini, 08:30 WIB',
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'guru-002',
    nama: 'Dewi Anggraini, M.Pd.',
    nip: '19880422 201402 2 004',
    nuptk: '8756766668210043',
    email: 'dewi.anggraini@guru.smp.belajar.id',
    role: 'Koordinator Kurikulum',
    subjectId: 'matematika',
    subjectName: 'Matematika',
    kelasList: ['Kelas VII', 'Kelas IX'],
    phone: '0813-8877-6655',
    status: 'Aktif',
    modulCount: 8,
    lastActive: 'Hari ini, 07:15 WIB',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'guru-003',
    nama: 'Budi Santoso, S.Pd.',
    nip: '19820711 200801 1 009',
    nuptk: '4532760662200021',
    email: 'budi.santoso@guru.smp.belajar.id',
    role: 'Guru Mapel',
    subjectId: 'bahasa-indonesia',
    subjectName: 'Bahasa Indonesia',
    kelasList: ['Kelas VII', 'Kelas VIII', 'Kelas IX'],
    phone: '0815-9922-1133',
    status: 'Aktif',
    modulCount: 4,
    lastActive: 'Kemarin, 14:20 WIB',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'guru-004',
    nama: 'Sarah Fitriani, S.Pd., M.Hum.',
    nip: '19910903 201903 2 015',
    nuptk: '9012769671210052',
    email: 'sarah.fitriani@guru.smp.belajar.id',
    role: 'Guru Mapel',
    subjectId: 'bahasa-inggris',
    subjectName: 'Bahasa Inggris',
    kelasList: ['Kelas VIII', 'Kelas IX'],
    phone: '0821-4455-6677',
    status: 'Aktif',
    modulCount: 6,
    lastActive: 'Hari ini, 09:00 WIB',
    avatarColor: 'from-purple-500 to-pink-600',
  },
  {
    id: 'guru-005',
    nama: 'Agus Pratama, S.Kom.',
    nip: '19930518 202203 1 008',
    nuptk: '1278771673130089',
    email: 'agus.pratama@guru.smp.belajar.id',
    role: 'Admin',
    subjectId: 'informatika',
    subjectName: 'Informatika',
    kelasList: ['Kelas VII', 'Kelas VIII'],
    phone: '0857-1122-3344',
    status: 'Aktif',
    modulCount: 7,
    lastActive: 'Sedang online',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'guru-006',
    nama: 'Drs. Hendra Gunawan',
    nip: '19670312 199412 1 002',
    nuptk: '2134745647200003',
    email: 'hendra.gunawan@guru.smp.belajar.id',
    role: 'Guru Mapel',
    subjectId: 'ips',
    subjectName: 'Ilmu Pengetahuan Sosial (IPS)',
    kelasList: ['Kelas VIII', 'Kelas IX'],
    phone: '0812-7788-9900',
    status: 'Aktif',
    modulCount: 3,
    lastActive: '2 hari yang lalu',
    avatarColor: 'from-rose-500 to-red-600',
  },
  {
    id: 'guru-007',
    nama: 'Nurul Hidayati, S.Pd.I.',
    nip: '19871120 201101 2 009',
    nuptk: '6743765667210034',
    email: 'nurul.hidayati@guru.smp.belajar.id',
    role: 'Guru Mapel',
    subjectId: 'pai',
    subjectName: 'Pendidikan Agama Islam dan Budi Pekerti',
    kelasList: ['Kelas VII', 'Kelas VIII', 'Kelas IX'],
    phone: '0813-2233-4455',
    status: 'Aktif',
    modulCount: 4,
    lastActive: 'Kemarin, 11:45 WIB',
    avatarColor: 'from-emerald-600 to-green-700',
  },
  {
    id: 'guru-008',
    nama: 'Bambang Irawan, S.Pd.',
    nip: '19840217 200902 1 005',
    nuptk: '5421762664200018',
    email: 'bambang.irawan@guru.smp.belajar.id',
    role: 'Guru Mapel',
    subjectId: 'pjok',
    subjectName: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasList: ['Kelas VII', 'Kelas VIII'],
    phone: '0819-3344-5566',
    status: 'Aktif',
    modulCount: 2,
    lastActive: '3 hari yang lalu',
    avatarColor: 'from-amber-600 to-yellow-600',
  },
];

export const INITIAL_SUPERVISION_LOGS: SupervisionLog[] = [
  {
    id: 'sup-001',
    teacherId: 'guru-001',
    teacherName: 'Rahmat Hidayat, S.Pd.',
    subjectName: 'Ilmu Pengetahuan Alam (IPA)',
    kelas: 'Kelas VII',
    judulModul: 'Suhu, Kalor, dan Perpindahannya (Fase D)',
    tanggalSupervisi: '18 September 2024',
    status: 'Disetujui',
    skorKelayakan: 94,
    catatanPengawas: 'Sintaks PBL sangat kontekstual, asesmen diagnostik dan rubrik LKPD operasional.',
    penelaah: 'Dr. Hj. Siti Nurhasanah, M.Pd. (Kepala Sekolah)',
  },
  {
    id: 'sup-002',
    teacherId: 'guru-002',
    teacherName: 'Dewi Anggraini, M.Pd.',
    subjectName: 'Matematika',
    kelas: 'Kelas VIII',
    judulModul: 'Teorema Pythagoras dan Penerapan Nyata',
    tanggalSupervisi: '15 September 2024',
    status: 'Disetujui',
    skorKelayakan: 96,
    catatanPengawas: 'Diferensiasi proses sangat baik dengan media konkret dan aplikasi GeoGebra.',
    penelaah: 'Pengawas Pembina Disdik',
  },
  {
    id: 'sup-003',
    teacherId: 'guru-003',
    teacherName: 'Budi Santoso, S.Pd.',
    subjectName: 'Bahasa Indonesia',
    kelas: 'Kelas VII',
    judulModul: 'Teks Deskripsi Objek Wisata Lingkungan',
    tanggalSupervisi: '12 September 2024',
    status: 'Perlu Perbaikan',
    skorKelayakan: 78,
    catatanPengawas: 'Pertanyaan pemantik perlu diperkaya dengan studi kasus lokal agar lebih menantang.',
    penelaah: 'Dewi Anggraini, M.Pd. (Koord. Kurikulum)',
  },
  {
    id: 'sup-004',
    teacherId: 'guru-005',
    teacherName: 'Agus Pratama, S.Kom.',
    subjectName: 'Informatika',
    kelas: 'Kelas VII',
    judulModul: 'Fondasi Berpikir Komputasional & Logika Bebras',
    tanggalSupervisi: '19 September 2024',
    status: 'Disetujui',
    skorKelayakan: 92,
    catatanPengawas: 'Aktivitas unplugged ramah siswa tanpa ketergantungan perangkat lab.',
    penelaah: 'Dr. Hj. Siti Nurhasanah, M.Pd. (Kepala Sekolah)',
  },
];

export const DEFAULT_CURRICULUM_CONFIG: CurriculumSubjectConfig[] = [
  { subjectId: 'ipa', name: 'Ilmu Pengetahuan Alam (IPA)', alokasiJpPerMinggu: 5, kktpStandar: 75 },
  { subjectId: 'matematika', name: 'Matematika', alokasiJpPerMinggu: 5, kktpStandar: 72 },
  { subjectId: 'bahasa-indonesia', name: 'Bahasa Indonesia', alokasiJpPerMinggu: 6, kktpStandar: 75 },
  { subjectId: 'bahasa-inggris', name: 'Bahasa Inggris', alokasiJpPerMinggu: 4, kktpStandar: 72 },
  { subjectId: 'ips', name: 'Ilmu Pengetahuan Sosial (IPS)', alokasiJpPerMinggu: 4, kktpStandar: 75 },
  { subjectId: 'informatika', name: 'Informatika', alokasiJpPerMinggu: 3, kktpStandar: 75 },
  { subjectId: 'pendidikan-pancasila', name: 'Pendidikan Pancasila', alokasiJpPerMinggu: 3, kktpStandar: 75 },
  { subjectId: 'pjok', name: 'Pendidikan Jasmani, Olahraga & Kesehatan', alokasiJpPerMinggu: 3, kktpStandar: 75 },
  { subjectId: 'seni-budaya', name: 'Seni dan Budaya', alokasiJpPerMinggu: 3, kktpStandar: 75 },
  { subjectId: 'pai', name: 'Pendidikan Agama Islam & Budi Pekerti', alokasiJpPerMinggu: 3, kktpStandar: 78 },
];

export function getSavedSchoolProfile(): SchoolProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE);
    if (!raw) return DEFAULT_SCHOOL_PROFILE;
    return { ...DEFAULT_SCHOOL_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SCHOOL_PROFILE;
  }
}

export function saveSchoolProfile(profile: SchoolProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save school profile', e);
  }
}

export function getSavedTeachers(): TeacherUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!raw) return INITIAL_TEACHERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TEACHERS;
  } catch {
    return INITIAL_TEACHERS;
  }
}

export function saveTeachers(teachers: TeacherUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (e) {
    console.error('Failed to save teachers', e);
  }
}

export function getActiveTeacherId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_TEACHER_ID);
    return raw || INITIAL_TEACHERS[0].id;
  } catch {
    return INITIAL_TEACHERS[0].id;
  }
}

export function setActiveTeacherId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TEACHER_ID, id);
  } catch (e) {
    console.error('Failed to save active teacher id', e);
  }
}

export function getSupervisionLogs(): SupervisionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPERVISION_LOGS);
    if (!raw) return INITIAL_SUPERVISION_LOGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SUPERVISION_LOGS;
  } catch {
    return INITIAL_SUPERVISION_LOGS;
  }
}

export function saveSupervisionLogs(logs: SupervisionLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPERVISION_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save supervision logs', e);
  }
}

export function getCurriculumConfig(): CurriculumSubjectConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRICULUM_CONFIG);
    if (!raw) return DEFAULT_CURRICULUM_CONFIG;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CURRICULUM_CONFIG;
  } catch {
    return DEFAULT_CURRICULUM_CONFIG;
  }
}

export function saveCurriculumConfig(cfg: CurriculumSubjectConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRICULUM_CONFIG, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed to save curriculum config', e);
  }
}
