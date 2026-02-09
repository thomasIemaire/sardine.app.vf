import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextFieldComponent } from '../../text-field/text-field';
import { SelectFieldComponent, SelectOption } from '../../select-field/select-field';
import { GFlowNode, IfConfig } from '../core/gflow.types';

@Component({
    selector: 'app-config-if',
    imports: [FormsModule, TextFieldComponent, SelectFieldComponent],
    template: `
        <div class="config-fields">
            <app-text-field
                label="Champ à évaluer"
                placeholder="ex: data.status"
                [(ngModel)]="field"
                (ngModelChange)="onChange()"
            />

            <app-select-field
                label="Opérateur"
                [options]="operatorOptions"
                [(ngModel)]="operator"
                (selectionChange)="onChange()"
            />

            <app-text-field
                label="Valeur"
                placeholder="Valeur à comparer"
                [(ngModel)]="value"
                (ngModelChange)="onChange()"
            />

            <app-text-field
                label="Expression (avancé)"
                placeholder="ex: data.count > 10"
                hint="Utiliser pour des conditions complexes"
                [(ngModel)]="condition"
                (ngModelChange)="onChange()"
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
export class ConfigIfComponent {
    node = input.required<GFlowNode>();

    @Output() configChange = new EventEmitter<void>();

    operatorOptions: SelectOption[] = [
        { label: 'Est égal à', value: 'equals' },
        { label: 'Contient', value: 'contains' },
        { label: 'Supérieur à', value: 'greater' },
        { label: 'Inférieur à', value: 'less' }
    ];

    get config(): IfConfig {
        return this.node().config as IfConfig;
    }

    get field(): string {
        return this.config.field || '';
    }
    set field(value: string) {
        this.config.field = value;
    }

    get operator(): string {
        return this.config.operator || 'equals';
    }
    set operator(value: string) {
        this.config.operator = value as IfConfig['operator'];
    }

    get value(): string {
        return this.config.value || '';
    }
    set value(val: string) {
        this.config.value = val;
    }

    get condition(): string {
        return this.config.condition || '';
    }
    set condition(value: string) {
        this.config.condition = value;
    }

    onChange(): void {
        this.configChange.emit();
    }
}
