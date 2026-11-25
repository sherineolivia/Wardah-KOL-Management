import { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Plus,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import {
  Campaign,
  KolCategory,
  KolProfile,
  KolSelectionStatus,
  SocialPlatform,
  TabKey,
} from '../types/kol';
import { KolAvatar } from './KolAvatar';

interface DataKolViewProps {
  kols: KolProfile[];
  campaigns: Campaign[];
  activeCampaignId: string;
  onUpdateKolStatus: (kolId: string, status: KolSelectionStatus) => void;
  onToggleKolCampaign: (kolId: string, campaignId: string) => void;
  onAddKol: (newKol: Omit<KolProfile, 'id' | 'initials'>) => void;
  onInspectCampaign: (campaignId: string, tab: TabKey) => void;
}

const CATEGORIES: Array<'Semua' | KolCategory> = [
  'Semua',
  'Beauty',
  'Lifestyle',
  'Skincare',
];

const PLATFORMS: Array<'Semua' | SocialPlatform> = [
  'Semua',
  'Instagram',
  'TikTok',
  'YouTube',
];

export function DataKolView({
  kols,
  campaigns,
  activeCampaignId,
  onUpdateKolStatus,
  onToggleKolCampaign,
  onAddKol,
  onInspectCampaign,
}: DataKolViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | KolCategory>('Semua');
  const [selectedPlatform, setSelectedPlatform] = useState<'Semua' | SocialPlatform>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | KolSelectionStatus>('Semua');
  const [detailKolId, setDetailKolId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for Tambah KOL
  const [formName, setFormName] = useState('');
  const [formHandle, setFormHandle] = useState('');
  const [formCategory, setFormCategory] = useState<KolCategory>('Beauty');
  const [formPlatform, setFormPlatform] = useState<SocialPlatform>('TikTok');
  const [formFollowers, setFormFollowers] = useState('');
  const [formEr, setFormEr] = useState('4,5%');
  const [formCity, setFormCity] = useState('Jakarta');
  const [formAudience, setFormAudience] = useState('');
  const [assignToActive, setAssignToActive] = useState(true);

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  const filteredKols = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return kols.filter((kol) => {
      if (selectedCategory !== 'Semua' && kol.category !== selectedCategory) {
        return false;
      }
      if (
        selectedPlatform !== 'Semua' &&
        !kol.platforms.includes(selectedPlatform)
      ) {
        return false;
      }
      if (statusFilter !== 'Semua' && kol.selectionStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;

      const linkedCampaignNames = campaigns
        .filter((c) => kol.assignedCampaignIds.includes(c.id))
        .map((c) => c.name.toLowerCase())
        .join(' ');

      return (
        kol.name.toLowerCase().includes(q) ||
        kol.handle.toLowerCase().includes(q) ||
        kol.city.toLowerCase().includes(q) ||
        kol.category.toLowerCase().includes(q) ||
        linkedCampaignNames.includes(q)
      );
    });
  }, [kols, searchQuery, selectedCategory, selectedPlatform, statusFilter, campaigns]);

  const detailKol = kols.find((k) => k.id === detailKolId) || null;

  const statusBadgeStyle = (status: KolSelectionStatus) => {
    switch (status) {
      case 'Terpilih':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Revisi Brief':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
    }
  };

  const handleCreateKol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formHandle.trim()) return;

    const normalizedHandle = formHandle.trim().startsWith('@')
      ? formHandle.trim()
      : `@${formHandle.trim()}`;

    onAddKol({
      name: formName.trim(),
      handle: normalizedHandle,
      category: formCategory,
      primaryPlatform: formPlatform,
      platforms: [formPlatform],
      followers: formFollowers.trim() || '120K',
      engagementRate: formEr.trim() || '4,5%',
      avgViews: '65K',
      city: formCity.trim() || 'Jakarta',
      audienceFit:
        formAudience.trim() ||
        `Audiens kategori ${formCategory} aktif di ${formPlatform}`,
      deliverableSummary: `1 ${formPlatform} Review + 2 Story`,
      selectionStatus: assignToActive ? 'Terpilih' : 'Kandidat',
      assignedCampaignIds: assignToActive ? [activeCampaign.id] : [],
    });

    setFormName('');
    setFormHandle('');
    setFormFollowers('');
    setFormAudience('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header & Search Bar */}
      <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-display font-bold text-[#0B1F3A]">
              Manajemen Data KOL
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {kols.filter((k) => k.selectionStatus === 'Terpilih').length} KOL terpilih ·{' '}
              {kols.length} total profil terdaftar
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#14335C] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah KOL
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama KOL, @username, kota, atau nama kampanye..."
            aria-label="Cari KOL"
            className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-[#0B1F3A] placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs + Platform/Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Kategori KOL"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-white text-[#0B1F3A] shadow-xs'
                      : 'text-slate-600 hover:text-[#0B1F3A]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter platform media sosial"
              value={selectedPlatform}
              onChange={(e) =>
                setSelectedPlatform(e.target.value as 'Semua' | SocialPlatform)
              }
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0284C7]"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p === 'Semua' ? 'Semua Platform' : p}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter status pemilihan KOL"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'Semua' | KolSelectionStatus)
              }
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0284C7]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terpilih">Terpilih</option>
              <option value="Kandidat">Kandidat</option>
              <option value="Revisi Brief">Revisi Brief</option>
            </select>
          </div>
        </div>
      </section>

      {/* Active Campaign Quick Context */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600">
        <span>
          Penugasan cepat terhubung ke:{' '}
          <strong className="text-[#0B1F3A]">{activeCampaign.name}</strong>
        </span>
        <span className="tabular-nums text-slate-500">
          Menampilkan {filteredKols.length} dari {kols.length} KOL
        </span>
      </div>

      {/* KOL Roster Grid */}
      {filteredKols.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-[#0B1F3A]">
            Tidak ada KOL yang cocok dengan filter saat ini
          </p>
          <p className="text-xs text-slate-500">
            Coba ubah kata kunci pencarian atau atur ulang kategori filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              setSelectedPlatform('Semua');
              setStatusFilter('Semua');
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E0F2FE] text-[#0B1F3A] text-xs font-semibold hover:bg-[#BAE6FD] transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKols.map((kol) => {
            const linkedCampaigns = campaigns.filter((c) =>
              kol.assignedCampaignIds.includes(c.id),
            );
            const isAssignedToActive = kol.assignedCampaignIds.includes(
              activeCampaign.id,
            );

            return (
              <article
                key={kol.id}
                className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between gap-3.5 hover:border-[#38BDF8] transition-colors"
              >
                {/* Top Row: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <KolAvatar
                      name={kol.name}
                      initials={kol.initials}
                      avatarUrl={kol.avatarUrl}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-display font-bold text-[#0B1F3A] truncate">
                        {kol.name}
                      </h3>
                      <div className="text-xs text-slate-500 truncate">
                        {kol.handle} · {kol.category} · {kol.city}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap shrink-0 ${statusBadgeStyle(
                      kol.selectionStatus,
                    )}`}
                  >
                    {kol.selectionStatus}
                  </span>
                </div>

                {/* Platform & Performance Line (Unboxed clean metadata) */}
                <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 border-y border-slate-100 text-xs">
                  <div className="text-slate-700 font-medium">
                    {kol.platforms.join(' · ')}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 tabular-nums">
                    <span>
                      Followers <strong className="text-[#0B1F3A]">{kol.followers}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      ER <strong className="text-[#0B1F3A]">{kol.engagementRate}</strong>
                    </span>
                  </div>
                </div>

                {/* Campaign Connection Info */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-500">
                    Kampanye Terkait
                  </div>
                  {linkedCampaigns.length > 0 ? (
                    <div className="space-y-1">
                      {linkedCampaigns.map((camp) => (
                        <button
                          key={camp.id}
                          type="button"
                          onClick={() => onInspectCampaign(camp.id, 'kampanye')}
                          className="w-full text-left flex items-center justify-between gap-2 rounded-lg bg-[#F0F9FF]/70 hover:bg-[#E0F2FE] px-2.5 py-1.5 text-xs transition-colors"
                        >
                          <span className="font-medium text-[#0B1F3A] truncate">
                            {camp.name}
                          </span>
                          <span className="text-[11px] text-[#0369A1] whitespace-nowrap shrink-0 inline-flex items-center gap-0.5">
                            {camp.verdict === 'revisi'
                              ? 'Perlu Revisi'
                              : camp.verdict === 'berhasil'
                                ? 'Berhasil'
                                : 'Aktif'}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Belum ditugaskan ke kampanye aktif
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onToggleKolCampaign(kol.id, activeCampaign.id)}
                    className={`min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 border transition-colors ${
                      isAssignedToActive
                        ? 'bg-[#E0F2FE] text-[#0B1F3A] border-[#7DD3FC]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isAssignedToActive ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#0284C7]" />
                        Terpilih di Kampanye Ini
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        Pilih ke Kampanye
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailKolId(kol.id)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#0B1F3A] whitespace-nowrap transition-colors"
                  >
                    Detail
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* KOL Detail Bottom Sheet / Modal */}
      {detailKol && (
        <div
          className="fixed inset-0 z-50 bg-[#0B1F3A]/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Detail ${detailKol.name}`}
          onClick={() => setDetailKolId(null)}
        >
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 p-5 max-h-[88vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <KolAvatar
                  name={detailKol.name}
                  initials={detailKol.initials}
                  avatarUrl={detailKol.avatarUrl}
                  size="lg"
                />
                <div>
                  <h3 className="text-base font-display font-bold text-[#0B1F3A]">
                    {detailKol.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {detailKol.handle} · {detailKol.category} · {detailKol.city}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailKolId(null)}
                aria-label="Tutup detail KOL"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 p-3 text-center tabular-nums">
              <div>
                <div className="text-[11px] text-slate-500">Followers</div>
                <div className="text-sm font-bold text-[#0B1F3A] mt-0.5">
                  {detailKol.followers}
                </div>
              </div>
              <div className="border-x border-slate-200">
                <div className="text-[11px] text-slate-500">Engagement</div>
                <div className="text-sm font-bold text-[#0B1F3A] mt-0.5">
                  {detailKol.engagementRate}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Rata-rata Views</div>
                <div className="text-sm font-bold text-[#0B1F3A] mt-0.5">
                  {detailKol.avgViews}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#0B1F3A]">
                Karakteristik Audiens & Brief
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {detailKol.audienceFit}
              </p>
              <p className="text-xs text-[#0369A1] font-medium">
                Deliverable: {detailKol.deliverableSummary}
              </p>
            </div>

            {/* Status Pemilihan */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#0B1F3A]">
                Ubah Status Pemilihan
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Terpilih', 'Kandidat', 'Revisi Brief'] as KolSelectionStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateKolStatus(detailKol.id, st)}
                      className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        detailKol.selectionStatus === st
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Penugasan Kampanye */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#0B1F3A]">
                Tugaskan ke Kampanye Wardah
              </div>
              <div className="space-y-2">
                {campaigns.map((c) => {
                  const assigned = detailKol.assignedCampaignIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onToggleKolCampaign(detailKol.id, c.id)}
                      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-colors ${
                        assigned
                          ? 'bg-[#F0F9FF] border-[#38BDF8] text-[#0B1F3A]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{c.name}</div>
                        <div className="text-[11px] text-slate-500">{c.productLine}</div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          assigned
                            ? 'bg-[#0284C7] border-[#0284C7] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {assigned && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDetailKolId(null)}
              className="w-full min-h-[44px] rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah KOL Baru */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-[#0B1F3A]/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Tambah KOL Baru"
          onClick={() => setShowAddModal(false)}
        >
          <form
            onSubmit={handleCreateKol}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 p-5 max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#0B1F3A]">
                Tambah Profil KOL
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Tutup form"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap KOL
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Hana Kartika"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={formHandle}
                    onChange={(e) => setFormHandle(e.target.value)}
                    placeholder="@hanakartika"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kota Domisili
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Jakarta"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as KolCategory)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="Beauty">Beauty</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Skincare">Skincare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Platform Utama
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as SocialPlatform)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Followers
                  </label>
                  <input
                    type="text"
                    value={formFollowers}
                    onChange={(e) => setFormFollowers(e.target.value)}
                    placeholder="150K"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Engagement Rate
                  </label>
                  <input
                    type="text"
                    value={formEr}
                    onChange={(e) => setFormEr(e.target.value)}
                    placeholder="4,5%"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Karakteristik Audiens
                </label>
                <input
                  type="text"
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value)}
                  placeholder="Contoh: Gen Z aktif, fokus perawatan kulit berjerawat"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assignToActive}
                  onChange={(e) => setAssignToActive(e.target.checked)}
                  className="w-4 h-4 accent-[#0B1F3A] rounded"
                />
                <span className="text-xs text-slate-700">
                  Langsung pilih untuk kampanye <strong>{activeCampaign.name}</strong>
                </span>
              </label>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 min-h-[44px] rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[44px] rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#14335C]"
              >
                Simpan KOL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
