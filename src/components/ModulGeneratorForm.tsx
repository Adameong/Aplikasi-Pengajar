import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Settings2,
  BookOpen,
  Clock,
  School,
  User,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Wand2,
  UserCheck,
  Building,
  Layers,
  FileCheck,
  ListOrdered,
  HelpCircle,
  Tag,
  Compass,
  ArrowRight,
  Sparkle,
} from 'lucide-react';
import {
  FaseDClass,
  SubjectId,
  TeacherUser,
  SchoolProfile,
  GenerateModulPayload,
  CpAtpItem,
} from '../types';
import {
  SUBJECTS_LIST,
  CP_ATP_DATABASE,
  MODEL_PEMBELAJARAN_LIST,
  PROFIL_PELAJAR_PANCASILA_LIST,
  DIFERENSIASI_OPTIONS,
  METODE_SPESIFIK_LIST,
} from '../data/cpAtpDatabase';

interface ModulGeneratorFormProps {
  onGenerate: (formData: GenerateModulPayload) => Promise<void>;
  isLoading: boolean;
  prefillData?: {
    subjectId: SubjectId;
    kelas: FaseDClass;
    tp: string;
    materiPokok: string;
    subMateri?: string;
    elemen: string;
    capaianPembelajaran?: string;
    alurTujuanPembelajaran?: string;
    dimensiP3?: string[];
  } | null;
  activeTeacher?: TeacherUser;
  schoolProfile?: SchoolProfile;
  onOpenAdminPanel?: () => void;
}

export const ModulGeneratorForm: React.FC<ModulGeneratorFormProps> = ({
  onGenerate,
  isLoading,
  prefillData,
  activeTeacher,
  schoolProfile,
  onOpenAdminPanel,
}) => {
  // Primary Form State
  const [subjectId, setSubjectId] = useState<SubjectId>(
    prefillData?.subjectId || activeTeacher?.subjectId || 'ipa'
  );
  const [kelas, setKelas] = useState<FaseDClass>(
    prefillData?.kelas || activeTeacher?.kelasList[0] || 'Kelas VII'
  );
  const [semester, setSemester] = useState<'Semua' | 'Semester 1 (Ganjil)' | 'Semester 2 (Genap)'>('Semua');

  // Selected CP/ATP Item from Database
  const [selectedCpAtpId, setSelectedCpAtpId] = useState<string>('');
  
  // Specific Curriculum & Material Fields
  const [materiPokok, setMateriPokok] = useState(prefillData?.materiPokok || 'Suhu, Kalor, dan Perpindahannya');
  const [subMateri, setSubMateri] = useState<string>(prefillData?.subMateri || 'Perpindahan Kalor: Konduksi pada Benda Padat');
  const [elemen, setElemen] = useState(prefillData?.elemen || 'Pemahaman IPA');
  const [capaianPembelajaran, setCapaianPembelajaran] = useState(
    prefillData?.capaianPembelajaran ||
      'Peserta didik memahami konsep suhu, kalor, perpindahan kalor serta penerapannya dalam kehidupan sehari-hari, termasuk mekanisme termoregulasi makhluk hidup.'
  );
  const [activeAtpStep, setActiveAtpStep] = useState<string>(prefillData?.alurTujuanPembelajaran || '');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState(
    prefillData?.tp ||
      'Peserta didik dapat menganalisis mekanisme perpindahan kalor secara konduksi, konveksi, dan radiasi melalui penyelidikan terpandu berbasis masalah kontekstual.'
  );

  // Pedagogical & Differentiation Options
  const [dimensiP3, setDimensiP3] = useState<string[]>(
    prefillData?.dimensiP3 || ['Bernalar Kritis', 'Bergotong Royong', 'Mandiri']
  );
  const [fokusDiferensiasi, setFokusDiferensiasi] = useState<string>(
    'Berdiferensiasi Seimbang (Konten, Proses, dan Produk)'
  );
  const [metodeSpesifik, setMetodeSpesifik] = useState<string>(
    'Penyelidikan Terpandu & Praktikum Laboratorium'
  );
  const [modelPembelajaran, setModelPembelajaran] = useState<string>(
    'Problem-Based Learning (PBL) - Pembelajaran Berbasis Masalah'
  );
  const [alokasiWaktu, setAlokasiWaktu] = useState('2 x 40 Menit (1 Pertemuan)');

  // Identity State
  const [namaGuru, setNamaGuru] = useState(activeTeacher?.nama || 'Rahmat Hidayat, S.Pd.');
  const [namaSekolah, setNamaSekolah] = useState(
    schoolProfile?.namaSekolah || 'SMP Negeri 1 Merdeka Belajar'
  );

  // UI accordion toggles
  const [showCpDetail, setShowCpDetail] = useState(false);
  const [showPedagogySettings, setShowPedagogySettings] = useState(true);
  const [showAdvancedIdentity, setShowAdvancedIdentity] = useState(false);

  // Sync active teacher
  useEffect(() => {
    if (activeTeacher) {
      setNamaGuru(activeTeacher.nama);
      if (!prefillData) {
        setSubjectId(activeTeacher.subjectId);
        if (activeTeacher.kelasList.length > 0) {
          setKelas(activeTeacher.kelasList[0]);
        }
      }
    }
  }, [activeTeacher]);

  // Sync school profile
  useEffect(() => {
    if (schoolProfile) {
      setNamaSekolah(schoolProfile.namaSekolah);
    }
  }, [schoolProfile]);

  // Sync prefillData when provided
  useEffect(() => {
    if (prefillData) {
      setSubjectId(prefillData.subjectId);
      setKelas(prefillData.kelas);
      setTujuanPembelajaran(prefillData.tp);
      setMateriPokok(prefillData.materiPokok);
      if (prefillData.subMateri) setSubMateri(prefillData.subMateri);
      setElemen(prefillData.elemen);
      if (prefillData.capaianPembelajaran) setCapaianPembelajaran(prefillData.capaianPembelajaran);
      if (prefillData.alurTujuanPembelajaran) setActiveAtpStep(prefillData.alurTujuanPembelajaran);
      if (prefillData.dimensiP3) setDimensiP3(prefillData.dimensiP3);
    }
  }, [prefillData]);

  // Filter available CP/ATP records for chosen Subject & Kelas
  const availableCpAtpItems = CP_ATP_DATABASE.filter((item) => {
    if (item.subjectId !== subjectId) return false;
    if (item.kelas !== kelas) return false;
    if (semester !== 'Semua' && item.semester && item.semester !== semester) return false;
    return true;
  });

  // Automatically select the first item when subject or class changes if current item not in filtered list
  useEffect(() => {
    if (availableCpAtpItems.length > 0) {
      const match = availableCpAtpItems.find((i) => i.id === selectedCpAtpId);
      if (!match) {
        applyCpAtpItem(availableCpAtpItems[0]);
      }
    } else {
      setSelectedCpAtpId('');
    }
  }, [subjectId, kelas, semester]);

  // Apply a selected CP/ATP item into form fields
  const applyCpAtpItem = (item: CpAtpItem) => {
    setSelectedCpAtpId(item.id);
    setMateriPokok(item.materiPokok);
    setElemen(item.elemen);
    setCapaianPembelajaran(item.capaianPembelajaran);
    setAlokasiWaktu(item.alokasiWaktuDefault);

    // Default sub-materi
    if (item.subMateriList && item.subMateriList.length > 0) {
      setSubMateri(item.subMateriList[0]);
    } else {
      setSubMateri('');
    }

    // Default TP & ATP
    if (item.alurTujuanPembelajaran && item.alurTujuanPembelajaran.length > 0) {
      setActiveAtpStep(item.alurTujuanPembelajaran[0]);
    }
    setTujuanPembelajaran(item.tujuanPembelajaranDefault);

    // Dimensi P3
    if (item.dimensiP3Default && item.dimensiP3Default.length > 0) {
      setDimensiP3(item.dimensiP3Default);
    }
  };

  // When subject changes from dropdown
  const handleSubjectChange = (newSubjectId: SubjectId) => {
    setSubjectId(newSubjectId);
    const matchedSubject = SUBJECTS_LIST.find((s) => s.id === newSubjectId);
    if (matchedSubject && matchedSubject.elements.length > 0) {
      setElemen(matchedSubject.elements[0]);
    }
  };

  // Toggle Dimensi P3
  const handleToggleP3 = (dimension: string) => {
    if (dimensiP3.includes(dimension)) {
      if (dimensiP3.length > 1) {
        setDimensiP3(dimensiP3.filter((d) => d !== dimension));
      }
    } else {
      setDimensiP3([...dimensiP3, dimension]);
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tujuanPembelajaran.trim()) return;

    const currentSubject = SUBJECTS_LIST.find((s) => s.id === subjectId);

    await onGenerate({
      subjectName: currentSubject?.name || 'Mata Pelajaran SMP',
      kelas,
      tp: tujuanPembelajaran,
      materiPokok,
      subMateri: subMateri.trim() || undefined,
      elemen,
      capaianPembelajaran,
      alurTujuanPembelajaran: activeAtpStep || undefined,
      dimensiP3,
      fokusDiferensiasi,
      metodeSpesifik,
      modelPembelajaran,
      namaGuru,
      namaSekolah,
      alokasiWaktu,
    });
  };

  // Current active CP/ATP item
  const currentItem = CP_ATP_DATABASE.find((i) => i.id === selectedCpAtpId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            <span>Penyusun Modul Ajar Otomatis Berbasis CP & ATP</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pilih materi pokok, sub-materi, dan rumusan ATP resmi (BSKAP 032/H/KR/2024) untuk menyusun Modul Ajar spesifik, berdiferensiasi, dan siap cetak PDF.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fase D BSKAP Terverifikasi</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-6">
        {/* Active Profile Info Banner */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-700 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Guru Pengampu: {namaGuru}</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>{namaSekolah}</span>
            </div>
          </div>

          {onOpenAdminPanel && (
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline self-start sm:self-auto flex items-center gap-1 cursor-pointer"
            >
              <span>Ubah Profil Sekolah & Switch Guru</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* SECTION 1: FILTER TINGKAT (MAPEL, KELAS, SEMESTER) */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>1. Identifikasi Kurikulum: Mata Pelajaran & Kelas</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Jenjang SMP (Fase D)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Mata Pelajaran */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Mata Pelajaran (Fase D)</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                {SUBJECTS_LIST.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenjang Kelas */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Tingkat Kelas (Fase D)
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['Kelas VII', 'Kelas VIII', 'Kelas IX'] as FaseDClass[]).map((kls) => (
                  <button
                    key={kls}
                    type="button"
                    onClick={() => setKelas(kls)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      kelas === kls
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {kls.replace('Kelas ', 'Kls ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Semester Pembelajaran
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="Semua">Semua Semester (Ganjil & Genap)</option>
                <option value="Semester 1 (Ganjil)">Semester 1 (Ganjil)</option>
                <option value="Semester 2 (Genap)">Semester 2 (Genap)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PILIHAN MATERI POKOK & SUB-MATERI SPESIFIK */}
        <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/30 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>2. Kelengkapan Pilihan Materi Pokok & Sub-Materi</span>
            </label>
            <span className="text-[11px] text-blue-700 font-medium">
              Tersedia {availableCpAtpItems.length} Bab Terstruktur
            </span>
          </div>

          {/* Quick Chapter Selector from Database */}
          {availableCpAtpItems.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Pilih Bab / Materi Pokok Resmi Kemendikbudristek:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableCpAtpItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyCpAtpItem(item)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      selectedCpAtpId === item.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            selectedCpAtpId === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.elemen}
                        </span>
                        {item.semester && (
                          <span
                            className={`text-[10px] ${
                              selectedCpAtpId === item.id ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {item.semester.includes('1') ? 'Sem 1' : 'Sem 2'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug">
                        {item.materiPokok}
                      </div>
                    </div>
                    {item.subMateriList && (
                      <span
                        className={`text-[11px] ${
                          selectedCpAtpId === item.id ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {item.subMateriList.length} Pilihan Sub-Topik
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Materi Pokok & Sub-Materi Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
                <span>Materi Pokok / Bab Pembelajaran</span>
                <span className="text-[11px] text-slate-400 font-normal">Dapat disesuaikan</span>
              </label>
              <input
                type="text"
                value={materiPokok}
                onChange={(e) => setMateriPokok(e.target.value)}
                placeholder="Contoh: Suhu, Kalor, dan Perpindahannya"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
                <span>Sub-Materi / Topik Pembelajaran Spesifik</span>
                <span className="text-[11px] text-blue-600 font-medium">Opsional tetapi dianjurkan</span>
              </label>
              <input
                type="text"
                value={subMateri}
                onChange={(e) => setSubMateri(e.target.value)}
                placeholder="Contoh: Perpindahan Kalor Konduksi pada Zat Padat"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          {/* Sub-Materi Chips Selector if available */}
          {currentItem && currentItem.subMateriList && currentItem.subMateriList.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Klik Sub-Materi untuk Memilih Fokus Topik Pembelajaran:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentItem.subMateriList.map((sub, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSubMateri(sub);
                    }}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      subMateri === sub
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: KELENGKAPAN CP & PILIHAN ATP RESMI */}
        <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>3. Kelengkapan Capaian Pembelajaran (CP) & Pilihan ATP</span>
            </label>
            <span className="text-[11px] text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              BSKAP 032/H/KR/2024
            </span>
          </div>

          {/* Capaian Pembelajaran (CP) Card with toggle */}
          <div className="bg-white rounded-xl border border-emerald-200/90 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>Capaian Pembelajaran (CP) Elemen: </span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {elemen}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCpDetail(!showCpDetail)}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showCpDetail ? 'Sembunyikan Teks CP' : 'Lihat / Edit Teks CP'}</span>
                {showCpDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{capaianPembelajaran}"
            </p>

            {showCpDetail && (
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Edit Rumusan Teks CP (Opsional):
                </label>
                <textarea
                  value={capaianPembelajaran}
                  onChange={(e) => setCapaianPembelajaran(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Pilihan Butir Alur Tujuan Pembelajaran (ATP) */}
          {currentItem && currentItem.alurTujuanPembelajaran && currentItem.alurTujuanPembelajaran.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilih Butir Alur Tujuan Pembelajaran (ATP) untuk Dimuat ke TP:</span>
                </label>
                <span className="text-[11px] text-slate-400">Klik butir untuk memuat</span>
              </div>

              <div className="space-y-1.5">
                {currentItem.alurTujuanPembelajaran.map((atp, idx) => {
                  const isSelected = activeAtpStep === atp || tujuanPembelajaran.includes(atp.slice(4, 25));
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveAtpStep(atp);
                        // Clean ATP number for TP statement if appropriate
                        const cleanTpText = atp.replace(/^\d+\.\d+\s*/, '');
                        setTujuanPembelajaran(
                          `Peserta didik dapat ${cleanTpText.charAt(0).toLowerCase() + cleanTpText.slice(1)}`
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-medium shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{atp}</span>
                      </div>
                      <button
                        type="button"
                        className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                      >
                        {isSelected ? 'ATP Aktif' : 'Pilih ATP Ini'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: TUJUAN PEMBELAJARAN (TP) OPERASIONAL UTAMA */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="input-tp" className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Tujuan Pembelajaran (TP) Operasional</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400 font-medium">Format ABCD (Audience, Behavior, Condition, Degree)</span>
          </div>
          <div className="relative">
            <textarea
              id="input-tp"
              value={tujuanPembelajaran}
              onChange={(e) => setTujuanPembelajaran(e.target.value)}
              rows={3}
              required
              placeholder="Contoh: Peserta didik dapat menganalisis perbedaan struktur sel hewan dan tumbuhan serta fungsi organel-organel utamanya melalui penyelidikan terpandu..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 bg-white placeholder:text-slate-400 leading-relaxed outline-none transition-all resize-y shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Keterangan: Rumusan TP akan menjadi pedoman utama AI dalam menyusun skenario pembelajaran inti, rubrik asesmen, dan LKPD siswa.
          </p>
        </div>

        {/* SECTION 5: KELENGKAPAN PEDAGOGI, DIFERENSIASI & PROFIL PELAJAR PANCASILA */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPedagogySettings(!showPedagogySettings)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-blue-600" />
              <span>4. Kelengkapan Diferensiasi, Metode & Profil Pelajar Pancasila (P3)</span>
            </div>
            {showPedagogySettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPedagogySettings && (
            <div className="p-4 space-y-4 bg-white">
              {/* Dimensi Profil Pelajar Pancasila */}
              <div>
                <label className="text-xs font-semibold text-slate-800 mb-1.5 block">
                  Dimensi Profil Pelajar Pancasila (Pilih 2-3 Dimensi Relevan):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROFIL_PELAJAR_PANCASILA_LIST.map((p3) => {
                    const isChecked = dimensiP3.includes(p3);
                    return (
                      <button
                        key={p3}
                        type="button"
                        onClick={() => handleToggleP3(p3)}
                        className={`p-2 rounded-lg text-left text-xs border transition-all cursor-pointer flex items-center gap-2 ${
                          isChecked
                            ? 'bg-amber-50 text-amber-950 border-amber-300 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] ${
                            isChecked ? 'bg-amber-500 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isChecked && '✓'}
                        </div>
                        <span className="line-clamp-1">{p3}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid Model, Diferensiasi, Metode & Alokasi Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                {/* Model Pembelajaran */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Model Pembelajaran Sintaks Operasional
                  </label>
                  <select
                    value={modelPembelajaran}
                    onChange={(e) => setModelPembelajaran(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {MODEL_PEMBELAJARAN_LIST.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fokus Diferensiasi */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Fokus Pembelajaran Berdiferensiasi
                  </label>
                  <select
                    value={fokusDiferensiasi}
                    onChange={(e) => setFokusDiferensiasi(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {DIFERENSIASI_OPTIONS.map((d) => (
                      <option key={d.id} value={d.label}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metode Spesifik */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Metode / Teknik Spesifik Utama
                  </label>
                  <select
                    value={metodeSpesifik}
                    onChange={(e) => setMetodeSpesifik(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {METODE_SPESIFIK_LIST.map((m, idx) => (
                      <option key={idx} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alokasi Waktu */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alokasi Waktu Pembelajaran</span>
                  </label>
                  <select
                    value={alokasiWaktu}
                    onChange={(e) => setAlokasiWaktu(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="2 x 40 Menit (1 Pertemuan)">2 x 40 Menit (1 Pertemuan)</option>
                    <option value="3 x 40 Menit (1 Pertemuan)">3 x 40 Menit (1 Pertemuan)</option>
                    <option value="4 x 40 Menit (2 Pertemuan)">4 x 40 Menit (2 Pertemuan)</option>
                    <option value="5 x 40 Menit (2 Pertemuan)">5 x 40 Menit (2 Pertemuan)</option>
                    <option value="6 x 40 Menit (3 Pertemuan)">6 x 40 Menit (3 Pertemuan)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: PENGATURAN IDENTITAS PENGESAHAN (KOP & TTD) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedIdentity(!showAdvancedIdentity)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Kustomisasi Identitas Guru & Satuan Pendidikan (Untuk Cetak PDF Resmi)</span>
            {showAdvancedIdentity ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvancedIdentity && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nama Lengkap Guru Pengampu</span>
                </label>
                <input
                  type="text"
                  value={namaGuru}
                  onChange={(e) => setNamaGuru(e.target.value)}
                  placeholder="Nama beserta gelar"
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nama Satuan Pendidikan (SMP)</span>
                </label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  placeholder="Nama sekolah"
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            id="btn-generate-modul"
            type="submit"
            disabled={isLoading || !tujuanPembelajaran.trim()}
            className="flex-1 min-w-[280px] flex items-center justify-center space-x-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all text-sm sm:text-base cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyusun Modul Ajar Spesifik BSKAP...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Modul Ajar Lengkap & PDF</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
