import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

export interface ImportUrlResult {
  url: string;
  fileName: string;
}

@Component({
  selector: 'app-import-url-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './import-url-dialog.html',
  styleUrl: './import-url-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportUrlDialogComponent {
  @Output() readonly urlImported = new EventEmitter<ImportUrlResult>();

  readonly visible = signal(false);
  readonly fileUrl = signal('');
  readonly fileName = signal('');
  readonly isImporting = signal(false);
  readonly urlError = signal<string | null>(null);

  readonly isValidUrl = computed(() => {
    const url = this.fileUrl().trim();
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });

  readonly detectedFileName = computed(() => {
    const url = this.fileUrl().trim();
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const segments = path.split('/');
      const lastSegment = segments[segments.length - 1];
      return lastSegment || '';
    } catch {
      return '';
    }
  });

  readonly finalFileName = computed(() => {
    return this.fileName().trim() || this.detectedFileName();
  });

  open(): void {
    this.fileUrl.set('');
    this.fileName.set('');
    this.urlError.set(null);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.fileUrl.set('');
    this.fileName.set('');
    this.urlError.set(null);
  }

  get isValid(): boolean {
    return this.isValidUrl() && this.finalFileName().length > 0;
  }

  onUrlChange(value: string): void {
    this.fileUrl.set(value);
    this.urlError.set(null);
  }

  onSubmit(): void {
    if (!this.isValid || this.isImporting()) return;

    this.isImporting.set(true);

    this.urlImported.emit({
      url: this.fileUrl().trim(),
      fileName: this.finalFileName()
    });

    this.isImporting.set(false);
    this.close();
  }
}
