import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BaseDialogComponent } from '../../components';
import { FoldersService, DocumentsService } from '../../../core/services';
import { AccessRole, PrincipalType, FolderPermissionInfo, DocumentPermissionInfo } from '../../../models';
import { isValidEmail } from '../../utils';

type PermissionInfo = FolderPermissionInfo | DocumentPermissionInfo;

export interface ShareResult {
  itemId: string;
  itemType: 'folder' | 'document';
}

interface RoleOption {
  label: string;
  value: AccessRole;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { label: 'Lecteur', value: 'viewer', description: 'Peut voir le contenu' },
  { label: 'Éditeur', value: 'editor', description: 'Peut modifier le contenu' },
  { label: 'Propriétaire', value: 'owner', description: 'Contrôle total' }
];

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    BaseDialogComponent
  ],
  templateUrl: './share-dialog.html',
  styleUrl: './share-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareDialogComponent {
  private readonly foldersService = inject(FoldersService);
  private readonly documentsService = inject(DocumentsService);

  @Output() readonly permissionsChanged = new EventEmitter<ShareResult>();

  readonly visible = signal(false);
  readonly itemId = signal<string | null>(null);
  readonly itemType = signal<'folder' | 'document'>('folder');
  readonly itemName = signal('');

  readonly permissions = signal<PermissionInfo[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  // New permission form
  readonly newEmail = signal('');
  readonly newRole = signal<AccessRole>('viewer');
  readonly addingPermission = signal(false);

  readonly roleOptions = ROLE_OPTIONS;

  readonly hasValidEmail = computed(() => {
    const email = this.newEmail().trim();
    return email.length > 0 && isValidEmail(email);
  });

  readonly ownPermissions = computed(() =>
    this.permissions().filter(p => !this.isInherited(p))
  );

  readonly inheritedPermissions = computed(() =>
    this.permissions().filter(p => this.isInherited(p))
  );

  open(id: string, type: 'folder' | 'document', name: string): void {
    this.itemId.set(id);
    this.itemType.set(type);
    this.itemName.set(name);
    this.newEmail.set('');
    this.newRole.set('viewer');
    this.visible.set(true);
    this.loadPermissions();
  }

  close(): void {
    this.visible.set(false);
    this.itemId.set(null);
    this.permissions.set([]);
  }

  private loadPermissions(): void {
    const id = this.itemId();
    if (!id) return;

    this.loading.set(true);

    if (this.itemType() === 'folder') {
      this.foldersService.getPermissions(id).subscribe({
        next: (perms) => {
          this.permissions.set(perms);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading folder permissions:', error);
          this.loading.set(false);
        }
      });
    } else {
      this.documentsService.getPermissions(id).subscribe({
        next: (perms) => {
          this.permissions.set(perms);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading document permissions:', error);
          this.loading.set(false);
        }
      });
    }
  }

  addPermission(): void {
    const id = this.itemId();
    const email = this.newEmail().trim();
    if (!id || !this.hasValidEmail() || this.addingPermission()) return;

    this.addingPermission.set(true);

    const request = {
      principalType: 'user' as PrincipalType,
      principalId: email, // Backend should resolve email to userId
      role: this.newRole()
    };

    if (this.itemType() === 'folder') {
      this.foldersService.addPermission(id, request).subscribe({
        next: (newPerm) => {
          this.permissions.update(list => [...list, newPerm]);
          this.newEmail.set('');
          this.newRole.set('viewer');
          this.addingPermission.set(false);
          this.emitChange();
        },
        error: (error) => {
          console.error('Error adding folder permission:', error);
          this.addingPermission.set(false);
        }
      });
    } else {
      this.documentsService.addPermission(id, request).subscribe({
        next: (newPerm) => {
          this.permissions.update(list => [...list, newPerm]);
          this.newEmail.set('');
          this.newRole.set('viewer');
          this.addingPermission.set(false);
          this.emitChange();
        },
        error: (error) => {
          console.error('Error adding document permission:', error);
          this.addingPermission.set(false);
        }
      });
    }
  }

  removePermission(permission: PermissionInfo): void {
    const id = this.itemId();
    if (!id || this.isInherited(permission)) return;

    if (this.itemType() === 'folder') {
      this.foldersService.removePermission(id, permission._id).subscribe({
        next: () => {
          this.permissions.update(list => list.filter(p => p._id !== permission._id));
          this.emitChange();
        },
        error: (error) => console.error('Error removing folder permission:', error)
      });
    } else {
      this.documentsService.removePermission(id, permission._id).subscribe({
        next: () => {
          this.permissions.update(list => list.filter(p => p._id !== permission._id));
          this.emitChange();
        },
        error: (error) => console.error('Error removing document permission:', error)
      });
    }
  }

  isInherited(permission: PermissionInfo): boolean {
    return 'inherited' in permission && permission.inherited === true;
  }

  getRoleLabel(role: AccessRole): string {
    return ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;
  }

  getRoleSeverity(role: AccessRole): 'success' | 'info' | 'warn' {
    switch (role) {
      case 'owner': return 'success';
      case 'editor': return 'warn';
      default: return 'info';
    }
  }

  getPrincipalIcon(type: PrincipalType): string {
    return type === 'team' ? 'fa-duotone fa-solid fa-users' : 'fa-duotone fa-solid fa-user';
  }

  private emitChange(): void {
    const id = this.itemId();
    if (id) {
      this.permissionsChanged.emit({
        itemId: id,
        itemType: this.itemType()
      });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addPermission();
    }
  }
}
