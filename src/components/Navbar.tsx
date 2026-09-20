import React from 'react';
import { BookOpen, FileText, Database, Award, Cloud, Sparkles, Building, UserCheck } from 'lucide-react';
import { TeacherUser } from '../types';

export type ActiveTab = 'generator' | 'cp-atp' | 'assessment' | 'drive' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasGeneratedModul: boolean;
  onQuickDownloadPdf: () => void;
  onOpenDriveModal: () => void;
  driveSyncCount: number;
  activeTeacher?: TeacherUser;
  schoolName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasGeneratedModul,
  onQuickDownloadPdf,
  onOpenDriveModal,
  driveSyncCount,
  activeTeacher,
  schoolName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 text-lg tracking-tight">GuruMerdeka</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  SMP Fase D
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate max-w-[280px]">
                {schoolName || 'SMP Negeri 1 Merdeka Belajar'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              id="nav-tab-generator"
              onClick={() => setActiveTab('generator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'generator'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Generator Modul</span>
            </button>

            <button
              id="nav-tab-cp-atp"
              onClick={() => setActiveTab('cp-atp')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'cp-atp'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Bank CP & ATP</span>
            </button>

            <button
              id="nav-tab-assessment"
              onClick={() => setActiveTab('assessment')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'assessment'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Buku Nilai</span>
            </button>

            <button
              id="nav-tab-drive"
              onClick={() => setActiveTab('drive')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'drive'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Cloud className="w-4 h-4 text-sky-600" />
              <span>Google Drive</span>
              {driveSyncCount > 0 && (
                <span className="w-5 h-5 text-[11px] font-bold bg-sky-100 text-sky-700 rounded-full flex items-center justify-center">
                  {driveSyncCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50/50'
              }`}
            >
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Admin Sekolah & User</span>
            </button>
          </nav>

          {/* Action Buttons & Active Teacher Profile */}
          <div className="flex items-center space-x-2">
            {activeTeacher && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                title="Kelola identitas guru dan profil sekolah"
                className="flex items-center space-x-2 pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  {activeTeacher.nama.charAt(0)}
                </div>
                <div className="hidden sm:block overflow-hidden max-w-[130px] md:max-w-[170px]">
                  <span className="block text-xs font-bold text-slate-800 truncate leading-tight">
                    {activeTeacher.nama}
                  </span>
                  <span className="block text-[10px] text-blue-600 font-medium truncate">
                    {activeTeacher.subjectName}
                  </span>
                </div>
                <UserCheck className="w-3.5 h-3.5 text-blue-600 hidden md:block shrink-0" />
              </button>
            )}

            <button
              id="btn-nav-drive-sync"
              onClick={onOpenDriveModal}
              title="Kelola Sinkronisasi Google Drive"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Cloud className="w-4 h-4 text-sky-600" />
            </button>

            {hasGeneratedModul && (
              <button
                id="btn-nav-download-pdf"
                onClick={onQuickDownloadPdf}
                className="hidden sm:flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Unduh PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden border-t border-slate-200 bg-white grid grid-cols-5 py-1.5">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center py-1 text-[10px] font-medium ${
            activeTab === 'generator' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>Modul</span>
        </button>

        <button
          onClick={() => setActiveTab('cp-atp')}
          className={`flex flex-col items-center py-1 text-[10px] font-medium ${
            activeTab === 'cp-atp' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <Database className="w-4 h-4 mb-0.5" />
          <span>CP & ATP</span>
        </button>

        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex flex-col items-center py-1 text-[10px] font-medium ${
            activeTab === 'assessment' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4 mb-0.5" />
          <span>Nilai</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex flex-col items-center py-1 text-[10px] font-medium ${
            activeTab === 'drive' ? 'text-sky-600' : 'text-slate-500'
          }`}
        >
          <Cloud className="w-4 h-4 mb-0.5" />
          <span>Drive</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center py-1 text-[10px] font-medium ${
            activeTab === 'admin' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Building className="w-4 h-4 mb-0.5" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};

