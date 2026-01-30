import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

export interface FolderColor {
  name: string;
  value: string;
}

export const FOLDER_COLORS: FolderColor[] = [
  { name: 'Gris', value: '#6b7280' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Ambre', value: '#f59e0b' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Citron', value: '#84cc16' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Émeraude', value: '#10b981' },
  { name: 'Turquoise', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Bleu ciel', value: '#0ea5e9' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pourpre', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Rose clair', value: '#f472b6' }
];

export interface CreateFolderResult {
  name: string;
  color: string;
}

@Component({
  selector: 'app-create-folder-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FloatLabelModule
  ],
  templateUrl: './create-folder-dialog.html',
  styleUrl: './create-folder-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateFolderDialogComponent {
  @Output() readonly folderCreated = new EventEmitter<CreateFolderResult>();

  readonly visible = signal(false);
  readonly folderName = signal('');
  readonly selectedColor = signal(FOLDER_COLORS[4].value); // Jaune par défaut
  readonly isSubmitting = signal(false);

  readonly colors = FOLDER_COLORS;

  open(): void {
    this.folderName.set('');
    this.selectedColor.set(FOLDER_COLORS[4].value);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.folderName.set('');
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  isColorSelected(color: string): boolean {
    return this.selectedColor() === color;
  }

  get isValid(): boolean {
    return this.folderName().trim().length > 0;
  }

  onSubmit(): void {
    if (!this.isValid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.folderCreated.emit({
      name: this.folderName().trim(),
      color: this.selectedColor()
    });

    this.isSubmitting.set(false);
    this.close();
  }
}
