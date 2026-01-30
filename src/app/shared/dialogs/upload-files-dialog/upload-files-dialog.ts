import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface UploadFilesResult {
  files: UploadedFile[];
}

@Component({
  selector: 'app-upload-files-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule
  ],
  templateUrl: './upload-files-dialog.html',
  styleUrl: './upload-files-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadFilesDialogComponent {
  @Output() readonly filesUploaded = new EventEmitter<UploadFilesResult>();

  readonly visible = signal(false);
  readonly selectedFiles = signal<UploadedFile[]>([]);
  readonly isDragging = signal(false);
  readonly isUploading = signal(false);

  readonly acceptedFormats = 'image/jpeg,image/png,image/gif,image/webp,application/pdf,video/mp4,video/quicktime,video/x-msvideo,video/webm';
  readonly maxFileSize = 100 * 1024 * 1024; // 100 Mo

  open(): void {
    this.selectedFiles.set([]);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.selectedFiles.set([]);
  }

  get hasFiles(): boolean {
    return this.selectedFiles().length > 0;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
    input.value = '';
  }

  private processFiles(fileList: FileList): void {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size <= this.maxFileSize) {
        newFiles.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    }

    this.selectedFiles.update(current => [...current, ...newFiles]);
  }

  removeFile(index: number): void {
    this.selectedFiles.update(current => current.filter((_, i) => i !== index));
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'fa-duotone fa-solid fa-image';
    if (type === 'application/pdf') return 'fa-duotone fa-solid fa-file-pdf';
    if (type.startsWith('video/')) return 'fa-duotone fa-solid fa-video';
    return 'fa-duotone fa-solid fa-file';
  }

  onSubmit(): void {
    if (!this.hasFiles || this.isUploading()) return;

    this.isUploading.set(true);

    this.filesUploaded.emit({
      files: this.selectedFiles()
    });

    this.isUploading.set(false);
    this.close();
  }
}
