import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createDefaultModulAjar } from './src/data/defaultModulTemplates.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: Generate Modul Ajar Kurikulum Merdeka Fase D (SMP)
app.post('/api/generate-modul', async (req, res) => {
  try {
    const {
      subjectName,
      kelas,
      tp,
      materiPokok,
      subMateri,
      elemen,
      capaianPembelajaran,
      alurTujuanPembelajaran,
      dimensiP3,
      fokusDiferensiasi,
      metodeSpesifik,
      modelPembelajaran,
      namaGuru,
      namaSekolah,
      alokasiWaktu,
    } = req.body;

    const ai = getGeminiClient();

    // Fallback if no API key is set
    if (!ai) {
      console.log('No GEMINI_API_KEY found, generating authentic default Modul Ajar template');
      const defaultModul = createDefaultModulAjar({
        subjectName,
        kelas,
        tp,
        materiPokok,
        subMateri,
        elemen,
        capaianPembelajaran,
        alurTujuanPembelajaran,
        dimensiP3,
        fokusDiferensiasi,
        metodeSpesifik,
        modelPembelajaran,
        namaGuru,
        namaSekolah,
        alokasiWaktu,
      });
      return res.json({ modul: defaultModul, source: 'template' });
    }

    const systemPrompt = `Anda adalah Asisten Pakar Kurikulum Merdeka Kemendikbudristek Indonesia, spesialis penyusunan Modul Ajar dan RPP SMP Fase D (Kelas 7, 8, 9) berdasarkan Keputusan Kepala BSKAP No. 032/H/KR/2024.
Tugas Anda adalah menyusun Modul Ajar yang SANGAT LENGKAP, OTENTIK, OPERASIONAL, dan BERDIFERENSIASI untuk guru SMP.
Format bahasa: Bahasa Indonesia baku, pedagogis, ramah guru, dan memenuhi standar supervisi pengawas sekolah.`;

    const p3Prompt = Array.isArray(dimensiP3) && dimensiP3.length > 0 ? dimensiP3.join(', ') : 'Bernalar Kritis, Bergotong Royong, Mandiri';

    const userPrompt = `Buatkan Modul Ajar Kurikulum Merdeka Lengkap untuk SMP Fase D dengan data spesifik berikut:
- Mata Pelajaran: ${subjectName || 'IPA'}
- Kelas: ${kelas || 'Kelas VII'}
- Elemen CP: ${elemen || 'Pemahaman Sains & Keterampilan Proses'}
- Capaian Pembelajaran (CP BSKAP): ${capaianPembelajaran || 'Sesuai BSKAP 032/H/KR/2024'}
- Alur Tujuan Pembelajaran (ATP): ${alurTujuanPembelajaran || 'Menyesuaikan alur TP'}
- Materi Pokok: ${materiPokok || 'Topik Esensial'}
${subMateri ? `- Sub-Materi / Rincian Topik Spesifik: ${subMateri}` : ''}
- Tujuan Pembelajaran (TP) Spesifik: ${tp || 'Menganalisis konsep dan fenomena kontekstual'}
- Profil Pelajar Pancasila yang Disasar: ${p3Prompt}
- Model Pembelajaran: ${modelPembelajaran || 'Problem-Based Learning (PBL)'}
${fokusDiferensiasi ? `- Fokus Pendekatan Berdiferensiasi: ${fokusDiferensiasi}` : ''}
${metodeSpesifik ? `- Metode / Teknik Spesifik Utama: ${metodeSpesifik}` : ''}
- Alokasi Waktu: ${alokasiWaktu || '2 x 40 Menit (1 Pertemuan)'}
- Nama Guru Pengampu: ${namaGuru || 'Guru Pengampu, S.Pd.'}
- Nama Satuan Pendidikan: ${namaSekolah || 'SMP Negeri 1 Merdeka Belajar'}

PANDUAN KONTEN:
1. Pastikan Capaian Pembelajaran, Alur Tujuan Pembelajaran, dan Tujuan Pembelajaran saling selaras (alignment) dengan taksonomi Bloom revisi/Marzano.
2. Pada bagian Kegiatan Inti, cantumkan 5 fase sintaks model pembelajaran secara runtut dengan instruksi operasional untuk guru dan siswa, serta tindakan eksplisit diferensiasi (konten, proses, produk).
3. Buat LKPD lengkap dan soal evaluasi HOTS yang berkaitan erat dengan materi ${materiPokok}${subMateri ? ` dan sub-materi ${subMateri}` : ''}.

Hasilkan struktur JSON yang lengkap dengan:
1. identitas lengkap
2. kompetensiAwal (3-4 butir)
3. profilPelajarPancasila (dimensi terpilih beserta deskripsi tindakannya)
4. saranaPrasarana (media, alatDanBahan, sumberBelajar)
5. targetPesertaDidik, modelPembelajaran, metodePembelajaran (array), pendekatan
6. capaianPembelajaran, alurTujuanPembelajaran, tujuanPembelajaran (array 2-3 TP terukur)
7. pemahamanBermakna, pertanyaanPemantik (3 pertanyaan investigatif)
8. persiapanPembelajaran (array)
9. kegiatanPembelajaran (pendahuluan durasi & kegiatan, inti durasi & minimal 5 fase sintaks model pembelajaran dengan kegiatanGuru, kegiatanSiswa, diferensiasi, penutup durasi & kegiatan)
10. asesmen:
    - diagnostik (nonKognitif 3 butir, kognitif 2-3 butir)
    - formatif (teknik dan rubrik 3 aspek dengan skor4, skor3, skor2, skor1)
    - sumatif (teknik, kisiKisi, dan 3-5 butir soal pilihan ganda & uraian HOTS dengan nomor, pertanyaan, opsi, kunciJawaban, pembahasan, levelKognitif)
11. pengayaanDanRemedial (pengayaan dan remedial konkret)
12. refleksi (guru dan siswa)
13. lkpd (judul, tujuan, alatBahan, langkahKerja, tugasAktivitas, kesimpulanPanduan)
14. bahanBacaan (siswa dan guru)
15. glosarium (istilah dan arti)
16. daftarPustaka`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '{}';
    let parsedModul;
    try {
      parsedModul = JSON.parse(responseText);
      parsedModul.id = `modul-${Date.now()}`;
      parsedModul.createdAt = new Date().toISOString();
      parsedModul.updatedAt = new Date().toISOString();
      if (!parsedModul.judul) {
        parsedModul.judul = `Modul Ajar ${subjectName} - ${kelas} (${materiPokok || tp.slice(0, 30)})`;
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON, falling back to template', parseError);
      parsedModul = createDefaultModulAjar({
        subjectName,
        kelas,
        tp,
        materiPokok,
        elemen,
        modelPembelajaran,
        namaGuru,
        namaSekolah,
        alokasiWaktu,
      });
    }

    return res.json({ modul: parsedModul, source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating modul:', error);
    // Graceful fallback to avoid leaving user hanging
    const fallback = createDefaultModulAjar({
      subjectName: req.body.subjectName,
      kelas: req.body.kelas,
      tp: req.body.tp,
      materiPokok: req.body.materiPokok,
      subMateri: req.body.subMateri,
      elemen: req.body.elemen,
      capaianPembelajaran: req.body.capaianPembelajaran,
      alurTujuanPembelajaran: req.body.alurTujuanPembelajaran,
      dimensiP3: req.body.dimensiP3,
      fokusDiferensiasi: req.body.fokusDiferensiasi,
      metodeSpesifik: req.body.metodeSpesifik,
      modelPembelajaran: req.body.modelPembelajaran,
      namaGuru: req.body.namaGuru,
      namaSekolah: req.body.namaSekolah,
      alokasiWaktu: req.body.alokasiWaktu,
    });
    return res.json({ modul: fallback, source: 'template_fallback', error: error?.message });
  }
});

// Start server and mount Vite
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Modul Ajar SMP Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
