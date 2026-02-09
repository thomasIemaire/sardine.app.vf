import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectFieldComponent, SelectOption } from '../../select-field/select-field';
import { EndConfig, GFlowNode } from '../core/gflow.types';

@Component({
    selector: 'app-config-end',
    imports: [FormsModule, SelectFieldComponent],
    template: `
        <div class="config-fields">
            <app-select-field
                label="Statut de fin"
                [options]="statusOptions"
                [(ngModel)]="status"
                (selectionChange)="onStatusChange()"
            />
        </div>
    `,
    styles: [`
        .config-fields {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
    `]
})
export class ConfigEndComponent {
    node = input.required<GFlowNode>();

    @Output() configChange = new EventEmitter<void>();

    statusOptions: SelectOption[] = [
        { label: 'Terminé', value: 'completed' },
        { label: 'Échoué', value: 'failed' },
        { label: 'Annulé', value: 'cancelled' }
    ];

    get status(): string {
        return (this.node().config as EndConfig)?.status || 'completed';
    }

    set status(value: string) {
        (this.node().config as EndConfig).status = value as EndConfig['status'];
    }

    onStatusChange(): void {
        this.configChange.emit();
    }
}
