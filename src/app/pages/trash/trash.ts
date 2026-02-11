import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, computed, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DaysRemainingComponent, GridComponent, NoResultsComponent, PageHeaderComponent, SectionHeaderComponent, TableToolbarComponent, TrashItemComponent, TrashItemData, ViewMode } from "@shared/components";
import { PageComponent } from "../page";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { TrashService, UserService } from "@core/services";
import { TrashFileResponse, TrashFolderResponse } from "@models/api.model";

@Component({
    selector: "app-trash",
    imports: [
        CommonModule,
        FormsModule,
        PageComponent,
        PageHeaderComponent,
        SectionHeaderComponent,
        TableToolbarComponent,
        GridComponent,
        NoResultsComponent,
        TrashItemComponent,
        DaysRemainingComponent,
        TableModule,
        ButtonModule,
        ConfirmDialogModule
    ],
    providers: [ConfirmationService],
    templateUrl: "./trash.html",
    styleUrls: ["./trash.scss"]
})
export class TrashComponent {
    private cdr = inject(ChangeDetectorRef);
    private trashService = inject(TrashService);
    private userService = inject(UserService);
    private confirmationService = inject(ConfirmationService);

    currentView: ViewMode = "card";
    private searchQuery = '';

    totalItems = computed(() => this.folders.length + this.files.length);

    toolbarActions = computed(() => [
        {
            label: "Vider la corbeille",
            icon: "fa-jelly-fill fa-solid fa-trash",
            severity: "danger",
            text: true,
            onClick: () => this.emptyTrash()
        }
    ]);

    private allFolders: TrashItemData[] = [];
    private allFiles: TrashItemData[] = [];
    folders: TrashItemData[] = [];
    files: TrashItemData[] = [];

    constructor() {
        effect(() => {
            this.userService.context();
            this.loadTrash();
        });
    }

    private loadTrash(): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;

        this.trashService.get(orgId).subscribe(response => {
            this.allFolders = response.folders.map(f => this.mapTrashFolder(f));
            this.allFiles = response.files.map(f => this.mapTrashFile(f));
            this.applyFilters();
            this.cdr.markForCheck();
        });
    }

    onSearch(query: string): void {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    onRestoreFolder(folder: TrashItemData): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.trashService.restoreFolder(orgId, folder.id).subscribe(() => this.loadTrash());
    }

    onDeleteFolder(folder: TrashItemData): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer définitivement le dossier "${folder.name}" et tout son contenu ?`,
            header: 'Suppression définitive',
            icon: 'fa-solid fa-triangle-exclamation',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: () => {
                const orgId = this.userService.getCurrentOrgId();
                if (!orgId) return;
                this.trashService.deleteFolderPermanently(orgId, folder.id).subscribe(() => this.loadTrash());
            }
        });
    }

    onRestoreFile(file: TrashItemData): void {
        const orgId = this.userService.getCurrentOrgId();
        if (!orgId) return;
        this.trashService.restoreFile(orgId, file.id).subscribe(() => this.loadTrash());
    }

    onDeleteFile(file: TrashItemData): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer définitivement le fichier "${file.name}" ?`,
            header: 'Suppression définitive',
            icon: 'fa-solid fa-triangle-exclamation',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: () => {
                const orgId = this.userService.getCurrentOrgId();
                if (!orgId) return;
                this.trashService.deleteFilePermanently(orgId, file.id).subscribe(() => this.loadTrash());
            }
        });
    }

    private emptyTrash(): void {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir vider la corbeille ? Cette action est irréversible.',
            header: 'Vider la corbeille',
            icon: 'fa-solid fa-triangle-exclamation',
            acceptLabel: 'Vider',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: () => {
                const orgId = this.userService.getCurrentOrgId();
                if (!orgId) return;
                this.trashService.empty(orgId).subscribe(() => this.loadTrash());
            }
        });
    }

    private applyFilters(): void {
        let filteredFolders = [...this.allFolders];
        let filteredFiles = [...this.allFiles];

        if (this.searchQuery) {
            filteredFolders = filteredFolders.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery)
            );
            filteredFiles = filteredFiles.filter(f =>
                f.name.toLowerCase().includes(this.searchQuery)
            );
        }

        filteredFolders.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
        filteredFiles.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());

        this.folders = filteredFolders;
        this.files = filteredFiles;
    }

    getDaysRemaining(deletedAt: Date): number {
        const now = new Date();
        const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
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

    private mapTrashFolder(f: TrashFolderResponse): TrashItemData {
        return {
            id: f.id,
            name: f.name,
            type: 'folder',
            deletedAt: new Date(f.deleted_at),
            originalPath: f.original_path
        };
    }

    private mapTrashFile(f: TrashFileResponse): TrashItemData {
        return {
            id: f.id,
            name: f.name,
            type: 'file',
            fileType: f.file_type as TrashItemData['fileType'],
            size: f.size,
            extension: f.extension,
            deletedAt: new Date(f.deleted_at),
            originalPath: f.original_path
        };
    }
}
