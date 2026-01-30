import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

export interface MoveDocumentResult {
  documentId: number;
  documentType: 'folder' | 'file';
  destinationFolderId: number | null;
}

export interface FolderTreeItem {
  id: number;
  name: string;
  parentId: number | null;
  color?: string;
}

@Component({
  selector: 'app-move-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TreeModule
  ],
  templateUrl: './move-document-dialog.html',
  styleUrl: './move-document-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveDocumentDialogComponent {
  @Output() readonly documentMoved = new EventEmitter<MoveDocumentResult>();

  readonly visible = signal(false);
  readonly documentId = signal<number | null>(null);
  readonly documentType = signal<'folder' | 'file'>('file');
  readonly documentName = signal('');
  readonly selectedNode = signal<TreeNode | null>(null);
  readonly isMoving = signal(false);

  private folders = signal<FolderTreeItem[]>([]);

  readonly folderTree = computed(() => {
    return this.buildTree(this.folders(), null);
  });

  private buildTree(folders: FolderTreeItem[], parentId: number | null): TreeNode[] {
    const currentDocId = this.documentId();
    const isFolder = this.documentType() === 'folder';

    return folders
      .filter(f => f.parentId === parentId)
      .filter(f => !isFolder || f.id !== currentDocId) // Exclude current folder if moving a folder
      .map(folder => ({
        key: String(folder.id),
        label: folder.name,
        data: folder,
        icon: 'fa-duotone fa-solid fa-folder',
        children: this.buildTree(folders, folder.id),
        selectable: !isFolder || !this.isDescendant(folder.id, currentDocId)
      }));
  }

  private isDescendant(folderId: number, targetId: number | null): boolean {
    if (!targetId) return false;
    const folder = this.folders().find(f => f.id === folderId);
    if (!folder) return false;
    if (folder.parentId === targetId) return true;
    if (folder.parentId === null) return false;
    return this.isDescendant(folder.parentId, targetId);
  }

  open(documentId: number, documentType: 'folder' | 'file', documentName: string, allFolders: FolderTreeItem[]): void {
    this.documentId.set(documentId);
    this.documentType.set(documentType);
    this.documentName.set(documentName);
    this.folders.set(allFolders);
    this.selectedNode.set(null);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.documentId.set(null);
    this.selectedNode.set(null);
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode.set(event.node);
  }

  onNodeUnselect(): void {
    this.selectedNode.set(null);
  }

  selectRoot(): void {
    this.selectedNode.set({ key: 'root', label: 'Racine', data: null });
  }

  get isRootSelected(): boolean {
    return this.selectedNode()?.key === 'root';
  }

  get hasSelection(): boolean {
    return this.selectedNode() !== null;
  }

  get selectedFolderName(): string {
    const node = this.selectedNode();
    if (!node) return '';
    if (node.key === 'root') return 'Racine';
    return node.label ?? '';
  }

  onSubmit(): void {
    const docId = this.documentId();
    if (!docId || !this.hasSelection || this.isMoving()) return;

    this.isMoving.set(true);

    const destinationId = this.selectedNode()?.key === 'root'
      ? null
      : Number(this.selectedNode()?.key);

    this.documentMoved.emit({
      documentId: docId,
      documentType: this.documentType(),
      destinationFolderId: destinationId
    });

    this.isMoving.set(false);
    this.close();
  }
}
