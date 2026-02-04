import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

export interface FolderTreeItem {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
}

@Component({
  selector: 'app-folder-tree-select',
  standalone: true,
  imports: [FormsModule, TreeModule, CheckboxModule],
  templateUrl: './folder-tree-select.html',
  styleUrl: './folder-tree-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FolderTreeSelectComponent {
  readonly folders = input<FolderTreeItem[]>([]);
  readonly multiSelect = input<boolean>(false);
  readonly showRootOption = input<boolean>(true);
  readonly excludeFolderId = input<string | null>(null);
  readonly excludeDescendantsOf = input<string | null>(null);

  readonly selectedNode = model<TreeNode | null>(null);
  readonly selectedNodes = model<TreeNode[]>([]);
  readonly includeRoot = model<boolean>(false);

  readonly folderTree = computed(() => {
    return this.buildTree(this.folders(), null);
  });

  readonly selectedCount = computed(() => {
    if (this.multiSelect()) {
      let count = this.selectedNodes().length;
      if (this.includeRoot()) count++;
      return count;
    }
    return this.selectedNode() ? 1 : 0;
  });

  readonly hasSelection = computed(() => this.selectedCount() > 0);

  readonly selectedFolderName = computed(() => {
    if (this.multiSelect()) {
      const count = this.selectedCount();
      if (count === 0) return '';
      if (count === 1) {
        if (this.includeRoot()) return 'Racine';
        return this.selectedNodes()[0]?.label ?? '';
      }
      return `${count} dossiers sélectionnés`;
    }
    const node = this.selectedNode();
    if (!node) return '';
    if (node.key === 'root') return 'Racine';
    return node.label ?? '';
  });

  readonly isRootSelected = computed(() => {
    if (this.multiSelect()) return this.includeRoot();
    return this.selectedNode()?.key === 'root';
  });

  private buildTree(folders: FolderTreeItem[], parentId: string | null): TreeNode[] {
    const excludeId = this.excludeFolderId();
    const excludeDescendants = this.excludeDescendantsOf();

    return folders
      .filter(f => f.parentId === parentId)
      .filter(f => f.id !== excludeId)
      .map(folder => ({
        key: folder.id,
        label: folder.name,
        data: folder,
        icon: 'fa-duotone fa-solid fa-folder',
        children: this.buildTree(folders, folder.id),
        selectable: !excludeDescendants || !this.isDescendant(folder.id, excludeDescendants)
      }));
  }

  private isDescendant(folderId: string, targetId: string | null): boolean {
    if (!targetId) return false;
    if (folderId === targetId) return true;
    const folder = this.folders().find(f => f.id === folderId);
    if (!folder) return false;
    if (folder.parentId === targetId) return true;
    if (folder.parentId === null) return false;
    return this.isDescendant(folder.parentId, targetId);
  }

  onNodeSelect(event: { node: TreeNode }): void {
    if (!this.multiSelect()) {
      this.selectedNode.set(event.node);
      this.includeRoot.set(false);
    }
  }

  onNodeUnselect(): void {
    if (!this.multiSelect()) {
      this.selectedNode.set(null);
    }
  }

  onSelectionChange(nodes: TreeNode | TreeNode[] | null | undefined): void {
    if (this.multiSelect()) {
      if (Array.isArray(nodes)) {
        this.selectedNodes.set(nodes);
      } else if (nodes) {
        this.selectedNodes.set([nodes]);
      } else {
        this.selectedNodes.set([]);
      }
    }
  }

  selectRoot(): void {
    if (this.multiSelect()) {
      this.includeRoot.update(v => !v);
    } else {
      this.selectedNode.set({ key: 'root', label: 'Racine', data: null });
      this.includeRoot.set(true);
    }
  }

  getSelectedFolderIds(): (string | null)[] {
    if (this.multiSelect()) {
      const ids: (string | null)[] = [];
      if (this.includeRoot()) ids.push(null);
      this.selectedNodes().forEach(node => {
        if (node.key && node.key !== 'root') {
          ids.push(node.key);
        }
      });
      return ids;
    }
    const node = this.selectedNode();
    if (!node) return [];
    if (node.key === 'root') return [null];
    return [node.key ?? null];
  }

  reset(): void {
    this.selectedNode.set(null);
    this.selectedNodes.set([]);
    this.includeRoot.set(false);
  }
}
