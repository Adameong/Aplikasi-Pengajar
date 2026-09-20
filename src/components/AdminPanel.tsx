import React, { useState } from 'react';
import {
  School,
  Users,
  ShieldCheck,
  Award,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  LogIn,
  Save,
  Trash2,
  Edit3,
  Calendar,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import { SchoolProfile, TeacherUser, TeacherRole, SupervisionLog, CurriculumSubjectConfig, SubjectId, FaseDClass } from '../types';
import { SUBJECTS_LIST } from '../data/cpAtpDatabase';
import { StudentDatabaseManager } from './StudentDatabaseManager';

interface AdminPanelProps {
  schoolProfile: SchoolProfile;
  onUpdateSchoolProfile: (updated: SchoolProfile) => void;
  teachers: TeacherUser[];
  onUpdateTeachers: (updated: TeacherUser[]) => void;
  activeTeacher: TeacherUser;
  onSwitchTeacher: (teacher: TeacherUser) => void;
  supervisionLogs: SupervisionLog[];
  onAddSupervisionLog: (log: SupervisionLog) => void;
  curriculumConfig: CurriculumSubjectConfig[];
  onUpdateCurriculumConfig: (config: CurriculumSubjectConfig[]) => void;
  onNavigateToGenerator: () => void;
  onNavigateToAssessment?: () => void;
  showToast: (msg: string) => void;
}

type AdminSection = 'school-profile' | 'teachers' | 'students' | 'supervision' | 'curriculum';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  schoolProfile,
  onUpdateSchoolProfile,
  teachers,
  onUpdateTeachers,
  activeTeacher,
  onSwitchTeacher,
  supervisionLogs,
  onAddSupervisionLog,
  curriculumConfig,
  onUpdateCurriculumConfig,
  onNavigateToGenerator,
  onNavigateToAssessment,
  showToast,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('school-profile');

  // School Profile Form State
  const [profileForm, setProfileForm] = useState<SchoolProfile>(schoolProfile);

  // Teachers State
  const [teacherSearch, setTeacherSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherForm, setTeacherForm] = useState<{
    nama: string;
    nip: string;
    nuptk: string;
    email: string;
    role: TeacherRole;
    subjectId: SubjectId;
    kelasList: FaseDClass[];
    phone: string;
    status: 'Aktif' | 'Cuti' | 'Nonaktif';
  }>({
    nama: '',
    nip: '',
    nuptk: '',
    email: '',
    role: 'Guru Mapel',
    subjectId: 'ipa',
    kelasList: ['Kelas VII'],
    phone: '',
    status: 'Aktif',
  });

  // Supervision Modal State
  const [isSupervisionModalOpen, setIsSupervisionModalOpen] = useState(false);
  const [supervisionForm, setSupervisionForm] = useState({
    teacherId: teachers[0]?.id || '',
    judulModul: 'Modul Ajar Pembelajaran Berdiferensiasi',
    skorKelayakan: 90,
    status: 'Disetujui' as 'Disetujui' | 'Perlu Perbaikan' | 'Menunggu Telaah',
    catatanPengawas: '',
    penelaah: schoolProfile.namaKepsek,
  });

  // Handle School Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolProfile(profileForm);
    showToast('Profil Satuan Pendidikan berhasil diperbarui & disinkronkan!');
  };

  // Handle Teacher Form Submit (Create or Edit)
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.nama.trim()) return;

    const matchedSubject = SUBJECTS_LIST.find((s) => s.id === teacherForm.subjectId);
    const subjectName = matchedSubject?.name || 'Mata Pelajaran SMP';

    if (editingTeacherId) {
      // Edit existing
      const updated = teachers.map((t) =>
        t.id === editingTeacherId
          ? {
              ...t,
              ...teacherForm,
              subjectName,
            }
          : t
      );
      onUpdateTeachers(updated);
      showToast(`Data guru ${teacherForm.nama} berhasil diperbarui!`);
    } else {
      // Add new teacher
      const newTeacher: TeacherUser = {
        id: `guru-${Date.now()}`,
        ...teacherForm,
        subjectName,
        modulCount: 0,
        lastActive: 'Baru ditambahkan',
        avatarColor: 'from-blue-600 to-indigo-600',
      };
      onUpdateTeachers([newTeacher, ...teachers]);
      showToast(`Guru ${teacherForm.nama} berhasil ditambahkan ke daftar!`);
    }

    setIsTeacherModalOpen(false);
    setEditingTeacherId(null);
  };

  // Open Edit Modal for Teacher
  const handleEditTeacher = (teacher: TeacherUser) => {
    setEditingTeacherId(teacher.id);
    setTeacherForm({
      nama: teacher.nama,
      nip: teacher.nip,
      nuptk: teacher.nuptk || '',
      email: teacher.email,
      role: teacher.role,
      subjectId: teacher.subjectId,
      kelasList: teacher.kelasList,
      phone: teacher.phone,
      status: teacher.status,
    });
    setIsTeacherModalOpen(true);
  };

  // Delete Teacher
  const handleDeleteTeacher = (id: string, name: string) => {
    if (teachers.length <= 1) {
      showToast('Minimal harus ada 1 data guru pengampu.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus guru ${name} dari daftar?`)) {
      const filtered = teachers.filter((t) => t.id !== id);
      onUpdateTeachers(filtered);
      if (activeTeacher.id === id && filtered.length > 0) {
        onSwitchTeacher(filtered[0]);
      }
      showToast(`Data guru ${name} telah dihapus.`);
    }
  };

  // Switch to teacher and optionally redirect
  const handleSelectTeacherToImpersonate = (teacher: TeacherUser) => {
    onSwitchTeacher(teacher);
    showToast(`Identitas aktif dialihkan ke: ${teacher.nama} (${teacher.subjectName})`);
  };

  // Add Supervision Log
  const handleSaveSupervision = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeacher = teachers.find((t) => t.id === supervisionForm.teacherId) || teachers[0];
    const newLog: SupervisionLog = {
      id: `sup-${Date.now()}`,
      teacherId: targetTeacher.id,
      teacherName: targetTeacher.nama,
      subjectName: targetTeacher.subjectName,
      kelas: targetTeacher.kelasList[0] || 'Kelas VII',
      judulModul: supervisionForm.judulModul,
      tanggalSupervisi: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date()),
      status: supervisionForm.status,
      skorKelayakan: Number(supervisionForm.skorKelayakan),
      catatanPengawas: supervisionForm.catatanPengawas || 'Telah diverifikasi sesuai standar BSKAP 032/2024.',
      penelaah: supervisionForm.penelaah || schoolProfile.namaKepsek,
    };
    onAddSupervisionLog(newLog);
    setIsSupervisionModalOpen(false);
    showToast('Catatan supervisi kurikulum berhasil dicatat!');
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.nama.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.nip.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(teacherSearch.toLowerCase());
    const matchSubject = selectedSubjectFilter === 'all' || t.subjectId === selectedSubjectFilter;
    return matchSearch && matchSubject;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Admin & School Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{schoolProfile.namaSekolah}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Akreditasi {schoolProfile.akreditasi}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  NPSN: {schoolProfile.npsn}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{schoolProfile.alamat}, {schoolProfile.kabupatenKota}</span>
                <span>•</span>
                <span>TP: {schoolProfile.tahunPelajaran} ({schoolProfile.semesterAktif})</span>
                <span>•</span>
                <span>Kepsek: {schoolProfile.namaKepsek}</span>
              </p>
            </div>
          </div>

          {/* Active Identity Switcher Highlight */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3 sm:px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {activeTeacher.nama.charAt(0)}
              </div>
              <div className="text-left">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Identitas Guru Aktif
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate max-w-[180px] sm:max-w-[220px]">
                  {activeTeacher.nama}
                </span>
                <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                  {activeTeacher.subjectName} ({activeTeacher.role})
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateToGenerator}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1 shrink-0"
              title="Gunakan identitas ini untuk menyusun Modul Ajar"
            >
              <span>Susun Modul</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-6 pt-5 border-t border-slate-100 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('school-profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSection === 'school-profile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Profil Satuan Pendidikan</span>
          </button>

          <button
            onClick={() => setActiveSection('teachers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSection === 'teachers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Guru Mapel & Akses User</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                activeSection === 'teachers' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {teachers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('students')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSection === 'students'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Database Siswa (Dapodik)</span>
          </button>

          <button
            onClick={() => setActiveSection('supervision')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSection === 'supervision'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Supervisi & Telaah Modul</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                activeSection === 'supervision' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {supervisionLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('curriculum')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSection === 'curriculum'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Struktur JP & KKTP</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PROFIL SATUAN PENDIDIKAN                                       */}
      {/* ========================================================================= */}
      {activeSection === 'school-profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ubah Profil Satuan Pendidikan</h3>
                <p className="text-xs text-slate-500">
                  Data ini akan otomatis tercetak pada dokumen resmi Modul Ajar, Lembar Pengesahan, dan Kop PDF.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfileForm(schoolProfile)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                title="Reset formulir"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Row 1: Nama & NPSN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Resmi Sekolah / Satuan Pendidikan:
                  </label>
                  <input
                    type="text"
                    value={profileForm.namaSekolah}
                    onChange={(e) => setProfileForm({ ...profileForm, namaSekolah: e.target.value })}
                    required
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: SMP Negeri 1 Merdeka Belajar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NPSN:</label>
                  <input
                    type="text"
                    value={profileForm.npsn}
                    onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
                    required
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="20104521"
                  />
                </div>
              </div>

              {/* Row 2: Status, Akreditasi, Jenjang */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Sekolah:</label>
                  <select
                    value={profileForm.statusSekolah}
                    onChange={(e) => setProfileForm({ ...profileForm, statusSekolah: e.target.value as any })}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Negeri">Negeri</option>
                    <option value="Swasta">Swasta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Akreditasi:</label>
                  <select
                    value={profileForm.akreditasi}
                    onChange={(e) => setProfileForm({ ...profileForm, akreditasi: e.target.value as any })}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="A">A (Unggul)</option>
                    <option value="B">B (Baik)</option>
                    <option value="C">C (Cukup)</option>
                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang Pendidikan:</label>
                  <input
                    type="text"
                    value={profileForm.jenjang}
                    onChange={(e) => setProfileForm({ ...profileForm, jenjang: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Alamat Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Jalan & Nomor:</label>
                <input
                  type="text"
                  value={profileForm.alamat}
                  onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jl. Pendidikan Nusantara No. 45"
                />
              </div>

              {/* Row 4: Kecamatan, Kota, Provinsi, Kode Pos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kecamatan:</label>
                  <input
                    type="text"
                    value={profileForm.kecamatan}
                    onChange={(e) => setProfileForm({ ...profileForm, kecamatan: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kab./Kota:</label>
                  <input
                    type="text"
                    value={profileForm.kabupatenKota}
                    onChange={(e) => setProfileForm({ ...profileForm, kabupatenKota: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Provinsi:</label>
                  <input
                    type="text"
                    value={profileForm.provinsi}
                    onChange={(e) => setProfileForm({ ...profileForm, provinsi: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kode Pos:</label>
                  <input
                    type="text"
                    value={profileForm.kodePos}
                    onChange={(e) => setProfileForm({ ...profileForm, kodePos: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: Kontak & Web */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telepon Sekolah:</label>
                  <input
                    type="text"
                    value={profileForm.telepon}
                    onChange={(e) => setProfileForm({ ...profileForm, telepon: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi:</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Website:</label>
                  <input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 6: Kepala Sekolah & Periode */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Pejabat Penandatangan & Pengesahan Dokumen</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kepala Sekolah (Lengkap Gelar):</label>
                    <input
                      type="text"
                      value={profileForm.namaKepsek}
                      onChange={(e) => setProfileForm({ ...profileForm, namaKepsek: e.target.value })}
                      required
                      className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Dr. Hj. Siti Nurhasanah, M.Pd."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Kepala Sekolah:</label>
                    <input
                      type="text"
                      value={profileForm.nipKepsek}
                      onChange={(e) => setProfileForm({ ...profileForm, nipKepsek: e.target.value })}
                      required
                      className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="19760820 200212 2 003"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Pelajaran Aktif:</label>
                    <input
                      type="text"
                      value={profileForm.tahunPelajaran}
                      onChange={(e) => setProfileForm({ ...profileForm, tahunPelajaran: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="2024/2025"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester Aktif:</label>
                    <select
                      value={profileForm.semesterAktif}
                      onChange={(e) => setProfileForm({ ...profileForm, semesterAktif: e.target.value as any })}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Ganjil">Semester Ganjil</option>
                      <option value="Genap">Semester Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Titimangsa Kota Tanda Tangan:</label>
                    <input
                      type="text"
                      value={profileForm.titimangsaKota}
                      onChange={(e) => setProfileForm({ ...profileForm, titimangsaKota: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Bandung"
                    />
                  </div>
                </div>
              </div>

              {/* Row 7: Kop Surat Dinas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Kop Dinas Pendidikan Pengayom (Header Resmi):
                </label>
                <textarea
                  rows={2}
                  value={profileForm.dinasPendidikanKop}
                  onChange={(e) => setProfileForm({ ...profileForm, dinasPendidikanKop: e.target.value })}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PEMERINTAH KABUPATEN/KOTA DINAS PENDIDIKAN"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil Satuan Pendidikan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Official Kop Preview & Quick Stats */}
          <div className="space-y-6">
            {/* Live Official Kop Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Pratinjau Kop Dokumen Kedinasan
              </span>
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-center font-serif text-slate-800 space-y-1">
                <div className="text-[10px] font-bold tracking-wider uppercase whitespace-pre-line leading-tight text-slate-700">
                  {profileForm.dinasPendidikanKop || 'PEMERINTAH DAERAH DINAS PENDIDIKAN DAN KEBUDAYAAN'}
                </div>
                <div className="text-sm font-extrabold uppercase tracking-normal text-slate-900 pt-0.5">
                  {profileForm.namaSekolah}
                </div>
                <div className="text-[9px] text-slate-500 leading-tight">
                  {profileForm.alamat}, {profileForm.kecamatan}, {profileForm.kabupatenKota} - {profileForm.kodePos}
                </div>
                <div className="text-[9px] text-slate-500">
                  Telp: {profileForm.telepon} | Email: {profileForm.email}
                </div>
                <div className="pt-2 border-b-2 border-slate-800" />
                <div className="pt-0.5 border-b border-slate-800" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2.5 text-center">
                Kop resmi ini otomatis terpasang pada halaman pertama dokumen PDF Modul Ajar dan LKPD.
              </p>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Ringkasan Administrasi
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Fase D SMP
                </span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between pb-1.5 border-b border-white/10">
                  <span>Guru Terdata</span>
                  <span className="font-bold text-white">{teachers.length} Pengampu</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-white/10">
                  <span>Modul Disusun</span>
                  <span className="font-bold text-white">
                    {teachers.reduce((acc, t) => acc + t.modulCount, 0)} Dokumen
                  </span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-white/10">
                  <span>Supervisi Disetujui</span>
                  <span className="font-bold text-emerald-400">
                    {supervisionLogs.filter((s) => s.status === 'Disetujui').length} Modul
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Semester Berjalan</span>
                  <span className="font-bold text-amber-300">
                    {profileForm.semesterAktif} {profileForm.tahunPelajaran}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: MANAJEMEN GURU MAPEL & AKSES USER (IMPERSONATE)                */}
      {/* ========================================================================= */}
      {activeSection === 'teachers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Daftar Guru Mapel & Akses Pengguna</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Kelola guru pengampu SMP Fase D dan gunakan fitur <strong>Akses Sebagai Guru Ini</strong> untuk berpindah akun pengampu secara instan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingTeacherId(null);
                  setTeacherForm({
                    nama: '',
                    nip: '',
                    nuptk: '',
                    email: '',
                    role: 'Guru Mapel',
                    subjectId: 'ipa',
                    kelasList: ['Kelas VII'],
                    phone: '',
                    status: 'Aktif',
                  });
                  setIsTeacherModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Guru Pengampu</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Cari nama guru, NIP, atau mata pelajaran..."
                  className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Filter Mapel:</span>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Mata Pelajaran ({teachers.length})</option>
                  {SUBJECTS_LIST.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teacher Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {filteredTeachers.map((teacher) => {
                const isActive = teacher.id === activeTeacher.id;

                return (
                  <div
                    key={teacher.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all relative flex flex-col justify-between ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      {/* Top status & badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            teacher.role === 'Admin'
                              ? 'bg-purple-100 text-purple-700'
                              : teacher.role === 'Koordinator Kurikulum'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {teacher.role}
                        </span>

                        {isActive ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sedang Digunakan</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {teacher.status}
                          </span>
                        )}
                      </div>

                      {/* Name & Subject */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                            teacher.avatarColor || 'from-blue-600 to-indigo-600'
                          } text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}
                        >
                          {teacher.nama
                            .split(' ')
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                            {teacher.nama}
                          </h4>
                          <span className="text-xs font-semibold text-blue-600 block mt-0.5">
                            {teacher.subjectName}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                            NIP: {teacher.nip || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Kelas Diampu:</span>
                          <span className="font-medium text-slate-800">
                            {teacher.kelasList.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Email:</span>
                          <span className="font-mono text-[11px] text-slate-700 truncate max-w-[150px]">
                            {teacher.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Modul Disusun:</span>
                          <span className="font-bold text-slate-800">{teacher.modulCount} Dokumen</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditTeacher(teacher)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit data guru"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeacher(teacher.id, teacher.nama)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus guru"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isActive ? (
                        <button
                          type="button"
                          onClick={onNavigateToGenerator}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 transition-all flex items-center gap-1"
                        >
                          <span>Buka Generator</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectTeacherToImpersonate(teacher)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 font-semibold text-xs transition-all flex items-center gap-1.5"
                        >
                          <LogIn className="w-3.5 h-3.5 text-blue-600" />
                          <span>Akses Guru Ini</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: SUPERVISI AKADEMIK & TELAAH MODUL                              */}
      {/* ========================================================================= */}
      {activeSection === 'supervision' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-600" />
                  <span>Supervisi & Telaah Modul Ajar Guru</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Instrumen evaluasi dan penjaminan mutu kurikulum modul ajar SMP Fase D sesuai instrumen pengawas BSKAP.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSupervisionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Hasil Telaah Supervisi</span>
              </button>
            </div>

            {/* List of Supervision Records */}
            <div className="mt-5 space-y-3">
              {supervisionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{log.judulModul}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                        {log.subjectName} ({log.kelas})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          log.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'Perlu Perbaikan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>Guru: <strong>{log.teacherName}</strong></span>
                      <span>•</span>
                      <span>Tanggal: {log.tanggalSupervisi}</span>
                      <span>•</span>
                      <span>Penelaah: {log.penelaah}</span>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-100 mt-2">
                      "{log.catatanPengawas}"
                    </p>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                    <span className="text-[11px] text-slate-400">Skor Kelayakan:</span>
                    <span className="text-xl font-black text-indigo-700">{log.skorKelayakan}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: STRUKTUR KURIKULUM & ALOKASI JP SMP FASE D                     */}
      {/* ========================================================================= */}
      {activeSection === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>Struktur Jam Pelajaran (JP) & Standar KKTP SMP</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Standar alokasi JP intrakurikuler per minggu dan ambang batas Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Fase D.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr =
                      'data:text/json;charset=utf-8,' +
                      encodeURIComponent(
                        JSON.stringify({ schoolProfile, teachers, curriculumConfig, supervisionLogs }, null, 2)
                      );
                    const dl = document.createElement('a');
                    dl.setAttribute('href', dataStr);
                    dl.setAttribute('download', `Cadangan_Data_${schoolProfile.npsn}_${Date.now()}.json`);
                    dl.click();
                    showToast('Cadangan data profil dan guru berhasil diunduh!');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor JSON</span>
                </button>
              </div>
            </div>

            {/* Curriculum Table */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-y border-slate-200">
                    <th className="py-3 px-4">Mata Pelajaran (Fase D SMP)</th>
                    <th className="py-3 px-4">Alokasi JP Intrakurikuler / Minggu</th>
                    <th className="py-3 px-4">Ambang Batas KKTP Satuan Pendidikan</th>
                    <th className="py-3 px-4">Guru Pengampu Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {curriculumConfig.map((cfg, idx) => {
                    const assignedTeachers = teachers.filter((t) => t.subjectId === cfg.subjectId);
                    return (
                      <tr key={cfg.subjectId} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{cfg.name}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                            {cfg.alokasiJpPerMinggu} JP / Minggu
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                            KKTP: {cfg.kktpStandar}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {assignedTeachers.length > 0 ? (
                            <span className="text-slate-800 font-medium">
                              {assignedTeachers.map((t) => t.nama).join(', ')}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Belum ada pengampu</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: DATABASE SISWA (DAPODIK)                                       */}
      {/* ========================================================================= */}
      {activeSection === 'students' && (
        <StudentDatabaseManager
          onNavigateToAssessment={onNavigateToAssessment}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT GURU MAPEL                                           */}
      {/* ========================================================================= */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{editingTeacherId ? 'Edit Data Guru Pengampu' : 'Tambah Guru Pengampu Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Guru:
                </label>
                <input
                  type="text"
                  value={teacherForm.nama}
                  onChange={(e) => setTeacherForm({ ...teacherForm, nama: e.target.value })}
                  required
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Siti Aisyah, S.Pd., M.Si."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP (Bila Ada):</label>
                  <input
                    type="text"
                    value={teacherForm.nip}
                    onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="19871120 201101 2 009"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NUPTK:</label>
                  <input
                    type="text"
                    value={teacherForm.nuptk}
                    onChange={(e) => setTeacherForm({ ...teacherForm, nuptk: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="6743765667210034"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran:</label>
                  <select
                    value={teacherForm.subjectId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, subjectId: e.target.value as SubjectId })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peran / Jabatan:</label>
                  <select
                    value={teacherForm.role}
                    onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value as TeacherRole })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Guru Mapel">Guru Mapel</option>
                    <option value="Koordinator Kurikulum">Koordinator Kurikulum</option>
                    <option value="Admin">Admin</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Satuan:</label>
                  <input
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="nama@guru.smp.belajar.id"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas yang Diampu (Fase D):</label>
                <div className="flex gap-4">
                  {(['Kelas VII', 'Kelas VIII', 'Kelas IX'] as FaseDClass[]).map((kls) => {
                    const checked = teacherForm.kelasList.includes(kls);
                    return (
                      <label key={kls} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeacherForm({ ...teacherForm, kelasList: [...teacherForm.kelasList, kls] });
                            } else {
                              setTeacherForm({
                                ...teacherForm,
                                kelasList: teacherForm.kelasList.filter((k) => k !== kls),
                              });
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{kls}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH SUPERVISI TELAAH MODUL                                      */}
      {/* ========================================================================= */}
      {isSupervisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                <span>Formulir Telaah & Supervisi Modul Ajar</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSupervisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupervision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guru yang Disupervisi:</label>
                <select
                  value={supervisionForm.teacherId}
                  onChange={(e) => setSupervisionForm({ ...supervisionForm, teacherId: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} - {t.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul / Topik Modul Ajar:</label>
                <input
                  type="text"
                  value={supervisionForm.judulModul}
                  onChange={(e) => setSupervisionForm({ ...supervisionForm, judulModul: e.target.value })}
                  required
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Skor Kelayakan (1-100):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={supervisionForm.skorKelayakan}
                    onChange={(e) => setSupervisionForm({ ...supervisionForm, skorKelayakan: Number(e.target.value) })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Rekomendasi:</label>
                  <select
                    value={supervisionForm.status}
                    onChange={(e) => setSupervisionForm({ ...supervisionForm, status: e.target.value as any })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Disetujui">Disetujui (Layak Cetak/Ajar)</option>
                    <option value="Perlu Perbaikan">Perlu Perbaikan (Revisi)</option>
                    <option value="Menunggu Telaah">Menunggu Telaah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Pembinaan & Feedback Pengawas:</label>
                <textarea
                  rows={3}
                  value={supervisionForm.catatanPengawas}
                  onChange={(e) => setSupervisionForm({ ...supervisionForm, catatanPengawas: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Berikan umpan balik terkait diferensiasi, asesmen, atau aktivitas LKPD..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Penelaah / Pengawas:</label>
                <input
                  type="text"
                  value={supervisionForm.penelaah}
                  onChange={(e) => setSupervisionForm({ ...supervisionForm, penelaah: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupervisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Simpan Hasil Supervisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
