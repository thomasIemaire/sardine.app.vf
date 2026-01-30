import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { HeaderPageComponent, HeaderTabsComponent, Tab } from '../../../shared';
import { MembersTabComponent } from './tabs/members/members-tab';
import { RightsTabComponent } from './tabs/rights/rights-tab';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [HeaderPageComponent, HeaderTabsComponent, MembersTabComponent, RightsTabComponent],
  templateUrl: './team-detail.html',
  styleUrl: './team-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: Tab[] = [
    { id: 'members', label: 'Membres' },
    { id: 'rights', label: 'Droits' }
  ];

  readonly membersSubTabs: Tab[] = [
    { id: 'users', label: 'Utilisateurs' },
    { id: 'subteams', label: 'Équipes' }
  ];

  readonly teamId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

  private readonly queryParamsSignal = toSignal(
    this.route.queryParams.pipe(map(params => ({
      tabs: params['tabs'] as string | undefined,
      subtabs: params['subtabs'] as string | undefined
    })))
  );

  readonly activeTab = computed(() => {
    const tabFromUrl = this.queryParamsSignal()?.tabs;
    if (tabFromUrl && this.tabs.some(t => t.id === tabFromUrl)) {
      return tabFromUrl;
    }
    return this.tabs[0]?.id;
  });

  readonly activeSubTab = computed(() => {
    const subTabFromUrl = this.queryParamsSignal()?.subtabs;
    if (subTabFromUrl && this.membersSubTabs.some(t => t.id === subTabFromUrl)) {
      return subTabFromUrl;
    }
    return this.membersSubTabs[0]?.id;
  });

  readonly currentSubTabs = computed(() => {
    return this.activeTab() === 'members' ? this.membersSubTabs : [];
  });
}
