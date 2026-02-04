import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TabbedPageComponent, PageTab } from '../../shared';
import { AgentsTabComponent } from './tabs/agents/agents-tab';
import { FlowsTabComponent } from './tabs/flows/flows-tab';

@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [TabbedPageComponent, AgentsTabComponent, FlowsTabComponent],
  templateUrl: './automation.html',
  styleUrl: './automation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutomationComponent {
  readonly tabs: PageTab[] = [
    { id: 'agents', label: 'Agents' },
    { id: 'flows', label: 'Flows' }
  ];
}
