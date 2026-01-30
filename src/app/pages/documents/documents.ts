import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { HeaderPageComponent, HeaderTabsComponent, Tab } from '../../shared';
import { FoldersTabComponent } from './tabs/folders/folders-tab';
import { TrashTabComponent } from './tabs/trash/trash-tab';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [HeaderPageComponent, HeaderTabsComponent, FoldersTabComponent, TrashTabComponent],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: Tab[] = [
    { id: 'folders', label: 'Dossiers' },
    { id: 'trash', label: 'Corbeille' }
  ];

  private readonly queryParams = toSignal(
    this.route.queryParams.pipe(map(params => params['tabs'] as string | undefined))
  );

  readonly activeTab = computed(() => {
    const tabFromUrl = this.queryParams();
    if (tabFromUrl && this.tabs.some(t => t.id === tabFromUrl)) {
      return tabFromUrl;
    }
    return this.tabs[0]?.id;
  });
}
