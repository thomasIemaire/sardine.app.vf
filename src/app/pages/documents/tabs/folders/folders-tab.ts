import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem } from 'primeng/api';
import { ThemeService, DisplayMode, FoldersService, DocumentsService } from '../../../../core/services';
import { FolderListItem, DocumentReferenceInFolder, FolderContentResponse, FolderBreadcrumb } from '../../../../models';
import {
  CardContainerComponent,
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
  DeleteDocumentResult,
  ShareDialogComponent,
  ShareResult,
  getFileIcon,
  getFileIconColor,
  formatFileSize
} from '../../../../shared';

// Extended folder for UI (with color)
interface FolderView extends FolderListItem {
  color: string;
}

// Extended document for UI
interface DocumentView extends DocumentReferenceInFolder {
  fileType: 'image' | 'pdf' | 'doc' | 'xls' | 'other';
}

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
    Divider,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    MenuModule,
    ContextMenuModule,
    ProgressSpinnerModule,
    CardContainerComponent,
    CreateFolderDialogComponent,
    UploadFilesDialogComponent,
    ImportUrlDialogComponent,
    MoveDocumentDialogComponent,
    CloneDocumentDialogComponent,
    DeleteDocumentDialogComponent,
    ShareDialogComponent
  ],
  templateUrl: './folders-tab.html',
  styleUrl: './folders-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoldersTabComponent {
  private readonly themeService = inject(ThemeService);
  private readonly foldersService = inject(FoldersService);
  private readonly documentsService = inject(DocumentsService);

  // Dialog references
  readonly createFolderDialog = viewChild<CreateFolderDialogComponent>('createFolderDialog');
  readonly uploadFilesDialog = viewChild<UploadFilesDialogComponent>('uploadFilesDialog');
  readonly importUrlDialog = viewChild<ImportUrlDialogComponent>('importUrlDialog');
  readonly moveDocumentDialog = viewChild<MoveDocumentDialogComponent>('moveDocumentDialog');
  readonly cloneDocumentDialog = viewChild<CloneDocumentDialogComponent>('cloneDocumentDialog');
  readonly deleteDocumentDialog = viewChild<DeleteDocumentDialogComponent>('deleteDocumentDialog');
  readonly shareDialog = viewChild<ShareDialogComponent>('shareDialog');

  // Context menu
  readonly contextMenuItems = signal<MenuItem[]>([]);

  // Inputs
  readonly folderId = input<string | null>(null);
  readonly spaceId = input.required<string>();

  readonly searchQuery = signal('');
  readonly filterType = signal<FilterType>('all');
  readonly displayMode = this.themeService.displayMode;
  readonly loading = signal(false);

  private readonly childFolders = signal<FolderView[]>([]);
  private readonly folderFiles = signal<DocumentView[]>([]);
  private readonly currentFolderData = signal<FolderContentResponse | null>(null);

  // Breadcrumb from API
  readonly breadcrumb = signal<FolderBreadcrumb[]>([]);

  readonly filterOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Dossiers', value: 'folders' },
    { label: 'Fichiers', value: 'files' }
  ];

  readonly addMenuItems: MenuItem[] = [
    { label: 'Importer un fichier', icon: 'fa-duotone fa-solid fa-file-import', command: () => this.openUploadFilesDialog() },
    { label: 'Importer depuis URL', icon: 'fa-duotone fa-solid fa-link', command: () => this.openImportUrlDialog() }
  ];

  // Drag & drop state
  readonly draggedItem = signal<{ id: string; type: 'folder' | 'file'; name: string; documentId?: string } | null>(null);
  readonly dropTargetId = signal<string | null>(null);

  constructor() {
    // Load content when folderId or spaceId changes
    effect(() => {
      const id = this.folderId();
      const space = this.spaceId();
      if (space) {
        this.loadContent(id, space);
      }
    }, { allowSignalWrites: true });
  }

  private loadContent(folderId: string | null, spaceId: string): void {
    this.loading.set(true);

    if (folderId) {
      // Load folder content by folder ID
      this.foldersService.getFolderContent(folderId).subscribe({
        next: (content) => {
          this.currentFolderData.set(content);
          this.childFolders.set(content.subfolders.map(f => this.mapFolder(f)));
          this.folderFiles.set(content.documents.map(d => this.mapDocument(d)));
          this.breadcrumb.set(content.breadcrumb);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading folder content:', error);
          this.loading.set(false);
        }
      });
    } else {
      // Load root folder content for this space
      this.foldersService.getRootFolder(spaceId).subscribe({
        next: (rootFolder) => {
          // Now load the content of the root folder
          this.foldersService.getFolderContent(rootFolder._id).subscribe({
            next: (content) => {
              this.currentFolderData.set(content);
              this.childFolders.set(content.subfolders.map(f => this.mapFolder(f)));
              this.folderFiles.set(content.documents.map(d => this.mapDocument(d)));
              this.breadcrumb.set([]); // Root has no breadcrumb
              this.loading.set(false);
            },
            error: (error) => {
              console.error('Error loading root folder content:', error);
              this.loading.set(false);
            }
          });
        },
        error: (error) => {
          console.error('Error getting root folder:', error);
          this.loading.set(false);
        }
      });
    }
  }

  private mapFolder(folder: FolderListItem): FolderView {
    return {
      ...folder,
      color: folder.color || this.getFolderColor(folder.name)
    };
  }

  private mapDocument(doc: DocumentReferenceInFolder): DocumentView {
    return {
      ...doc,
      fileType: this.getDocType(doc.mimeType, doc.name)
    };
  }

  private getDocType(mimeType: string | null | undefined, name: string): 'image' | 'pdf' | 'doc' | 'xls' | 'other' {
    if (mimeType) {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType === 'application/pdf') return 'pdf';
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xls';
      if (mimeType.includes('document') || mimeType.includes('word')) return 'doc';
    }
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'xls';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'doc';
    return 'other';
  }

  private getFolderColor(name: string): string {
    const colors = ['#f472b6', '#a78bfa', '#4ade80', '#22d3ee', '#fb923c', '#8b5cf6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Build folder tree from current content and breadcrumb
  private buildFolderTree(): { id: string; name: string; parentId: string | null; color: string }[] {
    const currentContent = this.currentFolderData();
    if (!currentContent) return [];

    const folders: { id: string; name: string; parentId: string | null; color: string }[] = [];

    // Add current folder
    folders.push({
      id: currentContent.folder._id,
      name: currentContent.folder.name,
      parentId: currentContent.folder.parentId ?? null,
      color: this.getFolderColor(currentContent.folder.name)
    });

    // Add breadcrumb folders (parents)
    for (const crumb of this.breadcrumb()) {
      if (!folders.some(f => f.id === crumb.id)) {
        folders.push({
          id: crumb.id,
          name: crumb.name,
          parentId: null, // We don't have parent info from breadcrumb
          color: this.getFolderColor(crumb.name)
        });
      }
    }

    // Add subfolders
    for (const sub of currentContent.subfolders) {
      if (!folders.some(f => f.id === sub._id)) {
        folders.push({
          id: sub._id,
          name: sub.name,
          parentId: sub.parentId ?? currentContent.folder._id,
          color: this.getFolderColor(sub.name)
        });
      }
    }

    return folders;
  }

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

  getFolderPath(folderId: string): string {
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

  readonly getFileIcon = getFileIcon;
  readonly getFileIconColor = getFileIconColor;
  readonly formatFileSize = formatFileSize;

  // Get current folder ID (from input or from loaded root folder)
  private getCurrentFolderId(): string | null {
    return this.folderId() ?? this.currentFolderData()?.folder._id ?? null;
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
    const currentParentId = this.getCurrentFolderId();
    this.foldersService.createFolder(this.spaceId(), {
      name: result.name,
      parentId: currentParentId
    }).subscribe({
      next: () => this.loadContent(this.folderId(), this.spaceId()),
      error: (error) => console.error('Error creating folder:', error)
    });
  }

  onFilesUploaded(result: UploadFilesResult): void {
    const currentFolderId = this.getCurrentFolderId();
    if (!currentFolderId) {
      console.error('No folder ID available for upload');
      return;
    }

    // Upload each file
    for (const uploadedFile of result.files) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.documentsService.importDocument({
          name: uploadedFile.name,
          folderId: currentFolderId,
          mimeType: uploadedFile.type,
          size: uploadedFile.size,
          content: base64
        }).subscribe({
          next: () => this.loadContent(this.folderId(), this.spaceId()),
          error: (error) => console.error('Error uploading file:', error)
        });
      };
      reader.readAsDataURL(uploadedFile.file);
    }
  }

  onUrlImported(result: ImportUrlResult): void {
    const currentFolderId = this.getCurrentFolderId();
    if (!currentFolderId) {
      console.error('No folder ID available for import');
      return;
    }

    this.documentsService.importDocument({
      name: result.fileName,
      folderId: currentFolderId
    }).subscribe({
      next: () => this.loadContent(this.folderId(), this.spaceId()),
      error: (error) => console.error('Error importing URL:', error)
    });
  }

  // Context menu methods
  buildContextMenu(id: string, type: 'folder' | 'file', name: string, documentId?: string): MenuItem[] {
    return [
      {
        label: 'Partager',
        icon: 'fa-duotone fa-solid fa-share-nodes',
        command: () => this.openShareDialog(id, type, name, documentId)
      },
      { separator: true },
      {
        label: 'Déplacer',
        icon: 'fa-duotone fa-solid fa-arrow-right-arrow-left',
        command: () => this.openMoveDialog(id, type, name, documentId)
      },
      {
        label: 'Cloner',
        icon: 'fa-duotone fa-solid fa-copy',
        command: () => this.openCloneDialog(id, type, name, documentId),
        visible: type === 'file' // Only files can be cloned
      },
      { separator: true },
      {
        label: 'Supprimer',
        icon: 'fa-duotone fa-solid fa-trash',
        command: () => this.openDeleteDialog(id, type, name, documentId)
      }
    ];
  }

  onContextMenu(event: MouseEvent, id: string, type: 'folder' | 'file', name: string, documentId?: string): void {
    event.preventDefault();
    this.contextMenuItems.set(this.buildContextMenu(id, type, name, documentId));
  }

  // Move dialog - for files, we use reference ID
  openMoveDialog(id: string, type: 'folder' | 'file', name: string, _documentId?: string): void {
    const sourceFolderId = this.getCurrentFolderId();
    const folderTree = this.buildFolderTree();
    this.moveDocumentDialog()?.open(id, type, name, sourceFolderId, folderTree);
  }

  onDocumentMoved(result: MoveDocumentResult): void {
    if (result.documentType === 'folder') {
      // Move folder using moveFolder API
      this.foldersService.moveFolder(result.documentId, {
        targetParentId: result.targetFolderId
      }).subscribe({
        next: () => this.loadContent(this.folderId(), this.spaceId()),
        error: (error) => console.error('Error moving folder:', error)
      });
    } else {
      // Move reference using moveReference API
      this.documentsService.moveReference(result.documentId, {
        targetFolderId: result.targetFolderId!
      }).subscribe({
        next: () => this.loadContent(this.folderId(), this.spaceId()),
        error: (error) => console.error('Error moving reference:', error)
      });
    }
  }

  // Clone dialog - only for files, uses document ID
  openCloneDialog(id: string, type: 'folder' | 'file', name: string, documentId?: string): void {
    if (type === 'folder') return; // Folders can't be cloned

    // For clone, we need the documentId, not the reference id
    const docId = documentId || id;
    if (!docId) {
      console.error('No document ID available for clone');
      return;
    }

    const folderTree = this.buildFolderTree();
    this.cloneDocumentDialog()?.open(docId, type, name, folderTree);
  }

  onDocumentCloned(result: CloneDocumentResult): void {
    if (result.documentType === 'folder') return; // Folders can't be cloned

    // Clone references to multiple folders
    this.documentsService.cloneReferences(result.documentId, {
      folderIds: result.destinationFolderIds.filter((id): id is string => id !== null)
    }).subscribe({
      next: () => this.loadContent(this.folderId(), this.spaceId()),
      error: (error) => console.error('Error cloning document:', error)
    });
  }

  // Delete
  private deleteItem(id: string, type: 'folder' | 'file'): void {
    if (type === 'folder') {
      this.foldersService.deleteFolder(id).subscribe({
        next: () => this.loadContent(this.folderId(), this.spaceId()),
        error: (error) => console.error('Error deleting folder:', error)
      });
    } else {
      // id is the reference ID
      this.documentsService.trashReference(id).subscribe({
        next: () => this.loadContent(this.folderId(), this.spaceId()),
        error: (error) => console.error('Error trashing reference:', error)
      });
    }
  }

  openDeleteDialog(id: string, type: 'folder' | 'file', name: string, _documentId?: string): void {
    this.deleteDocumentDialog()?.open(id, type, name);
  }

  onDocumentDeleted(result: DeleteDocumentResult): void {
    this.deleteItem(result.documentId, result.documentType);
  }

  // Share dialog
  openShareDialog(id: string, type: 'folder' | 'file', name: string, documentId?: string): void {
    if (type === 'folder') {
      this.shareDialog()?.open(id, 'folder', name);
    } else {
      // For files, we share the document itself (not the reference)
      const docId = documentId || id;
      this.shareDialog()?.open(docId, 'document', name);
    }
  }

  onPermissionsChanged(_result: ShareResult): void {
    // Permissions changed, could refresh or show notification
    // For now, no action needed as permissions don't affect the folder listing
  }

  // Drag & drop methods
  onDragStart(event: DragEvent, id: string, type: 'folder' | 'file', name: string, documentId?: string): void {
    this.draggedItem.set({ id, type, name, documentId });
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', id);
    }
  }

  onDragEnd(): void {
    this.draggedItem.set(null);
    this.dropTargetId.set(null);
  }

  onDragOver(event: DragEvent, targetFolderId: string): void {
    const dragged = this.draggedItem();
    if (!dragged) return;

    // Can't drop a folder into itself or into a file
    if (dragged.type === 'folder' && dragged.id === targetFolderId) return;

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dropTargetId.set(targetFolderId);
  }

  onDragLeave(): void {
    this.dropTargetId.set(null);
  }

  onDrop(event: DragEvent, targetFolderId: string): void {
    event.preventDefault();
    const dragged = this.draggedItem();
    if (!dragged) return;

    // Can't drop a folder into itself
    if (dragged.type === 'folder' && dragged.id === targetFolderId) {
      this.onDragEnd();
      return;
    }

    // Move the item
    if (dragged.type === 'folder') {
      // Move folder
      this.foldersService.moveFolder(dragged.id, {
        targetParentId: targetFolderId
      }).subscribe({
        next: () => this.loadContent(this.folderId(), this.spaceId()),
        error: (error) => console.error('Error moving folder:', error)
      });
    } else {
      // Move reference (dragged.id is the reference ID)
      this.documentsService.moveReference(dragged.id, {
        targetFolderId: targetFolderId
      }).subscribe({
        next: () => this.loadContent(this.folderId(), this.spaceId()),
        error: (error) => console.error('Error moving reference:', error)
      });
    }

    this.onDragEnd();
  }

  onDropToRoot(event: DragEvent): void {
    event.preventDefault();
    const dragged = this.draggedItem();
    if (!dragged) return;

    const rootFolderId = this.currentFolderData()?.folder._id;
    if (!rootFolderId) {
      this.onDragEnd();
      return;
    }

    // Move to root folder
    if (dragged.type === 'file') {
      this.documentsService.moveReference(dragged.id, {
        targetFolderId: rootFolderId
      }).subscribe({
        next: () => this.loadContent(this.folderId(), this.spaceId()),
        error: (error) => console.error('Error moving reference to root:', error)
      });
    } else {
      this.foldersService.moveFolder(dragged.id, {
        targetParentId: null
      }).subscribe({
        next: () => this.loadContent(this.folderId(), this.spaceId()),
        error: (error) => console.error('Error moving folder to root:', error)
      });
    }

    this.onDragEnd();
  }

  isDropTarget(folderId: string): boolean {
    return this.dropTargetId() === folderId;
  }
}
