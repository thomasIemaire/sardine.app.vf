import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { map } from 'rxjs';

export interface PageTab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tabbed-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink, Divider],
  templateUrl: './tabbed-page.html',
  styleUrl: './tabbed-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabbedPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly maintitle = input.required<string>();
  readonly subtitle = input<string>('');
  readonly tabs = input<PageTab[]>([]);
  readonly subTabs = input<PageTab[]>([]);

  readonly tabChanged = output<string>();
  readonly subTabChanged = output<string>();

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
    return tabsList[0]?.id ?? '';
  });

  readonly activeSubTab = computed(() => {
    const subTabFromUrl = this.queryParamsSignal()?.subtabs;
    const subTabsList = this.subTabs();
    if (subTabFromUrl && subTabsList.some(t => t.id === subTabFromUrl)) {
      return subTabFromUrl;
    }
    return subTabsList[0]?.id ?? '';
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

  onTabClick(tabId: string): void {
    this.tabChanged.emit(tabId);
  }

  onSubTabClick(subTabId: string): void {
    this.subTabChanged.emit(subTabId);
  }
}
