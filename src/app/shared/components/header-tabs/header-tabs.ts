import { CommonModule } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { Divider } from "primeng/divider";
import { map } from "rxjs";

export interface Tab {
    id: string;
    label: string;
}

@Component({
    selector: "app-header-tabs",
    imports: [CommonModule, ButtonModule, RouterLink, Divider],
    template: `
    <div class="header-tabs">
        <div class="list-tabs">
            <p-button
                *ngFor="let tab of tabs()"
                size="small"
                [label]="tab.label"
                [severity]="activeTab() === tab.id ? 'primary' : 'secondary'"
                rounded
                [routerLink]="[]"
                [queryParams]="getTabQueryParams(tab.id)"
                queryParamsHandling="merge" />
        </div>
        @if (subTabs().length > 0) {
            <p-divider layout="vertical" />
            <div class="list-tabs">
                <p-button
                    *ngFor="let tab of subTabs()"
                    size="small"
                    [label]="tab.label"
                    [severity]="activeSubTab() === tab.id ? 'primary' : 'secondary'"
                    rounded
                    [routerLink]="[]"
                    [queryParams]="getSubTabQueryParams(tab.id)"
                    queryParamsHandling="merge" />
            </div>
        }
    </div>
  `,
    styleUrls: ["./header-tabs.scss"],
})
export class HeaderTabsComponent {
    private readonly route = inject(ActivatedRoute);

    readonly tabs = input<Tab[]>([]);
    readonly subTabs = input<Tab[]>([]);

    private readonly queryParamsSignal = toSignal(
        this.route.queryParams.pipe(map(params => ({
            tabs: params['tabs'] as string | undefined,
            subtabs: params['subtabs'] as string | undefined
        })))
    );

    readonly activeTab = computed(() => {
        const tabFromUrl = this.queryParamsSignal()?.tabs;
        const tabsList = this.tabs();
        if (tabFromUrl && tabsList.some(t => t.id === tabFromUrl)) {
            return tabFromUrl;
        }
        return tabsList[0]?.id;
    });

    readonly activeSubTab = computed(() => {
        const subTabFromUrl = this.queryParamsSignal()?.subtabs;
        const subTabsList = this.subTabs();
        if (subTabFromUrl && subTabsList.some(t => t.id === subTabFromUrl)) {
            return subTabFromUrl;
        }
        return subTabsList[0]?.id;
    });

    getTabQueryParams(tabId: string): Record<string, string> {
        const subTabsList = this.subTabs();
        if (subTabsList.length > 0) {
            return { tabs: tabId, subtabs: this.activeSubTab() || subTabsList[0]?.id };
        }
        return { tabs: tabId };
    }

    getSubTabQueryParams(subTabId: string): Record<string, string> {
        return { tabs: this.activeTab() || this.tabs()[0]?.id, subtabs: subTabId };
    }
}