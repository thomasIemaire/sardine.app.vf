import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-config-doc-link',
    imports: [RouterModule],
    template: `
        <a class="config-doc-link" [routerLink]="['/automation/docs']" [fragment]="fragment()">
            <i class="fa-solid fa-book"></i>
            <span>Documentation</span>
        </a>
    `,
    styles: [`
        .config-doc-link {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
            padding: .5rem .75rem;
            background: var(--p-surface-100);
            border: 1px solid var(--p-surface-200);
            border-radius: .375rem;
            color: var(--p-text-muted-color);
            font-size: .75rem;
            text-decoration: none;
            transition: all .15s ease;
            width: fit-content;

            &:hover {
                background: var(--p-surface-200);
                color: var(--p-text-color);
            }

            i {
                font-size: .875rem;
            }
        }
    `]
})
export class ConfigDocLinkComponent {
    fragment = input.required<string>();
}
