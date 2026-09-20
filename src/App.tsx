/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ModulGeneratorForm } from './components/ModulGeneratorForm';
import { ModulViewer } from './components/ModulViewer';
import { AssessmentManager } from './components/AssessmentManager';
import { CpAtpExplorer } from './components/CpAtpExplorer';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { AdminPanel } from './components/AdminPanel';
import {
  ModulAjarData,
  FaseDClass,
  SubjectId,
  CpAtpItem,
  DriveSyncItem,
  SchoolProfile,
  TeacherUser,
  SupervisionLog,
  CurriculumSubjectConfig,
  GenerateModulPayload,
} from './types';
import { createDefaultModulAjar } from './data/defaultModulTemplates';
import { downloadModulAjarPDF } from './utils/pdfGenerator';
import { syncModulToGoogleDrive, getSavedDriveHistory } from './utils/googleDriveSync';
import {
  getSavedSchoolProfile,
  saveSchoolProfile,
  getSavedTeachers,
  saveTeachers,
  getActiveTeacherId,
  setActiveTeacherId as persistActiveTeacherId,
  getSupervisionLogs,
  saveSupervisionLogs,
  getCurriculumConfig,
  saveCurriculumConfig,
} from './utils/adminStorage';
import { Sparkles, FileText, CheckCircle2, Cloud, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveSyncCount, setDriveSyncCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // School Profile & Teacher State
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(getSavedSchoolProfile);
  const [teachers, setTeachers] = useState<TeacherUser[]>(getSavedTeachers);
  const [activeTeacherId, setActiveTeacherIdState] = useState<string>(getActiveTeacherId);
  const [supervisionLogs, setSupervisionLogs] = useState<SupervisionLog[]>(getSupervisionLogs);
  const [curriculumConfig, setCurriculumConfig] = useState<CurriculumSubjectConfig[]>(getCurriculumConfig);

  const activeTeacher = teachers.find((t) => t.id === activeTeacherId) || teachers[0];

  // Initialize with an authentic default Modul Ajar (Perpindahan Kalor IPA SMP Fase D)
  const [currentModul, setCurrentModul] = useState<ModulAjarData>(() => {
    const defaultSchool = getSavedSchoolProfile();
    const defaultTeachers = getSavedTeachers();
    const defaultTeacher = defaultTeachers[0];

    return createDefaultModulAjar({
      subjectName: defaultTeacher?.subjectName || 'Ilmu Pengetahuan Alam (IPA)',
      kelas: defaultTeacher?.kelasList[0] || 'Kelas VII',
      tp: 'Peserta didik dapat menganalisis mekanisme perpindahan kalor secara konduksi, konveksi, dan radiasi melalui penyelidikan terpandu berbasis masalah kontekstual.',
      materiPokok: 'Suhu, Kalor, dan Perpindahannya',
      elemen: 'Pemahaman IPA & Keterampilan Proses',
      modelPembelajaran: 'Problem-Based Learning (PBL)',
      namaGuru: defaultTeacher?.nama || 'Rahmat Hidayat, S.Pd.',
      namaSekolah: defaultSchool?.namaSekolah || 'SMP Negeri 1 Merdeka Belajar',
      alokasiWaktu: '2 x 40 Menit (1 Pertemuan)',
    });
  });

  // Prefill state from CP & ATP Explorer
  const [prefillData, setPrefillData] = useState<{
    subjectId: SubjectId;
    kelas: FaseDClass;
    tp: string;
    materiPokok: string;
    subMateri?: string;
    elemen: string;
    capaianPembelajaran?: string;
    alurTujuanPembelajaran?: string;
    dimensiP3?: string[];
  } | null>(null);

  useEffect(() => {
    const history = getSavedDriveHistory();
    setDriveSyncCount(history.length);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Switch Active Teacher
  const handleSwitchTeacher = (teacher: TeacherUser) => {
    setActiveTeacherIdState(teacher.id);
    persistActiveTeacherId(teacher.id);

    // Sync active teacher identity to open document
    setCurrentModul((prev) => ({
      ...prev,
      identitas: {
        ...prev.identitas,
        namaPenyusun: teacher.nama,
        nipPenyusun: teacher.nip,
        mataPelajaran: teacher.subjectName,
      },
    }));
  };

  // Update School Profile
  const handleUpdateSchoolProfile = (updated: SchoolProfile) => {
    setSchoolProfile(updated);
    saveSchoolProfile(updated);

    // Sync school profile to open document
    setCurrentModul((prev) => ({
      ...prev,
      identitas: {
        ...prev.identitas,
        namaSekolah: updated.namaSekolah,
        namaKepsek: updated.namaKepsek,
        nipKepsek: updated.nipKepsek,
        tahunPelajaran: updated.tahunPelajaran,
      },
    }));
  };

  // Update Teachers
  const handleUpdateTeachers = (updated: TeacherUser[]) => {
    setTeachers(updated);
    saveTeachers(updated);
  };

  // Add Supervision Log
  const handleAddSupervisionLog = (log: SupervisionLog) => {
    const updated = [log, ...supervisionLogs];
    setSupervisionLogs(updated);
    saveSupervisionLogs(updated);
  };

  // Update Curriculum Config
  const handleUpdateCurriculumConfig = (cfg: CurriculumSubjectConfig[]) => {
    setCurriculumConfig(cfg);
    saveCurriculumConfig(cfg);
  };

  // Generate Modul via backend API
  const handleGenerateModul = async (formData: GenerateModulPayload) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-modul', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi server generator');
      }

      const result = await response.json();
      if (result.modul) {
        const formattedModul: ModulAjarData = {
          ...result.modul,
          identitas: {
            ...result.modul.identitas,
            namaSekolah: schoolProfile.namaSekolah || result.modul.identitas.namaSekolah,
            namaKepsek: schoolProfile.namaKepsek || result.modul.identitas.namaKepsek,
            nipKepsek: schoolProfile.nipKepsek || result.modul.identitas.nipKepsek,
            tahunPelajaran: schoolProfile.tahunPelajaran || result.modul.identitas.tahunPelajaran,
          },
        };

        setCurrentModul(formattedModul);
        showToast('Modul Ajar Kurikulum Merdeka berhasil disusun!');

        // Increment teacher's module count
        const updatedTeachers = teachers.map((t) =>
          t.id === activeTeacher.id ? { ...t, modulCount: (t.modulCount || 0) + 1 } : t
        );
        handleUpdateTeachers(updatedTeachers);
        
        // Smoothly scroll down to viewer
        setTimeout(() => {
          const el = document.getElementById('section-modul-viewer');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } catch (err: any) {
      console.warn('API error, using local fallback engine:', err);
      const fallback = createDefaultModulAjar({
        subjectName: formData.subjectName,
        kelas: formData.kelas,
        tp: formData.tp,
        materiPokok: formData.materiPokok,
        subMateri: formData.subMateri,
        elemen: formData.elemen,
        capaianPembelajaran: formData.capaianPembelajaran,
        alurTujuanPembelajaran: formData.alurTujuanPembelajaran,
        dimensiP3: formData.dimensiP3,
        fokusDiferensiasi: formData.fokusDiferensiasi,
        metodeSpesifik: formData.metodeSpesifik,
        modelPembelajaran: formData.modelPembelajaran,
        namaGuru: formData.namaGuru,
        namaSekolah: schoolProfile.namaSekolah || formData.namaSekolah,
        alokasiWaktu: formData.alokasiWaktu,
      });
      setCurrentModul(fallback);
      showToast('Modul Ajar berhasil disusun berdasarkan standar BSKAP 2024!');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick PDF Download
  const handleQuickDownloadPdf = () => {
    if (!currentModul) return;
    downloadModulAjarPDF(currentModul, schoolProfile);
    showToast('Dokumen PDF resmi berhasil diunduh!');
  };

  // Sync with Google Drive
  const handleSyncDrive = async (modul: ModulAjarData) => {
    setIsSyncingDrive(true);
    try {
      const res = await syncModulToGoogleDrive(modul);
      if (res.success) {
        setCurrentModul({ ...modul, isSyncedToDrive: true });
        setDriveSyncCount(getSavedDriveHistory().length);
        showToast(res.message);
      }
    } catch (e) {
      console.error(e);
      showToast('Gagal menyinkronkan dokumen ke Google Drive.');
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // When user selects a TP in CP & ATP Explorer
  const handleSelectTpFromExplorer = (item: CpAtpItem) => {
    setPrefillData({
      subjectId: item.subjectId,
      kelas: item.kelas,
      tp: item.tujuanPembelajaranDefault,
      materiPokok: item.materiPokok,
      subMateri: item.subMateriList && item.subMateriList.length > 0 ? item.subMateriList[0] : undefined,
      elemen: item.elemen,
      capaianPembelajaran: item.capaianPembelajaran,
      alurTujuanPembelajaran: item.alurTujuanPembelajaran && item.alurTujuanPembelajaran.length > 0 ? item.alurTujuanPembelajaran[0] : undefined,
      dimensiP3: item.dimensiP3Default,
    });
    setActiveTab('generator');
    showToast(`Materi "${item.materiPokok}" & CP/ATP terpilih siap disusun.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-200">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeneratedModul={!!currentModul}
        onQuickDownloadPdf={handleQuickDownloadPdf}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        driveSyncCount={driveSyncCount}
        activeTeacher={activeTeacher}
        schoolName={schoolProfile.namaSekolah}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: GENERATOR MODUL */}
        {activeTab === 'generator' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Quick Hero Indicator */}
            <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl text-white p-6 sm:p-8 shadow-md">
              <div className="max-w-3xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                    SMP Fase D (Kelas 7, 8, 9)
                  </span>
                  <span className="flex items-center gap-1 text-xs text-blue-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Keputusan Kepala BSKAP 032/H/KR/2024</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Penyusun Modul Ajar Otomatis Berbasis CP & ATP Terbaru
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                  Cukup masukkan <strong>Tujuan Pembelajaran (TP)</strong> yang Anda inginkan. Sistem otomatis menyusun Modul Ajar lengkap berdiferensiasi, LKPD interaktif, rubrik asesmen, dan dokumen PDF resmi yang dapat langsung disinkronkan ke Google Drive.
                </p>
              </div>
            </div>

            {/* Form Generator */}
            <ModulGeneratorForm
              onGenerate={handleGenerateModul}
              isLoading={isLoading}
              prefillData={prefillData}
              activeTeacher={activeTeacher}
              schoolProfile={schoolProfile}
              onOpenAdminPanel={() => setActiveTab('admin')}
            />

            {/* Document Viewer */}
            <div id="section-modul-viewer">
              <ModulViewer
                modul={currentModul}
                onSyncDrive={handleSyncDrive}
                isSyncingDrive={isSyncingDrive}
              />
            </div>
          </motion.div>
        )}

        {/* TAB 2: BANK CP & ATP TERBARU */}
        {activeTab === 'cp-atp' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CpAtpExplorer onSelectTpForGenerator={handleSelectTpFromExplorer} />
          </motion.div>
        )}

        {/* TAB 3: BUKU NILAI & ASESMEN SISWA OTOMATIS */}
        {activeTab === 'assessment' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AssessmentManager
              currentModul={currentModul}
              onNavigateToStudentDb={() => setActiveTab('admin')}
              showToast={showToast}
            />
          </motion.div>
        )}

        {/* TAB 4: GOOGLE DRIVE & ARSIP */}
        {activeTab === 'drive' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                      Cloud Vault Synchronization
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-sky-600" />
                    <span>Penyimpanan Dokumen & Sinkronisasi Google Drive</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Cadangkan semua modul ajar, dokumen LKPD, dan buku nilai siswa secara otomatis ke Google Drive Anda.
                  </p>
                </div>

                <button
                  onClick={() => setIsDriveModalOpen(true)}
                  className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Sinkronkan Modul Aktif</span>
                </button>
              </div>

              {/* Connected Drive Status */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Folder Sinkronisasi
                  </span>
                  <p className="text-sm font-bold text-slate-800">Modul Ajar Kurikulum Merdeka</p>
                  <p className="text-[11px] text-slate-400 mt-1">Akun Google / Belajar.id</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Status Cadangan
                  </span>
                  <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Aktif & Otomatis</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Tersinkron dengan format PDF resmi</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Total Berkas Tersimpan
                  </span>
                  <p className="text-sm font-bold text-slate-800">{driveSyncCount} Dokumen PDF</p>
                  <p className="text-[11px] text-slate-400 mt-1">Siap dibagikan ke siswa/kepsek</p>
                </div>
              </div>
            </div>

            {/* List of Archived Files */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Berkas Modul Ajar Tersimpan di Google Drive:
              </h3>
              
              {driveSyncCount === 0 ? (
                <div className="p-8 text-center text-xs sm:text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Belum ada dokumen yang disinkronkan ke Google Drive. Buka Generator Modul lalu klik "Sinkronkan ke Google Drive" atau tombol di atas.
                </div>
              ) : (
                <div className="space-y-3">
                  {getSavedDriveHistory().map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.docTitle}</h4>
                          <p className="text-xs text-slate-500">
                            Disinkronkan: {item.syncedAt} • Ukuran: {item.fileSize} • Folder: {item.driveFolder}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleQuickDownloadPdf}
                          className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Unduh PDF</span>
                        </button>
                        <a
                          href={item.webLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <Cloud className="w-3.5 h-3.5" />
                          <span>Lihat di Drive</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5: PANEL ADMIN & MANAJEMEN SATUAN PENDIDIKAN */}
        {activeTab === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AdminPanel
              schoolProfile={schoolProfile}
              onUpdateSchoolProfile={handleUpdateSchoolProfile}
              teachers={teachers}
              activeTeacher={activeTeacher}
              onSwitchTeacher={handleSwitchTeacher}
              onUpdateTeachers={handleUpdateTeachers}
              supervisionLogs={supervisionLogs}
              onAddSupervisionLog={handleAddSupervisionLog}
              curriculumConfig={curriculumConfig}
              onUpdateCurriculumConfig={handleUpdateCurriculumConfig}
              onNavigateToGenerator={() => setActiveTab('generator')}
              onNavigateToAssessment={() => setActiveTab('assessment')}
              showToast={showToast}
            />
          </motion.div>
        )}
      </main>

      {/* Google Drive Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        currentModul={currentModul}
        onSyncComplete={() => {
          setDriveSyncCount(getSavedDriveHistory().length);
          setCurrentModul({ ...currentModul, isSyncedToDrive: true });
        }}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            GuruMerdeka SMP — Aplikasi Modul Ajar & Penilaian Terintegrasi Kurikulum Merdeka
          </p>
          <p>
            Dirancang untuk Guru SMP se-Indonesia berdasarkan Keputusan Kepala BSKAP Nomor 032/H/KR/2024 tentang Capaian Pembelajaran.
          </p>
        </div>
      </footer>
    </div>
  );
}
