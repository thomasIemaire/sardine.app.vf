import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-sidebar-menu-item',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
        <a class="menu-item"
           [routerLink]="route"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: exact }">
            <i class="menu-item__icon" [ngClass]="icon"></i>
            <span class="menu-item__label">{{ label }}</span>
        </a>
    `,
    styleUrls: ['./sidebar-menu-item.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarMenuItemComponent {
    @Input({ required: true }) icon!: string;
    @Input({ required: true }) label!: string;
    @Input({ required: true }) route!: string;
    @Input() exact: boolean = false;
}
