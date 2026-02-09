import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextFieldComponent } from '../../text-field/text-field';
import { TextareaFieldComponent } from '../../textarea-field/textarea-field';
import { SelectOption } from '../../select-field/select-field';
import { ApprovalConfig, ApprovalOption, GFlowNode } from '../core/gflow.types';

@Component({
    selector: 'app-config-approval',
    imports: [
        FormsModule,
        InputTextModule,
        SelectModule,
        ButtonModule,
        InputNumberModule,
        TextFieldComponent,
        TextareaFieldComponent
    ],
    template: `
        <div class="config-fields">
            <app-text-field
                label="Titre de la demande"
                placeholder="ex: Validation requise"
                [(ngModel)]="title"
                (ngModelChange)="onChange()"
            />

            <app-textarea-field
                label="Message"
                placeholder="Décrivez ce que l'utilisateur doit approuver..."
                [rows]="3"
                [(ngModel)]="message"
                (ngModelChange)="onChange()"
            />

            <div class="config-field">
                <label class="config-label">Assigner à</label>
                <div class="config-row">
                    <p-select
                        [options]="assigneeTypeOptions"
                        [(ngModel)]="assigneeType"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Type"
                        size="small"
                        class="assignee-type"
                        appendTo="body"
                        (onChange)="onChange()" />
                    <input pInputText
                        [(ngModel)]="assigneeName"
                        placeholder="Nom"
                        pSize="small"
                        class="assignee-name"
                        (ngModelChange)="onChange()" />
                </div>
            </div>

            <div class="config-field">
                <label class="config-label">Options de réponse</label>
                <div class="options-list">
                    @for (option of options; track $index) {
                        <div class="option-item">
                            <input pInputText
                                [(ngModel)]="option.label"
                                placeholder="Label"
                                pSize="small"
                                class="option-input"
                                (ngModelChange)="onOptionChange($index)" />
                            <input pInputText
                                [(ngModel)]="option.value"
                                placeholder="Valeur"
                                pSize="small"
                                class="option-input"
                                (ngModelChange)="onOptionChange($index)" />
                            <p-button
                                icon="fa-solid fa-trash"
                                severity="danger"
                                text
                                size="small"
                                [disabled]="options.length <= 2"
                                (onClick)="removeOption($index)" />
                        </div>
                    }
                </div>
                <p-button
                    label="Ajouter une option"
                    icon="fa-solid fa-plus"
                    size="small"
                    text
                    (onClick)="addOption()" />
            </div>

            <div class="config-field">
                <label class="config-label">Timeout (minutes)</label>
                <div class="config-row">
                    <p-inputNumber
                        [(ngModel)]="timeout"
                        [min]="0"
                        [max]="10080"
                        placeholder="0 = pas de timeout"
                        size="small"
                        class="timeout-input"
                        (ngModelChange)="onChange()" />
                    @if (timeout && timeout > 0) {
                        <p-select
                            [options]="timeoutActionOptions"
                            [(ngModel)]="timeoutAction"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Action"
                            size="small"
                            class="timeout-action"
                            appendTo="body"
                            (onChange)="onChange()" />
                    }
                </div>
            </div>
        </div>
    `,
    styles: [`
        .config-fields {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .config-field {
            display: flex;
            flex-direction: column;
            gap: .375rem;
        }
        .config-label {
            font-size: .8125rem;
            font-weight: 500;
            color: var(--p-text-color);
        }
        .config-row {
            display: flex;
            gap: .5rem;
        }
        .assignee-type {
            width: 120px;
        }
        .assignee-name {
            flex: 1;
        }
        .options-list {
            display: flex;
            flex-direction: column;
            gap: .5rem;
        }
        .option-item {
            display: flex;
            align-items: center;
            gap: .5rem;
        }
        .option-input {
            flex: 1;
        }
        .timeout-input {
            width: 120px;
        }
        .timeout-action {
            flex: 1;
        }
    `]
})
export class ConfigApprovalComponent {
    node = input.required<GFlowNode>();

    @Output() configChange = new EventEmitter<void>();

    assigneeTypeOptions: SelectOption[] = [
        { label: 'Utilisateur', value: 'user' },
        { label: 'Équipe', value: 'team' },
        { label: 'Rôle', value: 'role' }
    ];

    timeoutActionOptions: SelectOption[] = [
        { label: 'Approuver', value: 'approve' },
        { label: 'Rejeter', value: 'reject' },
        { label: 'Ignorer', value: 'skip' }
    ];

    get config(): ApprovalConfig {
        return this.node().config as ApprovalConfig;
    }

    get title(): string {
        return this.config.title || '';
    }
    set title(value: string) {
        this.config.title = value;
    }

    get message(): string {
        return this.config.message || '';
    }
    set message(value: string) {
        this.config.message = value;
    }

    get assigneeType(): string {
        return this.config.assigneeType || 'user';
    }
    set assigneeType(value: string) {
        this.config.assigneeType = value as ApprovalConfig['assigneeType'];
    }

    get assigneeName(): string {
        return this.config.assigneeName || '';
    }
    set assigneeName(value: string) {
        this.config.assigneeName = value;
    }

    get options(): ApprovalOption[] {
        if (!this.config.options || this.config.options.length === 0) {
            this.config.options = [
                { label: 'Approuver', value: 'approved' },
                { label: 'Rejeter', value: 'rejected' }
            ];
        }
        return this.config.options;
    }

    get timeout(): number | undefined {
        return this.config.timeout;
    }
    set timeout(value: number | undefined) {
        this.config.timeout = value;
    }

    get timeoutAction(): string {
        return this.config.timeoutAction || 'skip';
    }
    set timeoutAction(value: string) {
        this.config.timeoutAction = value as ApprovalConfig['timeoutAction'];
    }

    onChange(): void {
        this.updateNodeOutputs();
        this.configChange.emit();
    }

    onOptionChange(_index: number): void {
        this.updateNodeOutputs();
        this.configChange.emit();
    }

    addOption(): void {
        const newIndex = this.options.length + 1;
        this.options.push({ label: `Option ${newIndex}`, value: `option_${newIndex}` });
        this.updateNodeOutputs();
        this.configChange.emit();
    }

    removeOption(index: number): void {
        if (this.options.length > 2) {
            this.options.splice(index, 1);
            this.updateNodeOutputs();
            this.configChange.emit();
        }
    }

    private updateNodeOutputs(): void {
        const node = this.node();
        node.outputs = this.options.map(opt => ({ name: opt.label }));
    }
}
