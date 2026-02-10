import { CommonModule } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";
import { SelectableComponent } from "../selectable/selectable";
import { DaysRemainingComponent } from "../days-remaining/days-remaining";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

export type FileType = 'pdf' | 'doc' | 'xls' | 'img' | 'txt' | 'other';

export interface TrashItemData {
    id: string;
    name: string;
    type: 'file' | 'folder';
    fileType?: FileType;
    size?: number;
    extension?: string;
    deletedAt: Date;
    originalPath: string;
}

@Component({
    selector: "app-trash-item",
    imports: [CommonModule, SelectableComponent, DaysRemainingComponent, ButtonModule, TooltipModule],
    templateUrl: "./trash-item.html",
    styleUrls: ["./trash-item.scss"],
})
export class TrashItemComponent {
    item = input.required<TrashItemData>();
    restore = output<TrashItemData>();
    deletePermanently = output<TrashItemData>();

    isFile = computed(() => this.item().type === 'file');

    icon = computed(() => {
        if (this.item().type === 'folder') {
            return 'fa-jelly-fill fa-solid fa-folder';
        }
        switch (this.item().fileType) {
            case 'pdf': return 'fa-solid fa-file-pdf';
            case 'doc': return 'fa-solid fa-file-word';
            case 'xls': return 'fa-solid fa-file-excel';
            case 'img': return 'fa-solid fa-file-image';
            case 'txt': return 'fa-solid fa-file-lines';
            default: return 'fa-solid fa-file';
        }
    });

    iconColor = computed(() => {
        if (this.item().type === 'folder') {
            return 'var(--gray-color-400)';
        }
        switch (this.item().fileType) {
            case 'pdf': return 'var(--red-color-500)';
            case 'doc': return 'var(--blue-color-500)';
            case 'xls': return 'var(--green-color-500)';
            case 'img': return 'var(--purple-color-500)';
            case 'txt': return 'var(--gray-color-500)';
            default: return 'var(--gray-color-400)';
        }
    });

    iconBgColor = computed(() => {
        if (this.item().type === 'folder') {
            return 'var(--gray-color-100)';
        }
        switch (this.item().fileType) {
            case 'pdf': return 'var(--red-color-100)';
            case 'doc': return 'var(--blue-color-100)';
            case 'xls': return 'var(--green-color-100)';
            case 'img': return 'var(--purple-color-100)';
            case 'txt': return 'var(--gray-color-100)';
            default: return 'var(--gray-color-100)';
        }
    });

    formattedSize = computed(() => {
        const size = this.item().size;
        if (!size) return '';
        if (size < 1024) return `${size} o`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
        return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
    });

    daysRemaining = computed(() => {
        const deletedAt = this.item().deletedAt;
        const now = new Date();
        const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    });

    onRestore(event: Event): void {
        event.stopPropagation();
        this.restore.emit(this.item());
    }

    onDelete(event: Event): void {
        event.stopPropagation();
        this.deletePermanently.emit(this.item());
    }
}
