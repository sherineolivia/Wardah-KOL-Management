import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Printer,
  RefreshCw,
  Share2,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { CAMPAIGN_BANNER_IMAGE } from '../data/initialData';
import {
  Campaign,
  CampaignStageId,
  EvaluationVerdict,
  KolProfile,
  StageStatus,
  TabKey,
} from '../types/kol';
import { KolAvatar } from './KolAvatar';

interface KampanyeViewProps {
  campaigns: Campaign[];
  activeCampaign: Campaign;
  kols: KolProfile[];
  focusedStageId: CampaignStageId | null;
  onSelectCampaign: (campaignId: string) => void;
  onFocusStage: (stageId: CampaignStageId | null) => void;
  onUpdateStageStatus: (
    campaignId: string,
    stageId: CampaignStageId,
    status: StageStatus,
  ) => void;
  onUpdateStrategyNote: (campaignId: string, strategyAngle: string) => void;
  onCyclePublicationStatus: (campaignId: string, pubId: string) => void;
  onSetEvaluationVerdict: (campaignId: string, verdict: EvaluationVerdict) => void;
  onToggleRevisionAction: (campaignId: string, actionId: string) => void;
  onAddRevisionAction: (campaignId: string, label: string, owner: string) => void;
  onApplyRevisionRound: (campaignId: string) => void;
  onNavigateTab: (tab: TabKey) => void;
}

export function KampanyeView({
  campaigns,
  activeCampaign,
  kols,
  focusedStageId,
  onSelectCampaign,
  onFocusStage,
  onUpdateStageStatus,
  onUpdateStrategyNote,
  onCyclePublicationStatus,
  onSetEvaluationVerdict,
  onToggleRevisionAction,
  onAddRevisionAction,
  onApplyRevisionRound,
  onNavigateTab,
}: KampanyeViewProps) {
  const [bannerError, setBannerError] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(false);
  const [strategyDraft, setStrategyDraft] = useState(activeCampaign.strategyAngle);
  const [newRevisionText, setNewRevisionText] = useState('');
  const [newRevisionOwner, setNewRevisionOwner] = useState('Tim Kreatif & KOL');
  const [revisionToast, setRevisionToast] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const selectedStageId: CampaignStageId =
    focusedStageId ||
    activeCampaign.stages.find(
      (s) => s.status === 'revisi' || s.status === 'berjalan',
    )?.id ||
    'evaluasi_laporan';

  const activeStage =
    activeCampaign.stages.find((s) => s.id === selectedStageId) ||
    activeCampaign.stages[0];

  const assignedKols = kols.filter((k) =>
    k.assignedCampaignIds.includes(activeCampaign.id),
  );

  const stageStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'selesai':
        return {
          label: 'Selesai',
          cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
      case 'revisi':
        return {
          label: 'Perlu Revisi',
          cls: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: RefreshCw,
        };
      case 'berjalan':
        return {
          label: 'Berjalan',
          cls: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          icon: Clock,
        };
      default:
        return {
          label: 'Menunggu',
          cls: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: Clock,
        };
    }
  };

  const handleSaveStrategy = () => {
    if (strategyDraft.trim()) {
      onUpdateStrategyNote(activeCampaign.id, strategyDraft.trim());
    }
    setEditingStrategy(false);
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevisionText.trim()) return;
    onAddRevisionAction(
      activeCampaign.id,
      newRevisionText.trim(),
      newRevisionOwner.trim() || 'Tim PR/Marketing',
    );
    setNewRevisionText('');
  };

  const handleTriggerRevision = () => {
    onApplyRevisionRound(activeCampaign.id);
    setRevisionToast(
      `Revisi strategi putaran ke-${activeCampaign.revisionRound + 1} diterapkan. Tahap Strategi Promosi diaktifkan kembali.`,
    );
    setTimeout(() => setRevisionToast(null), 5000);
  };

  return (
    <div className="space-y-5">
      {/* Campaign Switcher */}
      <section className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {campaigns.map((camp) => {
          const active = camp.id === activeCampaign.id;
          return (
            <button
              key={camp.id}
              type="button"
              onClick={() => {
                onSelectCampaign(camp.id);
                setStrategyDraft(camp.strategyAngle);
                setEditingStrategy(false);
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-left border whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#38BDF8]'
              }`}
            >
              <div className="text-xs font-semibold">{camp.name}</div>
              <div
                className={`text-[11px] mt-0.5 ${
                  active ? 'text-sky-200' : 'text-slate-500'
                }`}
              >
                {camp.verdict === 'berhasil'
                  ? 'Berhasil · Pertahankan'
                  : camp.verdict === 'revisi'
                    ? 'Perlu Revisi Strategi'
                    : 'Publikasi Berjalan'}
              </div>
            </button>
          );
        })}
      </section>

      {/* Campaign Overview Banner Card */}
      <section className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-4 relative min-h-[150px] bg-gradient-to-br from-[#E0F2FE] to-[#F8FAFC]">
            {!bannerError ? (
              <img
                src={CAMPAIGN_BANNER_IMAGE}
                alt={`Visual produk ${activeCampaign.productLine}`}
                referrerPolicy="no-referrer"
                onError={() => setBannerError(true)}
                className="w-full h-full object-cover max-h-[210px] md:max-h-none"
              />
            ) : (
              <div className="w-full h-full min-h-[150px] flex flex-col items-center justify-center p-4 text-center">
                <span className="text-xs font-display font-semibold text-[#0B1F3A]">
                  {activeCampaign.productLine}
                </span>
              </div>
            )}
          </div>

          <div className="md:col-span-8 p-4 sm:p-5 flex flex-col justify-between gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-xs font-medium text-[#0284C7]">
                  {activeCampaign.productLine} · {activeCampaign.period}
                </div>
                <h2 className="text-lg font-display font-bold text-[#0B1F3A] mt-0.5">
                  {activeCampaign.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-xs font-semibold text-[#0B1F3A] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#0284C7]" />
                Ringkasan Laporan
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs tabular-nums">
              <div>
                <div className="text-slate-500">Penjualan</div>
                <div
                  className={`font-bold mt-0.5 ${
                    activeCampaign.salesDeltaPct < 0
                      ? 'text-rose-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {activeCampaign.salesLiftLabel}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Total Views</div>
                <div className="font-bold text-[#0B1F3A] mt-0.5">
                  {activeCampaign.actualViews}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Konversi / CTR</div>
                <div className="font-bold text-[#0B1F3A] mt-0.5">
                  {activeCampaign.actualConversionRate}
                </div>
              </div>
              <div>
                <div className="text-slate-500">KOL Terpilih</div>
                <div className="font-bold text-[#0B1F3A] mt-0.5">
                  {assignedKols.length} Kreator
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Toast Feedback for Revision */}
      {revisionToast && (
        <div
          role="status"
          className="rounded-xl bg-[#E0F2FE] border border-[#7DD3FC] px-4 py-3 text-xs font-medium text-[#0B1F3A] flex items-center justify-between gap-2"
        >
          <span>{revisionToast}</span>
          <button
            type="button"
            onClick={() => setRevisionToast(null)}
            className="text-[#0369A1] hover:text-[#0B1F3A]"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5-Stage Monitoring Stepper + Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: 5 Tahapan Monitoring Kampanye */}
        <section
          aria-label="Tahapan Monitoring Kampanye"
          className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-bold text-[#0B1F3A]">
              Tahapan Kampanye
            </h3>
            <span className="text-xs text-slate-500 tabular-nums">
              5 Tahap Inti
            </span>
          </div>

          <div className="space-y-2">
            {activeCampaign.stages.map((stage) => {
              const isSelected = stage.id === activeStage.id;
              const badge = stageStatusBadge(stage.status);
              const StatusIcon = badge.icon;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => onFocusStage(stage.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-colors flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#F0F9FF] border-[#0284C7]'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#0B1F3A] text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {stage.order}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-display font-bold text-[#0B1F3A]">
                        {stage.title}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {stage.summary}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap shrink-0 ${badge.cls}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: Active Stage Operational Detail & Evaluation Panel */}
        <section
          aria-label="Detail Tahapan dan Evaluasi"
          className="lg:col-span-7 space-y-4"
        >
          {/* Active Stage Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500">
                  Tahap 0{activeStage.order} · Diperbarui {activeStage.updatedAt}
                </div>
                <h3 className="text-base font-display font-bold text-[#0B1F3A] mt-0.5">
                  {activeStage.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="stage-status-select"
                  className="text-xs text-slate-500"
                >
                  Status:
                </label>
                <select
                  id="stage-status-select"
                  value={activeStage.status}
                  onChange={(e) =>
                    onUpdateStageStatus(
                      activeCampaign.id,
                      activeStage.id,
                      e.target.value as StageStatus,
                    )
                  }
                  className="min-h-[38px] px-3 py-1 rounded-xl border border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="menunggu">Menunggu</option>
                  <option value="berjalan">Berjalan</option>
                  <option value="revisi">Perlu Revisi</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Stage-Specific Operational Content */}
            {activeStage.id === 'monitoring_promosi' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeStage.summary}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-3 space-y-1">
                    <div className="text-slate-500">Target KPI Kampanye</div>
                    <div className="font-semibold text-[#0B1F3A]">
                      {activeCampaign.kpiTarget}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-3 space-y-1">
                    <div className="text-slate-500">Status Pemicu Penjualan</div>
                    <div className="font-semibold text-[#0B1F3A]">
                      {activeCampaign.salesTriggerActive
                        ? 'Aktif (Penurunan penjualan memicu audit promosi)'
                        : 'Normal (Pemantauan berkala berjalan)'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStage.id === 'pemilihan_kol' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-600">
                    Daftar KOL yang dipilih untuk kampanye ini ({assignedKols.length}{' '}
                    kreator):
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('kol')}
                    className="text-xs font-semibold text-[#0284C7] hover:text-[#0B1F3A] inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Kelola di Data KOL
                  </button>
                </div>

                {assignedKols.length === 0 ? (
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-4 text-center space-y-2">
                    <p className="text-xs text-slate-600">
                      Belum ada KOL yang dipilih untuk kampanye ini.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('kol')}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold"
                    >
                      Pilih KOL Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {assignedKols.map((kol) => (
                      <div
                        key={kol.id}
                        className="p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <KolAvatar
                            name={kol.name}
                            initials={kol.initials}
                            avatarUrl={kol.avatarUrl}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#0B1F3A] truncate">
                              {kol.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {kol.category} · {kol.primaryPlatform} · {kol.followers}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#0369A1] whitespace-nowrap">
                          {kol.selectionStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeStage.id === 'strategi_promosi' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-3.5 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Target Audiens
                  </div>
                  <p className="text-xs text-[#0B1F3A] leading-relaxed">
                    {activeCampaign.targetAudience}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Sudut Pandang & Brief Strategi (Putaran Revisi:{' '}
                      {activeCampaign.revisionRound})
                    </span>
                    {!editingStrategy && (
                      <button
                        type="button"
                        onClick={() => {
                          setStrategyDraft(activeCampaign.strategyAngle);
                          setEditingStrategy(true);
                        }}
                        className="text-xs font-semibold text-[#0284C7] hover:text-[#0B1F3A] inline-flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Ubah Brief
                      </button>
                    )}
                  </div>

                  {editingStrategy ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={strategyDraft}
                        onChange={(e) => setStrategyDraft(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-[#0B1F3A] bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingStrategy(false)}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveStrategy}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold"
                        >
                          Simpan Strategi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#0B1F3A] leading-relaxed">
                      {activeCampaign.strategyAngle}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeStage.id === 'publikasi_medsos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Jadwal & Status Konten Media Sosial</span>
                  <span className="tabular-nums font-semibold text-[#0B1F3A]">
                    {
                      activeCampaign.publications.filter(
                        (p) => p.status === 'Tayang',
                      ).length
                    }
                    /{activeCampaign.publications.length} Tayang
                  </span>
                </div>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {activeCampaign.publications.map((pub) => (
                    <div
                      key={pub.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-semibold text-[#0B1F3A]">
                          {pub.contentTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          {pub.kolName} · {pub.platform} · {pub.scheduledDate}
                          {pub.status === 'Tayang' &&
                            ` · ${pub.views} views (${pub.engagement} ER)`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onCyclePublicationStatus(activeCampaign.id, pub.id)
                        }
                        title="Ketuk untuk mengubah status publikasi"
                        className={`min-h-[36px] px-3 py-1 rounded-lg text-[11px] font-semibold border whitespace-nowrap shrink-0 inline-flex items-center gap-1 transition-colors ${
                          pub.status === 'Tayang'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : pub.status === 'Revisi Konten'
                              ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                              : 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD] hover:bg-[#BAE6FD]/60'
                        }`}
                      >
                        <Share2 className="w-3 h-3" />
                        {pub.status}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Ketuk status konten untuk mengganti antara Terjadwal, Tayang, dan Revisi Konten.
                </p>
              </div>
            )}

            {activeStage.id === 'evaluasi_laporan' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeCampaign.verdictSummary}
                </p>
                <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 p-3 text-center tabular-nums">
                  <div>
                    <div className="text-[11px] text-slate-500">Penjualan</div>
                    <div
                      className={`text-sm font-bold mt-0.5 ${
                        activeCampaign.salesDeltaPct < 0
                          ? 'text-rose-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {activeCampaign.salesLiftLabel}
                    </div>
                  </div>
                  <div className="border-x border-slate-200">
                    <div className="text-[11px] text-slate-500">Penayangan</div>
                    <div className="text-sm font-bold text-[#0B1F3A] mt-0.5">
                      {activeCampaign.actualViews}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Konversi</div>
                    <div className="text-sm font-bold text-[#0B1F3A] mt-0.5">
                      {activeCampaign.actualConversionRate}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pilihan Hasil Evaluasi Promosi & Tindak Lanjut (Always accessible on Kampanye) */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-display font-bold text-[#0B1F3A]">
                Keputusan Hasil Evaluasi Promosi
              </h3>
              <p className="text-xs text-slate-500">
                Tentukan apakah strategi promosi berhasil dipertahankan atau perlu revisi.
              </p>
            </div>

            {/* Segmented Choice: Berhasil vs Perlu Revisi */}
            <div
              role="radiogroup"
              aria-label="Hasil evaluasi promosi"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <button
                type="button"
                role="radio"
                aria-checked={activeCampaign.verdict === 'berhasil'}
                onClick={() =>
                  onSetEvaluationVerdict(activeCampaign.id, 'berhasil')
                }
                className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  activeCampaign.verdict === 'berhasil'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    activeCampaign.verdict === 'berhasil'
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-display font-bold">
                    Berhasil · Pertahankan Strategi
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Target penjualan & KPI tercapai, lanjutkan pola kolaborasi KOL.
                  </div>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={activeCampaign.verdict === 'revisi'}
                onClick={() => onSetEvaluationVerdict(activeCampaign.id, 'revisi')}
                className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  activeCampaign.verdict === 'revisi'
                    ? 'bg-rose-50 border-rose-600 text-rose-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    activeCampaign.verdict === 'revisi'
                      ? 'text-rose-700'
                      : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-display font-bold">
                    Perlu Revisi · Belum Berhasil
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Aktifkan daftar tindak lanjut & perbarui strategi promosi.
                  </div>
                </div>
              </button>
            </div>

            {/* Tindak Lanjut Apabila Strategi Belum Berhasil */}
            {activeCampaign.verdict === 'revisi' && (
              <div className="rounded-xl bg-[#F8FAFC] border border-rose-200 p-4 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-display font-bold text-rose-950">
                      Rencana Tindak Lanjut Revisi Strategi
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Tandai langkah perbaikan sebelum kembali ke tahap Strategi Promosi.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-rose-800 tabular-nums">
                    Putaran #{Math.max(1, activeCampaign.revisionRound)}
                  </span>
                </div>

                {/* Follow-up Action Checklist */}
                <div className="space-y-2">
                  {activeCampaign.revisionActions.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() =>
                        onToggleRevisionAction(activeCampaign.id, act.id)
                      }
                      className="w-full min-h-[44px] text-left rounded-xl bg-white border border-slate-200 px-3 py-2.5 flex items-start gap-3 hover:border-[#38BDF8] transition-colors"
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 ${
                          act.done
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {act.done && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-medium ${
                            act.done
                              ? 'line-through text-slate-400'
                              : 'text-[#0B1F3A]'
                          }`}
                        >
                          {act.label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          PIC: {act.owner}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Add New Follow-Up Action */}
                <form
                  onSubmit={handleAddFollowUp}
                  className="flex flex-col sm:flex-row gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={newRevisionText}
                    onChange={(e) => setNewRevisionText(e.target.value)}
                    placeholder="Tambah langkah tindak lanjut baru..."
                    aria-label="Tambah langkah tindak lanjut"
                    className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                  />
                  <input
                    type="text"
                    value={newRevisionOwner}
                    onChange={(e) => setNewRevisionOwner(e.target.value)}
                    placeholder="PIC"
                    aria-label="Penanggung jawab"
                    className="sm:w-36 min-h-[42px] px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0B1F3A] focus:outline-none focus:border-[#0284C7]"
                  />
                  <button
                    type="submit"
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0B1F3A] text-xs font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                </form>

                {/* Primary Flow CTA: Return to Strategy Stage */}
                <button
                  type="button"
                  onClick={handleTriggerRevision}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#14335C] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Terapkan Revisi & Kembali ke Tahap Strategi
                </button>
              </div>
            )}

            {/* When Berhasil is Selected */}
            {activeCampaign.verdict === 'berhasil' && (
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-display font-bold text-emerald-950">
                    Strategi Dipertahankan
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Hasil promosi memenuhi target. Dokumentasi laporan siap dibagikan ke
                    manajemen PR & Marketing Wardah.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                >
                  Buka Laporan Hasil
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal Ringkasan Laporan Hasil Promosi */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 bg-[#0B1F3A]/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Laporan Hasil Promosi"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 p-5 max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#0284C7]">
                  Laporan Evaluasi PR/Marketing Wardah
                </div>
                <h3 className="text-base font-display font-bold text-[#0B1F3A] mt-0.5">
                  {activeCampaign.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                aria-label="Tutup laporan"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Lini Produk</span>
                <span className="font-semibold text-[#0B1F3A]">
                  {activeCampaign.productLine}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode & Anggaran</span>
                <span className="font-semibold text-[#0B1F3A] tabular-nums">
                  {activeCampaign.period} · {activeCampaign.budgetIdr}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Realisasi Penjualan</span>
                <span className="font-semibold text-[#0B1F3A] tabular-nums">
                  {activeCampaign.currentSalesUnits.toLocaleString('id-ID')} /{' '}
                  {activeCampaign.targetSalesUnits.toLocaleString('id-ID')} unit (
                  {activeCampaign.salesLiftLabel})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Keputusan Evaluasi</span>
                <span className="font-semibold text-[#0B1F3A]">
                  {activeCampaign.verdict === 'berhasil'
                    ? 'Berhasil — Strategi Dipertahankan'
                    : activeCampaign.verdict === 'revisi'
                      ? 'Perlu Revisi Strategi'
                      : 'Dalam Tahap Publikasi'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#0B1F3A]">
                Ringkasan Analisis Tim
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeCampaign.verdictSummary}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#0B1F3A]">
                KOL Terlibat ({assignedKols.length})
              </div>
              <p className="text-xs text-slate-600">
                {assignedKols.length > 0
                  ? assignedKols.map((k) => `${k.name} (${k.primaryPlatform})`).join(', ')
                  : 'Belum ada KOL terpilih.'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50 inline-flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#14335C]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
