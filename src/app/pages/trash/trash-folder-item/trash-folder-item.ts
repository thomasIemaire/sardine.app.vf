import { CommonModule } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";
import { SelectableComponent } from "@shared/components";
import { ButtonModule } from "primeng/button";

export interface TrashFolderItem {
    id: string;
    name: string;
    filesCount: number;
    foldersCount: number;
    deletedAt: Date;
    originalPath: string;
}

@Component({
    selector: "app-trash-folder-item",
    imports: [CommonModule, SelectableComponent, ButtonModule],
    templateUrl: "./trash-folder-item.html",
    styleUrls: ["./trash-folder-item.scss"],
})
export class TrashFolderItemComponent {
    folder = input.required<TrashFolderItem>();
    restore = output<TrashFolderItem>();
    deletePermanently = output<TrashFolderItem>();

    daysRemaining = computed(() => {
        const deletedAt = this.folder().deletedAt;
        const now = new Date();
        const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    });

    onRestore(event: Event): void {
        event.stopPropagation();
        this.restore.emit(this.folder());
    }

    onDelete(event: Event): void {
        event.stopPropagation();
        this.deletePermanently.emit(this.folder());
    }
}
