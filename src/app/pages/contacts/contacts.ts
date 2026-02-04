import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TabbedPageComponent, PageTab } from '../../shared';
import { DirectoryTabComponent } from './tabs/directory/directory-tab';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [TabbedPageComponent, DirectoryTabComponent],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsComponent {
  readonly tabs: PageTab[] = [
    { id: 'directory', label: 'Annuaire' }
  ];
}
