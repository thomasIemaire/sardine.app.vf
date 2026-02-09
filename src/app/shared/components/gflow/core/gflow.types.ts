import { Type } from '@angular/core';

// ============================================================================
// JSON Types
// ============================================================================

export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

// ============================================================================
// Port Types
// ============================================================================

export type PortKind = 'in' | 'out' | 'entry' | 'exit';

export interface GFlowPort {
    name?: string;
    map?: JsonValue;
}

export interface PortRef {
    nodeId: string;
    portIndex: number;
    kind: PortKind;
}

// ============================================================================
// Node Types
// ============================================================================

export type NodeType =
    | 'new'
    | 'start'
    | 'end'
    | 'if'
    | 'switch'
    | 'merge'
    | 'edit'
    | 'agent'
    | 'approval'
    | 'http'
    | 'notification';

export interface NodeIcon {
    icon: string;
    rotate?: number;
}

export interface GFlowNode {
    id: string;
    name: string;
    type: NodeType;
    x: number;
    y: number;
    color: string;
    icon: NodeIcon;
    inputs: GFlowPort[];
    outputs: GFlowPort[];
    entries: GFlowPort[];
    exits: GFlowPort[];
    configured: boolean;
    focused: boolean;
    selected: boolean;
    config: NodeConfig;
    configComponent: Type<unknown> | null;
}

// ============================================================================
// Node Configurations
// ============================================================================

export interface StartConfig {
    triggerType?: 'manual' | 'scheduled' | 'webhook';
}

export interface EndConfig {
    status: 'completed' | 'failed' | 'cancelled';
}

export interface IfConfig {
    condition: string;
    field?: string;
    operator?: 'equals' | 'contains' | 'greater' | 'less';
    value?: string;
}

export interface SwitchCase {
    label: string;
    value: string;
}

export interface SwitchConfig {
    field: string;
    cases: SwitchCase[];
}

export interface MergeConfig {
    mode: 'all' | 'any' | 'first';
    inputs?: { index: number; enabled: boolean }[];
}

export interface EditOperation {
    type: 'set' | 'delete' | 'rename';
    path: string;
    value?: string;
    newPath?: string;
}

export interface EditConfig {
    operations: EditOperation[];
}

export interface AgentConfig {
    agentId: string;
    agentName: string;
    version: string;
}

export interface ApprovalOption {
    label: string;
    value: string;
    color?: string;
}

export interface ApprovalConfig {
    title: string;
    message: string;
    options: ApprovalOption[];
    assigneeType: 'user' | 'team' | 'role';
    assigneeId: string;
    assigneeName: string;
    timeout?: number;
    timeoutAction?: 'approve' | 'reject' | 'skip';
}

export interface HttpHeader {
    key: string;
    value: string;
}

export interface HttpConfig {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    headers: HttpHeader[];
    body?: string;
    bodyType: 'none' | 'json' | 'form' | 'raw';
    timeout: number;
    retries: number;
    outputPath?: string;
}

export type NotificationChannel = 'app' | 'email' | 'sms';
export type NotificationTargetType = 'user' | 'team' | 'organization' | 'role';

export interface NotificationTarget {
    type: NotificationTargetType;
    id: string;
    name: string;
}

export interface NotificationConfig {
    title: string;
    message: string;
    channel: NotificationChannel;
    targets: NotificationTarget[];
    priority: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
    actionLabel?: string;
}

export type NodeConfig =
    | StartConfig
    | EndConfig
    | IfConfig
    | SwitchConfig
    | MergeConfig
    | EditConfig
    | AgentConfig
    | ApprovalConfig
    | HttpConfig
    | NotificationConfig
    | Record<string, unknown>;

// ============================================================================
// Link Types
// ============================================================================

export type LinkRelation = 'io' | 'entry-exit';

export interface GFlowLink {
    id: string;
    src: PortRef;
    dst: PortRef;
    relation: LinkRelation;
    d?: string;
    mid?: { x: number; y: number };
    map?: JsonValue;
}

// ============================================================================
// Flow Types
// ============================================================================

export interface FlowViewport {
    x: number;
    y: number;
    scale: number;
}

export interface FlowData {
    nodes: GFlowNode[];
    links: GFlowLink[];
    viewport?: FlowViewport;
}

export interface Flow {
    id?: string;
    title: string;
    description?: string;
    data?: FlowData;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function cloneJson<T extends JsonValue>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createNode(partial: Partial<GFlowNode>): GFlowNode {
    return {
        id: partial.id || generateId(),
        name: partial.name || '',
        type: partial.type || 'new',
        x: partial.x ?? 0,
        y: partial.y ?? 0,
        color: partial.color || '',
        icon: partial.icon || { icon: '' },
        inputs: partial.inputs ? [...partial.inputs] : [],
        outputs: partial.outputs ? [...partial.outputs] : [],
        entries: partial.entries ? [...partial.entries] : [],
        exits: partial.exits ? [...partial.exits] : [],
        configured: partial.configured ?? false,
        focused: partial.focused ?? false,
        selected: partial.selected ?? false,
        config: partial.config || {},
        configComponent: partial.configComponent ?? null,
    };
}
