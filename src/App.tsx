import { useEffect, useState } from 'react';
import {
  BarChart3,
  LayoutDashboard,
  RotateCcw,
  Users,
} from 'lucide-react';
import { INITIAL_CAMPAIGNS, INITIAL_KOLS } from './data/initialData';
import {
  Campaign,
  CampaignStageId,
  EvaluationVerdict,
  KolProfile,
  KolSelectionStatus,
  StageStatus,
  TabKey,
} from './types/kol';
import { BerandaView } from './components/BerandaView';
import { DataKolView } from './components/DataKolView';
import { KampanyeView } from './components/KampanyeView';

const STORAGE_KEY = 'wardah-kol-management-state-v1';

interface PersistedState {
  campaigns: Campaign[];
  kols: KolProfile[];
  activeCampaignId: string;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (
        Array.isArray(parsed.campaigns) &&
        parsed.campaigns.length > 0 &&
        Array.isArray(parsed.kols) &&
        parsed.kols.length > 0
      ) {
        return {
          campaigns: parsed.campaigns,
          kols: parsed.kols,
          activeCampaignId: parsed.activeCampaignId || parsed.campaigns[0].id,
        };
      }
    }
  } catch {
    // Fallback to clean initial data
  }
  return {
    campaigns: INITIAL_CAMPAIGNS,
    kols: INITIAL_KOLS,
    activeCampaignId: INITIAL_CAMPAIGNS[0].id,
  };
}

export default function App() {
  const [initial] = useState<PersistedState>(() => loadInitialState());
  const [campaigns, setCampaigns] = useState<Campaign[]>(initial.campaigns);
  const [kols, setKols] = useState<KolProfile[]>(initial.kols);
  const [activeCampaignId, setActiveCampaignId] = useState<string>(
    initial.activeCampaignId,
  );
  const [activeTab, setActiveTab] = useState<TabKey>('beranda');
  const [focusedStageId, setFocusedStageId] = useState<CampaignStageId | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        campaigns,
        kols,
        activeCampaignId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [campaigns, kols, activeCampaignId]);

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  const handleNavigateTab = (tab: TabKey, focusStage?: CampaignStageId) => {
    setActiveTab(tab);
    if (focusStage) {
      setFocusedStageId(focusStage);
    } else if (tab !== 'kampanye') {
      setFocusedStageId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectCampaign = (campaignId: string, tab: TabKey) => {
    setActiveCampaignId(campaignId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateKolStatus = (kolId: string, status: KolSelectionStatus) => {
    setKols((prev) =>
      prev.map((k) => (k.id === kolId ? { ...k, selectionStatus: status } : k)),
    );
  };

  const handleToggleKolCampaign = (kolId: string, campaignId: string) => {
    setKols((prev) =>
      prev.map((k) => {
        if (k.id !== kolId) return k;
        const alreadyAssigned = k.assignedCampaignIds.includes(campaignId);
        const nextAssigned = alreadyAssigned
          ? k.assignedCampaignIds.filter((id) => id !== campaignId)
          : [...k.assignedCampaignIds, campaignId];
        return {
          ...k,
          assignedCampaignIds: nextAssigned,
          selectionStatus:
            !alreadyAssigned && k.selectionStatus === 'Kandidat'
              ? 'Terpilih'
              : k.selectionStatus,
        };
      }),
    );
  };

  const handleAddKol = (newKol: Omit<KolProfile, 'id' | 'initials'>) => {
    const parts = newKol.name.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : newKol.name.slice(0, 2).toUpperCase();

    const created: KolProfile = {
      ...newKol,
      id: `kol-${Date.now()}`,
      initials,
    };
    setKols((prev) => [created, ...prev]);
  };

  const handleUpdateStageStatus = (
    campaignId: string,
    stageId: CampaignStageId,
    status: StageStatus,
  ) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          stages: c.stages.map((s) =>
            s.id === stageId ? { ...s, status, updatedAt: 'Baru saja' } : s,
          ),
        };
      }),
    );
  };

  const handleUpdateStrategyNote = (campaignId: string, strategyAngle: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          strategyAngle,
          stages: c.stages.map((s) =>
            s.id === 'strategi_promosi'
              ? {
                  ...s,
                  summary: strategyAngle,
                  updatedAt: 'Baru saja',
                }
              : s,
          ),
        };
      }),
    );
  };

  const handleCyclePublicationStatus = (campaignId: string, pubId: string) => {
    const order: Array<'Terjadwal' | 'Tayang' | 'Revisi Konten'> = [
      'Terjadwal',
      'Tayang',
      'Revisi Konten',
    ];
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          publications: c.publications.map((p) => {
            if (p.id !== pubId) return p;
            const nextStatus = order[(order.indexOf(p.status) + 1) % order.length];
            return {
              ...p,
              status: nextStatus,
              views: nextStatus === 'Tayang' && p.views === '—' ? '145K' : p.views,
              engagement:
                nextStatus === 'Tayang' && p.engagement === '—'
                  ? '4,4%'
                  : p.engagement,
            };
          }),
        };
      }),
    );
  };

  const handleSetEvaluationVerdict = (
    campaignId: string,
    verdict: EvaluationVerdict,
  ) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        const defaultActions =
          verdict === 'revisi' && c.revisionActions.length === 0
            ? [
                {
                  id: `rev-${Date.now()}`,
                  label: 'Perkuat hook 3 detik pertama & tambahkan call-to-action promo',
                  owner: 'Tim Kreatif & KOL',
                  done: false,
                },
              ]
            : c.revisionActions;

        return {
          ...c,
          verdict,
          revisionActions: defaultActions,
          stages: c.stages.map((s) => {
            if (s.id === 'evaluasi_laporan') {
              return {
                ...s,
                status: verdict === 'berhasil' ? 'selesai' : 'revisi',
                updatedAt: 'Baru saja',
              };
            }
            if (s.id === 'strategi_promosi' && verdict === 'revisi') {
              return { ...s, status: 'revisi' };
            }
            return s;
          }),
        };
      }),
    );
  };

  const handleToggleRevisionAction = (campaignId: string, actionId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          revisionActions: c.revisionActions.map((a) =>
            a.id === actionId ? { ...a, done: !a.done } : a,
          ),
        };
      }),
    );
  };

  const handleAddRevisionAction = (
    campaignId: string,
    label: string,
    owner: string,
  ) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          revisionActions: [
            ...c.revisionActions,
            {
              id: `rev-${Date.now()}`,
              label,
              owner,
              done: false,
            },
          ],
        };
      }),
    );
  };

  const handleApplyRevisionRound = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          revisionRound: c.revisionRound + 1,
          stages: c.stages.map((s) => {
            if (s.id === 'strategi_promosi') {
              return {
                ...s,
                status: 'berjalan',
                updatedAt: 'Baru saja',
              };
            }
            if (s.id === 'publikasi_medsos') {
              return {
                ...s,
                status: 'berjalan',
              };
            }
            return s;
          }),
        };
      }),
    );
    setFocusedStageId('strategi_promosi');
  };

  const handleResetDemoData = () => {
    setCampaigns(INITIAL_CAMPAIGNS);
    setKols(INITIAL_KOLS);
    setActiveCampaignId(INITIAL_CAMPAIGNS[0].id);
    setFocusedStageId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const navItems: Array<{
    key: TabKey;
    label: string;
    icon: typeof LayoutDashboard;
  }> = [
    { key: 'beranda', label: 'Beranda', icon: LayoutDashboard },
    { key: 'kol', label: 'Data KOL', icon: Users },
    { key: 'kampanye', label: 'Kampanye', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#0B1F3A] flex flex-col">
      {/* Compact Sticky Top App Bar (within 15% mobile sticky cap combined with bottom nav) */}
      <header className="sticky top-0 z-30 h-13 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => handleNavigateTab('beranda')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
          >
            {/* Geometric Wardah-inspired Drop/Petal Mark */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="28" height="28" rx="8" fill="#0B1F3A" />
              <path
                d="M14 5.5C14 5.5 8.5 11.4 8.5 15.8C8.5 18.8376 10.9624 21.3 14 21.3C17.0376 21.3 19.5 18.8376 19.5 15.8C19.5 11.4 14 5.5 14 5.5Z"
                fill="#38BDF8"
              />
              <path
                d="M14 9.5C14 9.5 11 13 11 15.8C11 17.4569 12.3431 18.8 14 18.8C15.6569 18.8 17 17.4569 17 15.8C17 13 14 9.5 14 9.5Z"
                fill="#E0F2FE"
              />
            </svg>
            <span className="font-display font-bold text-sm sm:text-base tracking-tight text-[#0B1F3A]">
              Wardah KOL Management
            </span>
          </button>

          <button
            type="button"
            onClick={handleResetDemoData}
            title="Kembalikan data contoh awal"
            className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-100 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-24">
        {activeTab === 'beranda' && (
          <BerandaView
            campaigns={campaigns}
            activeCampaign={activeCampaign}
            kols={kols}
            onSelectCampaign={(id) => setActiveCampaignId(id)}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'kol' && (
          <DataKolView
            kols={kols}
            campaigns={campaigns}
            activeCampaignId={activeCampaign.id}
            onUpdateKolStatus={handleUpdateKolStatus}
            onToggleKolCampaign={handleToggleKolCampaign}
            onAddKol={handleAddKol}
            onInspectCampaign={handleInspectCampaign}
          />
        )}

        {activeTab === 'kampanye' && (
          <KampanyeView
            campaigns={campaigns}
            activeCampaign={activeCampaign}
            kols={kols}
            focusedStageId={focusedStageId}
            onSelectCampaign={(id) => setActiveCampaignId(id)}
            onFocusStage={setFocusedStageId}
            onUpdateStageStatus={handleUpdateStageStatus}
            onUpdateStrategyNote={handleUpdateStrategyNote}
            onCyclePublicationStatus={handleCyclePublicationStatus}
            onSetEvaluationVerdict={handleSetEvaluationVerdict}
            onToggleRevisionAction={handleToggleRevisionAction}
            onAddRevisionAction={handleAddRevisionAction}
            onApplyRevisionRound={handleApplyRevisionRound}
            onNavigateTab={handleNavigateTab}
          />
        )}
      </main>

      {/* Consistent Fixed Bottom Navigation Bar (3 Primary Menus: Beranda, Data KOL, Kampanye) */}
      <nav
        aria-label="Navigasi Utama"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-3 h-[60px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigateTab(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-[#0B1F3A]'
                    : 'text-slate-500 hover:text-[#0B1F3A]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 w-10 h-0.5 rounded-full bg-[#0284C7]"
                  />
                )}
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#0284C7]' : 'text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span
                  className={`text-[11px] leading-none whitespace-nowrap ${
                    isActive ? 'font-bold text-[#0B1F3A]' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
