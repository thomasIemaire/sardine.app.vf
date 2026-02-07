import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, effect, ElementRef, input, model, OnInit, output, signal, viewChild } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { DividerModule } from "primeng/divider";

export type ViewMode = 'list' | 'card';

export interface TableToolbarAction {
    label: string;
    icon: string;
    severity?: string;
    text?: boolean;
    outlined?: boolean;
    onClick: () => void;
}

@Component({
    selector: "app-table-toolbar",
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DividerModule],
    templateUrl: "./table-toolbar.html",
    styleUrls: ["./table-toolbar.scss"]
})
export class TableToolbarComponent implements OnInit, AfterViewInit {
    private readonly STORAGE_PREFIX = 'sardine-view-';

    searchField = input<boolean>(true);
    searchFieldPlaceholder = input<string>("Rechercher...");
    multipleViews = input<boolean>(false);
    storageKey = input<string>();
    view = model<ViewMode>('card');
    actions = input<TableToolbarAction[]>([]);
    search = output<string>();

    private filtersWrapper = viewChild<ElementRef>('filtersWrapper');
    hasFilters = signal(false);

    value: string = "";

    onSearch(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.value = target.value;
        this.search.emit(this.value);
    }

    constructor() {
        effect(() => {
            const key = this.storageKey();
            const currentView = this.view();
            if (key) {
                localStorage.setItem(this.STORAGE_PREFIX + key, currentView);
            }
        });
    }

    ngOnInit(): void {
        const key = this.storageKey();
        if (key) {
            const stored = localStorage.getItem(this.STORAGE_PREFIX + key);
            if (stored === 'list' || stored === 'card') {
                this.view.set(stored);
            }
        }
    }

    ngAfterViewInit(): void {
        const wrapper = this.filtersWrapper()?.nativeElement;
        this.hasFilters.set(wrapper?.children?.length > 0);
    }

    toggleView(): void {
        this.view.update(v => v === 'card' ? 'list' : 'card');
    }
}