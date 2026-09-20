import * as XLSX from 'xlsx';
import { StudentRecord } from '../types';

const STORAGE_KEY = 'gurumerdeka_students_db_v1';

export const INITIAL_STUDENTS_DATABASE: StudentRecord[] = [
  {
    id: 'std-1',
    nisn: '0091827361',
    nis: '232407001',
    nama: 'Ahmad Fauzi',
    jenisKelamin: 'L',
    rombel: 'Kelas VII-A',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2011-04-12',
    nilaiDiagnostik: 80,
    nilaiLKPD: 88,
    nilaiSumatif: 90,
    nilaiAkhir: 87,
    kktpStatus: 'Tuntas',
    predikat: 'Baik',
    catatanCapaian: 'Menunjukkan penguasaan Baik dalam menganalisis konsep inti dan sangat aktif berkolaborasi.',
  },
  {
    id: 'std-2',
    nisn: '0091827362',
    nis: '232407002',
    nama: 'Anisa Rahmawati',
    jenisKelamin: 'P',
    rombel: 'Kelas VII-A',
    tempatLahir: 'Bandung',
    tanggalLahir: '2011-08-25',
    nilaiDiagnostik: 85,
    nilaiLKPD: 95,
    nilaiSumatif: 95,
    nilaiAkhir: 93,
    kktpStatus: 'Tuntas',
    predikat: 'Sangat Baik',
    catatanCapaian: 'Menunjukkan penguasaan Sangat Baik dan bernalar kritis tinggi dalam penyelidikan LKPD.',
  },
  {
    id: 'std-3',
    nisn: '0091827363',
    nis: '232407003',
    nama: 'Bima Satria Yudha',
    jenisKelamin: 'L',
    rombel: 'Kelas VII-A',
    tempatLahir: 'Semarang',
    tanggalLahir: '2011-02-14',
    nilaiDiagnostik: 65,
    nilaiLKPD: 70,
    nilaiSumatif: 65,
    nilaiAkhir: 67,
    kktpStatus: 'Remedial',
    predikat: 'Cukup',
    catatanCapaian: 'Perlu bimbingan lanjutan pada pemahaman konsep dan perhitungan data observasi.',
  },
  {
    id: 'std-4',
    nisn: '0091827364',
    nis: '232407004',
    nama: 'Citra Kirana Putri',
    jenisKelamin: 'P',
    rombel: 'Kelas VII-A',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2011-11-03',
    nilaiDiagnostik: 75,
    nilaiLKPD: 85,
    nilaiSumatif: 80,
    nilaiAkhir: 81,
    kktpStatus: 'Tuntas',
    predikat: 'Baik',
    catatanCapaian: 'Mampu menyelesaikan tugas dengan baik dan komunikatif saat mempresentasikan hasil.',
  },
  {
    id: 'std-5',
    nisn: '0091827365',
    nis: '232407005',
    nama: 'Daffa Pratama',
    jenisKelamin: 'L',
    rombel: 'Kelas VII-B',
    tempatLahir: 'Yogyakarta',
    tanggalLahir: '2011-06-19',
    nilaiDiagnostik: 90,
    nilaiLKPD: 90,
    nilaiSumatif: 92,
    nilaiAkhir: 91,
    kktpStatus: 'Tuntas',
    predikat: 'Sangat Baik',
    catatanCapaian: 'Menunjukkan kemandirian tinggi dan mampu membimbing rekan sebaya dalam kelompok.',
  },
  {
    id: 'std-6',
    nisn: '0091827366',
    nis: '232407006',
    nama: 'Eka Nur Cahyani',
    jenisKelamin: 'P',
    rombel: 'Kelas VII-B',
    tempatLahir: 'Malang',
    tanggalLahir: '2011-09-30',
    nilaiDiagnostik: 60,
    nilaiLKPD: 68,
    nilaiSumatif: 62,
    nilaiAkhir: 64,
    kktpStatus: 'Remedial',
    predikat: 'Cukup',
    catatanCapaian: 'Perlu penguatan konsep dasar materi dan latihan mandiri terarah.',
  },
  {
    id: 'std-7',
    nisn: '0091827367',
    nis: '232407007',
    nama: 'Fajar Maulana',
    jenisKelamin: 'L',
    rombel: 'Kelas VII-B',
    tempatLahir: 'Surakarta',
    tanggalLahir: '2011-01-18',
    nilaiDiagnostik: 78,
    nilaiLKPD: 82,
    nilaiSumatif: 85,
    nilaiAkhir: 82,
    kktpStatus: 'Tuntas',
    predikat: 'Baik',
    catatanCapaian: 'Telah menguasai tujuan pembelajaran dengan baik serta teliti dalam mencatat data.',
  },
  {
    id: 'std-8',
    nisn: '0091827368',
    nis: '232407008',
    nama: 'Gita Permatasari',
    jenisKelamin: 'P',
    rombel: 'Kelas VII-B',
    tempatLahir: 'Denpasar',
    tanggalLahir: '2011-05-07',
    nilaiDiagnostik: 85,
    nilaiLKPD: 92,
    nilaiSumatif: 88,
    nilaiAkhir: 89,
    kktpStatus: 'Tuntas',
    predikat: 'Sangat Baik',
    catatanCapaian: 'Sangat antusias, kritis dalam tanya jawab, dan hasil produk LKPD sangat rapi.',
  },
];

/**
 * Compute student metric scores based on KKTP threshold
 */
export function calculateStudentMetrics(
  diagnostik: number,
  lkpd: number,
  sumatif: number,
  threshold = 75,
  tpKeyword = 'tujuan pembelajaran'
) {
  const clampedD = Math.min(100, Math.max(0, diagnostik || 0));
  const clampedL = Math.min(100, Math.max(0, lkpd || 0));
  const clampedS = Math.min(100, Math.max(0, sumatif || 0));

  // 20% diagnostik + 40% LKPD + 40% sumatif
  const akhir = Math.round(clampedD * 0.2 + clampedL * 0.4 + clampedS * 0.4);
  const status: 'Tuntas' | 'Remedial' = akhir >= threshold ? 'Tuntas' : 'Remedial';

  let predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan' = 'Cukup';
  if (akhir >= 88) predikat = 'Sangat Baik';
  else if (akhir >= 75) predikat = 'Baik';
  else if (akhir >= 60) predikat = 'Cukup';
  else predikat = 'Perlu Bimbingan';

  const catatan =
    status === 'Tuntas'
      ? `Menunjukkan penguasaan ${predikat} dalam kompetensi ${tpKeyword} dan aktif berkolaborasi.`
      : `Perlu pendampingan belajar dan remedial terarah pada kompetensi ${tpKeyword}.`;

  return { akhir, status, predikat, catatan };
}

/**
 * Load saved students from LocalStorage
 */
export function getSavedStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS_DATABASE));
      return INITIAL_STUDENTS_DATABASE;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_STUDENTS_DATABASE;
  } catch (err) {
    console.error('Failed to load students from localStorage:', err);
    return INITIAL_STUDENTS_DATABASE;
  }
}

/**
 * Save students to LocalStorage
 */
export function saveStudents(students: StudentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    window.dispatchEvent(new CustomEvent('gurumerdeka_students_updated', { detail: students }));
  } catch (err) {
    console.error('Failed to save students to localStorage:', err);
  }
}

/**
 * Parse an uploaded Excel (.xls, .xlsx) or CSV file from Dapodik
 */
export async function parseDapodikFile(
  file: File
): Promise<{ success: boolean; data: StudentRecord[]; count: number; error?: string }> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { success: false, data: [], count: 0, error: 'File Excel tidak memiliki lembar kerja (sheet).' };
    }

    // Pick first sheet or sheet with relevant name
    const sheetName =
      workbook.SheetNames.find(
        (name) =>
          name.toLowerCase().includes('peserta didik') ||
          name.toLowerCase().includes('siswa') ||
          name.toLowerCase().includes('dapodik')
      ) || workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];
    // Convert to 2D array to accurately inspect headers
    const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });

    if (rows.length === 0) {
      return { success: false, data: [], count: 0, error: 'Lembar kerja kosong atau tidak dapat dibaca.' };
    }

    // Find header row by searching for 'nama' or 'nisn' in any column
    let headerRowIdx = -1;
    let colMap: Record<string, number> = {};

    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;

      const lowerCells = row.map((cell) => String(cell || '').trim().toLowerCase());
      
      const hasNama = lowerCells.some(
        (c) => c === 'nama' || c === 'nama siswa' || c === 'nama peserta didik' || c === 'nama lengkap'
      );
      const hasNisn = lowerCells.some((c) => c.includes('nisn'));
      const hasJk = lowerCells.some((c) => c === 'jk' || c === 'jenis kelamin' || c === 'l/p');

      if (hasNama || (hasNisn && hasJk)) {
        headerRowIdx = i;
        lowerCells.forEach((cellText, colIdx) => {
          if (
            cellText === 'nama' ||
            cellText === 'nama siswa' ||
            cellText === 'nama peserta didik' ||
            cellText === 'nama lengkap'
          ) {
            colMap['nama'] = colIdx;
          } else if (cellText.includes('nisn')) {
            colMap['nisn'] = colIdx;
          } else if (cellText === 'nipd' || cellText === 'nis' || cellText === 'no induk') {
            colMap['nis'] = colIdx;
          } else if (cellText === 'jk' || cellText === 'jenis kelamin' || cellText === 'l/p') {
            colMap['jk'] = colIdx;
          } else if (
            cellText === 'rombel' ||
            cellText === 'rombongan belajar' ||
            cellText === 'kelas' ||
            cellText === 'rombel saat ini'
          ) {
            colMap['rombel'] = colIdx;
          } else if (cellText === 'tempat lahir' || cellText === 'tmp lahir') {
            colMap['tempatLahir'] = colIdx;
          } else if (cellText === 'tanggal lahir' || cellText === 'tgl lahir') {
            colMap['tanggalLahir'] = colIdx;
          } else if (cellText === 'nik') {
            colMap['nik'] = colIdx;
          }
        });
        break;
      }
    }

    if (headerRowIdx === -1 || colMap['nama'] === undefined) {
      // Fallback: try default headers if standard
      return {
        success: false,
        data: [],
        count: 0,
        error:
          'Format kolom file Dapodik tidak terdeteksi. Pastikan file memiliki kolom "Nama Siswa" atau "Nama Peserta Didik" dan "NISN".',
      };
    }

    const parsedStudents: StudentRecord[] = [];
    const timestamp = Date.now();

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const rawNama = String(row[colMap['nama']] || '').trim();
      // Skip empty rows or footer rows (e.g. "Total", "Mengetahui")
      if (!rawNama || rawNama.toLowerCase().startsWith('total') || rawNama.toLowerCase().startsWith('mengetahui')) {
        continue;
      }

      // NISN
      let rawNisn = colMap['nisn'] !== undefined ? String(row[colMap['nisn']] || '').trim() : '';
      if (!rawNisn || rawNisn === '-') {
        rawNisn = `009${Math.floor(1000000 + Math.random() * 9000000)}`;
      }

      // NIS
      const rawNis = colMap['nis'] !== undefined ? String(row[colMap['nis']] || '').trim() : undefined;

      // Gender
      let rawJk: 'L' | 'P' = 'L';
      if (colMap['jk'] !== undefined) {
        const jkVal = String(row[colMap['jk']] || '').trim().toUpperCase();
        if (jkVal.startsWith('P') || jkVal === 'WANITA' || jkVal === 'PEREMPUAN') {
          rawJk = 'P';
        } else {
          rawJk = 'L';
        }
      }

      // Rombel
      let rawRombel = 'Kelas VII-A';
      if (colMap['rombel'] !== undefined && row[colMap['rombel']]) {
        rawRombel = String(row[colMap['rombel']]).trim();
        if (!rawRombel.toLowerCase().startsWith('kelas') && !rawRombel.toLowerCase().startsWith('kls')) {
          rawRombel = `Kelas ${rawRombel}`;
        }
      }

      // Tempat & Tanggal Lahir
      const rawTempat = colMap['tempatLahir'] !== undefined ? String(row[colMap['tempatLahir']] || '').trim() : undefined;
      const rawTgl = colMap['tanggalLahir'] !== undefined ? String(row[colMap['tanggalLahir']] || '').trim() : undefined;
      const rawNik = colMap['nik'] !== undefined ? String(row[colMap['nik']] || '').trim() : undefined;

      // Initial default scores
      const metrics = calculateStudentMetrics(75, 80, 80);

      parsedStudents.push({
        id: `dapodik-${timestamp}-${r}`,
        nisn: rawNisn,
        nis: rawNis,
        nama: rawNama,
        jenisKelamin: rawJk,
        rombel: rawRombel,
        tempatLahir: rawTempat,
        tanggalLahir: rawTgl,
        nik: rawNik,
        nilaiDiagnostik: 75,
        nilaiLKPD: 80,
        nilaiSumatif: 80,
        nilaiAkhir: metrics.akhir,
        kktpStatus: metrics.status,
        predikat: metrics.predikat,
        catatanCapaian: metrics.catatan,
      });
    }

    if (parsedStudents.length === 0) {
      return {
        success: false,
        data: [],
        count: 0,
        error: 'Tidak ada baris data siswa yang berhasil diekstrak dari file.',
      };
    }

    return {
      success: true,
      data: parsedStudents,
      count: parsedStudents.length,
    };
  } catch (err: any) {
    console.error('Error parsing Dapodik file:', err);
    return {
      success: false,
      data: [],
      count: 0,
      error: `Gagal membaca file: ${err?.message || 'Format file tidak didukung.'}`,
    };
  }
}

/**
 * Generate and download an authentic Dapodik Excel (.xlsx) template
 */
export function downloadDapodikTemplate() {
  const headers = [
    'No',
    'Nama Peserta Didik',
    'NISN',
    'NIPD',
    'Jenis Kelamin',
    'Rombongan Belajar',
    'Tempat Lahir',
    'Tanggal Lahir',
    'NIK',
    'Nama Ibu Kandung',
  ];

  const sampleRows = [
    [1, 'Aditya Pratama Putra', '0092345671', '242507001', 'L', 'Kelas VII-A', 'Bandung', '2011-03-15', '3273011503110001', 'Siti Aminah'],
    [2, 'Bella Safira Anggraini', '0092345672', '242507002', 'P', 'Kelas VII-A', 'Jakarta', '2011-07-22', '3171026207110002', 'Nurhayati'],
    [3, 'Dimas Arya Pamungkas', '0092345673', '242507003', 'L', 'Kelas VII-A', 'Semarang', '2011-10-09', '3374030910110003', 'Endang Sri'],
    [4, 'Dinda Aulia Maharani', '0092345674', '242507004', 'P', 'Kelas VII-B', 'Surabaya', '2011-05-18', '3578045805110004', 'Rina Kartika'],
    [5, 'Farhan Rizki Ramadhan', '0092345675', '242507005', 'L', 'Kelas VII-B', 'Yogyakarta', '2011-08-30', '3471053008110005', 'Sri Wahyuni'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // Styling column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 26 }, // Nama Peserta Didik
    { wch: 14 }, // NISN
    { wch: 12 }, // NIPD
    { wch: 14 }, // Jenis Kelamin
    { wch: 18 }, // Rombongan Belajar
    { wch: 16 }, // Tempat Lahir
    { wch: 14 }, // Tanggal Lahir
    { wch: 20 }, // NIK
    { wch: 20 }, // Nama Ibu
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Peserta Didik Dapodik');

  XLSX.writeFile(workbook, 'Template_Daftar_Siswa_Dapodik_SMP.xlsx');
}
