import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { TabbedPageComponent, PageTab } from '../../shared';
import { TeamsTabComponent } from './tabs/teams/teams-tab';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [TabbedPageComponent, TeamsTabComponent],
  templateUrl: './teams.html',
  styleUrl: './teams.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: PageTab[] = [
    { id: 'teams', label: 'Équipes' }
  ];

  readonly teamId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id'))),
    { initialValue: null }
  );
}
