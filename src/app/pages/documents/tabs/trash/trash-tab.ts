import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ContextMenuModule } from 'primeng/contextmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuItem } from 'primeng/api';
import { ThemeService, DisplayMode } from '../../../../core/services';
import {
  RestoreDocumentDialogComponent,
  RestoreDocumentResult,
  PermanentDeleteDialogComponent,
  PermanentDeleteResult
} from '../../../../shared';

export interface TrashItem {
  id: number;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'image' | 'pdf' | 'doc' | 'xls' | 'other';
  color?: string;
  size?: number;
  deletedAt: Date;
  originalPath: string;
  originalParentId: number | null;
}

// Mock data pour la corbeille
const MOCK_TRASH_ITEMS: TrashItem[] = [
  {
    id: 101,
    name: 'Ancien projet',
    type: 'folder',
    color: '#f472b6',
    deletedAt: new Date('2026-01-28'),
    originalPath: 'Projets',
    originalParentId: 2
  },
  {
    id: 102,
    name: 'Brouillon-présentation.pptx',
    type: 'file',
    fileType: 'other',
    size: 2500000,
    deletedAt: new Date('2026-01-27'),
    originalPath: 'Marketing / Visuels',
    originalParentId: 12
  },
  {
    id: 103,
    name: 'Photo-équipe.jpg',
    type: 'file',
    fileType: 'image',
    size: 1200000,
    deletedAt: new Date('2026-01-25'),
    originalPath: 'Ressources / Images',
    originalParentId: 31
  },
  {
    id: 104,
    name: 'Notes-réunion.docx',
    type: 'file',
    fileType: 'doc',
    size: 45000,
    deletedAt: new Date('2026-01-20'),
    originalPath: 'Administration',
    originalParentId: 4
  },
  {
    id: 105,
    name: 'Rapport-2024.pdf',
    type: 'file',
    fileType: 'pdf',
    size: 3500000,
    deletedAt: new Date('2026-01-15'),
    originalPath: 'Administration / Contrats',
    originalParentId: 41
  },
  {
    id: 106,
    name: 'Archives 2023',
    type: 'folder',
    color: '#a78bfa',
    deletedAt: new Date('2026-01-10'),
    originalPath: 'Projets',
    originalParentId: 2
  },
  {
    id: 107,
    name: 'Budget-prévisionnel.xlsx',
    type: 'file',
    fileType: 'xls',
    size: 89000,
    deletedAt: new Date('2026-01-05'),
    originalPath: 'Marketing',
    originalParentId: 1
  }
];

// Mock folders pour le tree de restauration
const MOCK_FOLDERS = [
  { id: 1, name: 'Marketing', parentId: null, color: '#f472b6' },
  { id: 2, name: 'Projets', parentId: null, color: '#a78bfa' },
  { id: 3, name: 'Ressources', parentId: null, color: '#4ade80' },
  { id: 4, name: 'Administration', parentId: null, color: '#22d3ee' },
  { id: 12, name: 'Visuels', parentId: 1, color: '#f472b6' },
  { id: 31, name: 'Images', parentId: 3, color: '#4ade80' },
  { id: 41, name: 'Contrats', parentId: 4, color: '#22d3ee' }
];

type FilterType = 'all' | 'folders' | 'files';

@Component({
  selector: 'app-trash-tab',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    ContextMenuModule,
    CheckboxModule,
    RestoreDocumentDialogComponent,
    PermanentDeleteDialogComponent
  ],
  templateUrl: './trash-tab.html',
  styleUrl: './trash-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrashTabComponent {
  private readonly themeService = inject(ThemeService);

  // Dialog references
  readonly restoreDocumentDialog = viewChild<RestoreDocumentDialogComponent>('restoreDocumentDialog');
  readonly permanentDeleteDialog = viewChild<PermanentDeleteDialogComponent>('permanentDeleteDialog');

  // Context menu
  readonly contextMenuItems = signal<MenuItem[]>([]);

  // State
  readonly searchQuery = signal('');
  readonly filterType = signal<FilterType>('all');
  readonly displayMode = this.themeService.displayMode;
  readonly selectedItems = signal<Set<number>>(new Set());

  private readonly trashItems = signal<TrashItem[]>(MOCK_TRASH_ITEMS);

  readonly filterOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Dossiers', value: 'folders' },
    { label: 'Fichiers', value: 'files' }
  ];

  // Computed
  readonly filteredItems = computed(() => {
    let items = this.trashItems();

    // Filter by type
    if (this.filterType() === 'folders') {
      items = items.filter(item => item.type === 'folder');
    } else if (this.filterType() === 'files') {
      items = items.filter(item => item.type === 'file');
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.originalPath.toLowerCase().includes(query)
      );
    }

    // Sort by deletion date (most recent first)
    return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
  });

  readonly totalCount = computed(() => this.trashItems().length);
  readonly filteredCount = computed(() => this.filteredItems().length);
  readonly selectedCount = computed(() => this.selectedItems().size);
  readonly allSelected = computed(() =>
    this.filteredItems().length > 0 &&
    this.filteredItems().every(item => this.selectedItems().has(item.id))
  );

  // Methods
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onFilterChange(value: FilterType): void {
    this.filterType.set(value);
  }

  toggleDisplayMode(): void {
    const newMode: DisplayMode = this.displayMode() === 'table' ? 'card' : 'table';
    this.themeService.setDisplayMode(newMode);
  }

  // Selection
  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedItems.set(new Set());
    } else {
      const newSet = new Set<number>();
      this.filteredItems().forEach(item => newSet.add(item.id));
      this.selectedItems.set(newSet);
    }
  }

  toggleItemSelection(id: number): void {
    this.selectedItems.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  isSelected(id: number): boolean {
    return this.selectedItems().has(id);
  }

  // Time remaining
  getDaysRemaining(deletedAt: Date): number {
    const now = new Date();
    const deleteDate = new Date(deletedAt);
    const expirationDate = new Date(deleteDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const remainingMs = expirationDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  }

  getRemainingLabel(deletedAt: Date): string {
    const days = this.getDaysRemaining(deletedAt);
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return '1 jour restant';
    return `${days} jours restants`;
  }

  getRemainingClass(deletedAt: Date): string {
    const days = this.getDaysRemaining(deletedAt);
    if (days <= 3) return 'danger';
    if (days <= 7) return 'warning';
    return 'normal';
  }

  // Icons
  getItemIcon(item: TrashItem): string {
    if (item.type === 'folder') {
      return 'fa-duotone fa-solid fa-folder';
    }
    switch (item.fileType) {
      case 'image': return 'fa-duotone fa-solid fa-file-image';
      case 'pdf': return 'fa-duotone fa-solid fa-file-pdf';
      case 'doc': return 'fa-duotone fa-solid fa-file-word';
      case 'xls': return 'fa-duotone fa-solid fa-file-excel';
      default: return 'fa-duotone fa-solid fa-file';
    }
  }

  getItemIconColor(item: TrashItem): string {
    if (item.type === 'folder') {
      return item.color || '#6b7280';
    }
    switch (item.fileType) {
      case 'image': return '#8b5cf6';
      case 'pdf': return '#ef4444';
      case 'doc': return '#3b82f6';
      case 'xls': return '#22c55e';
      default: return '#6b7280';
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  // Context menu
  buildContextMenu(item: TrashItem): MenuItem[] {
    return [
      {
        label: 'Restaurer',
        icon: 'fa-duotone fa-solid fa-trash-arrow-up',
        command: () => this.openRestoreDialog(item)
      },
      { separator: true },
      {
        label: 'Supprimer définitivement',
        icon: 'fa-duotone fa-solid fa-circle-xmark',
        command: () => this.openPermanentDeleteDialog(item)
      }
    ];
  }

  onContextMenu(event: MouseEvent, item: TrashItem): void {
    event.preventDefault();
    this.contextMenuItems.set(this.buildContextMenu(item));
  }

  // Restore dialog
  openRestoreDialog(item: TrashItem): void {
    this.restoreDocumentDialog()?.open(
      item.id,
      item.type,
      item.name,
      item.originalPath,
      MOCK_FOLDERS
    );
  }

  onDocumentRestored(result: RestoreDocumentResult): void {
    this.trashItems.update(items =>
      items.filter(item => item.id !== result.documentId)
    );
    this.selectedItems.update(set => {
      const newSet = new Set(set);
      newSet.delete(result.documentId);
      return newSet;
    });
  }

  // Permanent delete dialog
  openPermanentDeleteDialog(item: TrashItem): void {
    this.permanentDeleteDialog()?.openSingle(item.id, item.name);
  }

  openPermanentDeleteSelected(): void {
    const ids = Array.from(this.selectedItems());
    if (ids.length === 1) {
      const item = this.trashItems().find(i => i.id === ids[0]);
      if (item) {
        this.permanentDeleteDialog()?.openSingle(item.id, item.name);
      }
    } else {
      this.permanentDeleteDialog()?.openMultiple(ids);
    }
  }

  openEmptyTrashDialog(): void {
    this.permanentDeleteDialog()?.openAll(this.totalCount());
  }

  onPermanentlyDeleted(result: PermanentDeleteResult): void {
    if (result.deleteAll) {
      this.trashItems.set([]);
      this.selectedItems.set(new Set());
    } else {
      this.trashItems.update(items =>
        items.filter(item => !result.documentIds.includes(item.id))
      );
      this.selectedItems.update(set => {
        const newSet = new Set(set);
        result.documentIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }

  // Bulk restore
  restoreSelected(): void {
    const selectedIds = Array.from(this.selectedItems());
    if (selectedIds.length === 1) {
      const item = this.trashItems().find(i => i.id === selectedIds[0]);
      if (item) {
        this.openRestoreDialog(item);
      }
    }
    // For multiple items, we could implement a batch restore dialog
  }
}
