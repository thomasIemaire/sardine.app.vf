import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { BaseDialogComponent } from '../../components';
import { EmailListInputComponent, MemberInvite } from '../../components/email-list-input/email-list-input';

export type { MemberInvite as TeamMemberInvite };

export interface TeamColor {
  name: string;
  value: string;
}

export const TEAM_COLORS: TeamColor[] = [
  { name: 'Gris', value: '#6b7280' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Ambre', value: '#f59e0b' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Citron', value: '#84cc16' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Émeraude', value: '#10b981' },
  { name: 'Turquoise', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Bleu ciel', value: '#0ea5e9' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pourpre', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Rose clair', value: '#f472b6' }
];

export interface CreateTeamResult {
  name: string;
  description: string;
  color: string;
  parentId: number | null;
  members: MemberInvite[];
}

@Component({
  selector: 'app-create-team-dialog',
  standalone: true,
  imports: [
    FormsModule,
    DividerModule,
    InputTextModule,
    TextareaModule,
    BaseDialogComponent,
    EmailListInputComponent
  ],
  templateUrl: './create-team-dialog.html',
  styleUrl: './create-team-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTeamDialogComponent {
  @Output() readonly teamCreated = new EventEmitter<CreateTeamResult>();

  readonly visible = signal(false);
  readonly teamName = signal('');
  readonly teamDescription = signal('');
  readonly selectedColor = signal(TEAM_COLORS[11].value); // Bleu par défaut
  readonly members = signal<MemberInvite[]>([]);
  readonly isSubmitting = signal(false);

  readonly colors = TEAM_COLORS;

  private parentId: number | null = null;

  readonly isValid = computed(() => this.teamName().trim().length > 0);

  readonly submitLabel = computed(() => {
    const count = this.members().length;
    if (count === 0) return "Créer l'équipe";
    if (count === 1) return 'Créer et inviter 1 membre';
    return `Créer et inviter ${count} membres`;
  });

  open(parentId: number | null = null): void {
    this.parentId = parentId;
    this.teamName.set('');
    this.teamDescription.set('');
    this.selectedColor.set(TEAM_COLORS[11].value);
    this.members.set([]);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.teamName.set('');
    this.teamDescription.set('');
    this.members.set([]);
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  isColorSelected(color: string): boolean {
    return this.selectedColor() === color;
  }

  onSubmit(): void {
    if (!this.isValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.teamCreated.emit({
      name: this.teamName().trim(),
      description: this.teamDescription().trim(),
      color: this.selectedColor(),
      parentId: this.parentId,
      members: this.members()
    });

    this.isSubmitting.set(false);
    this.close();
  }
}
