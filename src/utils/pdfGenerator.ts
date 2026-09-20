import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ModulAjarData, SchoolProfile } from '../types';

export function generateModulAjarPDF(modul: ModulAjarData, schoolProfile?: SchoolProfile): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  let currentY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // --- KOP RESMI DOKUMEN SEKOLAH ---
  const dinasLines = (schoolProfile?.dinasPendidikanKop || 'PEMERINTAH DAERAH DINAS PENDIDIKAN DAN KEBUDAYAAN')
    .split('\n')
    .filter(Boolean);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  dinasLines.forEach((line) => {
    doc.text(line.trim(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
  });
  
  doc.setFontSize(13);
  doc.text((schoolProfile?.namaSekolah || modul.identitas.namaSekolah).toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const alamatText = schoolProfile
    ? `${schoolProfile.alamat} | Telp: ${schoolProfile.telepon} | Email: ${schoolProfile.email} | Akreditasi: ${schoolProfile.akreditasi}`
    : 'Alamat: Jl. Pendidikan No. 21 | Web/Email: smp.merdeka@belajar.id | Akreditasi: A (Unggul)';
  doc.text(alamatText, pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  // Double horizontal line for official Kop
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 1;
  doc.setLineWidth(0.2);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // --- JUDUL DOKUMEN ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('MODUL AJAR KURIKULUM MERDEKA', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text(`FASE D (${modul.identitas.kelas.toUpperCase()}) - ${modul.identitas.mataPelajaran.toUpperCase()}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  // --- BAGIAN A: INFORMASI UMUM ---
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('A. INFORMASI UMUM', margin + 3, currentY + 4.5);
  currentY += 8.5;

  // Tabel Identitas
  const identitasRows = [
    ['Nama Penyusun', `: ${modul.identitas.namaPenyusun}`, 'Fase / Kelas', `: ${modul.identitas.fase} / ${modul.identitas.kelas}`],
    ['Satuan Pendidikan', `: ${modul.identitas.namaSekolah}`, 'Mata Pelajaran', `: ${modul.identitas.mataPelajaran}`],
    ['Tahun Pelajaran', `: ${modul.identitas.tahunPelajaran}`, 'Alokasi Waktu', `: ${modul.identitas.alokasiWaktu}`],
    ['Elemen / Domain', `: ${modul.identitas.elemen}`, 'Model Pembelajaran', `: ${modul.modelPembelajaran}`],
    ['Pendekatan', `: ${modul.pendekatan}`, 'Target Murid', `: ${modul.targetPesertaDidik.slice(0, 45)}...`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: identitasRows,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 1.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 58 },
      2: { fontStyle: 'bold', cellWidth: 30 },
      3: { cellWidth: 54 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // Profil Pelajar Pancasila & Sarana
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Profil Pelajar Pancasila:', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  modul.profilPelajarPancasila.forEach((item) => {
    checkPageBreak(5);
    doc.text(`• ${item}`, margin + 3, currentY);
    currentY += 4;
  });
  currentY += 2;

  // --- BAGIAN B: KOMPONEN INTI ---
  checkPageBreak(12);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('B. KOMPONEN INTI', margin + 3, currentY + 4.5);
  currentY += 8.5;

  // 1. Capaian Pembelajaran & ATP
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. Capaian Pembelajaran (CP) Elemen & Alur Tujuan Pembelajaran (ATP):', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const cpSplit = doc.splitTextToSize(`CP (BSKAP 032/H/KR/2024): ${modul.capaianPembelajaran}`, pageWidth - (margin * 2) - 4);
  doc.text(cpSplit, margin + 2, currentY);
  currentY += cpSplit.length * 3.8 + 1.5;

  if (modul.alurTujuanPembelajaran) {
    const atpSplit = doc.splitTextToSize(`ATP: ${modul.alurTujuanPembelajaran}`, pageWidth - (margin * 2) - 4);
    checkPageBreak(atpSplit.length * 4);
    doc.text(atpSplit, margin + 2, currentY);
    currentY += atpSplit.length * 3.8 + 2;
  }

  // 2. Tujuan Pembelajaran (TP)
  checkPageBreak(10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. Tujuan Pembelajaran (TP):', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  modul.tujuanPembelajaran.forEach((tp, idx) => {
    const tpLines = doc.splitTextToSize(`${idx + 1}. ${tp}`, pageWidth - (margin * 2) - 4);
    checkPageBreak(tpLines.length * 4);
    doc.text(tpLines, margin + 2, currentY);
    currentY += tpLines.length * 3.8;
  });
  currentY += 3;

  // 3. Pemahaman Bermakna & Pertanyaan Pemantik
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('3. Pemahaman Bermakna & Pertanyaan Pemantik:', margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const maknaLines = doc.splitTextToSize(`• Pemahaman Bermakna: ${modul.pemahamanBermakna}`, pageWidth - (margin * 2) - 4);
  doc.text(maknaLines, margin + 2, currentY);
  currentY += maknaLines.length * 3.8 + 2;

  modul.pertanyaanPemantik.forEach((q) => {
    const qLines = doc.splitTextToSize(`• Pertanyaan Pemantik: ${q}`, pageWidth - (margin * 2) - 4);
    checkPageBreak(qLines.length * 4);
    doc.text(qLines, margin + 2, currentY);
    currentY += qLines.length * 3.8;
  });
  currentY += 4;

  // 4. Kegiatan Pembelajaran
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('4. Langkah-Langkah Kegiatan Pembelajaran (Berdiferensiasi):', margin, currentY);
  currentY += 5;

  const tableKegiatan = [
    [
      { content: `Pendahuluan (${modul.kegiatanPembelajaran.pendahuluan.durasi})`, styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      modul.kegiatanPembelajaran.pendahuluan.kegiatan.map((k) => `• ${k}`).join('\n'),
    ],
    [
      { content: `Kegiatan Inti (${modul.kegiatanPembelajaran.inti.durasi})\nSintaks: ${modul.modelPembelajaran}`, styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      modul.kegiatanPembelajaran.inti.sintaks.map((s) => `[${s.faseSintaks}]\n- Guru: ${s.kegiatanGuru}\n- Murid: ${s.kegiatanSiswa}${s.diferensiasi ? '\n- ' + s.diferensiasi : ''}`).join('\n\n'),
    ],
    [
      { content: `Penutup (${modul.kegiatanPembelajaran.penutup.durasi})`, styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      modul.kegiatanPembelajaran.penutup.kegiatan.map((k) => `• ${k}`).join('\n'),
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Tahap Kegiatan', 'Deskripsi Alur Aktivitas Guru dan Peserta Didik']],
    body: tableKegiatan,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59], overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: pageWidth - (margin * 2) - 45 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // --- BAGIAN C: ASESMEN & RUBRIK ---
  checkPageBreak(15);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('C. ASESMEN PEMBELAJARAN & RUBRIK PENILAIAN', margin + 3, currentY + 4.5);
  currentY += 8.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. Rubrik Asesmen Formatif (Proses & Kinerja):', margin, currentY);
  currentY += 4;

  const rubrikRows = modul.asesmen.formatif.rubrik.map((r) => [
    r.aspek,
    r.skor4,
    r.skor3,
    r.skor2,
    r.skor1,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Aspek yang Dinilai', 'Sangat Baik (4)', 'Baik (3)', 'Cukup (2)', 'Perlu Bimbingan (1)']],
    body: rubrikRows,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 37 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 2. Soal Evaluasi Sumatif
  checkPageBreak(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. Kisi-kisi & Butir Soal Asesmen Sumatif (Ketercapaian TP):', margin, currentY);
  currentY += 4;

  modul.asesmen.sumatif.soal.forEach((soal) => {
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const qText = `Soal No. ${soal.nomor} [Level ${soal.levelKognitif}]: ${soal.pertanyaan}`;
    const qSplit = doc.splitTextToSize(qText, pageWidth - (margin * 2) - 4);
    doc.text(qSplit, margin + 2, currentY);
    currentY += qSplit.length * 3.6;

    if (soal.opsi && soal.opsi.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      soal.opsi.forEach((opt) => {
        checkPageBreak(4);
        doc.text(`   ${opt}`, margin + 4, currentY);
        currentY += 3.5;
      });
    }

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(37, 99, 235);
    doc.text(`Kunci: ${soal.kunciJawaban} | Pembahasan: ${soal.pembahasan.slice(0, 110)}...`, margin + 4, currentY);
    doc.setTextColor(30, 41, 59);
    currentY += 5;
  });

  // --- BAGIAN D: LAMPIRAN (LKPD) ---
  checkPageBreak(20);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('D. LAMPIRAN: LEMBAR KERJA PESERTA DIDIK (LKPD)', margin + 3, currentY + 4.5);
  currentY += 8.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(modul.lkpd.judul, margin, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Tujuan Aktivitas: ${modul.lkpd.tujuan}`, margin + 2, currentY);
  currentY += 5;

  // Langkah Kerja LKPD
  doc.setFont('helvetica', 'bold');
  doc.text('Petunjuk Kerja & Aktivitas Siswa:', margin + 2, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  modul.lkpd.langkahKerja.forEach((langkah, i) => {
    checkPageBreak(4);
    doc.text(`${i + 1}. ${langkah}`, margin + 4, currentY);
    currentY += 3.8;
  });
  currentY += 2;

  // --- TANDA TANGAN PENGESAHAN DOKUMEN ---
  checkPageBreak(35);
  currentY += 4;
  const kotaTitimangsa = schoolProfile?.titimangsaKota || 'Kota Satuan';
  const ttdDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Ditetapkan di: ${kotaTitimangsa}`, margin + 5, currentY);
  doc.text(`Pada tanggal: ${ttdDate}`, pageWidth - margin - 55, currentY);
  currentY += 5;

  doc.text('Mengetahui,', margin + 5, currentY);
  doc.text('Guru Mata Pelajaran,', pageWidth - margin - 55, currentY);
  currentY += 4;

  doc.text('Kepala Sekolah,', margin + 5, currentY);
  doc.text(modul.identitas.mataPelajaran, pageWidth - margin - 55, currentY);
  currentY += 18;

  const kepsekNama = schoolProfile?.namaKepsek || modul.identitas.namaKepsek;
  const kepsekNip = schoolProfile?.nipKepsek || modul.identitas.nipKepsek;

  doc.setFont('helvetica', 'bold');
  doc.text(kepsekNama, margin + 5, currentY);
  doc.text(modul.identitas.namaPenyusun, pageWidth - margin - 55, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. ${kepsekNip}`, margin + 5, currentY);
  doc.text(`NIP. ${modul.identitas.nipPenyusun}`, pageWidth - margin - 55, currentY);

  // --- FOOTER DENGAN NOMOR HALAMAN ---
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Modul Ajar Kurikulum Merdeka SMP Fase D - ${modul.identitas.mataPelajaran} | Dokumen Resmi`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  return doc;
}

export function downloadModulAjarPDF(modul: ModulAjarData, schoolProfile?: SchoolProfile): void {
  const doc = generateModulAjarPDF(modul, schoolProfile);
  const cleanTitle = (modul.judul || 'Modul_Ajar_SMP').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanTitle}.pdf`);
}

