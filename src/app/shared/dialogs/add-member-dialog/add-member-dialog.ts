import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal, viewChild } from '@angular/core';
import { BaseDialogComponent } from '../../components';
import { EmailListInputComponent, MemberInvite } from '../../components/email-list-input/email-list-input';

export type { MemberInvite };
export { MEMBER_ROLES, type MemberRole, type RoleOption } from '../../components/email-list-input/email-list-input';

export interface AddMemberResult {
  members: MemberInvite[];
  teamId: number;
}

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [BaseDialogComponent, EmailListInputComponent],
  templateUrl: './add-member-dialog.html',
  styleUrl: './add-member-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMemberDialogComponent {
  @Output() readonly memberAdded = new EventEmitter<AddMemberResult>();

  readonly dialog = viewChild<BaseDialogComponent>('dialog');

  readonly visible = signal(false);
  readonly members = signal<MemberInvite[]>([]);
  readonly isSubmitting = signal(false);

  private teamId = 0;

  readonly isValid = computed(() => this.members().length > 0);

  readonly submitLabel = computed(() => {
    const count = this.members().length;
    if (count === 0) return 'Inviter';
    if (count === 1) return 'Inviter le membre';
    return `Inviter ${count} membres`;
  });

  open(teamId: number): void {
    this.teamId = teamId;
    this.members.set([]);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.members.set([]);
  }

  onSubmit(): void {
    if (!this.isValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.memberAdded.emit({
      members: this.members(),
      teamId: this.teamId
    });

    this.isSubmitting.set(false);
    this.close();
  }
}
