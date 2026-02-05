import { Component, inject, input } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { filter, map, startWith } from "rxjs";

export interface PageHeaderTab {
    id: string;
    label: string;
}

export interface PageHeaderSecondaryAction {
    icon: string;
    label: string;
    command: () => void;
}

@Component({
    selector: "app-page-header",
    imports: [ButtonModule],
    templateUrl: "./page-header.html",
    styleUrls: ["./page-header.scss"],
})
export class PageHeaderComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    label = input.required<string>();
    description = input<string>();
    tabs = input<PageHeaderTab[]>();
    secondaryAction = input<PageHeaderSecondaryAction>();
    backAction = input<() => void>();

    private activeChildPath = toSignal(
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            startWith(null),
            map(() => this.route.firstChild?.snapshot?.url?.[0]?.path ?? '')
        ),
        { initialValue: '' }
    );

    selectTab(tab: PageHeaderTab): void {
        this.router.navigate([tab.id], { relativeTo: this.route });
    }

    isActive(tab: PageHeaderTab): boolean {
        return this.activeChildPath() === tab.id;
    }
}