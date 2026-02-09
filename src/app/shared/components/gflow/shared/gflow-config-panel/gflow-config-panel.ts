import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfigBase } from '../config-base/config-base';
import { GFlowLink, GFlowNode, JsonValue } from '../../core/gflow.types';

@Component({
    selector: 'app-gflow-config-panel',
    imports: [CommonModule, ConfigBase, ButtonModule],
    templateUrl: './gflow-config-panel.html',
    styleUrls: ['./gflow-config-panel.scss'],
})
export class GflowConfigPanelComponent implements OnChanges {
    @Input() node: GFlowNode | null = null;
    @Input() link: GFlowLink | null = null;
    @Input() nodes: GFlowNode[] = [];
    @Input() links: GFlowLink[] = [];
    @Input() inputMap: JsonValue | null = null;

    @Output() cancel = new EventEmitter<void>();
    @Output() save = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    @Output() configChange = new EventEmitter<unknown>();

    componentInputs: Record<string, unknown> | null = null;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['node']) {
            if (this.node?.configComponent) {
                this.componentInputs = {
                    node: this.node,
                };
            } else {
                this.componentInputs = null;
            }
        }
    }
}
