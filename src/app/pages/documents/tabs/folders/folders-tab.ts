import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Divider } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { ThemeService, DisplayMode } from '../../../../core/services';
import {
  CreateFolderDialogComponent,
  CreateFolderResult,
  UploadFilesDialogComponent,
  UploadFilesResult,
  ImportUrlDialogComponent,
  ImportUrlResult,
  MoveDocumentDialogComponent,
  MoveDocumentResult,
  CloneDocumentDialogComponent,
  CloneDocumentResult,
  DeleteDocumentDialogComponent,
  DeleteDocumentResult
} from '../../../../shared';

export interface Folder {
  id: number;
  name: string;
  filesCount: number;
  color: string;
  updatedAt: Date;
  parentId: number | null;
}

export interface DocumentFile {
  id: number;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'xls' | 'other';
  thumbnailUrl?: string;
  size: number;
  updatedAt: Date;
  folderId: number | null;
}

// Hiérarchie des dossiers
const MOCK_FOLDERS: Folder[] = [
  // Dossiers racines (parentId = null)
  { id: 1, name: 'Marketing', filesCount: 24, color: '#f472b6', updatedAt: new Date('2026-01-20'), parentId: null },
  { id: 2, name: 'Projets', filesCount: 8, color: '#a78bfa', updatedAt: new Date('2026-01-18'), parentId: null },
  { id: 3, name: 'Ressources', filesCount: 156, color: '#4ade80', updatedAt: new Date('2026-01-15'), parentId: null },
  { id: 4, name: 'Administration', filesCount: 32, color: '#22d3ee', updatedAt: new Date('2026-01-24'), parentId: null },

  // Sous-dossiers de Marketing (id: 1)
  { id: 11, name: 'Campagnes 2025', filesCount: 12, color: '#f472b6', updatedAt: new Date('2026-01-19'), parentId: 1 },
  { id: 12, name: 'Visuels', filesCount: 45, color: '#f472b6', updatedAt: new Date('2026-01-18'), parentId: 1 },
  { id: 13, name: 'Templates', filesCount: 8, color: '#f472b6', updatedAt: new Date('2026-01-17'), parentId: 1 },

  // Sous-dossiers de Campagnes 2025 (id: 11)
  { id: 111, name: 'Q1', filesCount: 4, color: '#f472b6', updatedAt: new Date('2026-01-15'), parentId: 11 },
  { id: 112, name: 'Q2', filesCount: 3, color: '#f472b6', updatedAt: new Date('2026-01-14'), parentId: 11 },
  { id: 113, name: 'Q3', filesCount: 5, color: '#f472b6', updatedAt: new Date('2026-01-13'), parentId: 11 },

  // Sous-dossiers de Projets (id: 2)
  { id: 21, name: 'Projet Alpha', filesCount: 15, color: '#a78bfa', updatedAt: new Date('2026-01-16'), parentId: 2 },
  { id: 22, name: 'Projet Beta', filesCount: 8, color: '#a78bfa', updatedAt: new Date('2026-01-15'), parentId: 2 },
  { id: 23, name: 'Archives', filesCount: 42, color: '#a78bfa', updatedAt: new Date('2026-01-10'), parentId: 2 },

  // Sous-dossiers de Projet Alpha (id: 21)
  { id: 211, name: 'Specs', filesCount: 5, color: '#a78bfa', updatedAt: new Date('2026-01-14'), parentId: 21 },
  { id: 212, name: 'Designs', filesCount: 10, color: '#a78bfa', updatedAt: new Date('2026-01-13'), parentId: 21 },

  // Sous-dossiers de Ressources (id: 3)
  { id: 31, name: 'Images', filesCount: 89, color: '#4ade80', updatedAt: new Date('2026-01-12'), parentId: 3 },
  { id: 32, name: 'Documents', filesCount: 34, color: '#4ade80', updatedAt: new Date('2026-01-11'), parentId: 3 },
  { id: 33, name: 'Vidéos', filesCount: 12, color: '#4ade80', updatedAt: new Date('2026-01-10'), parentId: 3 },

  // Sous-dossiers de Administration (id: 4)
  { id: 41, name: 'Contrats', filesCount: 18, color: '#22d3ee', updatedAt: new Date('2026-01-22'), parentId: 4 },
  { id: 42, name: 'Factures', filesCount: 56, color: '#22d3ee', updatedAt: new Date('2026-01-21'), parentId: 4 },
  { id: 43, name: 'RH', filesCount: 24, color: '#22d3ee', updatedAt: new Date('2026-01-20'), parentId: 4 },
];

// Fichiers avec leur dossier parent
const MOCK_FILES: DocumentFile[] = [
  // Fichiers à la racine (folderId = null)
  { id: 1, name: 'Readme.txt', type: 'doc', size: 2500, updatedAt: new Date('2026-01-23'), folderId: null },

  // Fichiers dans Marketing (id: 1)
  { id: 2, name: 'Stratégie-2026.pdf', type: 'pdf', size: 1250000, updatedAt: new Date('2026-01-22'), folderId: 1 },
  { id: 3, name: 'Budget-marketing.xlsx', type: 'xls', size: 45000, updatedAt: new Date('2026-01-21'), folderId: 1 },

  // Fichiers dans Visuels (id: 12)
  { id: 4, name: 'Logo-principal.png', type: 'image', thumbnailUrl: 'https://picsum.photos/seed/1/200/150', size: 245000, updatedAt: new Date('2026-01-20'), folderId: 12 },
  { id: 5, name: 'Banner-web.jpg', type: 'image', thumbnailUrl: 'https://picsum.photos/seed/2/200/150', size: 890000, updatedAt: new Date('2026-01-19'), folderId: 12 },
  { id: 6, name: 'Icon-set.png', type: 'image', thumbnailUrl: 'https://picsum.photos/seed/3/200/150', size: 156000, updatedAt: new Date('2026-01-18'), folderId: 12 },

  // Fichiers dans Campagnes Q1 (id: 111)
  { id: 7, name: 'Campagne-janvier.pdf', type: 'pdf', size: 3200000, updatedAt: new Date('2026-01-17'), folderId: 111 },
  { id: 8, name: 'Résultats-Q1.xlsx', type: 'xls', size: 78000, updatedAt: new Date('2026-01-16'), folderId: 111 },

  // Fichiers dans Projet Alpha (id: 21)
  { id: 9, name: 'Brief-projet.docx', type: 'doc', size: 28000, updatedAt: new Date('2026-01-15'), folderId: 21 },
  { id: 10, name: 'Planning.xlsx', type: 'xls', size: 35000, updatedAt: new Date('2026-01-14'), folderId: 21 },

  // Fichiers dans Specs (id: 211)
  { id: 11, name: 'Specs-techniques.pdf', type: 'pdf', size: 2100000, updatedAt: new Date('2026-01-13'), folderId: 211 },
  { id: 12, name: 'API-documentation.pdf', type: 'pdf', size: 1800000, updatedAt: new Date('2026-01-12'), folderId: 211 },

  // Fichiers dans Designs (id: 212)
  { id: 13, name: 'Maquette-v1.png', type: 'image', thumbnailUrl: 'https://picsum.photos/seed/4/200/150', size: 1200000, updatedAt: new Date('2026-01-11'), folderId: 212 },
  { id: 14, name: 'Maquette-v2.png', type: 'image', thumbnailUrl: 'https://picsum.photos/seed/5/200/150', size: 1350000, updatedAt: new Date('2026-01-10'), folderId: 212 },

  // Fichiers dans Contrats (id: 41)
  { id: 15, name: 'Contrat-fournisseur.pdf', type: 'pdf', size: 450000, updatedAt: new Date('2026-01-09'), folderId: 41 },
  { id: 16, name: 'Contrat-client-A.pdf', type: 'pdf', size: 380000, updatedAt: new Date('2026-01-08'), folderId: 41 },
];

type FilterType = 'all' | 'folders' | 'files';

@Component({
  selector: 'app-folders-tab',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    Divider,
    SelectModule,
    MenuModule,
    ContextMenuModule,
    CreateFolderDialogComponent,
    UploadFilesDialogComponent,
    ImportUrlDialogComponent,
    MoveDocumentDialogComponent,
    CloneDocumentDialogComponent,
    DeleteDocumentDialogComponent
  ],
  templateUrl: './folders-tab.html',
  styleUrl: './folders-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoldersTabComponent {
  private readonly themeService = inject(ThemeService);

  // Dialog references
  readonly createFolderDialog = viewChild<CreateFolderDialogComponent>('createFolderDialog');
  readonly uploadFilesDialog = viewChild<UploadFilesDialogComponent>('uploadFilesDialog');
  readonly importUrlDialog = viewChild<ImportUrlDialogComponent>('importUrlDialog');
  readonly moveDocumentDialog = viewChild<MoveDocumentDialogComponent>('moveDocumentDialog');
  readonly cloneDocumentDialog = viewChild<CloneDocumentDialogComponent>('cloneDocumentDialog');
  readonly deleteDocumentDialog = viewChild<DeleteDocumentDialogComponent>('deleteDocumentDialog');

  // Drag & drop state
  readonly draggedItem = signal<{ id: number; type: 'folder' | 'file'; name: string } | null>(null);
  readonly dropTargetId = signal<number | null>(null);

  // Context menu
  readonly contextMenuItems = signal<MenuItem[]>([]);

  readonly folderId = input<string | null>(null);
  readonly searchQuery = signal('');
  readonly filterType = signal<FilterType>('all');
  readonly displayMode = this.themeService.displayMode;

  private readonly allFolders = signal<Folder[]>(MOCK_FOLDERS);
  private readonly allFiles = signal<DocumentFile[]>(MOCK_FILES);

  readonly filterOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Dossiers', value: 'folders' },
    { label: 'Fichiers', value: 'files' }
  ];

  readonly addMenuItems: MenuItem[] = [
    { label: 'Importer un fichier', icon: 'fa-duotone fa-solid fa-file-import', command: () => this.openUploadFilesDialog() },
    { label: 'Importer depuis URL', icon: 'fa-duotone fa-solid fa-link', command: () => this.openImportUrlDialog() }
  ];

  // Dossier actuel
  readonly currentFolder = computed(() => {
    const id = Number(this.folderId());
    if (!id) return null;
    return this.allFolders().find(f => f.id === id) ?? null;
  });

  // Dossiers enfants du dossier actuel
  readonly childFolders = computed(() => {
    const currentId = this.folderId() ? Number(this.folderId()) : null;
    return this.allFolders().filter(f => f.parentId === currentId);
  });

  // Fichiers du dossier actuel
  readonly folderFiles = computed(() => {
    const currentId = this.folderId() ? Number(this.folderId()) : null;
    return this.allFiles().filter(f => f.folderId === currentId);
  });

  // Fil d'Ariane (breadcrumb)
  readonly breadcrumb = computed(() => {
    const path: Folder[] = [];
    let currentId = this.folderId() ? Number(this.folderId()) : null;

    while (currentId) {
      const folder = this.allFolders().find(f => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return path;
  });

  readonly filteredFolders = computed(() => {
    if (this.filterType() === 'files') return [];
    const query = this.searchQuery().toLowerCase().trim();
    const folders = this.childFolders();
    if (!query) return folders;
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(query)
    );
  });

  readonly filteredFiles = computed(() => {
    if (this.filterType() === 'folders') return [];
    const query = this.searchQuery().toLowerCase().trim();
    const files = this.folderFiles();
    if (!query) return files;
    return files.filter(file =>
      file.name.toLowerCase().includes(query)
    );
  });

  getFolderPath(folderId: number): string {
    return `/documents/folders/${folderId}`;
  }

  readonly foldersCount = computed(() => this.filteredFolders().length);
  readonly filesCount = computed(() => this.filteredFiles().length);

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

  getFileIcon(type: DocumentFile['type']): string {
    switch (type) {
      case 'image': return 'fa-duotone fa-solid fa-file-image';
      case 'pdf': return 'fa-duotone fa-solid fa-file-pdf';
      case 'doc': return 'fa-duotone fa-solid fa-file-word';
      case 'xls': return 'fa-duotone fa-solid fa-file-excel';
      default: return 'fa-duotone fa-solid fa-file';
    }
  }

  getFileIconColor(type: DocumentFile['type']): string {
    switch (type) {
      case 'image': return '#8b5cf6';
      case 'pdf': return '#ef4444';
      case 'doc': return '#3b82f6';
      case 'xls': return '#22c55e';
      default: return '#6b7280';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  // Dialog methods
  openCreateFolderDialog(): void {
    this.createFolderDialog()?.open();
  }

  openUploadFilesDialog(): void {
    this.uploadFilesDialog()?.open();
  }

  openImportUrlDialog(): void {
    this.importUrlDialog()?.open();
  }

  onFolderCreated(result: CreateFolderResult): void {
    const currentParentId = this.folderId() ? Number(this.folderId()) : null;
    const newFolder: Folder = {
      id: Date.now(),
      name: result.name,
      filesCount: 0,
      color: result.color,
      updatedAt: new Date(),
      parentId: currentParentId
    };
    this.allFolders.update(folders => [...folders, newFolder]);
  }

  onFilesUploaded(result: UploadFilesResult): void {
    const currentFolderId = this.folderId() ? Number(this.folderId()) : null;
    const newFiles: DocumentFile[] = result.files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: this.getFileTypeFromMime(file.type),
      size: file.size,
      updatedAt: new Date(),
      folderId: currentFolderId
    }));
    this.allFiles.update(files => [...files, ...newFiles]);
  }

  onUrlImported(result: ImportUrlResult): void {
    const currentFolderId = this.folderId() ? Number(this.folderId()) : null;
    const newFile: DocumentFile = {
      id: Date.now(),
      name: result.fileName,
      type: this.getFileTypeFromName(result.fileName),
      size: 0,
      updatedAt: new Date(),
      folderId: currentFolderId
    };
    this.allFiles.update(files => [...files, newFile]);
  }

  private getFileTypeFromMime(mimeType: string): DocumentFile['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
    return 'other';
  }

  private getFileTypeFromName(fileName: string): DocumentFile['type'] {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext ?? '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext ?? '')) return 'doc';
    if (['xls', 'xlsx'].includes(ext ?? '')) return 'xls';
    return 'other';
  }

  // Context menu methods
  buildContextMenu(id: number, type: 'folder' | 'file', name: string): MenuItem[] {
    return [
      {
        label: 'Déplacer',
        icon: 'fa-duotone fa-solid fa-arrow-right-arrow-left',
        command: () => this.openMoveDialog(id, type, name)
      },
      {
        label: 'Cloner',
        icon: 'fa-duotone fa-solid fa-copy',
        command: () => this.openCloneDialog(id, type, name)
      },
      { separator: true },
      {
        label: 'Supprimer',
        icon: 'fa-duotone fa-solid fa-trash',
        command: () => this.openDeleteDialog(id, type, name)
      }
    ];
  }

  onContextMenu(event: MouseEvent, id: number, type: 'folder' | 'file', name: string): void {
    event.preventDefault();
    this.contextMenuItems.set(this.buildContextMenu(id, type, name));
  }

  // Move dialog
  openMoveDialog(id: number, type: 'folder' | 'file', name: string): void {
    const folders = this.allFolders().map(f => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      color: f.color
    }));
    this.moveDocumentDialog()?.open(id, type, name, folders);
  }

  onDocumentMoved(result: MoveDocumentResult): void {
    if (result.documentType === 'folder') {
      this.allFolders.update(folders =>
        folders.map(f =>
          f.id === result.documentId
            ? { ...f, parentId: result.destinationFolderId, updatedAt: new Date() }
            : f
        )
      );
    } else {
      this.allFiles.update(files =>
        files.map(f =>
          f.id === result.documentId
            ? { ...f, folderId: result.destinationFolderId, updatedAt: new Date() }
            : f
        )
      );
    }
  }

  // Clone dialog
  openCloneDialog(id: number, type: 'folder' | 'file', name: string): void {
    const folders = this.allFolders().map(f => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      color: f.color
    }));
    this.cloneDocumentDialog()?.open(id, type, name, folders);
  }

  onDocumentCloned(result: CloneDocumentResult): void {
    if (result.documentType === 'folder') {
      const originalFolder = this.allFolders().find(f => f.id === result.documentId);
      if (originalFolder) {
        const newFolders = result.destinationFolderIds.map((destId, index) => ({
          ...originalFolder,
          id: Date.now() + index,
          parentId: destId,
          name: `${originalFolder.name} (copie)`,
          updatedAt: new Date()
        }));
        this.allFolders.update(folders => [...folders, ...newFolders]);
      }
    } else {
      const originalFile = this.allFiles().find(f => f.id === result.documentId);
      if (originalFile) {
        const newFiles = result.destinationFolderIds.map((destId, index) => ({
          ...originalFile,
          id: Date.now() + index,
          folderId: destId,
          name: `${originalFile.name.replace(/(\.[^.]+)$/, ' (copie)$1')}`,
          updatedAt: new Date()
        }));
        this.allFiles.update(files => [...files, ...newFiles]);
      }
    }
  }

  // Delete dialog
  openDeleteDialog(id: number, type: 'folder' | 'file', name: string): void {
    this.deleteDocumentDialog()?.open(id, type, name);
  }

  onDocumentDeleted(result: DeleteDocumentResult): void {
    if (result.documentType === 'folder') {
      // Recursively delete folder and all its contents
      const folderIdsToDelete = this.getFolderAndDescendantIds(result.documentId);
      this.allFolders.update(folders =>
        folders.filter(f => !folderIdsToDelete.includes(f.id))
      );
      this.allFiles.update(files =>
        files.filter(f => !folderIdsToDelete.includes(f.folderId ?? -1))
      );
    } else {
      this.allFiles.update(files =>
        files.filter(f => f.id !== result.documentId)
      );
    }
  }

  private getFolderAndDescendantIds(folderId: number): number[] {
    const ids = [folderId];
    const children = this.allFolders().filter(f => f.parentId === folderId);
    for (const child of children) {
      ids.push(...this.getFolderAndDescendantIds(child.id));
    }
    return ids;
  }

  // Drag & Drop methods
  onDragStart(event: DragEvent, id: number, type: 'folder' | 'file', name: string): void {
    this.draggedItem.set({ id, type, name });
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ id, type, name }));
    }
  }

  onDragEnd(): void {
    this.draggedItem.set(null);
    this.dropTargetId.set(null);
  }

  onDragOver(event: DragEvent, targetFolderId: number): void {
    event.preventDefault();
    const dragged = this.draggedItem();
    if (!dragged) return;

    // Prevent dropping folder into itself or its descendants
    if (dragged.type === 'folder' && this.isDescendantOf(targetFolderId, dragged.id)) {
      return;
    }

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dropTargetId.set(targetFolderId);
  }

  onDragLeave(): void {
    this.dropTargetId.set(null);
  }

  onDrop(event: DragEvent, targetFolderId: number): void {
    event.preventDefault();
    const dragged = this.draggedItem();

    if (!dragged) return;

    // Prevent dropping folder into itself or its descendants
    if (dragged.type === 'folder' && this.isDescendantOf(targetFolderId, dragged.id)) {
      this.draggedItem.set(null);
      this.dropTargetId.set(null);
      return;
    }

    // Move the item
    if (dragged.type === 'folder') {
      this.allFolders.update(folders =>
        folders.map(f =>
          f.id === dragged.id
            ? { ...f, parentId: targetFolderId, updatedAt: new Date() }
            : f
        )
      );
    } else {
      this.allFiles.update(files =>
        files.map(f =>
          f.id === dragged.id
            ? { ...f, folderId: targetFolderId, updatedAt: new Date() }
            : f
        )
      );
    }

    this.draggedItem.set(null);
    this.dropTargetId.set(null);
  }

  private isDescendantOf(potentialDescendant: number, ancestorId: number): boolean {
    if (potentialDescendant === ancestorId) return true;
    const folder = this.allFolders().find(f => f.id === potentialDescendant);
    if (!folder || folder.parentId === null) return false;
    return this.isDescendantOf(folder.parentId, ancestorId);
  }

  isDropTarget(folderId: number): boolean {
    return this.dropTargetId() === folderId;
  }
}
