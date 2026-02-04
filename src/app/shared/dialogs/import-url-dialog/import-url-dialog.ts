import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { BaseDialogComponent } from '../../components';
import { isValidUrl } from '../../utils';

export interface ImportUrlResult {
  url: string;
  fileName: string;
}

@Component({
  selector: 'app-import-url-dialog',
  standalone: true,
  imports: [FormsModule, InputTextModule, BaseDialogComponent],
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

  readonly urlIsValid = computed(() => isValidUrl(this.fileUrl()));

  readonly detectedFileName = computed(() => {
    const url = this.fileUrl().trim();
    if (!url || !this.urlIsValid()) return '';
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const segments = path.split('/');
      return segments[segments.length - 1] || '';
    } catch {
      return '';
    }
  });

  readonly finalFileName = computed(() => {
    return this.fileName().trim() || this.detectedFileName();
  });

  readonly isValid = computed(() => {
    return this.urlIsValid() && this.finalFileName().length > 0;
  });

  open(): void {
    this.fileUrl.set('');
    this.fileName.set('');
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.fileUrl.set('');
    this.fileName.set('');
  }

  onSubmit(): void {
    if (!this.isValid() || this.isImporting()) return;

    this.isImporting.set(true);

    this.urlImported.emit({
      url: this.fileUrl().trim(),
      fileName: this.finalFileName()
    });

    this.isImporting.set(false);
    this.close();
  }
}
