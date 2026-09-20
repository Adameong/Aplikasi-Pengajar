import React, { useState } from 'react';
import { Download, Cloud, Printer, Copy, Check, FileCheck, BookOpen, Layers, Award, FileText } from 'lucide-react';
import { ModulAjarData } from '../types';
import { downloadModulAjarPDF } from '../utils/pdfGenerator';

interface ModulViewerProps {
  modul: ModulAjarData;
  onSyncDrive: (modul: ModulAjarData) => Promise<void>;
  isSyncingDrive: boolean;
}

export const ModulViewer: React.FC<ModulViewerProps> = ({
  modul,
  onSyncDrive,
  isSyncingDrive,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'lengkap' | 'lkpd' | 'asesmen'>('lengkap');
  const [copied, setCopied] = useState(false);

  const handleDownloadPdf = () => {
    downloadModulAjarPDF(modul);
  };

  const handleCopyText = async () => {
    const textContent = `
MODUL AJAR KURIKULUM MERDEKA (FASE D SMP)
Mata Pelajaran: ${modul.identitas.mataPelajaran}
Kelas / Fase: ${modul.identitas.kelas} / ${modul.identitas.fase}
Alokasi Waktu: ${modul.identitas.alokasiWaktu}
Penyusun: ${modul.identitas.namaPenyusun} (${modul.identitas.namaSekolah})

TUJUAN PEMBELAJARAN:
${modul.tujuanPembelajaran.map((tp, i) => `${i + 1}. ${tp}`).join('\n')}

PEMAHAMAN BERMAKNA:
${modul.pemahamanBermakna}

PERTANYAAN PEMANTIK:
${modul.pertanyaanPemantik.map((q) => `- ${q}`).join('\n')}

KEGIATAN PEMBELAJARAN (${modul.modelPembelajaran}):
1. Pendahuluan (${modul.kegiatanPembelajaran.pendahuluan.durasi})
${modul.kegiatanPembelajaran.pendahuluan.kegiatan.map((k) => `- ${k}`).join('\n')}

2. Kegiatan Inti (${modul.kegiatanPembelajaran.inti.durasi})
${modul.kegiatanPembelajaran.inti.sintaks
  .map(
    (s) =>
      `[${s.faseSintaks}]\nGuru: ${s.kegiatanGuru}\nSiswa: ${s.kegiatanSiswa}${s.diferensiasi ? '\nDiferensiasi: ' + s.diferensiasi : ''}`
  )
  .join('\n\n')}

3. Penutup (${modul.kegiatanPembelajaran.penutup.durasi})
${modul.kegiatanPembelajaran.penutup.kegiatan.map((k) => `- ${k}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Toolbar */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Dokumen Terverifikasi BSKAP 2024
            </span>
            {modul.isSyncedToDrive && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Google Drive Tersinkron</span>
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {modul.judul}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            {modul.identitas.namaSekolah} • {modul.identitas.namaPenyusun} • {modul.identitas.alokasiWaktu}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download PDF */}
          <button
            id="btn-download-pdf-viewer"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF Lengkap</span>
          </button>

          {/* Sync to Google Drive */}
          <button
            id="btn-sync-drive-viewer"
            onClick={() => onSyncDrive(modul)}
            disabled={isSyncingDrive}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Cloud className="w-4 h-4" />
            <span>{isSyncingDrive ? 'Menyinkronkan...' : 'Sinkron ke Drive'}</span>
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Viewer Navigation Sub-tabs */}
      <div className="bg-slate-100/70 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2">
        <button
          onClick={() => setActiveSubTab('lengkap')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'lengkap'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Modul Ajar Lengkap</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lkpd')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'lkpd'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Lembar Kerja Siswa (LKPD)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('asesmen')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'asesmen'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rubrik & Kisi-kisi Asesmen</span>
        </button>
      </div>

      {/* Main Document Content Container */}
      <div className="p-5 sm:p-8 max-w-4xl mx-auto space-y-8 print:p-0">
        
        {/* SUBTAB 1: DOKUMEN LENGKAP */}
        {activeSubTab === 'lengkap' && (
          <div className="space-y-8 font-serif leading-relaxed text-slate-900">
            
            {/* Kop Resmi Surat */}
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <p className="text-xs font-sans font-bold text-slate-600 tracking-wider">
                PEMERINTAH DAERAH DINAS PENDIDIKAN DAN KEBUDAYAAN
              </p>
              <h1 className="text-lg sm:text-xl font-bold font-sans uppercase tracking-tight text-slate-900">
                {modul.identitas.namaSekolah}
              </h1>
              <p className="text-xs font-sans text-slate-500">
                Alamat: Jl. Pendidikan No. 21 | Web/Email: smp.merdeka@belajar.id | Akreditasi: A (Unggul)
              </p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-bold font-sans uppercase tracking-wide text-slate-900">
                MODUL AJAR KURIKULUM MERDEKA
              </h2>
              <p className="text-xs sm:text-sm font-sans font-semibold text-blue-700">
                FASE D ({modul.identitas.kelas.toUpperCase()}) - {modul.identitas.mataPelajaran.toUpperCase()}
              </p>
            </div>

            {/* A. IDENTITAS UMUM */}
            <section className="space-y-3">
              <div className="bg-slate-100 px-3 py-1.5 font-sans font-bold text-xs uppercase tracking-wider text-slate-800 rounded">
                A. IDENTITAS UMUM
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6 text-xs sm:text-sm font-sans">
                <div><span className="font-semibold text-slate-700">Nama Penyusun:</span> {modul.identitas.namaPenyusun}</div>
                <div><span className="font-semibold text-slate-700">Fase / Kelas:</span> {modul.identitas.fase} / {modul.identitas.kelas}</div>
                <div><span className="font-semibold text-slate-700">Satuan Pendidikan:</span> {modul.identitas.namaSekolah}</div>
                <div><span className="font-semibold text-slate-700">Mata Pelajaran:</span> {modul.identitas.mataPelajaran}</div>
                <div><span className="font-semibold text-slate-700">Tahun Pelajaran:</span> {modul.identitas.tahunPelajaran}</div>
                <div><span className="font-semibold text-slate-700">Alokasi Waktu:</span> {modul.identitas.alokasiWaktu}</div>
                <div><span className="font-semibold text-slate-700">Elemen CP:</span> {modul.identitas.elemen}</div>
                <div><span className="font-semibold text-slate-700">Model Pembelajaran:</span> {modul.modelPembelajaran}</div>
              </div>

              {/* Profil Pelajar Pancasila */}
              <div className="mt-3 font-sans text-xs sm:text-sm space-y-1">
                <p className="font-semibold text-slate-800">Profil Pelajar Pancasila yang Dikembangkan:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {modul.profilPelajarPancasila.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Sarana & Prasarana */}
              <div className="mt-3 font-sans text-xs sm:text-sm space-y-1">
                <p className="font-semibold text-slate-800">Sarana dan Prasarana:</p>
                <p className="text-slate-700"><strong className="text-slate-800">Media:</strong> {modul.saranaPrasarana.media.join(', ')}</p>
                <p className="text-slate-700"><strong className="text-slate-800">Alat/Bahan:</strong> {modul.saranaPrasarana.alatDanBahan.join(', ')}</p>
              </div>
            </section>

            {/* B. KOMPONEN INTI */}
            <section className="space-y-4">
              <div className="bg-slate-100 px-3 py-1.5 font-sans font-bold text-xs uppercase tracking-wider text-slate-800 rounded">
                B. KOMPONEN INTI
              </div>

              {/* Capaian Pembelajaran */}
              <div className="space-y-1 font-sans text-xs sm:text-sm">
                <p className="font-semibold text-slate-800">1. Capaian Pembelajaran (CP) & Alur Tujuan Pembelajaran (ATP):</p>
                <div className="p-3 bg-slate-50 border-l-2 border-blue-600 rounded text-slate-700 space-y-2">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs mb-0.5">Capaian Pembelajaran (CP BSKAP No. 032/H/KR/2024):</span>
                    <p className="italic leading-relaxed">"{modul.capaianPembelajaran}"</p>
                  </div>
                  {modul.alurTujuanPembelajaran && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="font-bold text-slate-900 block text-xs mb-0.5">Alur Tujuan Pembelajaran (ATP):</span>
                      <p className="text-slate-800 leading-relaxed">{modul.alurTujuanPembelajaran}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tujuan Pembelajaran */}
              <div className="space-y-1 font-sans text-xs sm:text-sm">
                <p className="font-semibold text-slate-800">2. Tujuan Pembelajaran (TP):</p>
                <ul className="list-decimal list-inside space-y-1 text-slate-800 font-medium">
                  {modul.tujuanPembelajaran.map((tp, idx) => (
                    <li key={idx} className="bg-blue-50/50 p-2 rounded border border-blue-100">
                      {tp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pemahaman Bermakna & Pertanyaan Pemantik */}
              <div className="space-y-2 font-sans text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-slate-800">3. Pemahaman Bermakna:</p>
                  <p className="text-slate-700">{modul.pemahamanBermakna}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">4. Pertanyaan Pemantik:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {modul.pertanyaanPemantik.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Kegiatan Pembelajaran Berdiferensiasi */}
              <div className="space-y-2 font-sans text-xs sm:text-sm">
                <p className="font-semibold text-slate-800">
                  5. Kegiatan Pembelajaran Berdiferensiasi (Model: {modul.modelPembelajaran}):
                </p>

                {/* Pendahuluan */}
                <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800 text-xs uppercase bg-slate-50 p-1.5 rounded">
                    <span>Kegiatan Pendahuluan</span>
                    <span>{modul.kegiatanPembelajaran.pendahuluan.durasi}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {modul.kegiatanPembelajaran.pendahuluan.kegiatan.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>

                {/* Kegiatan Inti (Sintaks Model) */}
                <div className="border border-slate-200 rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-800 text-xs uppercase bg-slate-50 p-1.5 rounded">
                    <span>Kegiatan Inti ({modul.modelPembelajaran})</span>
                    <span>{modul.kegiatanPembelajaran.inti.durasi}</span>
                  </div>
                  <div className="space-y-3">
                    {modul.kegiatanPembelajaran.inti.sintaks.map((s, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-1">
                        <p className="font-bold text-blue-800 text-xs">{s.faseSintaks}</p>
                        <p className="text-slate-700">
                          <strong className="text-slate-800">Aktivitas Guru:</strong> {s.kegiatanGuru}
                        </p>
                        <p className="text-slate-700">
                          <strong className="text-slate-800">Aktivitas Peserta Didik:</strong> {s.kegiatanSiswa}
                        </p>
                        {s.diferensiasi && (
                          <p className="text-emerald-700 text-xs italic bg-emerald-50/80 p-1 rounded">
                            🌱 {s.diferensiasi}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Penutup */}
                <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800 text-xs uppercase bg-slate-50 p-1.5 rounded">
                    <span>Kegiatan Penutup</span>
                    <span>{modul.kegiatanPembelajaran.penutup.durasi}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {modul.kegiatanPembelajaran.penutup.kegiatan.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* C. ASESMEN SINGKAT */}
            <section className="space-y-3">
              <div className="bg-slate-100 px-3 py-1.5 font-sans font-bold text-xs uppercase tracking-wider text-slate-800 rounded">
                C. ASESMEN PEMBELAJARAN
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs sm:text-sm">
                <div className="p-3 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">1. Asesmen Diagnostik</p>
                  <p className="text-slate-600 text-xs">Awal pembelajaran: Menilai kesiapan belajar kognitif & non-kognitif.</p>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">2. Asesmen Formatif</p>
                  <p className="text-slate-600 text-xs">{modul.asesmen.formatif.teknik}</p>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">3. Asesmen Sumatif</p>
                  <p className="text-slate-600 text-xs">{modul.asesmen.sumatif.teknik}</p>
                </div>
              </div>
            </section>

            {/* Pengesahan Tanda Tangan */}
            <div className="pt-6 font-sans text-xs sm:text-sm grid grid-cols-2 gap-8 text-center">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala {modul.identitas.namaSekolah}</p>
                <div className="h-16" />
                <p className="font-bold underline">{modul.identitas.namaKepsek}</p>
                <p className="text-slate-500">NIP. {modul.identitas.nipKepsek}</p>
              </div>

              <div>
                <p>Guru Mata Pelajaran,</p>
                <p className="font-semibold">{modul.identitas.mataPelajaran}</p>
                <div className="h-16" />
                <p className="font-bold underline">{modul.identitas.namaPenyusun}</p>
                <p className="text-slate-500">NIP. {modul.identitas.nipPenyusun}</p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: LKPD */}
        {activeSubTab === 'lkpd' && (
          <div className="space-y-6 font-sans">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-1">
                {modul.lkpd.judul}
              </h3>
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Tujuan Aktivitas:</strong> {modul.lkpd.tujuan}
              </p>
            </div>

            {/* Format Isian Siswa */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div><span className="text-slate-500">Kelompok:</span> ....................</div>
              <div><span className="text-slate-500">Kelas:</span> {modul.identitas.kelas}</div>
              <div><span className="text-slate-500">Waktu:</span> 30 Menit</div>
              <div><span className="text-slate-500">Nilai:</span> [   / 100 ]</div>
            </div>

            {/* Langkah Kerja */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Petunjuk & Langkah Kerja Penyelidikan:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 bg-white p-4 border border-slate-200 rounded-xl">
                {modul.lkpd.langkahKerja.map((langkah, i) => (
                  <li key={i} className="leading-relaxed">{langkah}</li>
                ))}
              </ol>
            </div>

            {/* Tugas Aktivitas */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Tugas Analisis dan Eksplorasi Kelompok:</h4>
              <div className="space-y-2.5">
                {modul.lkpd.tugasAktivitas.map((tugas, idx) => (
                  <div key={idx} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm">{tugas}</p>
                    <div className="mt-2 h-16 border border-dashed border-slate-300 rounded bg-white p-2 text-slate-400 text-xs italic">
                      [Tuliskan hasil diskusi atau sajikan diagram/jawaban di sini...]
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kesimpulan Panduan */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h5 className="font-bold text-emerald-900 text-xs uppercase mb-1">Panduan Kesimpulan Konsep:</h5>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                {modul.lkpd.kesimpulanPanduan}
              </p>
            </div>
          </div>
        )}

        {/* SUBTAB 3: ASESMEN & RUBRIK */}
        {activeSubTab === 'asesmen' && (
          <div className="space-y-6 font-sans">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                1. Rubrik Penilaian Formatif (Kinerja & Ketercapaian TP)
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Digunakan selama proses penyelidikan kelompok dan pengerjaan LKPD.
              </p>

              {/* Table Rubrik */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-semibold">Aspek Dinilai</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Sangat Baik (4)</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Baik (3)</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Cukup (2)</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Perlu Bimbingan (1)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {modul.asesmen.formatif.rubrik.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-bold text-slate-800 whitespace-nowrap">{r.aspek}</td>
                        <td className="px-3 py-2.5 text-slate-700 bg-emerald-50/30">{r.skor4}</td>
                        <td className="px-3 py-2.5 text-slate-700 bg-blue-50/30">{r.skor3}</td>
                        <td className="px-3 py-2.5 text-slate-700 bg-amber-50/30">{r.skor2}</td>
                        <td className="px-3 py-2.5 text-slate-700 bg-rose-50/30">{r.skor1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Soal Evaluasi Sumatif */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                2. Kisi-kisi dan Butir Soal Asesmen Sumatif (Ketercapaian TP)
              </h3>
              <p className="text-xs text-slate-500">
                Kisi-kisi: {modul.asesmen.sumatif.kisiKisi}
              </p>

              <div className="space-y-4">
                {modul.asesmen.sumatif.soal.map((soal) => (
                  <div key={soal.nomor} className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">
                        Soal No. {soal.nomor}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                        Level {soal.levelKognitif}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {soal.pertanyaan}
                    </p>

                    {soal.opsi && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                        {soal.opsi.map((opsi, i) => (
                          <div key={i} className="text-xs text-slate-700">
                            {opsi}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex flex-col sm:flex-row gap-1 sm:gap-4 text-emerald-800 bg-emerald-50/60 p-2 rounded">
                      <span><strong>Kunci Jawaban:</strong> {soal.kunciJawaban}</span>
                      <span><strong>Pembahasan:</strong> {soal.pembahasan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
