export type TabKey = 'beranda' | 'kol' | 'kampanye';

export type KolCategory = 'Beauty' | 'Lifestyle' | 'Skincare';

export type SocialPlatform = 'Instagram' | 'TikTok' | 'YouTube';

export type KolSelectionStatus = 'Terpilih' | 'Kandidat' | 'Revisi Brief';

export type StageStatus = 'selesai' | 'berjalan' | 'revisi' | 'menunggu';

export type EvaluationVerdict = 'berhasil' | 'revisi' | 'belum_dievaluasi';

export type CampaignStageId =
  | 'monitoring_promosi'
  | 'pemilihan_kol'
  | 'strategi_promosi'
  | 'publikasi_medsos'
  | 'evaluasi_laporan';

export interface SalesPoint {
  label: string;
  actualUnits: number;
  targetUnits: number;
  revenueMillion: number;
  note?: string;
}

export interface CampaignStage {
  id: CampaignStageId;
  order: number;
  title: string;
  shortTitle: string;
  status: StageStatus;
  summary: string;
  updatedAt: string;
}

export interface PublicationItem {
  id: string;
  kolId: string;
  kolName: string;
  platform: SocialPlatform;
  contentTitle: string;
  scheduledDate: string;
  status: 'Tayang' | 'Terjadwal' | 'Revisi Konten';
  views: string;
  engagement: string;
}

export interface RevisionActionItem {
  id: string;
  label: string;
  owner: string;
  done: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  productLine: string;
  period: string;
  budgetIdr: string;
  salesStatusLabel: 'Menurun' | 'Stabil' | 'Meningkat';
  salesDeltaPct: number;
  salesTriggerActive: boolean;
  currentSalesUnits: number;
  targetSalesUnits: number;
  revenueIdr: string;
  targetAudience: string;
  strategyAngle: string;
  kpiTarget: string;
  actualViews: string;
  actualConversionRate: string;
  salesLiftLabel: string;
  verdict: EvaluationVerdict;
  verdictSummary: string;
  revisionRound: number;
  lastRevisionNote?: string;
  weeklyTrend: SalesPoint[];
  monthlyTrend: SalesPoint[];
  stages: CampaignStage[];
  publications: PublicationItem[];
  revisionActions: RevisionActionItem[];
}

export interface KolProfile {
  id: string;
  name: string;
  handle: string;
  category: KolCategory;
  primaryPlatform: SocialPlatform;
  platforms: SocialPlatform[];
  followers: string;
  engagementRate: string;
  avgViews: string;
  city: string;
  audienceFit: string;
  deliverableSummary: string;
  selectionStatus: KolSelectionStatus;
  assignedCampaignIds: string[];
  avatarUrl?: string;
  initials: string;
}
