import { GFlowPort, JsonValue, NodeType } from './gflow.types';

const cloneJson = <T extends JsonValue>(value: T): T =>
    JSON.parse(JSON.stringify(value));

const clonePorts = (ports?: GFlowPort[]): GFlowPort[] =>
    (ports ?? []).map((port) => ({
        ...port,
        map: port.map === undefined ? undefined : cloneJson(port.map),
    }));

export type NodeCategory = 'Flux' | 'Logique' | 'Agents';

interface NodeBlueprint {
    name: string;
    inputs?: GFlowPort[];
    outputs?: GFlowPort[];
    entries?: GFlowPort[];
    exits?: GFlowPort[];
    configured?: boolean;
    config?: unknown;
    configComponent?: any;
}

export interface NodeTypeDefinition {
    type: NodeType;
    label: string;
    icon: { icon: string; rotate?: number };
    color?: string;
    category: NodeCategory;
    create: () => NodeBlueprint;
}

export interface PaletteItem {
    type: NodeType;
    label: string;
    icon: { icon: string; rotate?: number };
    color?: string;
}

export interface PaletteGroup {
    name: string;
    items: PaletteItem[];
}

const definitions: NodeTypeDefinition[] = [
    {
        type: 'new',
        label: 'Nouveau',
        icon: { icon: 'fa-solid fa-plus' },
        color: 'var(--background-color-300)',
        category: 'Flux',
        create: () => ({
            name: 'Nouveau',
            inputs: clonePorts([{}]),
            outputs: clonePorts([{}]),
            entries: clonePorts([{}]),
            exits: clonePorts([{}]),
        }),
    },
    {
        type: 'start',
        label: 'Début',
        icon: { icon: 'fa-solid fa-play' },
        color: '#DEF5EE',
        category: 'Flux',
        create: () => ({
            name: 'Début',
            inputs: [],
            outputs: clonePorts([{}]),
        }),
    },
    {
        type: 'end',
        label: 'Fin',
        icon: { icon: 'fa-solid fa-stop' },
        color: '#FADCD9',
        category: 'Flux',
        create: () => ({
            name: 'Fin',
            inputs: clonePorts([{}]),
            outputs: [],
            configured: false,
            config: { status: 'completed' },
        }),
    },
    {
        type: 'if',
        label: 'Si / Sinon',
        icon: {
            icon: 'fa-solid fa-arrows-split-up-and-left',
            rotate: 90,
        },
        color: '#FFF3B0',
        category: 'Logique',
        create: () => ({
            name: 'Si / Sinon',
            inputs: clonePorts([{}]),
            outputs: clonePorts([{ name: 'true' }, { name: 'false' }]),
            configured: false,
            config: { condition: '' },
        }),
    },
    {
        type: 'switch',
        label: 'Switch / Case',
        icon: { icon: 'fa-solid fa-shuffle' },
        color: '#FFF3B0',
        category: 'Logique',
        create: () => ({
            name: 'Switch / Case',
            inputs: clonePorts([{}]),
            outputs: clonePorts([{ name: 'Case 1' }]),
            configured: false,
            config: { cases: [{ label: 'Case 1', value: '' }] },
        }),
    },
    {
        type: 'merge',
        label: 'Fusionner',
        icon: { icon: 'fa-solid fa-code-fork' },
        color: '#FFF3B0',
        category: 'Logique',
        create: () => ({
            name: 'Fusionner',
            inputs: clonePorts([{}]),
            outputs: clonePorts([{}]),
            configured: false,
            config: {},
        }),
    },
    {
        type: 'edit',
        label: 'Modifier',
        icon: { icon: 'fa-solid fa-pen' },
        color: '#FFF3B0',
        category: 'Logique',
        create: () => ({
            name: 'Modifier',
            inputs: clonePorts([{}]),
            outputs: clonePorts([{ map: {} }]),
            configured: false,
            config: { edits: [] },
        }),
    },
    {
        type: 'agent',
        label: 'Agent',
        icon: { icon: 'fa-solid fa-location-arrow' },
        color: '#DEF5EE',
        category: 'Agents',
        create: () => ({
            name: 'Agent',
            inputs: clonePorts([{}]),
            outputs: clonePorts([{}]),
            exits: clonePorts([{}]),
            configured: false,
            config: { agentName: '', version: '' },
        }),
    },
];

export const NODE_DEFINITIONS = definitions;

export const NODE_DEFINITION_MAP: Record<NodeType, NodeTypeDefinition> = definitions
    .reduce((acc, definition) => {
        acc[definition.type] = definition;
        return acc;
    }, {} as Record<NodeType, NodeTypeDefinition>);

export const PALETTE_GROUPS: PaletteGroup[] = (() => {
    const groups = new Map<NodeCategory, PaletteGroup>();

    definitions.forEach((definition) => {
        if (definition.type === 'new' || definition.type === 'start') return;

        const existing = groups.get(definition.category);
        const item: PaletteItem = {
            type: definition.type,
            label: definition.label,
            icon: definition.icon,
            color: definition.color,
        };

        if (existing) {
            existing.items.push(item);
        } else {
            groups.set(definition.category, {
                name: definition.category,
                items: [item],
            });
        }
    });

    return Array.from(groups.values());
})();
