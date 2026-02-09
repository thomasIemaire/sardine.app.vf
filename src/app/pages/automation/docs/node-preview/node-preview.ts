import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeType } from '@shared/components/gflow/core/gflow.types';
import { NODE_DEFINITION_MAP } from '@shared/components/gflow/core/node-definitions';

@Component({
    selector: 'app-node-preview',
    imports: [CommonModule],
    template: `
        <div class="node-preview">
            <div class="node-preview__icon" [style.backgroundColor]="definition.color">
                <i [class]="definition.icon.icon" [style.rotate.deg]="definition.icon.rotate || 0"></i>
            </div>
            <div class="node-preview__info">
                <span class="node-preview__label">{{ definition.label }}</span>
                <span class="node-preview__category">{{ definition.category }}</span>
            </div>
        </div>
    `,
    styles: [`
        .node-preview {
            display: inline-flex;
            align-items: center;
            gap: .75rem;
            padding: .75rem 1rem;
            background: var(--background-color-50);
            border: 1px solid var(--surface-border);
            border-radius: .5rem;
            width: fit-content;
        }

        .node-preview__icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: .5rem;
            color: var(--p-surface-900);
            font-size: 1rem;
        }

        .node-preview__info {
            display: flex;
            flex-direction: column;
            gap: .125rem;
        }

        .node-preview__label {
            font-weight: 600;
            font-size: .9375rem;
            color: var(--p-text-color);
        }

        .node-preview__category {
            font-size: .75rem;
            color: var(--p-text-muted-color);
        }
    `]
})
export class NodePreviewComponent {
    nodeType = input.required<NodeType>();

    get definition() {
        return NODE_DEFINITION_MAP[this.nodeType()];
    }
}
