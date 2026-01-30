import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HeaderPageComponent, HeaderTabsComponent } from '../../shared';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, HeaderPageComponent, HeaderTabsComponent],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent { }
