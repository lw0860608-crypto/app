export enum Platform {
    YouTube = 'YouTube',
    TikTok = 'TikTok',
    Bilibili = 'Bilibili',
    Douyin = 'Douyin',
    Xiaohongshu = 'Xiaohongshu',
}

export enum TaskStatus {
    Pending = 'Pending',
    'Pending Approval' = 'Pending Approval',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Scheduled = 'Scheduled',
    Generating = 'Generating',
    Assembling = 'Assembling',
    Uploading = 'Uploading',
    Published = 'Published',
    Failed = 'Failed',
    'Takedown Pending' = 'Takedown Pending',
    'Takedown Complete' = 'Takedown Complete'
}

export enum NodeType {
    Server = 'Server',
    MobileProxy = 'MobileProxy',
    DesktopCompanion = 'DesktopCompanion',
}

export enum ApiType {
    Text = 'Text',
    Image = 'Image',
    Video = 'Video',
    Audio = 'Audio',
    Source = 'Source',
}

export interface Account {
    id: string;
    user_id: string;
    username: string;
    platform: Platform;
    credentials?: any; // Can be OAuth tokens, cookies, etc.
    content_style: string | null;
    is_autonomous: boolean;
    daily_spend_limit: number | null;
    approval_threshold: number | null;
    creative_mandate: string | null;
    daily_post_limit: number | null;
    preferred_post_times: string | null;
    estimated_ecpm_cny: number | null;
    enable_saas_watermark: boolean;
    created_at: string;
}

export interface GenerationTask {
    id: string;
    user_id: string;
    account_id: string;
    prompt: string;
    status: TaskStatus;
    created_at: string;
    scheduled_for: string | null;
    published_at: string | null;
    video_url: string | null;
    estimated_cost: number | null;
    target_node_location: string | null;
    expires_at: string | null;
    variant_of_task_id?: string | null;
    ab_test_group?: string | null;
    takedown_status: 'Pending' | 'Complete' | null;
}

export interface ExecutionNode {
    id: string;
    name: string;
    node_type: NodeType;
    location: string;
    status: 'Online' | 'Offline';
    last_heartbeat: string | null;
    created_at: string;
}

export interface PerformanceMetric {
    id: string;
    task_id: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    fetched_at: string;
}

export interface TaskSubStep {
    id: string;
    task_id: string;
    step_name: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
    started_at: string | null;
    completed_at: string | null;
    details: any;
}

export interface ManagedPlatform {
    id: string;
    platform_name: Platform;
    publisher_script: string;
    is_active: boolean;
    credentials_schema: any;
}

export interface ApiProvider {
    id: string;
    user_id: string;
    system_provider_id: string;
    credentials: any;
    is_active: boolean;
    created_at: string;
}

export interface ApiMarketplaceProvider {
  id: string;
  provider_name: string;
  api_type: ApiType;
  description: string;
  is_core: boolean;
  credentials_schema: any;
  icon_name: string | null;
}


export interface Workflow {
    id: string;
    name: string;
    description: string | null;
    status: 'active' | 'inactive';
    n8n_webhook_url: string;
}

export interface TrendingVideo {
    id: string;
    source_url: string;
    platform: Platform;
    analysis_status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
    analysis_result: any;
    created_at: string;
}

export interface StrategyLog {
    id: string;
    user_id: string;
    account_id: string;
    details: any;
    created_at: string;
    accounts?: { username: string }; // Optional relation join
}

export interface Asset {
    id: string;
    user_id: string;
    file_name: string;
    storage_url: string;
    asset_type: 'video' | 'image' | 'audio';
    size_bytes: number;
    created_at: string;
}

export interface AffiliateRule {
    id: string;
    user_id: string;
    keyword: string;
    affiliate_link: string;
    is_active: boolean;
    created_at: string;
}

export interface SuperAdminUser {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
}