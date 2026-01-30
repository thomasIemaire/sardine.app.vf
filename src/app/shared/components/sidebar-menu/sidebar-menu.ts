import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sidebar-menu',
    standalone: true,
    imports: [CommonModule],
    template: `
        <nav class="sidebar-menu">
            @if (label) {
                <span class="sidebar-menu__label">{{ label }}</span>
            }
            <div class="sidebar-menu__items">
                <ng-content></ng-content>
            </div>
        </nav>
    `,
    styleUrls: ['./sidebar-menu.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarMenuComponent {
    @Input() label?: string;
}
