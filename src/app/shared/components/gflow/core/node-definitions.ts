import { Type } from '@angular/core';
import {
    AgentConfig,
    ApprovalConfig,
    cloneJson,
    EditConfig,
    EndConfig,
    GFlowPort,
    HttpConfig,
    IfConfig,
    JsonValue,
    MergeConfig,
    NodeConfig,
    NodeIcon,
    NodeType,
    NotificationConfig,
    SwitchConfig
} from './gflow.types';
import { ConfigEndComponent } from '../configs/config-end';
import { ConfigIfComponent } from '../configs/config-if';
import { ConfigSwitchComponent } from '../configs/config-switch';
import { ConfigEditComponent } from '../configs/config-edit';
import { ConfigAgentComponent } from '../configs/config-agent';
import { ConfigApprovalComponent } from '../configs/config-approval';
import { ConfigHttpComponent } from '../configs/config-http';
import { ConfigNotificationComponent } from '../configs/config-notification';

// ============================================================================
// Types
// ============================================================================

export type NodeCategory = 'Flux' | 'Logique' | 'Actions' | 'Agents';

export interface NodeBlueprint {
    name: string;
    inputs: GFlowPort[];
    outputs: GFlowPort[];
    entries: GFlowPort[];
    exits: GFlowPort[];
    configured: boolean;
    config: NodeConfig;
    configComponent: Type<unknown> | null;
}

export interface NodeDefinition {
    type: NodeType;
    label: string;
    icon: NodeIcon;
    color: string;
    category: NodeCategory;
    create: () => NodeBlueprint;
}

export interface PaletteItem {
    type: NodeType;
    label: string;
    icon: NodeIcon;
    color: string;
}

export interface PaletteGroup {
    name: NodeCategory;
    items: PaletteItem[];
}

// ============================================================================
// Helpers
// ============================================================================

function clonePorts(ports: GFlowPort[]): GFlowPort[] {
    return ports.map(port => ({
        ...port,
        map: port.map !== undefined ? cloneJson(port.map as JsonValue) : undefined,
    }));
}

function createPort(name?: string, map?: JsonValue): GFlowPort {
    return { name, map };
}

// ============================================================================
// Node Definitions
// ============================================================================

const NODE_DEFINITIONS_LIST: NodeDefinition[] = [
    // Hidden node type for creating new nodes
    {
        type: 'new',
        label: 'Nouveau',
        icon: { icon: 'fa-solid fa-plus' },
        color: 'var(--background-color-300)',
        category: 'Flux',
        create: () => ({
            name: 'Nouveau',
            inputs: [createPort()],
            outputs: [createPort()],
            entries: [createPort()],
            exits: [createPort()],
            configured: false,
            config: {},
            configComponent: null,
        }),
    },

    // Flow control nodes
    {
        type: 'start',
        label: 'Début',
        icon: { icon: 'fa-jelly-fill fa-solid fa-play' },
        color: 'var(--p-green-300)',
        category: 'Flux',
        create: () => ({
            name: 'Début',
            inputs: [],
            outputs: [createPort()],
            entries: [],
            exits: [],
            configured: true,
            config: { triggerType: 'manual' },
            configComponent: null,
        }),
    },
    {
        type: 'end',
        label: 'Fin',
        icon: { icon: 'fa-jelly-fill fa-solid fa-stop' },
        color: 'var(--p-red-300)',
        category: 'Flux',
        create: () => ({
            name: 'Fin',
            inputs: [createPort()],
            outputs: [],
            entries: [],
            exits: [],
            configured: false,
            config: { status: 'completed' } as EndConfig,
            configComponent: ConfigEndComponent,
        }),
    },

    // Logic nodes
    {
        type: 'if',
        label: 'Si / Sinon',
        icon: { icon: 'fa-solid fa-split' },
        color: 'var(--p-yellow-300)',
        category: 'Logique',
        create: () => ({
            name: 'Si / Sinon',
            inputs: [createPort()],
            outputs: [createPort('true'), createPort('false')],
            entries: [],
            exits: [],
            configured: false,
            config: { condition: '', field: '', operator: 'equals', value: '' } as IfConfig,
            configComponent: ConfigIfComponent,
        }),
    },
    {
        type: 'switch',
        label: 'Switch / Case',
        icon: { icon: 'fa-solid fa-shuffle' },
        color: 'var(--p-yellow-300)',
        category: 'Logique',
        create: () => ({
            name: 'Switch / Case',
            inputs: [createPort()],
            outputs: [createPort('Case 1')],
            entries: [],
            exits: [],
            configured: false,
            config: { field: '', cases: [{ label: 'Case 1', value: '' }] } as SwitchConfig,
            configComponent: ConfigSwitchComponent,
        }),
    },
    {
        type: 'merge',
        label: 'Fusionner',
        icon: { icon: 'fa-solid fa-merge' },
        color: 'var(--p-yellow-300)',
        category: 'Logique',
        create: () => ({
            name: 'Fusionner',
            inputs: [createPort()],
            outputs: [createPort()],
            entries: [],
            exits: [],
            configured: false,
            config: { mode: 'all' } as MergeConfig,
            configComponent: null,
        }),
    },
    {
        type: 'edit',
        label: 'Modifier',
        icon: { icon: 'fa-jelly-fill fa-regular fa-arrows-rotate' },
        color: 'var(--p-yellow-300)',
        category: 'Logique',
        create: () => ({
            name: 'Modifier',
            inputs: [createPort()],
            outputs: [createPort(undefined, {})],
            entries: [],
            exits: [],
            configured: false,
            config: { operations: [] } as EditConfig,
            configComponent: ConfigEditComponent,
        }),
    },

    // Action nodes
    {
        type: 'approval',
        label: 'Approbation',
        icon: { icon: 'fa-jelly-fill fa-regular fa-thumbs-up' },
        color: 'var(--p-gray-300)',
        category: 'Actions',
        create: () => ({
            name: 'Approbation',
            inputs: [createPort()],
            outputs: [createPort('Approuver'), createPort('Rejeter')],
            entries: [],
            exits: [],
            configured: false,
            config: {
                title: '',
                message: '',
                options: [
                    { label: 'Approuver', value: 'approved' },
                    { label: 'Rejeter', value: 'rejected' }
                ],
                assigneeType: 'user',
                assigneeId: '',
                assigneeName: '',
            } as ApprovalConfig,
            configComponent: ConfigApprovalComponent,
        }),
    },
    {
        type: 'http',
        label: 'Requête HTTP',
        icon: { icon: 'fa-jelly-fill fa-solid fa-globe' },
        color: 'var(--p-gray-300)',
        category: 'Actions',
        create: () => ({
            name: 'Requête HTTP',
            inputs: [createPort()],
            outputs: [createPort()],
            entries: [],
            exits: [],
            configured: false,
            config: {
                method: 'GET',
                url: '',
                headers: [],
                bodyType: 'none',
                timeout: 30000,
                retries: 0,
            } as HttpConfig,
            configComponent: ConfigHttpComponent,
        }),
    },
    {
        type: 'notification',
        label: 'Notification',
        icon: { icon: 'fa-jelly-fill fa-solid fa-bell' },
        color: 'var(--p-gray-300)',
        category: 'Actions',
        create: () => ({
            name: 'Notification',
            inputs: [createPort()],
            outputs: [createPort()],
            entries: [],
            exits: [],
            configured: false,
            config: {
                title: '',
                message: '',
                channel: 'app',
                targets: [{ type: 'user', id: '', name: '' }],
                priority: 'normal',
            } as NotificationConfig,
            configComponent: ConfigNotificationComponent,
        }),
    },

    // Agent nodes
    {
        type: 'agent',
        label: 'Agent',
        icon: { icon: 'fa-solid fa-robot' },
        color: 'var(--p-blue-300)',
        category: 'Agents',
        create: () => ({
            name: 'Agent',
            inputs: [createPort()],
            outputs: [createPort()],
            entries: [],
            exits: [createPort()],
            configured: false,
            config: { agentId: '', agentName: '', version: '' } as AgentConfig,
            configComponent: ConfigAgentComponent,
        }),
    },
];

// ============================================================================
// Exports
// ============================================================================

export const NODE_DEFINITIONS = NODE_DEFINITIONS_LIST;

export const NODE_DEFINITION_MAP: Record<NodeType, NodeDefinition> = NODE_DEFINITIONS_LIST.reduce(
    (acc, def) => {
        acc[def.type] = def;
        return acc;
    },
    {} as Record<NodeType, NodeDefinition>
);

export const PALETTE_GROUPS: PaletteGroup[] = (() => {
    const categoryOrder: NodeCategory[] = ['Flux', 'Logique', 'Actions', 'Agents'];
    const groups = new Map<NodeCategory, PaletteGroup>();

    // Initialize groups in order
    categoryOrder.forEach(category => {
        groups.set(category, { name: category, items: [] });
    });

    // Populate groups (exclude 'new' and 'start')
    NODE_DEFINITIONS_LIST.forEach(def => {
        if (def.type === 'new' || def.type === 'start') return;

        const group = groups.get(def.category);
        if (group) {
            group.items.push({
                type: def.type,
                label: def.label,
                icon: def.icon,
                color: def.color,
            });
        }
    });

    // Return only non-empty groups
    return categoryOrder
        .map(cat => groups.get(cat)!)
        .filter(group => group.items.length > 0);
})();
