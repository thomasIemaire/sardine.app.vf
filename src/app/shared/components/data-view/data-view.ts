import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  inject,
  input,
  output,
  signal,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Divider } from 'primeng/divider';
import { ThemeService, DisplayMode } from '../../../core/services';

export interface DataViewColumn {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    Divider,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    TableModule
  ],
  templateUrl: './data-view.html',
  styleUrl: './data-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataViewComponent<T> {
  private readonly themeService = inject(ThemeService);

  readonly data = input<T[]>([]);
  readonly columns = input<DataViewColumn[]>([]);
  readonly searchPlaceholder = input<string>('Rechercher...');
  readonly emptyMessage = input<string>('Aucun résultat trouvé');
  readonly trackByField = input<string>('id');
  readonly showSearch = input<boolean>(true);
  readonly showViewToggle = input<boolean>(true);

  readonly searchChange = output<string>();

  readonly searchQuery = signal('');
  readonly displayMode = this.themeService.displayMode;

  @ContentChild('tableCell', { static: false }) tableCellTemplate!: TemplateRef<any>;
  @ContentChild('tableActions', { static: false }) tableActionsTemplate!: TemplateRef<any>;
  @ContentChild('card', { static: false }) cardTemplate!: TemplateRef<any>;

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.searchChange.emit(value);
  }

  toggleDisplayMode(): void {
    const newMode: DisplayMode = this.displayMode() === 'table' ? 'card' : 'table';
    this.themeService.setDisplayMode(newMode);
  }

  trackByFn(index: number, item: T): any {
    return (item as any)[this.trackByField()] ?? index;
  }

  getFieldValue(item: T, field: string): any {
    const keys = field.split('.');
    let value: any = item;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }
}
