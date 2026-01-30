import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { HeaderPageComponent, HeaderTabsComponent, Tab } from '../../../shared';
import { FoldersTabComponent } from '../tabs/folders/folders-tab';
import { TrashTabComponent } from '../tabs/trash/trash-tab';

@Component({
  selector: 'app-folder-detail',
  standalone: true,
  imports: [HeaderPageComponent, HeaderTabsComponent, FoldersTabComponent, TrashTabComponent],
  templateUrl: './folder-detail.html',
  styleUrl: './folder-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FolderDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: Tab[] = [
    { id: 'folders', label: 'Dossiers' },
    { id: 'trash', label: 'Corbeille' }
  ];

  readonly folderId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

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
