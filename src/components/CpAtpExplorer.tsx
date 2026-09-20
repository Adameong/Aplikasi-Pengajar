import React, { useState } from 'react';
import { Database, Search, Sparkles, Filter, CheckCircle2, ChevronRight } from 'lucide-react';
import { SubjectId, FaseDClass, CpAtpItem } from '../types';
import { CP_ATP_DATABASE, SUBJECTS_LIST } from '../data/cpAtpDatabase';

interface CpAtpExplorerProps {
  onSelectTpForGenerator: (item: CpAtpItem) => void;
}

export const CpAtpExplorer: React.FC<CpAtpExplorerProps> = ({ onSelectTpForGenerator }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedKelas, setSelectedKelas] = useState<FaseDClass | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getSubjectName = (id: SubjectId) => {
    return SUBJECTS_LIST.find((s) => s.id === id)?.name || id;
  };

  const filteredItems = CP_ATP_DATABASE.filter((item) => {
    if (selectedSubject !== 'all' && item.subjectId !== selectedSubject) return false;
    if (selectedKelas !== 'all' && item.kelas !== selectedKelas) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const subjectName = getSubjectName(item.subjectId).toLowerCase();
      const matchTitle = subjectName.includes(q);
      const matchMateri = item.materiPokok.toLowerCase().includes(q);
      const matchTp = item.tujuanPembelajaranDefault.toLowerCase().includes(q);
      const matchCp = item.capaianPembelajaran.toLowerCase().includes(q);
      return matchTitle || matchMateri || matchTp || matchCp;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Keputusan Kepala BSKAP No. 032/H/KR/2024
              </span>
              <span className="text-xs text-slate-500">SMP Fase D (Kelas 7, 8, 9)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>Bank Capaian Pembelajaran (CP) & ATP Terbaru</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Koleksi CP dan Alur Tujuan Pembelajaran (ATP) resmi terverifikasi untuk seluruh mata pelajaran SMP. Klik <strong>"Gunakan di Generator"</strong> untuk menyusun modul ajar secara instan.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="pt-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, konsep, atau kata kunci TP (cth: kalor, pythagoras)..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as any)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {SUBJECTS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value as any)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="all">Semua Tingkat Kelas</option>
              <option value="Kelas VII">Kelas VII (Fase D)</option>
              <option value="Kelas VIII">Kelas VIII (Fase D)</option>
              <option value="Kelas IX">Kelas IX (Fase D)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Menampilkan <strong>{filteredItems.length}</strong> CP & ATP terpilih</span>
      </div>

      {/* List of CP/ATP Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Top Tags */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {getSubjectName(item.subjectId)}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{item.kelas}</span>
                  <span>•</span>
                  <span>{item.alokasiWaktuDefault}</span>
                </div>
              </div>

              {/* Title / Materi */}
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.materiPokok}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                  <span>Elemen CP: <strong className="text-slate-700">{item.elemen}</strong></span>
                  {item.semester && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600 font-medium">{item.semester}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Sub-Materi List Chips if available */}
              {item.subMateriList && item.subMateriList.length > 0 && (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">Pilihan Sub-Materi / Rincian Bahasan:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.subMateriList.map((sub, sIdx) => (
                      <span key={sIdx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Capaian Pembelajaran */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1">Capaian Pembelajaran (CP BSKAP 032/H/KR/2024):</span>
                "{item.capaianPembelajaran}"
              </div>

              {/* Alur Tujuan Pembelajaran (ATP) */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-800">Alur Tujuan Pembelajaran (ATP):</span>
                <div className="flex flex-wrap gap-1 items-center text-slate-600">
                  {item.alurTujuanPembelajaran.map((step, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      <span>{step}</span>
                      {idx < item.alurTujuanPembelajaran.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Profil Pelajar Pancasila default */}
              {item.dimensiP3Default && item.dimensiP3Default.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Dimensi P3:</span>
                  {item.dimensiP3Default.map((dim, dIdx) => (
                    <span key={dIdx} className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70 px-2 py-0.5 rounded-md">
                      {dim}
                    </span>
                  ))}
                </div>
              )}

              {/* Tujuan Pembelajaran Default */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 leading-relaxed">
                <span className="font-bold text-blue-900 block mb-1">Tujuan Pembelajaran (TP) Operasional:</span>
                "{item.tujuanPembelajaranDefault}"
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Format Kurikulum Merdeka
              </span>
              <button
                onClick={() => onSelectTpForGenerator(item)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gunakan di Generator</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
