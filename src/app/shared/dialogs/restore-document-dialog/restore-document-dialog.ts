import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseDialogComponent } from '../../components';
import { FolderTreeSelectComponent, FolderTreeItem } from '../../components/folder-tree-select/folder-tree-select';

export type { FolderTreeItem };

export interface RestoreDocumentResult {
  documentId: string;
  documentType: 'folder' | 'file';
  destinationFolderId: string | null;
}

@Component({
  selector: 'app-restore-document-dialog',
  standalone: true,
  imports: [ButtonModule, BaseDialogComponent, FolderTreeSelectComponent],
  templateUrl: './restore-document-dialog.html',
  styleUrl: './restore-document-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestoreDocumentDialogComponent {
  @Output() readonly documentRestored = new EventEmitter<RestoreDocumentResult>();

  readonly treeSelect = viewChild<FolderTreeSelectComponent>('treeSelect');

  readonly visible = signal(false);
  readonly documentId = signal<string | null>(null);
  readonly documentType = signal<'folder' | 'file'>('file');
  readonly documentName = signal('');
  readonly originalPath = signal('');
  readonly folders = signal<FolderTreeItem[]>([]);
  readonly isRestoring = signal(false);

  open(id: string, type: 'folder' | 'file', name: string, originalPath: string, allFolders: FolderTreeItem[]): void {
    this.documentId.set(id);
    this.documentType.set(type);
    this.documentName.set(name);
    this.originalPath.set(originalPath);
    this.folders.set(allFolders);
    this.treeSelect()?.reset();
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentId.set(null);
    this.treeSelect()?.reset();
  }

  get excludeId(): string | null {
    return this.documentType() === 'folder' ? this.documentId() : null;
  }

  restoreToOriginal(): void {
    this.treeSelect()?.reset();
    this.doRestore(null);
  }

  onSubmit(): void {
    const tree = this.treeSelect();
    if (!tree?.hasSelection()) return;

    const ids = tree.getSelectedFolderIds();
    this.doRestore(ids[0] ?? null);
  }

  private doRestore(destinationFolderId: string | null): void {
    const id = this.documentId();
    if (id === null || this.isRestoring()) return;

    this.isRestoring.set(true);

    this.documentRestored.emit({
      documentId: id,
      documentType: this.documentType(),
      destinationFolderId
    });

    this.isRestoring.set(false);
    this.close();
  }
}
