// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface ApiError {
    detail: string;
    code?: string;
    field?: string;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export interface RefreshRequest {
    refresh_token: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface AuthResponse {
    user: UserResponse;
    tokens: AuthTokens;
}

// ============================================================================
// User Types
// ============================================================================

export interface UserResponse {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserUpdateRequest {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
}

// ============================================================================
// Organization Types
// ============================================================================

export interface OrganizationResponse {
    id: string;
    name: string;
    description: string | null;
    is_personal: boolean;
    holding_id: string | null;
    holding_name: string | null;
    distributor_id: string | null;
    distributor_name: string | null;
    member_count: number;
    created_by: UserResponse | null;
    created_at: string;
    updated_at: string;
}

export interface OrganizationCreateRequest {
    name: string;
    description?: string;
    holding_id?: string;
    distributor_id?: string;
    member_ids?: string[];
}

export interface OrganizationUpdateRequest {
    name?: string;
    description?: string;
}

// ============================================================================
// Member Types
// ============================================================================

export type MemberRole = 'admin' | 'member' | 'reader';

export interface MemberResponse {
    id: string;
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    role: MemberRole;
    added_at: string;
    added_by: UserResponse | null;
}

export interface AddMemberItem {
    email: string;
    role: MemberRole;
}

export interface AddMembersRequest {
    members: AddMemberItem[];
}

export interface UpdateMemberRoleRequest {
    role: MemberRole;
}

// ============================================================================
// Team Types
// ============================================================================

export interface TeamResponse {
    id: string;
    name: string;
    description: string | null;
    member_count: number;
    members: MemberResponse[];
    created_by: UserResponse | null;
    created_at: string;
    updated_at: string;
}

export interface TeamCreateRequest {
    name: string;
    description?: string;
    member_ids?: string[];
}

export interface TeamUpdateRequest {
    name?: string;
    description?: string;
}

export interface TeamAddMembersRequest {
    user_ids: string[];
}

// ============================================================================
// Folder Types
// ============================================================================

export interface FolderResponse {
    id: string;
    name: string;
    path: string;
    parent_id: string | null;
    files_count: number;
    folders_count: number;
    created_by: UserResponse | null;
    created_at: string;
    updated_at: string;
}

export interface FolderContentsResponse {
    folder: FolderResponse;
    subfolders: FolderResponse[];
    files: FileResponse[];
}

export interface FolderCreateRequest {
    name: string;
    parent_id?: string;
}

export interface FolderRenameRequest {
    name: string;
}

export interface FolderMoveRequest {
    target_folder_id: string | null;
}

// ============================================================================
// File Types
// ============================================================================

export type FileType = 'pdf' | 'doc' | 'xls' | 'img' | 'txt' | 'other';

export interface FileResponse {
    id: string;
    name: string;
    original_name: string;
    extension: string;
    mime_type: string;
    size: number;
    file_type: FileType;
    folder_id: string | null;
    created_by: UserResponse | null;
    created_at: string;
    updated_at: string;
}

export interface FileRenameRequest {
    name: string;
}

export interface FileMoveRequest {
    target_folder_id: string | null;
}

// ============================================================================
// Trash Types
// ============================================================================

export interface TrashFolderResponse extends FolderResponse {
    deleted_at: string;
    original_path: string;
}

export interface TrashFileResponse extends FileResponse {
    deleted_at: string;
    original_path: string;
}

export interface TrashResponse {
    folders: TrashFolderResponse[];
    files: TrashFileResponse[];
}

export interface EmptyTrashResponse {
    success: boolean;
    deleted_count: number;
}

// ============================================================================
// Agent Types
// ============================================================================

export type AgentStatus = 'active' | 'inactive' | 'error';

export interface AgentResponse {
    id: string;
    name: string;
    reference: string;
    version: string;
    description: string | null;
    status: AgentStatus;
    config: Record<string, unknown>;
    shared_with: string[];
    share_with_children: boolean;
    created_by: UserResponse | null;
    created_at: string;
    updated_at: string;
}

export interface AgentCreateRequest {
    name: string;
    reference: string;
    description?: string;
    status?: AgentStatus;
    config?: Record<string, unknown>;
    shared_with?: string[];
    share_with_children?: boolean;
}

export interface AgentUpdateRequest {
    name?: string;
    description?: string;
    status?: AgentStatus;
    config?: Record<string, unknown>;
}

// ============================================================================
// Flow Types
// ============================================================================

export type FlowStatus = 'active' | 'inactive' | 'error';

export interface FlowNodePort {
    id: string;
    label: string;
}

export interface FlowNodeIcon {
    icon: string;
    rotate?: number;
}

export interface FlowNode {
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    color: string;
    icon: FlowNodeIcon;
    inputs: FlowNodePort[];
    outputs: FlowNodePort[];
    entries: FlowNodePort[];
    exits: FlowNodePort[];
    configured: boolean;
    config: Record<string, unknown>;
}

export interface FlowLinkEndpoint {
    nodeId: string;
    portIndex: number;
    kind: 'in' | 'out' | 'entry' | 'exit';
}

export interface FlowLink {
    id: string;
    src: FlowLinkEndpoint;
    dst: FlowLinkEndpoint;
    relation: 'io' | 'entry-exit';
    map?: Record<string, unknown>;
}

export interface FlowViewport {
    x: number;
    y: number;
    scale: number;
}

export interface FlowData {
    nodes: FlowNode[];
    links: FlowLink[];
    viewport: FlowViewport;
}

export interface FlowResponse {
    id: string;
    name: string;
    reference: string | null;
    version: string;
    description: string | null;
    status: FlowStatus;
    is_template: boolean;
    flow_data: FlowData;
    shared_with: string[];
    share_with_children: boolean;
    created_by: UserResponse | null;
    created_at: string;
    updated_at: string;
}

export interface FlowCreateRequest {
    name: string;
    reference?: string;
    description?: string;
    status?: FlowStatus;
    is_template?: boolean;
    flow_data?: FlowData;
    shared_with?: string[];
    share_with_children?: boolean;
}

export interface FlowUpdateRequest {
    name?: string;
    description?: string;
    status?: FlowStatus;
    flow_data?: FlowData;
}

export interface FlowImportRequest {
    flow_json: Record<string, unknown>;
}

export interface FlowExportResponse {
    flow_json: Record<string, unknown>;
}

export interface FlowExecuteRequest {
    input_data?: Record<string, unknown>;
}

// ============================================================================
// Flow Execution Types
// ============================================================================

export type FlowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface FlowExecutionResponse {
    id: string;
    flow_id: string;
    status: FlowExecutionStatus;
    trigger_type: 'manual' | 'scheduled' | 'webhook';
    triggered_by: UserResponse | null;
    started_at: string | null;
    completed_at: string | null;
    error: string | null;
    execution_data: Record<string, unknown>;
    created_at: string;
}

// ============================================================================
// Common Types
// ============================================================================

export interface SuccessResponse {
    success: boolean;
}
