import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-rights-tab',
  standalone: true,
  imports: [],
  template: `
    <div class="rights-tab">
      <p>Contenu de l'onglet Droits</p>
    </div>
  `,
  styles: [`
    .rights-tab {
      padding: 1rem 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightsTabComponent {}
