import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  UserCheck,
  AlertCircle,
  Download,
  Plus,
  CheckCircle2,
  TrendingUp,
  Users,
  Sparkles,
  RefreshCw,
  Upload,
  Filter,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';
import { StudentRecord, ModulAjarData } from '../types';
import {
  getSavedStudents,
  saveStudents,
  calculateStudentMetrics as calcMetricsStorage,
  parseDapodikFile,
  downloadDapodikTemplate,
} from '../utils/studentStorage';

interface AssessmentManagerProps {
  currentModul: ModulAjarData;
  onNavigateToStudentDb?: () => void;
  showToast?: (msg: string) => void;
}

export const AssessmentManager: React.FC<AssessmentManagerProps> = ({
  currentModul,
  onNavigateToStudentDb,
  showToast,
}) => {
  const [students, setStudents] = useState<StudentRecord[]>(() => getSavedStudents());
  const [kktpThreshold, setKktpThreshold] = useState<number>(75);
  const [selectedRombelFilter, setSelectedRombelFilter] = useState<string>('all');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with storage events
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setStudents(e.detail);
      }
    };
    window.addEventListener('gurumerdeka_students_updated', handleUpdate);
    return () => {
      window.removeEventListener('gurumerdeka_students_updated', handleUpdate);
    };
  }, []);

  // Interactive Quiz State
  const [selectedStudentForQuiz, setSelectedStudentForQuiz] = useState<string>('');

  useEffect(() => {
    if (students.length > 0 && !selectedStudentForQuiz) {
      setSelectedStudentForQuiz(students[0].id);
    }
  }, [students, selectedStudentForQuiz]);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Available rombels for filter
  const availableRombels = Array.from(
    new Set(students.map((s) => s.rombel || 'Kelas VII-A'))
  ).sort();

  // Filter students based on selected rombel
  const displayedStudents = students.filter((s) => {
    if (selectedRombelFilter === 'all') return true;
    return (s.rombel || 'Kelas VII-A') === selectedRombelFilter;
  });

  // Helper to recompute stats
  const calculateStudentMetrics = (diagnostik: number, lkpd: number, sumatif: number) => {
    const tpKeyword = currentModul.tujuanPembelajaran[0]?.slice(0, 45) || 'tujuan pembelajaran';
    return calcMetricsStorage(diagnostik, lkpd, sumatif, kktpThreshold, tpKeyword);
  };

  const handleScoreChange = (id: string, field: 'nilaiDiagnostik' | 'nilaiLKPD' | 'nilaiSumatif', val: number) => {
    const clampedVal = Math.min(100, Math.max(0, val || 0));
    const updated = students.map((s) => {
      if (s.id !== id) return s;
      const newD = field === 'nilaiDiagnostik' ? clampedVal : s.nilaiDiagnostik;
      const newL = field === 'nilaiLKPD' ? clampedVal : s.nilaiLKPD;
      const newS = field === 'nilaiSumatif' ? clampedVal : s.nilaiSumatif;
      const metrics = calculateStudentMetrics(newD, newL, newS);
      return {
        ...s,
        [field]: clampedVal,
        nilaiAkhir: metrics.akhir,
        kktpStatus: metrics.status,
        predikat: metrics.predikat,
        catatanCapaian: metrics.catatan,
      };
    });
    setStudents(updated);
    saveStudents(updated);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newId = `std-${Date.now()}`;
    const randomNisn = `009${Math.floor(1000000 + Math.random() * 9000000)}`;
    const metrics = calculateStudentMetrics(75, 80, 80);

    const newRec: StudentRecord = {
      id: newId,
      nisn: randomNisn,
      nama: newStudentName.trim(),
      jenisKelamin: newStudentGender,
      rombel: selectedRombelFilter !== 'all' ? selectedRombelFilter : 'Kelas VII-A',
      nilaiDiagnostik: 75,
      nilaiLKPD: 80,
      nilaiSumatif: 80,
      nilaiAkhir: metrics.akhir,
      kktpStatus: metrics.status,
      predikat: metrics.predikat,
      catatanCapaian: metrics.catatan,
    };

    const updated = [...students, newRec];
    setStudents(updated);
    saveStudents(updated);
    setNewStudentName('');
    if (showToast) showToast(`Siswa "${newRec.nama}" berhasil ditambahkan.`);
  };

  // Quick Dapodik File Import directly in Assessment Manager
  const handleDapodikFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsImporting(true);

    const res = await parseDapodikFile(file);
    setIsImporting(false);

    if (res.success) {
      // Append without duplicate NISN
      const existingNisns = new Set(students.map((s) => s.nisn));
      const newItems = res.data.filter((s) => !existingNisns.has(s.nisn));
      const updated = [...students, ...newItems];

      setStudents(updated);
      saveStudents(updated);
      if (showToast) {
        showToast(`Berhasil menambahkan ${res.count} siswa dari file Dapodik ${file.name}!`);
      }
    } else {
      alert(`Gagal mengimpor file Dapodik: ${res.error || 'Format tidak dikenali'}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Class Analytics Calculations
  const totalStudents = students.length;
  const avgScore = totalStudents > 0 ? (students.reduce((acc, s) => acc + s.nilaiAkhir, 0) / totalStudents).toFixed(1) : '0';
  const tuntasCount = students.filter((s) => s.kktpStatus === 'Tuntas').length;
  const tuntasPercentage = totalStudents > 0 ? Math.round((tuntasCount / totalStudents) * 100) : 0;
  const highestScore = totalStudents > 0 ? Math.max(...students.map((s) => s.nilaiAkhir)) : 0;
  const lowestScore = totalStudents > 0 ? Math.min(...students.map((s) => s.nilaiAkhir)) : 0;

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'L/P', 'Nilai Diagnostik', 'Nilai Formatif (LKPD)', 'Nilai Sumatif', 'Nilai Akhir', 'KKTP Status', 'Predikat', 'Deskripsi Capaian'];
    const rows = students.map((s, idx) => [
      idx + 1,
      s.nisn,
      `"${s.nama}"`,
      s.jenisKelamin,
      s.nilaiDiagnostik,
      s.nilaiLKPD,
      s.nilaiSumatif,
      s.nilaiAkhir,
      s.kktpStatus,
      s.predikat,
      `"${s.catatanCapaian}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_${currentModul.identitas.mataPelajaran}_${currentModul.identitas.kelas}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Interactive Quiz Handlers
  const handleQuizAnswer = (soalNo: number, ans: string) => {
    setQuizAnswers({ ...quizAnswers, [soalNo]: ans });
  };

  const handleEvaluateQuiz = () => {
    const questions = currentModul.asesmen.sumatif.soal;
    if (questions.length === 0) return;

    let correctCount = 0;
    questions.forEach((q) => {
      const userAns = (quizAnswers[q.nomor] || '').trim().toUpperCase();
      const expected = q.kunciJawaban.trim().toUpperCase();
      if (userAns.startsWith(expected) || userAns === expected) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);

    // Update the selected student's sumatif score directly!
    if (selectedStudentForQuiz) {
      handleScoreChange(selectedStudentForQuiz, 'nilaiSumatif', calculatedScore);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Penilaian Otomatis Kurikulum Merdeka
              </span>
              <span className="text-xs text-slate-500">
                {currentModul.identitas.kelas} • {currentModul.identitas.mataPelajaran}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Buku Nilai & Asesmen Siswa Terintegrasi</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Nilai diagnostik, LKPD formatif, dan tes sumatif dihitung otomatis sesuai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden file input for Dapodik Import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={handleDapodikFileChange}
              className="hidden"
              id="file-upload-dapodik-assessment"
            />

            <label
              htmlFor="file-upload-dapodik-assessment"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Mengimpor...' : 'Impor XLS Dapodik'}</span>
            </label>

            <button
              onClick={downloadDapodikTemplate}
              title="Unduh format template Excel Dapodik"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Template XLS</span>
            </button>

            {onNavigateToStudentDb && (
              <button
                onClick={onNavigateToStudentDb}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Kelola Database Siswa</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Nilai</span>
            </button>
          </div>
        </div>

        {/* Analytics Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
            <div className="flex items-center justify-between text-blue-700 text-xs font-semibold mb-1">
              <span>Rata-Rata Kelas</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{avgScore}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Skala nilai 0-100</p>
          </div>

          <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
            <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-1">
              <span>Ketuntasan TP</span>
              <UserCheck className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">{tuntasPercentage}%</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">{tuntasCount} dari {totalStudents} Siswa Tuntas</p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between text-slate-700 text-xs font-semibold mb-1">
              <span>Nilai Tertinggi / Terendah</span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{highestScore} / {lowestScore}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Rentang capaian kelas</p>
          </div>

          <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl">
            <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
              <span>Ambang Batas KKTP</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                max={90}
                value={kktpThreshold}
                onChange={(e) => setKktpThreshold(Number(e.target.value))}
                className="w-16 p-1 text-base font-bold bg-white rounded border border-amber-300 text-slate-900 text-center"
              />
              <span className="text-xs text-amber-700 font-medium">Kriteria Minimum</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Disesuaikan dengan modul</p>
          </div>
        </div>
      </div>

      {/* Main Table: Buku Nilai Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daftar Nilai Siswa (Daftar Hadir & Penilaian Berkelanjutan)
            </h3>
            <p className="text-xs text-slate-500">
              Ketik langsung angka nilai untuk melihat pembaruan status dan narasi rapor secara seketika. Nilai tersimpan otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Rombel */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRombelFilter}
                onChange={(e) => setSelectedRombelFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Rombel ({students.length} Siswa)</option>
                {availableRombels.map((rombel) => (
                  <option key={rombel} value={rombel}>
                    {rombel} ({students.filter((s) => (s.rombel || 'Kelas VII-A') === rombel).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Form Tambah Siswa Cepat */}
            <form onSubmit={handleAddStudent} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Nama siswa baru..."
                className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={newStudentGender}
                onChange={(e) => setNewStudentGender(e.target.value as 'L' | 'P')}
                className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
              >
                <option value="L">L</option>
                <option value="P">P</option>
              </select>
              <button
                type="submit"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-3 py-3 text-center w-10">No</th>
                <th className="px-3 py-3 text-left">Nama Siswa</th>
                <th className="px-2 py-3 text-center">L/P</th>
                <th className="px-3 py-3 text-center w-24">Diagnostik (20%)</th>
                <th className="px-3 py-3 text-center w-24">LKPD Formatif (40%)</th>
                <th className="px-3 py-3 text-center w-24">Sumatif TP (40%)</th>
                <th className="px-3 py-3 text-center w-20">Nilai Akhir</th>
                <th className="px-3 py-3 text-center w-24">Status KKTP</th>
                <th className="px-4 py-3 text-left">Deskripsi Capaian Rapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayedStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2.5 text-center text-slate-400 font-medium">{idx + 1}</td>
                  
                  <td className="px-3 py-2.5">
                    <p className="font-bold text-slate-900 text-xs">{student.nama}</p>
                    <p className="text-[10px] text-slate-400">NISN: {student.nisn}</p>
                  </td>

                  <td className="px-2 py-2.5 text-center text-slate-600">{student.jenisKelamin}</td>

                  {/* Input Nilai Diagnostik */}
                  <td className="px-2 py-2.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={student.nilaiDiagnostik}
                      onChange={(e) => handleScoreChange(student.id, 'nilaiDiagnostik', Number(e.target.value))}
                      className="w-16 p-1.5 text-center font-semibold bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:bg-white text-xs"
                    />
                  </td>

                  {/* Input Nilai LKPD */}
                  <td className="px-2 py-2.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={student.nilaiLKPD}
                      onChange={(e) => handleScoreChange(student.id, 'nilaiLKPD', Number(e.target.value))}
                      className="w-16 p-1.5 text-center font-semibold bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:bg-white text-xs"
                    />
                  </td>

                  {/* Input Nilai Sumatif */}
                  <td className="px-2 py-2.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={student.nilaiSumatif}
                      onChange={(e) => handleScoreChange(student.id, 'nilaiSumatif', Number(e.target.value))}
                      className="w-16 p-1.5 text-center font-semibold bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:bg-white text-xs"
                    />
                  </td>

                  {/* Nilai Akhir */}
                  <td className="px-3 py-2.5 text-center font-bold text-slate-900 text-sm">
                    {student.nilaiAkhir}
                  </td>

                  {/* KKTP Status */}
                  <td className="px-2 py-2.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        student.kktpStatus === 'Tuntas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {student.kktpStatus}
                    </span>
                  </td>

                  {/* Catatan Capaian */}
                  <td className="px-4 py-2.5 text-slate-700 text-xs max-w-xs leading-relaxed">
                    {student.catatanCapaian}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Quiz Simulation: Test the Assessment directly */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 inline-block mb-1">
              Simulasi Pengerjaan Siswa
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Kuis & Uji Asesmen Sumatif Siswa (Input Nilai Otomatis)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih siswa untuk simulasi pengerjaan soal asesmen dari Modul Ajar ini. Hasil penilaian otomatis memperbarui nilai sumatif di buku nilai!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Siswa:</label>
            <select
              value={selectedStudentForQuiz}
              onChange={(e) => {
                setSelectedStudentForQuiz(e.target.value);
                setQuizSubmitted(false);
                setQuizScore(null);
                setQuizAnswers({});
              }}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.jenisKelamin}) • {s.rombel || 'Kelas VII-A'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Soal-soal Interaktif */}
        <div className="space-y-4">
          {currentModul.asesmen.sumatif.soal.map((q) => (
            <div key={q.nomor} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Pertanyaan {q.nomor} [Level: {q.levelKognitif}]
                </span>
                {quizSubmitted && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (quizAnswers[q.nomor] || '').startsWith(q.kunciJawaban)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {(quizAnswers[q.nomor] || '').startsWith(q.kunciJawaban) ? 'Jawaban Benar' : 'Jawaban Salah'}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {q.pertanyaan}
              </p>

              {/* Opsi Jawaban Radio */}
              {q.opsi && q.opsi.length > 0 ? (
                <div className="space-y-1.5">
                  {q.opsi.map((opsi, i) => {
                    const optKey = opsi.charAt(0);
                    const isSelected = quizAnswers[q.nomor] === optKey;
                    return (
                      <label
                        key={i}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`soal-${q.nomor}`}
                          checked={isSelected}
                          onChange={() => handleQuizAnswer(q.nomor, optKey)}
                          className="text-blue-600"
                        />
                        <span>{opsi}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <textarea
                    rows={2}
                    placeholder="Ketik jawaban analisis siswa di sini..."
                    value={quizAnswers[q.nomor] || ''}
                    onChange={(e) => handleQuizAnswer(q.nomor, e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Quiz Evaluation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            {quizSubmitted && quizScore !== null && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Skor Diperoleh: {quizScore} / 100 (Tersimpan ke Buku Nilai Siswa)</span>
              </div>
            )}
          </div>

          <button
            onClick={handleEvaluateQuiz}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Koreksi & Masukkan Nilai Siswa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
