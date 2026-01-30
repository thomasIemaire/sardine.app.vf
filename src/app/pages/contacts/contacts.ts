import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { HeaderPageComponent, HeaderTabsComponent, Tab } from '../../shared';
import { DirectoryTabComponent } from './tabs/directory/directory-tab';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [HeaderPageComponent, HeaderTabsComponent, DirectoryTabComponent],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: Tab[] = [
    { id: 'directory', label: 'Annuaire' }
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
