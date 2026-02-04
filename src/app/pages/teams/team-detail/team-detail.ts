import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { TabbedPageComponent, PageTab } from '../../../shared';
import { MembersTabComponent } from './tabs/members/members-tab';
import { RightsTabComponent } from './tabs/rights/rights-tab';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [TabbedPageComponent, MembersTabComponent, RightsTabComponent],
  templateUrl: './team-detail.html',
  styleUrl: './team-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: PageTab[] = [
    { id: 'members', label: 'Membres' },
    { id: 'rights', label: 'Droits' }
  ];

  readonly teamId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );
}
