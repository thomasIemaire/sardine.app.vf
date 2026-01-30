import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { HeaderPageComponent, HeaderTabsComponent, Tab } from '../../shared';
import { TeamsTabComponent } from './tabs/teams/teams-tab';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [HeaderPageComponent, HeaderTabsComponent, TeamsTabComponent],
  templateUrl: './teams.html',
  styleUrl: './teams.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: Tab[] = [
    { id: 'teams', label: 'Équipes' }
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
