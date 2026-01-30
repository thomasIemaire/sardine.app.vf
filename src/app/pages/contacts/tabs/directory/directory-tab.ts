import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-directory-tab',
  standalone: true,
  imports: [],
  template: `
    <div class="directory-tab">
      <p>Contenu de l'onglet Annuaire</p>
    </div>
  `,
  styles: [`
    .directory-tab {
      padding: 1rem 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectoryTabComponent {}
