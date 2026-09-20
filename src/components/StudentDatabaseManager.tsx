import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Upload,
  Download,
  Plus,
  Search,
  Edit3,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StudentRecord } from '../types';
import {
  getSavedStudents,
  saveStudents,
  parseDapodikFile,
  downloadDapodikTemplate,
  calculateStudentMetrics,
} from '../utils/studentStorage';

interface StudentDatabaseManagerProps {
  onNavigateToAssessment?: () => void;
  showToast: (msg: string) => void;
}

export const StudentDatabaseManager: React.FC<StudentDatabaseManagerProps> = ({
  onNavigateToAssessment,
  showToast,
}) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRombel, setSelectedRombel] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  // Modal State for Add / Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [studentForm, setStudentForm] = useState({
    nama: '',
    nisn: '',
    nis: '',
    jenisKelamin: 'L' as 'L' | 'P',
    rombel: 'Kelas VII-A',
    tempatLahir: '',
    tanggalLahir: '',
    nik: '',
  });

  // Dapodik Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreview, setImportedPreview] = useState<StudentRecord[] | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isParsing, setIsParsing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load students on mount and subscribe to update events
  useEffect(() => {
    setStudents(getSavedStudents());

    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setStudents(e.detail);
      }
    };

    window.addEventListener('gurumerdeka_students_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('gurumerdeka_students_updated', handleStorageUpdate);
    };
  }, []);

  // Compute available rombels
  const availableRombels = Array.from(
    new Set(students.map((s) => s.rombel || 'Kelas VII-A'))
  ).sort();

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nis && s.nis.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRombel =
      selectedRombel === 'all' || (s.rombel || 'Kelas VII-A') === selectedRombel;

    const matchesGender =
      selectedGender === 'all' || s.jenisKelamin === selectedGender;

    return matchesSearch && matchesRombel && matchesGender;
  });

  // Handle Add Student
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setStudentForm({
      nama: '',
      nisn: `009${Math.floor(1000000 + Math.random() * 9000000)}`,
      nis: '',
      jenisKelamin: 'L',
      rombel: availableRombels[0] || 'Kelas VII-A',
      tempatLahir: '',
      tanggalLahir: '',
      nik: '',
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Student
  const handleOpenEditModal = (student: StudentRecord) => {
    setEditingStudent(student);
    setStudentForm({
      nama: student.nama,
      nisn: student.nisn,
      nis: student.nis || '',
      jenisKelamin: student.jenisKelamin,
      rombel: student.rombel || 'Kelas VII-A',
      tempatLahir: student.tempatLahir || '',
      tanggalLahir: student.tanggalLahir || '',
      nik: student.nik || '',
    });
    setIsEditModalOpen(true);
  };

  // Save Add/Edit Form
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.nama.trim()) {
      showToast('Nama siswa wajib diisi');
      return;
    }

    if (editingStudent) {
      // Edit existing
      const updated = students.map((s) => {
        if (s.id !== editingStudent.id) return s;
        return {
          ...s,
          nama: studentForm.nama.trim(),
          nisn: studentForm.nisn.trim(),
          nis: studentForm.nis.trim() || undefined,
          jenisKelamin: studentForm.jenisKelamin,
          rombel: studentForm.rombel.trim(),
          tempatLahir: studentForm.tempatLahir.trim() || undefined,
          tanggalLahir: studentForm.tanggalLahir.trim() || undefined,
          nik: studentForm.nik.trim() || undefined,
        };
      });
      setStudents(updated);
      saveStudents(updated);
      showToast(`Data siswa "${studentForm.nama}" berhasil diperbarui.`);
    } else {
      // Add new
      const metrics = calculateStudentMetrics(75, 80, 80);
      const newStudent: StudentRecord = {
        id: `std-custom-${Date.now()}`,
        nama: studentForm.nama.trim(),
        nisn: studentForm.nisn.trim() || `009${Math.floor(1000000 + Math.random() * 9000000)}`,
        nis: studentForm.nis.trim() || undefined,
        jenisKelamin: studentForm.jenisKelamin,
        rombel: studentForm.rombel.trim() || 'Kelas VII-A',
        tempatLahir: studentForm.tempatLahir.trim() || undefined,
        tanggalLahir: studentForm.tanggalLahir.trim() || undefined,
        nik: studentForm.nik.trim() || undefined,
        nilaiDiagnostik: 75,
        nilaiLKPD: 80,
        nilaiSumatif: 80,
        nilaiAkhir: metrics.akhir,
        kktpStatus: metrics.status,
        predikat: metrics.predikat,
        catatanCapaian: metrics.catatan,
      };
      const updated = [...students, newStudent];
      setStudents(updated);
      saveStudents(updated);
      showToast(`Siswa "${newStudent.nama}" berhasil ditambahkan.`);
    }

    setIsEditModalOpen(false);
  };

  // Delete student
  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Hapus data siswa "${name}" dari database?`)) {
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      saveStudents(updated);
      showToast(`Data siswa "${name}" telah dihapus.`);
    }
  };

  // Handle file selection for Dapodik XLS
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setImportFileName(file.name);
    setIsParsing(true);
    setImportError(null);

    const res = await parseDapodikFile(file);
    setIsParsing(false);

    if (res.success) {
      setImportedPreview(res.data);
      setIsImportModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setImportError(res.error || 'Gagal membaca file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Confirm import from Dapodik preview
  const handleConfirmImport = () => {
    if (!importedPreview || importedPreview.length === 0) return;

    let updatedList: StudentRecord[] = [];

    if (importMode === 'replace') {
      updatedList = importedPreview;
    } else {
      // Append: avoid duplicate NISN
      const existingNisns = new Set(students.map((s) => s.nisn));
      const newItems = importedPreview.filter((s) => !existingNisns.has(s.nisn));
      updatedList = [...students, ...newItems];
    }

    setStudents(updatedList);
    saveStudents(updatedList);
    setIsImportModalOpen(false);
    setImportedPreview(null);
    showToast(`Berhasil mengimpor ${importedPreview.length} siswa dari file Dapodik!`);
  };

  // Export database to CSV
  const handleExportStudents = () => {
    const headers = ['No', 'Nama Siswa', 'NISN', 'NIPD', 'Jenis Kelamin', 'Rombel', 'Tempat Lahir', 'Tanggal Lahir', 'NIK'];
    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.nama}"`,
      s.nisn,
      s.nis || '-',
      s.jenisKelamin,
      `"${s.rombel || 'Kelas VII-A'}"`,
      `"${s.tempatLahir || '-'}"`,
      `"${s.tanggalLahir || '-'}"`,
      `"${s.nik || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Data_Siswa_Dapodik_SMP_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data siswa berhasil diekspor.');
  };

  // Quick reset to default
  const handleResetDefault = () => {
    if (confirm('Kembalikan database siswa ke data standar contoh? Perubahan yang belum diekspor akan hilang.')) {
      const initial = getSavedStudents();
      setStudents(initial);
      saveStudents(initial);
      showToast('Database siswa direset ke data default.');
    }
  };

  // Statistics
  const totalCount = students.length;
  const maleCount = students.filter((s) => s.jenisKelamin === 'L').length;
  const femaleCount = students.filter((s) => s.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Master Data Peserta Didik
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Terintegrasi Dapodik Kemendikbud</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Database Siswa & Manajemen Rombel</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Kelola master data siswa secara terpusat untuk keperluan penilaian otomatis, buku nilai asesmen, pengisian LKPD, dan rekap capaian KKTP Kurikulum Merdeka.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-dapodik"
            />

            {/* Impor Dapodik Button */}
            <label
              htmlFor="file-upload-dapodik"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Impor XLS Dapodik</span>
            </label>

            {/* Unduh Format Template Excel */}
            <button
              onClick={downloadDapodikTemplate}
              title="Unduh contoh template Excel standar Dapodik"
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Format Template XLS</span>
              <span className="sm:hidden">Template</span>
            </button>

            {/* Tambah Siswa Manual */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>

            {/* Ekspor CSV */}
            <button
              onClick={handleExportStudents}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Ekspor Data</span>
            </button>
          </div>
        </div>

        {/* Error message from parser if any */}
        {importError && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Gagal Memproses File: </span>
              {importError}
              <p className="mt-1 text-xs text-rose-700">
                Tip: Anda dapat mengunduh <strong>Format Template XLS</strong> di atas sebagai acuan susunan kolom yang benar.
              </p>
            </div>
            <button onClick={() => setImportError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
            <span className="text-xs text-blue-700 font-semibold block">Total Siswa Aktif</span>
            <span className="text-2xl font-bold text-blue-900 mt-1 block">{totalCount}</span>
            <span className="text-[11px] text-blue-600/80">Terdaftar di sistem</span>
          </div>

          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
            <span className="text-xs text-indigo-700 font-semibold block">Laki-laki (L)</span>
            <span className="text-2xl font-bold text-indigo-900 mt-1 block">{maleCount}</span>
            <span className="text-[11px] text-indigo-600/80">
              {totalCount > 0 ? `${Math.round((maleCount / totalCount) * 100)}% dari total` : '0%'}
            </span>
          </div>

          <div className="p-3.5 bg-pink-50/60 border border-pink-100 rounded-xl">
            <span className="text-xs text-pink-700 font-semibold block">Perempuan (P)</span>
            <span className="text-2xl font-bold text-pink-900 mt-1 block">{femaleCount}</span>
            <span className="text-[11px] text-pink-600/80">
              {totalCount > 0 ? `${Math.round((femaleCount / totalCount) * 100)}% dari total` : '0%'}
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
            <span className="text-xs text-emerald-700 font-semibold block">Rombongan Belajar</span>
            <span className="text-2xl font-bold text-emerald-900 mt-1 block">{availableRombels.length}</span>
            <span className="text-[11px] text-emerald-600/80 truncate block">
              {availableRombels.slice(0, 2).join(', ')}
              {availableRombels.length > 2 ? ' ...' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Rombel Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Semua Rombel ({availableRombels.length})</option>
              {availableRombels.map((rombel) => (
                <option key={rombel} value={rombel}>
                  {rombel}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">Semua Gender</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>

          {/* Go to Buku Nilai */}
          {onNavigateToAssessment && (
            <button
              onClick={onNavigateToAssessment}
              className="ml-auto sm:ml-2 flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>Ke Buku Nilai</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">NISN / NIPD</th>
                <th className="py-3 px-3 text-center">L/P</th>
                <th className="py-3 px-4">Rombel (Kelas)</th>
                <th className="py-3 px-4 hidden md:table-cell">Tempat, Tanggal Lahir</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">Tidak ada data siswa yang sesuai</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba ubah kata kunci pencarian atau gunakan tombol "Impor XLS Dapodik".
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.nama}</div>
                      {student.nik && (
                        <div className="text-[11px] text-slate-400">NIK: {student.nik}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      <div>{student.nisn}</div>
                      {student.nis && <div className="text-[11px] text-slate-400">NIS: {student.nis}</div>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          student.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {student.rombel || 'Kelas VII-A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 hidden md:table-cell">
                      {student.tempatLahir || student.tanggalLahir
                        ? `${student.tempatLahir || '-'}, ${student.tanggalLahir || '-'}`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.nama)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Menampilkan {filteredStudents.length} dari total {students.length} siswa
          </span>
          <button
            onClick={handleResetDefault}
            className="text-slate-500 hover:text-slate-800 underline decoration-slate-300"
          >
            Reset Database ke Contoh Bawaan
          </button>
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT STUDENT */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              {/* Nama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={studentForm.nama}
                  onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* NISN & NIPD */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NISN (10 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0091827361"
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIPD / No. Induk
                  </label>
                  <input
                    type="text"
                    placeholder="232407001"
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Gender & Rombel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={studentForm.jenisKelamin}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, jenisKelamin: e.target.value as 'L' | 'P' })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rombel / Kelas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kelas VII-A"
                    value={studentForm.rombel}
                    onChange={(e) => setStudentForm({ ...studentForm, rombel: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tempat & Tanggal Lahir */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Jakarta"
                    value={studentForm.tempatLahir}
                    onChange={(e) => setStudentForm({ ...studentForm, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={studentForm.tanggalLahir}
                    onChange={(e) => setStudentForm({ ...studentForm, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  type="text"
                  placeholder="327301..."
                  value={studentForm.nik}
                  onChange={(e) => setStudentForm({ ...studentForm, nik: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PREVIEW IMPORT DAPODIK */}
      {isImportModalOpen && importedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Pratinjau Impor Dapodik
                  </span>
                  <span className="text-xs text-slate-500 truncate max-w-[280px]">
                    {importFileName}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Ditemukan {importedPreview.length} Data Peserta Didik
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode selection */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 shrink-0 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Pilih Metode Impor Database:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    importMode === 'append'
                      ? 'bg-blue-50/80 border-blue-500 text-blue-950 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="text-xs font-bold block">Tambahkan / Gabungkan</span>
                    <span className="text-[11px] text-slate-500">
                      Siswa baru ditambahkan ke daftar yang sudah ada. NISN duplikat akan diabaikan.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    importMode === 'replace'
                      ? 'bg-blue-50/80 border-blue-500 text-blue-950 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="text-xs font-bold block">Ganti Seluruh Database</span>
                    <span className="text-[11px] text-slate-500">
                      Menghapus data siswa saat ini dan menggantikannya penuh dengan data file Dapodik ini.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl min-h-[220px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5">Nama Peserta Didik</th>
                    <th className="p-2.5">NISN</th>
                    <th className="p-2.5 text-center">L/P</th>
                    <th className="p-2.5">Rombel</th>
                    <th className="p-2.5">Tempat / Tgl Lahir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importedPreview.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="p-2.5 font-medium text-slate-900">{item.nama}</td>
                      <td className="p-2.5 font-mono text-slate-600">{item.nisn}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded font-bold text-[10px] ${
                            item.jenisKelamin === 'L'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {item.jenisKelamin}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700 font-medium">{item.rombel || 'Kelas VII-A'}</td>
                      <td className="p-2.5 text-slate-500">
                        {item.tempatLahir || item.tanggalLahir
                          ? `${item.tempatLahir || '-'}, ${item.tanggalLahir || '-'}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <span className="text-xs text-slate-500">
                Data akan langsung aktif di Buku Nilai & Asesmen setelah disimpan.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi & Simpan ke Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
