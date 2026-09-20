import React, { useState } from 'react';
import { Cloud, CheckCircle2, ExternalLink, RefreshCw, Folder, FileText, Key, X, Download } from 'lucide-react';
import { ModulAjarData, DriveSyncItem } from '../types';
import { getSavedDriveHistory, getCachedDriveToken, setCachedDriveToken, syncModulToGoogleDrive } from '../utils/googleDriveSync';
import { downloadModulAjarPDF } from '../utils/pdfGenerator';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModul: ModulAjarData;
  onSyncComplete?: (item: DriveSyncItem) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentModul,
  onSyncComplete,
}) => {
  const [history, setHistory] = useState<DriveSyncItem[]>(getSavedDriveHistory());
  const [folderName, setFolderName] = useState('Modul Ajar Kurikulum Merdeka');
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [customToken, setCustomToken] = useState(getCachedDriveToken() || '');
  const [showTokenInput, setShowTokenInput] = useState(false);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSuccessMsg(null);
    try {
      const res = await syncModulToGoogleDrive(currentModul, folderName);
      setHistory(getSavedDriveHistory());
      setSuccessMsg(res.message);
      if (onSyncComplete) {
        onSyncComplete(res.item);
      }
    } catch (err: any) {
      console.error(err);
      setSuccessMsg('Gagal menyinkronkan dokumen ke Google Drive');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveToken = () => {
    setCachedDriveToken(customToken.trim() || null);
    setShowTokenInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Sinkronisasi Google Drive</h3>
              <p className="text-xs text-slate-300">Penyimpanan & Cadangan Cloud Modul Ajar SMP</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Box */}
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-sky-600" />
                <span className="text-xs sm:text-sm font-bold text-sky-950">
                  Folder Google Drive Tujuan:
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Siap Tersinkron</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Nama folder Google Drive..."
                className="w-full text-xs sm:text-sm p-2 rounded-lg border border-sky-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-sky-400/20 outline-none"
              />
            </div>

            <p className="text-[11px] text-sky-800">
              Dokumen PDF dan metadata Modul Ajar akan otomatis dicadangkan ke akun Google Drive Anda di bawah folder di atas.
            </p>
          </div>

          {/* Dokumen yang Siap Disinkronkan */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Dokumen Modul Ajar Aktif:
            </p>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{currentModul.judul}</h4>
                  <p className="text-xs text-slate-500">
                    {currentModul.identitas.mataPelajaran} • {currentModul.identitas.kelas} • Guru: {currentModul.identitas.namaPenyusun}
                  </p>
                </div>
              </div>
            </div>

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Sync Button */}
          <div>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengunggah dan Menyinkronkan ke Google Drive...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>Sinkronkan Dokumen Ini Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* Token Options Toggle (Optional OAuth Key) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Pengaturan Google OAuth Access Token (Opsional)</span>
            </button>

            {showTokenInput && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-[11px] text-slate-600">
                  Jika Anda memiliki Google OAuth Bearer Token dari Google Workspace / Akun Belajar.id, masukkan di sini untuk upload API langsung ke Google Drive:
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="ya29.a0AfH6SM..."
                    className="flex-1 text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    onClick={handleSaveToken}
                    className="text-xs bg-slate-800 text-white px-3 py-2 rounded-lg font-medium"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Riwayat Sinkronisasi */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Riwayat Sinkronisasi Drive ({history.length}):
              </h4>
            </div>

            {history.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Belum ada dokumen yang disinkronkan. Klik tombol di atas untuk mencadangkan dokumen.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{item.docTitle}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.syncedAt} • {item.fileSize} • Folder: {item.driveFolder}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={item.webLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka Drive</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
