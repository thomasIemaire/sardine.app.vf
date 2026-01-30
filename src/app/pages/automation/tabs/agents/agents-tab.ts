import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-agents-tab',
  standalone: true,
  imports: [],
  template: `
    <div class="agents-tab">
      <p>Contenu de l'onglet Agents</p>
    </div>
  `,
  styles: [`
    .agents-tab {
      padding: 1rem 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsTabComponent {}
