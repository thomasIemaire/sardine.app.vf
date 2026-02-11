import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, output, signal } from "@angular/core";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";

export interface ImportFileEntry {
    name: string;
    size: number;
    mime_type: string;
    base64: string;
}

export interface ImportFileData {
    files: ImportFileEntry[];
}

@Component({
    selector: "app-import-file-dialog",
    imports: [CommonModule, DialogModule, ButtonModule],
    templateUrl: "./import-file-dialog.html",
    styleUrls: ["./import-file-dialog.scss"]
})
export class ImportFileDialogComponent {
    private cdr = inject(ChangeDetectorRef);

    visible = signal(false);
    submitted = output<ImportFileData>();

    selectedFiles: File[] = [];
    isDragOver = false;

    open(): void {
        this.reset();
        this.visible.set(true);
    }

    close(): void {
        this.visible.set(false);
    }

    async submit(): Promise<void> {
        if (!this.isValid()) return;

        const entries = await Promise.all(
            this.selectedFiles.map(file => this.fileToBase64Entry(file))
        );

        this.submitted.emit({ files: entries });
        this.close();
    }

    isValid(): boolean {
        return this.selectedFiles.length > 0;
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
        this.cdr.markForCheck();
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
        this.cdr.markForCheck();
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        const files = event.dataTransfer?.files;
        if (files) {
            this.addFiles(files);
        }
        this.cdr.markForCheck();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.addFiles(input.files);
            input.value = '';
        }
        this.cdr.markForCheck();
    }

    removeFile(index: number): void {
        this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
        this.cdr.markForCheck();
    }

    formatFileSize(size: number): string {
        if (size < 1024) return `${size} o`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
        return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
    }

    private addFiles(fileList: FileList): void {
        const newFiles = [...this.selectedFiles];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const alreadyAdded = newFiles.some(f => f.name === file.name && f.size === file.size);
            if (!alreadyAdded) {
                newFiles.push(file);
            }
        }
        this.selectedFiles = newFiles;
    }

    private fileToBase64Entry(file: File): Promise<ImportFileEntry> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve({
                    name: file.name,
                    size: file.size,
                    mime_type: file.type || 'application/octet-stream',
                    base64
                });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    private reset(): void {
        this.selectedFiles = [];
        this.isDragOver = false;
    }
}
