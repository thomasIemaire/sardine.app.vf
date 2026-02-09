import { CommonModule } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { ButtonModule } from "primeng/button";

export type FileType = 'pdf' | 'doc' | 'xls' | 'img' | 'txt' | 'other';

export interface TrashFileItem {
    id: string;
    name: string;
    type: FileType;
    size: number;
    extension: string;
    deletedAt: Date;
    originalPath: string;
}

@Component({
    selector: "app-trash-file-item",
    imports: [CommonModule, SelectableComponent, ButtonModule],
    templateUrl: "./trash-file-item.html",
    styleUrls: ["./trash-file-item.scss"],
})
export class TrashFileItemComponent {
    file = input.required<TrashFileItem>();
    restore = output<TrashFileItem>();
    deletePermanently = output<TrashFileItem>();

    fileIcon = computed(() => {
        switch (this.file().type) {
            case 'pdf': return 'fa-solid fa-file-pdf';
            case 'doc': return 'fa-solid fa-file-word';
            case 'xls': return 'fa-solid fa-file-excel';
            case 'img': return 'fa-solid fa-file-image';
            case 'txt': return 'fa-solid fa-file-lines';
            default: return 'fa-solid fa-file';
        }
    });

    fileColor = computed(() => {
        switch (this.file().type) {
            case 'pdf': return 'var(--red-color-500)';
            case 'doc': return 'var(--blue-color-500)';
            case 'xls': return 'var(--green-color-500)';
            case 'img': return 'var(--purple-color-500)';
            case 'txt': return 'var(--gray-color-500)';
            default: return 'var(--gray-color-400)';
        }
    });

    fileBgColor = computed(() => {
        switch (this.file().type) {
            case 'pdf': return 'var(--red-color-100)';
            case 'doc': return 'var(--blue-color-100)';
            case 'xls': return 'var(--green-color-100)';
            case 'img': return 'var(--purple-color-100)';
            case 'txt': return 'var(--gray-color-100)';
            default: return 'var(--gray-color-100)';
        }
    });

    formattedSize = computed(() => {
        const size = this.file().size;
        if (size < 1024) return `${size} o`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
        return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
    });

    daysRemaining = computed(() => {
        const deletedAt = this.file().deletedAt;
        const now = new Date();
        const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    });

    onRestore(event: Event): void {
        event.stopPropagation();
        this.restore.emit(this.file());
    }

    onDelete(event: Event): void {
        event.stopPropagation();
        this.deletePermanently.emit(this.file());
    }
}
