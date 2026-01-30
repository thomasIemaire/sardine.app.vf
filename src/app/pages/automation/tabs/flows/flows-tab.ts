import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-flows-tab',
  standalone: true,
  imports: [],
  template: `
    <div class="flows-tab">
      <p>Contenu de l'onglet Flows</p>
    </div>
  `,
  styles: [`
    .flows-tab {
      padding: 1rem 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowsTabComponent {}
