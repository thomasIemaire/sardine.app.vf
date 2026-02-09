import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentConfig, EndConfig, GFlowLink, GFlowNode, PortKind } from '../core/gflow.types';

@Component({
    selector: 'app-gflow-node',
    imports: [CommonModule],
    templateUrl: './gflow-node.html',
    styleUrls: ['./gflow-node.scss']
})
export class GflowNodeComponent {
    readonly item = input.required<GFlowNode>();
    readonly links = input<GFlowLink[]>([]);

    readonly hasNamedOutputs = computed(() =>
        this.item().outputs.some(port => !!port.name)
    );

    readonly isNewNode = computed(() => this.item().type === 'new');
    readonly isAgentNode = computed(() => this.item().type === 'agent');
    readonly isEndNode = computed(() => this.item().type === 'end');

    readonly agentName = computed(() => {
        const config = this.item().config as AgentConfig;
        return config?.agentName || '';
    });

    readonly agentVersion = computed(() => {
        const config = this.item().config as AgentConfig;
        return config?.version || '';
    });

    readonly endStatus = computed(() => {
        const config = this.item().config as EndConfig;
        return config?.status || '';
    });

    readonly isFocusedOrSelected = computed(() =>
        this.item().focused || this.item().selected
    );

    readonly hasEntries = computed(() =>
        (this.item().entries?.length ?? 0) > 0
    );

    readonly hasExits = computed(() =>
        (this.item().exits?.length ?? 0) > 0
    );

    isPortConnected(kind: PortKind, index: number): boolean {
        const nodeId = this.item().id;
        return this.links().some(link => {
            const isSource = link.src.nodeId === nodeId &&
                             link.src.kind === kind &&
                             link.src.portIndex === index;
            const isDest = link.dst.nodeId === nodeId &&
                           link.dst.kind === kind &&
                           link.dst.portIndex === index;
            return isSource || isDest;
        });
    }
}
