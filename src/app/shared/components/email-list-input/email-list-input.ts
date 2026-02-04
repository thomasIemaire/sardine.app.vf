import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { isValidEmail } from '../../utils';

export type MemberRole = 'admin' | 'member' | 'viewer';

export interface RoleOption {
  label: string;
  value: MemberRole;
  description: string;
}

export interface MemberInvite {
  email: string;
  role: MemberRole;
}

export const MEMBER_ROLES: RoleOption[] = [
  { label: 'Administrateur', value: 'admin', description: 'Accès complet et gestion de l\'équipe' },
  { label: 'Membre', value: 'member', description: 'Accès standard aux ressources' },
  { label: 'Lecteur', value: 'viewer', description: 'Accès en lecture seule' }
];

@Component({
  selector: 'app-email-list-input',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './email-list-input.html',
  styleUrl: './email-list-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailListInputComponent {
  readonly members = model<MemberInvite[]>([]);
  readonly placeholder = input<string>('Ajouter une adresse email...');
  readonly showRoles = input<boolean>(true);
  readonly defaultRole = input<MemberRole>('member');

  readonly emailInput = signal('');
  readonly roles = MEMBER_ROLES;

  readonly hasInvalidEmail = computed(() => {
    const value = this.emailInput().trim();
    if (!value) return false;
    return !isValidEmail(value);
  });

  readonly canAddEmail = computed(() => {
    const value = this.emailInput().trim();
    return value && isValidEmail(value) && !this.members().some(m => m.email === value);
  });

  addMember(): void {
    const email = this.emailInput().trim();
    if (this.canAddEmail()) {
      this.members.update(list => [...list, { email, role: this.defaultRole() }]);
      this.emailInput.set('');
    }
  }

  removeMember(email: string): void {
    this.members.update(list => list.filter(m => m.email !== email));
  }

  updateMemberRole(email: string, role: MemberRole): void {
    this.members.update(list =>
      list.map(m => m.email === email ? { ...m, role } : m)
    );
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addMember();
    }
  }
}
