import { Component, inject, input, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";

export interface PageHeaderTab {
    id: string;
    label: string;
}

@Component({
    selector: "app-page-header",
    imports: [ButtonModule],
    templateUrl: "./page-header.html",
    styleUrls: ["./page-header.scss"],
})
export class PageHeaderComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    label = input.required<string>();
    description = input<string>();
    tabs = input<PageHeaderTab[]>();

    activeTab = signal<string>('');

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const tabId = params['tab'];
            const tabsList = this.tabs();
            if (tabId && tabsList?.some(t => t.id === tabId)) {
                this.activeTab.set(tabId);
            } else if (tabsList?.length) {
                this.activeTab.set(tabsList[0].id);
            }
        });
    }

    selectTab(tab: PageHeaderTab): void {
        this.activeTab.set(tab.id);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab: tab.id },
            queryParamsHandling: 'merge',
        });
    }

    isActive(tab: PageHeaderTab): boolean {
        return this.activeTab() === tab.id;
    }
}