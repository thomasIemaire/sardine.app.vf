import { Component, computed, inject, input } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { filter, map, startWith } from "rxjs";

export interface PageHeaderTab {
    id: string;
    label: string;
    subtabs?: PageHeaderTab[];
}

export interface PageHeaderSecondaryAction {
    icon: string;
    label: string;
    command: () => void;
}

@Component({
    selector: "app-page-header",
    imports: [ButtonModule, DividerModule],
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

    public activeChildPath = toSignal(
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            startWith(null),
            map(() => this.route.firstChild?.snapshot?.url?.[0]?.path ?? '')
        ),
        { initialValue: '' }
    );

    private activeSubtabId = toSignal(
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            startWith(null),
            map(() => this.route.firstChild?.snapshot?.queryParams?.['tab'] ?? '')
        ),
        { initialValue: '' }
    );

    activeSubtabs = computed(() => {
        const activeTab = this.activeChildPath();
        return this.tabs()?.find(t => t.id === activeTab)?.subtabs ?? [];
    });

    selectTab(tab: PageHeaderTab): void {
        const queryParams = tab.subtabs?.length ? { tab: tab.subtabs[0].id } : {};
        this.router.navigate([tab.id], { relativeTo: this.route, queryParams });
    }

    selectSubtab(subtab: PageHeaderTab): void {
        this.router.navigate([], {
            relativeTo: this.route.firstChild,
            queryParams: { tab: subtab.id },
            queryParamsHandling: 'merge'
        });
    }

    isActive(tab: PageHeaderTab): boolean {
        return this.activeChildPath() === tab.id;
    }

    isSubtabActive(tab: PageHeaderTab): boolean {
        const activeId = this.activeSubtabId();
        if (!activeId) {
            const subtabs = this.activeSubtabs();
            return subtabs.length > 0 && subtabs[0].id === tab.id;
        }
        return activeId === tab.id;
    }
}
