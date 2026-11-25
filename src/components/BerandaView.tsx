import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Megaphone,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Campaign, CampaignStageId, KolProfile, TabKey } from '../types/kol';
import { SalesTrendChart } from './SalesTrendChart';

interface BerandaViewProps {
  campaigns: Campaign[];
  activeCampaign: Campaign;
  kols: KolProfile[];
  onSelectCampaign: (campaignId: string) => void;
  onNavigateTab: (tab: TabKey, focusStage?: CampaignStageId) => void;
}

export function BerandaView({
  campaigns,
  activeCampaign,
  kols,
  onSelectCampaign,
  onNavigateTab,
}: BerandaViewProps) {
  const [trendMode, setTrendMode] = useState<'weekly' | 'monthly'>('weekly');

  const assignedKols = kols.filter((k) =>
    k.assignedCampaignIds.includes(activeCampaign.id),
  );
  const selectedKolsCount = assignedKols.filter(
    (k) => k.selectionStatus === 'Terpilih',
  ).length;

  const targetAchievementPct = Math.round(
    (activeCampaign.currentSalesUnits / Math.max(1, activeCampaign.targetSalesUnits)) * 100,
  );

  const completedStages = activeCampaign.stages.filter((s) => s.status === 'selesai').length;
  const activeStage =
    activeCampaign.stages.find((s) => s.status === 'revisi' || s.status === 'berjalan') ||
    activeCampaign.stages[activeCampaign.stages.length - 1];

  const isSalesDropping = activeCampaign.salesDeltaPct < 0;

  // 7-Step Flowchart Mapping based on live campaign state
  const flowchartSteps: Array<{
    step: number;
    title: string;
    detail: string;
    stateLabel: string;
    stateTone: 'done' | 'active' | 'alert' | 'neutral';
    targetTab: TabKey;
    focusStage?: CampaignStageId;
  }> = [
    {
      step: 1,
      title: 'Monitoring Data Penjualan',
      detail: `${activeCampaign.currentSalesUnits.toLocaleString('id-ID')} / ${activeCampaign.targetSalesUnits.toLocaleString('id-ID')} unit (${activeCampaign.salesDeltaPct > 0 ? '+' : ''}${activeCampaign.salesDeltaPct.toFixed(1).replace('.', ',')}% vs target)`,
      stateLabel: isSalesDropping ? 'Penurunan Terdeteksi' : 'Sesuai Target',
      stateTone: isSalesDropping ? 'alert' : 'done',
      targetTab: 'kampanye',
      focusStage: 'monitoring_promosi',
    },
    {
      step: 2,
      title: 'Monitoring Promosi',
      detail: activeCampaign.salesTriggerActive
        ? 'Diaktifkan karena penjualan turun · Audit CTR & konversi berjalan'
        : 'Monitoring rutin performa konten & jangkauan berjalan normal',
      stateLabel:
        activeCampaign.stages[0].status === 'selesai' ? 'Selesai' : 'Berjalan',
      stateTone: activeCampaign.stages[0].status === 'selesai' ? 'done' : 'active',
      targetTab: 'kampanye',
      focusStage: 'monitoring_promosi',
    },
    {
      step: 3,
      title: 'Pemilihan KOL',
      detail: `${selectedKolsCount} KOL terpilih dari ${assignedKols.length} kandidat untuk ${activeCampaign.productLine}`,
      stateLabel:
        activeCampaign.stages[1].status === 'selesai' ? 'Selesai' : 'Berjalan',
      stateTone: activeCampaign.stages[1].status === 'selesai' ? 'done' : 'active',
      targetTab: 'kol',
    },
    {
      step: 4,
      title: 'Penyusunan Strategi Promosi',
      detail: activeCampaign.strategyAngle,
      stateLabel:
        activeCampaign.stages[2].status === 'revisi'
          ? 'Revisi Strategi'
          : activeCampaign.stages[2].status === 'selesai'
            ? 'Selesai'
            : 'Berjalan',
      stateTone:
        activeCampaign.stages[2].status === 'revisi'
          ? 'alert'
          : activeCampaign.stages[2].status === 'selesai'
            ? 'done'
            : 'active',
      targetTab: 'kampanye',
      focusStage: 'strategi_promosi',
    },
    {
      step: 5,
      title: 'Publikasi Konten Media Sosial',
      detail: `${activeCampaign.publications.filter((p) => p.status === 'Tayang').length} dari ${activeCampaign.publications.length} konten sudah tayang`,
      stateLabel:
        activeCampaign.stages[3].status === 'selesai' ? 'Selesai' : 'Berjalan',
      stateTone: activeCampaign.stages[3].status === 'selesai' ? 'done' : 'active',
      targetTab: 'kampanye',
      focusStage: 'publikasi_medsos',
    },
    {
      step: 6,
      title: 'Evaluasi & Laporan Hasil Promosi',
      detail: `Penayangan ${activeCampaign.actualViews} · Konversi ${activeCampaign.actualConversionRate}`,
      stateLabel:
        activeCampaign.verdict === 'berhasil'
          ? 'Berhasil'
          : activeCampaign.verdict === 'revisi'
            ? 'Belum Berhasil'
            : 'Menunggu',
      stateTone:
        activeCampaign.verdict === 'berhasil'
          ? 'done'
          : activeCampaign.verdict === 'revisi'
            ? 'alert'
            : 'neutral',
      targetTab: 'kampanye',
      focusStage: 'evaluasi_laporan',
    },
    {
      step: 7,
      title: 'Keputusan Strategi',
      detail:
        activeCampaign.verdict === 'berhasil'
          ? 'Strategi dipertahankan untuk periode kampanye berikutnya'
          : activeCampaign.verdict === 'revisi'
            ? `Revisi strategi putaran ke-${Math.max(1, activeCampaign.revisionRound)} (${activeCampaign.revisionActions.filter((a) => !a.done).length} tindak lanjut tersisa)`
            : 'Menunggu hasil evaluasi akhir publikasi konten',
      stateLabel:
        activeCampaign.verdict === 'berhasil'
          ? 'Pertahankan'
          : activeCampaign.verdict === 'revisi'
            ? 'Revisi Strategi'
            : 'Menunggu',
      stateTone:
        activeCampaign.verdict === 'berhasil'
          ? 'done'
          : activeCampaign.verdict === 'revisi'
            ? 'alert'
            : 'neutral',
      targetTab: 'kampanye',
      focusStage: 'evaluasi_laporan',
    },
  ];

  const toneBadgeClass = (tone: 'done' | 'active' | 'alert' | 'neutral') => {
    switch (tone) {
      case 'done':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'alert':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'active':
        return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Selector Strip */}
      <section aria-label="Pilih Kampanye Produk" className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold text-slate-500 tracking-wide">
            Fokus Lini Produk & Kampanye
          </h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {campaigns.length} Kampanye Aktif
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {campaigns.map((camp) => {
            const isSelected = camp.id === activeCampaign.id;
            return (
              <button
                key={camp.id}
                type="button"
                onClick={() => onSelectCampaign(camp.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-left transition-colors whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#38BDF8] hover:bg-[#F0F9FF]'
                }`}
              >
                <div className="text-xs font-semibold leading-tight">{camp.name}</div>
                <div
                  className={`text-[11px] mt-0.5 tabular-nums ${
                    isSelected ? 'text-sky-200' : 'text-slate-500'
                  }`}
                >
                  {camp.salesStatusLabel} ({camp.salesDeltaPct > 0 ? '+' : ''}
                  {camp.salesDeltaPct.toFixed(1).replace('.', ',')}%)
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sales Drop Alert Banner (when sales decline triggers promotion monitoring) */}
      {isSalesDropping && (
        <section
          aria-label="Peringatan Penurunan Penjualan"
          className="rounded-2xl bg-rose-50/90 border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-950">
                Penjualan {activeCampaign.productLine} menurun{' '}
                <span className="tabular-nums">
                  {activeCampaign.salesDeltaPct.toFixed(1).replace('.', ',')}%
                </span>{' '}
                di bawah target
              </p>
              <p className="text-xs text-rose-800 leading-relaxed">
                Sesuai alur kerja PR/Marketing Wardah, tim mengaktifkan tahap Monitoring
                Promosi dan Evaluasi Strategi KOL untuk memulihkan konversi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('kampanye', 'evaluasi_laporan')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          >
            Tindak Lanjut
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* Ringkasan Kondisi Penjualan & Status Kampanye */}
      <section
        aria-label="Ringkasan Kondisi Penjualan dan Kampanye"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
      >
        {/* Card 1: Kondisi Penjualan */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Kondisi Penjualan</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                isSalesDropping
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isSalesDropping ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              {activeCampaign.salesStatusLabel}
            </span>
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-[#0B1F3A] tabular-nums">
              {activeCampaign.currentSalesUnits.toLocaleString('id-ID')}{' '}
              <span className="text-sm font-normal text-slate-500">unit</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 tabular-nums">
              <span>Target {activeCampaign.targetSalesUnits.toLocaleString('id-ID')}</span>
              <span aria-hidden="true">·</span>
              <span>Omzet {activeCampaign.revenueIdr}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
              <span>Pencapaian Target</span>
              <span className="font-semibold text-[#0B1F3A]">{targetAchievementPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isSalesDropping ? 'bg-rose-500' : 'bg-[#0284C7]'
                }`}
                style={{ width: `${Math.min(100, targetAchievementPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Status Kampanye */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Status Kampanye</span>
            <Megaphone className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div>
            <div className="text-base font-display font-bold text-[#0B1F3A] leading-snug">
              {activeStage.title}
            </div>
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{activeStage.summary}</p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 tabular-nums">
              {completedStages}/5 tahap selesai
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('kampanye', activeStage.id)}
              className="text-[#0284C7] hover:text-[#0B1F3A] font-semibold inline-flex items-center gap-1"
            >
              Pantau
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Alokasi KOL */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">KOL Terlibat</span>
            <Users className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-[#0B1F3A] tabular-nums">
              {selectedKolsCount}{' '}
              <span className="text-sm font-normal text-slate-500">KOL terpilih</span>
            </div>
            <div className="mt-1 text-xs text-slate-500 tabular-nums">
              Views {activeCampaign.actualViews} · Konversi {activeCampaign.actualConversionRate}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Anggaran {activeCampaign.budgetIdr}</span>
            <button
              type="button"
              onClick={() => onNavigateTab('kol')}
              className="text-[#0284C7] hover:text-[#0B1F3A] font-semibold inline-flex items-center gap-1"
            >
              Kelola KOL
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Desktop 2-Column Split: Sales Trend Chart + Evaluation / Revision Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Grafik Tren Penjualan */}
        <section
          aria-label="Grafik Tren Penjualan"
          className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-display font-bold text-[#0B1F3A]">
                Grafik Tren Penjualan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeCampaign.productLine} · {activeCampaign.period}
              </p>
            </div>
            <div
              role="group"
              aria-label="Rentang waktu grafik"
              className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200"
            >
              <button
                type="button"
                onClick={() => setTrendMode('weekly')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  trendMode === 'weekly'
                    ? 'bg-white text-[#0B1F3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Mingguan
              </button>
              <button
                type="button"
                onClick={() => setTrendMode('monthly')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  trendMode === 'monthly'
                    ? 'bg-white text-[#0B1F3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>

          <SalesTrendChart
            data={
              trendMode === 'weekly'
                ? activeCampaign.weeklyTrend
                : activeCampaign.monthlyTrend
            }
            periodLabel={trendMode === 'weekly' ? 'Minggu' : 'Bulan'}
          />
        </section>

        {/* Informasi Evaluasi atau Revisi Strategi */}
        <section
          aria-label="Informasi Evaluasi dan Revisi Strategi"
          className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col justify-between gap-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-display font-bold text-[#0B1F3A]">
                Evaluasi & Keputusan Strategi
              </h2>
              {activeCampaign.verdict === 'berhasil' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Berhasil
                </span>
              ) : activeCampaign.verdict === 'revisi' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Perlu Revisi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Proses Publikasi
                </span>
              )}
            </div>

            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3.5 space-y-2">
              <div className="text-xs font-semibold text-[#0B1F3A]">
                {activeCampaign.verdict === 'berhasil'
                  ? 'Rekomendasi: Pertahankan Strategi'
                  : activeCampaign.verdict === 'revisi'
                    ? `Rekomendasi: Revisi Strategi (Putaran ke-${Math.max(1, activeCampaign.revisionRound)})`
                    : 'Rekomendasi: Lanjutkan Monitoring Publikasi'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeCampaign.verdictSummary}
              </p>
            </div>

            {activeCampaign.verdict === 'revisi' &&
              activeCampaign.revisionActions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Prioritas Tindak Lanjut:
                  </div>
                  <ul className="space-y-1.5">
                    {activeCampaign.revisionActions.slice(0, 3).map((act) => (
                      <li
                        key={act.id}
                        className="flex items-start gap-2 text-xs text-slate-600"
                      >
                        <span
                          className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            act.done ? 'bg-emerald-600' : 'bg-[#0284C7]'
                          }`}
                        />
                        <span className={act.done ? 'line-through text-slate-400' : ''}>
                          {act.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('kampanye', 'evaluasi_laporan')}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#14335C] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            {activeCampaign.verdict === 'revisi'
              ? 'Buka Tindak Lanjut Revisi'
              : 'Lihat Evaluasi & Laporan Lengkap'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>

      {/* Tahapan Alur Pengelolaan KOL (Flowchart Interactive Tracker) */}
      <section
        aria-label="Alur Pengelolaan KOL Wardah"
        className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-display font-bold text-[#0B1F3A]">
              Alur Kerja Pengelolaan KOL
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ketuk tahapan untuk membuka detail operasional terkait
            </p>
          </div>
          <span className="text-xs font-medium text-[#0369A1]">
            Standar Operasional Tim PR/Marketing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {flowchartSteps.map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => onNavigateTab(item.targetTab, item.focusStage)}
              className="group text-left rounded-xl border border-slate-200 hover:border-[#38BDF8] bg-[#F8FAFC] hover:bg-[#F0F9FF]/60 p-3.5 flex flex-col justify-between gap-2.5 transition-colors min-h-[108px]"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-xs font-mono font-semibold text-[#0284C7] tabular-nums">
                  0{item.step}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${toneBadgeClass(
                    item.stateTone,
                  )}`}
                >
                  {item.stateLabel}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-display font-semibold text-[#0B1F3A] group-hover:text-[#0284C7] transition-colors">
                  {item.title}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
