import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, computed, effect, inject, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { GridComponent, NoResultsComponent, PageHeaderComponent, SectionHeaderComponent, TableToolbarComponent, ViewMode } from "@shared/components";
import { CreateFolderData, CreateFolderDialogComponent, ImportFileData, ImportFileDialogComponent } from "@shared/dialogs";
import { PageComponent } from "../page";
import { FolderItem, FolderItemComponent } from "./folder-item/folder-item";
import { FileItem, FileItemComponent } from "./file-item/file-item";
import { MenuItem } from "primeng/api";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { FoldersService, FilesService, UserService } from "@core/services";
import { FolderResponse, FileResponse } from "@models/api.model";

interface Breadcrumb {
    id: string;
    name: string;
}

@Component({
    selector: "app-documents",
    imports: [
        CommonModule,
        FormsModule,
        PageComponent,
        PageHeaderComponent,
        SectionHeaderComponent,
        TableToolbarComponent,
        GridComponent,
        NoResultsComponent,
        FolderItemComponent,
        FileItemComponent,
        TableModule,
        ButtonModule,
        MenuModule,
        CreateFolderDialogComponent,
        ImportFileDialogComponent
    ],
    templateUrl: "./documents.html",
    styleUrls: ["./documents.scss"]
})
export class DocumentsComponent {
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private foldersService = inject(FoldersService);
    private filesService = inject(FilesService);
    private userService = inject(UserService);
    private createFolderDialog = viewChild.required(CreateFolderDialogComponent);
    private importFileDialog = viewChild.required(ImportFileDialogComponent);

    currentView: ViewMode = "card";
    private searchQuery = '';

    currentFolderId = toSignal(
        this.route.paramMap.pipe(map(params => params.get('folderId'))),
        { initialValue: null }
    );
    breadcrumbs = signal<Breadcrumb[]>([]);

    pageTitle = computed(() => {
        const crumbs = this.breadcrumbs();
        return crumbs.length > 0 ? crumbs[crumbs.length - 1].name : 'Documents';
    });

    pageDescription = computed(() => {
        const folderId = this.currentFolderId();
        if (!folderId) return 'Gérez vos documents et dossiers';
        return null;
    });

    toolbarActions = computed(() => [
        {
            label: "Nouveau dossier",
            icon: "fa-solid fa-folder-plus",
            outlined: true,
            onClick: () => this.createFolder()
        },
        {
            label: "Importer un fichier",
            icon: "fa-solid fa-upload",
            onClick: () => this.uploadFile()
        }
    ]);

    folders: FolderItem[] = [];
    files: FileItem[] = [];

    private lastOrgId: string | null = null;

    constructor() {
        effect(() => {
            const orgId = this.userService.context()?.organization?.id ?? null;
            const folderId = this.currentFolderId();

            if (this.lastOrgId && orgId !== this.lastOrgId && folderId) {
                this.lastOrgId = orgId;
                this.router.navigate(['/documents']);
                return;
            }

            this.lastOrgId = orgId;
            this.loadContents();
        });
    }

    private loadContents(): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        const folderId = this.currentFolderId();

        if (folderId) {
            this.foldersService.getContents(orgId, folderId).subscribe(response => {
                this.folders = response.subfolders.map(f => this.mapFolder(f));
                this.files = response.files.map(f => this.mapFile(f));
                this.applySearch();
                this.cdr.markForCheck();
            });
            this.foldersService.getBreadcrumbs(orgId, folderId).subscribe(crumbs => {
                this.breadcrumbs.set(crumbs.map(c => ({ id: c.id, name: c.name })));
            });
        } else {
            this.breadcrumbs.set([]);
            this.foldersService.listRoot(orgId).subscribe(folders => {
                this.folders = folders.map(f => this.mapFolder(f));
                this.files = [];
                this.applySearch();
                this.cdr.markForCheck();
            });
        }
    }

    onSearch(query: string): void {
        this.searchQuery = query.toLowerCase();
        this.loadContents();
    }

    navigateToFolder(folder: FolderItem): void {
        this.searchQuery = '';
        this.router.navigate(['/documents', folder.id]);
    }

    navigateToBreadcrumb(breadcrumb: Breadcrumb): void {
        this.searchQuery = '';
        this.router.navigate(['/documents', breadcrumb.id]);
    }

    navigateBack(): void {
        const crumbs = this.breadcrumbs();
        this.searchQuery = '';
        if (crumbs.length > 1) {
            this.router.navigate(['/documents', crumbs[crumbs.length - 2].id]);
        } else {
            this.router.navigate(['/documents']);
        }
    }

    navigateToRoot(): void {
        this.searchQuery = '';
        this.router.navigate(['/documents']);
    }

    private applySearch(): void {
        if (this.searchQuery) {
            this.folders = this.folders.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery)
            );
            this.files = this.files.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery)
            );
        }
    }

    getFileIcon(type: string): string {
        switch (type) {
            case 'pdf': return 'fa-solid fa-file-pdf';
            case 'doc': return 'fa-solid fa-file-word';
            case 'xls': return 'fa-solid fa-file-excel';
            case 'img': return 'fa-solid fa-file-image';
            case 'txt': return 'fa-solid fa-file-lines';
            default: return 'fa-solid fa-file';
        }
    }

    formatFileSize(size: number): string {
        if (size < 1024) return `${size} o`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
        return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
    }

    private createFolder(): void {
        this.createFolderDialog().open();
    }

    private uploadFile(): void {
        this.importFileDialog().open();
    }

    onFolderCreated(data: CreateFolderData): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.foldersService.create(orgId, {
            name: data.name,
            parent_id: this.currentFolderId() ?? undefined
        }).subscribe(() => this.loadContents());
    }

    onFilesImported(data: ImportFileData): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.filesService.upload(orgId, data.files, this.currentFolderId() ?? undefined).subscribe(() => this.loadContents());
    }

    getFolderMenuItems(folder: FolderItem): MenuItem[] {
        return [
            {
                label: 'Ouvrir',
                icon: 'fa-jelly-fill fa-solid fa-folder',
                command: () => this.navigateToFolder(folder)
            },
            { separator: true },
            {
                label: 'Renommer',
                icon: 'fa-solid fa-pen',
                command: () => console.log('Rename folder', folder)
            },
            {
                label: 'Déplacer',
                icon: 'fa-solid fa-arrows-up-down-left-right',
                command: () => console.log('Move folder', folder)
            },
            {
                label: 'Partager',
                icon: 'fa-jelly-fill fa-solid fa-share-nodes',
                command: () => console.log('Share folder', folder)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => this.deleteFolder(folder)
            }
        ];
    }

    getFileMenuItems(file: FileItem): MenuItem[] {
        return [
            {
                label: 'Ouvrir',
                icon: 'fa-jelly-fill fa-solid fa-arrow-up-right-from-square',
                command: () => console.log('Open file', file)
            },
            {
                label: 'Télécharger',
                icon: 'fa-solid fa-download',
                command: () => this.downloadFile(file)
            },
            { separator: true },
            {
                label: 'Renommer',
                icon: 'fa-solid fa-pen',
                command: () => console.log('Rename file', file)
            },
            {
                label: 'Déplacer',
                icon: 'fa-solid fa-arrows-up-down-left-right',
                command: () => console.log('Move file', file)
            },
            {
                label: 'Partager',
                icon: 'fa-jelly-fill fa-solid fa-share-nodes',
                command: () => console.log('Share file', file)
            },
            { separator: true },
            {
                label: 'Supprimer',
                icon: 'fa-jelly-fill fa-solid fa-trash',
                styleClass: 'menu-item-danger',
                command: () => this.deleteFile(file)
            }
        ];
    }

    private deleteFolder(folder: FolderItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.foldersService.delete(orgId, folder.id).subscribe(() => this.loadContents());
    }

    private deleteFile(file: FileItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.filesService.delete(orgId, file.id).subscribe(() => this.loadContents());
    }

    private downloadFile(file: FileItem): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.filesService.download(orgId, file.id).subscribe(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    private mapFolder(f: FolderResponse): FolderItem {
        return {
            id: f.id,
            name: f.name,
            filesCount: f.files_count,
            foldersCount: f.folders_count,
            updatedAt: new Date(f.updated_at)
        };
    }

    private mapFile(f: FileResponse): FileItem {
        return {
            id: f.id,
            name: f.name,
            type: f.file_type,
            size: f.size,
            extension: f.extension,
            createdAt: new Date(f.created_at),
            updatedAt: new Date(f.updated_at)
        };
    }
}
