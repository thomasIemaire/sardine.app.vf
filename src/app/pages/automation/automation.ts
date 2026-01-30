import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { HeaderPageComponent, HeaderTabsComponent, Tab } from '../../shared';
import { AgentsTabComponent } from './tabs/agents/agents-tab';
import { FlowsTabComponent } from './tabs/flows/flows-tab';

@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [HeaderPageComponent, HeaderTabsComponent, AgentsTabComponent, FlowsTabComponent],
  templateUrl: './automation.html',
  styleUrl: './automation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutomationComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: Tab[] = [
    { id: 'agents', label: 'Agents' },
    { id: 'flows', label: 'Flows' }
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
