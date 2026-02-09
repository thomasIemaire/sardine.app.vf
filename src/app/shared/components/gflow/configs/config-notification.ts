import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TextFieldComponent } from '../../text-field/text-field';
import { TextareaFieldComponent } from '../../textarea-field/textarea-field';
import { SelectFieldComponent, SelectOption } from '../../select-field/select-field';
import { GFlowNode, NotificationConfig, NotificationTarget } from '../core/gflow.types';

@Component({
    selector: 'app-config-notification',
    imports: [
        FormsModule,
        InputTextModule,
        SelectModule,
        ButtonModule,
        TextFieldComponent,
        TextareaFieldComponent,
        SelectFieldComponent
    ],
    template: `
        <div class="config-fields">
            <app-text-field
                label="Titre"
                placeholder="Titre de la notification"
                [(ngModel)]="title"
                (ngModelChange)="onChange()"
            />

            <app-textarea-field
                label="Message"
                placeholder="Contenu de la notification..."
                [rows]="3"
                [(ngModel)]="message"
                (ngModelChange)="onChange()"
            />

            <app-select-field
                label="Canal"
                [options]="channelOptions"
                [(ngModel)]="channel"
                (selectionChange)="onChange()"
            />

            <app-select-field
                label="Priorité"
                [options]="priorityOptions"
                [(ngModel)]="priority"
                (selectionChange)="onChange()"
            />

            <div class="config-field">
                <label class="config-label">Destinataires</label>
                <div class="targets-list">
                    @for (target of targets; track $index) {
                        <div class="target-item">
                            <p-select
                                [options]="targetTypeOptions"
                                [(ngModel)]="target.type"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Type"
                                size="small"
                                class="target-type"
                                appendTo="body"
                                (onChange)="onChange()" />
                            <input pInputText
                                [(ngModel)]="target.name"
                                placeholder="Nom"
                                pSize="small"
                                class="target-name"
                                (ngModelChange)="onChange()" />
                            <p-button
                                icon="fa-solid fa-trash"
                                severity="danger"
                                text
                                size="small"
                                [disabled]="targets.length <= 1"
                                (onClick)="removeTarget($index)" />
                        </div>
                    }
                </div>
                <p-button
                    label="Ajouter un destinataire"
                    icon="fa-solid fa-plus"
                    size="small"
                    text
                    (onClick)="addTarget()" />
            </div>

            <div class="config-field">
                <label class="config-label">Action (optionnel)</label>
                <div class="action-fields">
                    <app-text-field
                        placeholder="Texte du bouton"
                        [(ngModel)]="actionLabel"
                        (ngModelChange)="onChange()"
                    />
                    <app-text-field
                        placeholder="URL de redirection"
                        [(ngModel)]="actionUrl"
                        (ngModelChange)="onChange()"
                    />
                </div>
                <small class="config-hint">Ajoute un bouton cliquable à la notification</small>
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
        .config-hint {
            font-size: .6875rem;
            color: var(--p-text-muted-color);
        }
        .targets-list {
            display: flex;
            flex-direction: column;
            gap: .5rem;
        }
        .target-item {
            display: flex;
            align-items: center;
            gap: .5rem;
        }
        .target-type {
            width: 140px;
        }
        .target-name {
            flex: 1;
        }
        .action-fields {
            display: flex;
            flex-direction: column;
            gap: .5rem;
        }
    `]
})
export class ConfigNotificationComponent {
    node = input.required<GFlowNode>();

    @Output() configChange = new EventEmitter<void>();

    channelOptions: SelectOption[] = [
        { label: 'Application', value: 'app' },
        { label: 'Email', value: 'email' },
        { label: 'SMS', value: 'sms' }
    ];

    priorityOptions: SelectOption[] = [
        { label: 'Basse', value: 'low' },
        { label: 'Normale', value: 'normal' },
        { label: 'Haute', value: 'high' },
        { label: 'Urgente', value: 'urgent' }
    ];

    targetTypeOptions: SelectOption[] = [
        { label: 'Utilisateur', value: 'user' },
        { label: 'Équipe', value: 'team' },
        { label: 'Organisation', value: 'organization' },
        { label: 'Rôle', value: 'role' }
    ];

    get config(): NotificationConfig {
        return this.node().config as NotificationConfig;
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

    get channel(): string {
        return this.config.channel || 'app';
    }
    set channel(value: string) {
        this.config.channel = value as NotificationConfig['channel'];
    }

    get priority(): string {
        return this.config.priority || 'normal';
    }
    set priority(value: string) {
        this.config.priority = value as NotificationConfig['priority'];
    }

    get targets(): NotificationTarget[] {
        if (!this.config.targets || this.config.targets.length === 0) {
            this.config.targets = [{ type: 'user', id: '', name: '' }];
        }
        return this.config.targets;
    }

    get actionUrl(): string {
        return this.config.actionUrl || '';
    }
    set actionUrl(value: string) {
        this.config.actionUrl = value;
    }

    get actionLabel(): string {
        return this.config.actionLabel || '';
    }
    set actionLabel(value: string) {
        this.config.actionLabel = value;
    }

    onChange(): void {
        this.configChange.emit();
    }

    addTarget(): void {
        this.targets.push({ type: 'user', id: '', name: '' });
        this.configChange.emit();
    }

    removeTarget(index: number): void {
        if (this.targets.length > 1) {
            this.targets.splice(index, 1);
            this.configChange.emit();
        }
    }
}
