import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ContextMenuModule } from 'primeng/contextmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem } from 'primeng/api';
import { ThemeService, DisplayMode, FoldersService, DocumentsService } from '../../../../core/services';
import { TrashItemResponse } from '../../../../models';
import {
  RestoreDocumentDialogComponent,
  RestoreDocumentResult,
  PermanentDeleteDialogComponent,
  PermanentDeleteResult,
  getFileIcon,
  getFileIconColor,
  formatFileSize
} from '../../../../shared';

// Extended trash item for UI
interface TrashItemView extends TrashItemResponse {
  fileType: 'folder' | 'image' | 'pdf' | 'doc' | 'xls' | 'other';
  color: string;
}

type FilterType = 'all' | 'folders' | 'files';

@Component({
  selector: 'app-trash-tab',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    ContextMenuModule,
    CheckboxModule,
    ProgressSpinnerModule,
    RestoreDocumentDialogComponent,
    PermanentDeleteDialogComponent
  ],
  templateUrl: './trash-tab.html',
  styleUrl: './trash-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrashTabComponent {
  private readonly themeService = inject(ThemeService);
  private readonly foldersService = inject(FoldersService);
  private readonly documentsService = inject(DocumentsService);

  // Dialog references
  readonly restoreDocumentDialog = viewChild<RestoreDocumentDialogComponent>('restoreDocumentDialog');
  readonly permanentDeleteDialog = viewChild<PermanentDeleteDialogComponent>('permanentDeleteDialog');

  // Context menu
  readonly contextMenuItems = signal<MenuItem[]>([]);

  // Input
  readonly spaceId = input.required<string>();

  // State
  readonly searchQuery = signal('');
  readonly filterType = signal<FilterType>('all');
  readonly displayMode = this.themeService.displayMode;
  readonly selectedItems = signal<Set<string>>(new Set());
  readonly loading = signal(false);

  private readonly trashItems = signal<TrashItemView[]>([]);

  readonly filterOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Dossiers', value: 'folders' },
    { label: 'Fichiers', value: 'files' }
  ];

  constructor() {
    effect(() => {
      const space = this.spaceId();
      if (space) {
        this.loadTrashItems(space);
      }
    }, { allowSignalWrites: true });
  }

  private loadTrashItems(spaceId: string): void {
    this.loading.set(true);
    this.foldersService.getTrash(spaceId).subscribe({
      next: (items) => {
        this.trashItems.set(items.map(item => this.mapTrashItem(item)));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading trash items:', error);
        this.loading.set(false);
      }
    });
  }

  private mapTrashItem(item: TrashItemResponse): TrashItemView {
    return {
      ...item,
      fileType: item.itemType === 'folder' ? 'folder' : this.getDocType(item.itemName),
      color: this.getItemColor(item.itemName)
    };
  }

  private getDocType(name: string): 'image' | 'pdf' | 'doc' | 'xls' | 'other' {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'xls';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'doc';
    return 'other';
  }

  private getItemColor(name: string): string {
    const colors = ['#f472b6', '#a78bfa', '#4ade80', '#22d3ee', '#fb923c', '#8b5cf6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Computed
  readonly filteredItems = computed(() => {
    let items = this.trashItems();

    // Filter by type
    if (this.filterType() === 'folders') {
      items = items.filter(item => item.itemType === 'folder');
    } else if (this.filterType() === 'files') {
      items = items.filter(item => item.itemType === 'reference');
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      items = items.filter(item =>
        item.itemName.toLowerCase().includes(query)
      );
    }

    // Sort by deletion date (most recent first)
    return items.sort((a, b) => {
      const dateA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
      const dateB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
      return dateB - dateA;
    });
  });

  readonly totalCount = computed(() => this.trashItems().length);
  readonly filteredCount = computed(() => this.filteredItems().length);
  readonly selectedCount = computed(() => this.selectedItems().size);
  readonly allSelected = computed(() =>
    this.filteredItems().length > 0 &&
    this.filteredItems().every(item => this.selectedItems().has(item._id))
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
      const newSet = new Set<string>();
      this.filteredItems().forEach(item => newSet.add(item._id));
      this.selectedItems.set(newSet);
    }
  }

  toggleItemSelection(id: string): void {
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

  isSelected(id: string): boolean {
    return this.selectedItems().has(id);
  }

  // Time remaining - use expiresAt from API or calculate from deletedAt
  getDaysRemaining(item: TrashItemView): number {
    if (item.expiresAt) {
      const now = new Date();
      const expirationDate = new Date(item.expiresAt);
      const remainingMs = expirationDate.getTime() - now.getTime();
      return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
    }
    if (!item.deletedAt) return 30;
    const now = new Date();
    const deleteDate = new Date(item.deletedAt);
    const expirationDate = new Date(deleteDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const remainingMs = expirationDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  }

  getRemainingLabel(item: TrashItemView): string {
    const days = this.getDaysRemaining(item);
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return '1 jour restant';
    return `${days} jours restants`;
  }

  getRemainingClass(item: TrashItemView): string {
    const days = this.getDaysRemaining(item);
    if (days <= 3) return 'danger';
    if (days <= 7) return 'warning';
    return 'normal';
  }

  // Icons
  getItemIcon(item: TrashItemView): string {
    if (item.itemType === 'folder') {
      return 'fa-duotone fa-solid fa-folder';
    }
    // Filter out 'folder' as it's not a valid FileType
    const fileType = item.fileType === 'folder' ? 'other' : item.fileType;
    return getFileIcon(fileType);
  }

  getItemIconColor(item: TrashItemView): string {
    if (item.itemType === 'folder') {
      return item.color || '#6b7280';
    }
    // Filter out 'folder' as it's not a valid FileType
    const fileType = item.fileType === 'folder' ? 'other' : item.fileType;
    return getFileIconColor(fileType);
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '';
    return formatFileSize(bytes);
  }

  // Context menu
  buildContextMenu(item: TrashItemView): MenuItem[] {
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

  onContextMenu(event: MouseEvent, item: TrashItemView): void {
    event.preventDefault();
    this.contextMenuItems.set(this.buildContextMenu(item));
  }

  // Restore dialog
  openRestoreDialog(item: TrashItemView): void {
    // For restore, we use the itemId (actual folder/reference ID) not the trash item ID
    this.restoreDocumentDialog()?.open(
      item.itemId,
      item.itemType === 'folder' ? 'folder' : 'file',
      item.itemName,
      item.originalParentName ?? '',
      [] // We don't need folder tree for simple restore
    );
  }

  onDocumentRestored(result: RestoreDocumentResult): void {
    const item = this.trashItems().find(i => i.itemId === result.documentId);
    if (!item) return;

    // Call API to restore
    if (item.itemType === 'folder') {
      this.foldersService.restoreFolder(item.itemId).subscribe({
        next: () => this.loadTrashItems(this.spaceId()),
        error: (error) => console.error('Error restoring folder:', error)
      });
    } else {
      // Restore reference
      this.documentsService.restoreReference(item.itemId).subscribe({
        next: () => this.loadTrashItems(this.spaceId()),
        error: (error) => console.error('Error restoring reference:', error)
      });
    }
  }

  // Permanent delete dialog
  openPermanentDeleteDialog(item: TrashItemView): void {
    this.permanentDeleteDialog()?.openSingle(item.itemId, item.itemName);
  }

  openPermanentDeleteSelected(): void {
    const ids = Array.from(this.selectedItems());
    if (ids.length === 1) {
      const item = this.trashItems().find(i => i._id === ids[0]);
      if (item) {
        this.permanentDeleteDialog()?.openSingle(item.itemId, item.itemName);
      }
    } else {
      // For multiple items, get their itemIds
      const itemIds = ids
        .map(id => this.trashItems().find(i => i._id === id)?.itemId)
        .filter((id): id is string => id !== undefined);
      this.permanentDeleteDialog()?.openMultiple(itemIds);
    }
  }

  openEmptyTrashDialog(): void {
    this.permanentDeleteDialog()?.openAll(this.totalCount());
  }

  onPermanentlyDeleted(result: PermanentDeleteResult): void {
    if (result.deleteAll) {
      // Call API to empty trash
      this.foldersService.emptyTrash(this.spaceId()).subscribe({
        next: () => {
          this.trashItems.set([]);
          this.selectedItems.set(new Set());
        },
        error: (error) => console.error('Error emptying trash:', error)
      });
    } else if (result.documentIds && result.documentIds.length > 0) {
      // Purge individual items
      const item = this.trashItems().find(i => i.itemId === result.documentIds![0]);
      if (item) {
        if (item.itemType === 'folder') {
          this.foldersService.purgeFolder(item.itemId).subscribe({
            next: () => this.loadTrashItems(this.spaceId()),
            error: (error) => console.error('Error purging folder:', error)
          });
        } else {
          this.documentsService.purgeReference(item.itemId).subscribe({
            next: () => this.loadTrashItems(this.spaceId()),
            error: (error) => console.error('Error purging reference:', error)
          });
        }
      }
    }
  }

  // Bulk restore
  restoreSelected(): void {
    const selectedIds = Array.from(this.selectedItems());
    if (selectedIds.length === 1) {
      const item = this.trashItems().find(i => i._id === selectedIds[0]);
      if (item) {
        this.openRestoreDialog(item);
      }
    }
  }
}
