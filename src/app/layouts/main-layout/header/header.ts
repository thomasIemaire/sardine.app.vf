import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Divider } from "primeng/divider";
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { filter, map, startWith } from 'rxjs';
import { SidebarService, ThemeService, ThemeMode, DisplayMode } from '../../../core/services';

interface RouteConfig {
  label: string;
  tabs: Record<string, string>;
}

interface DetailRouteConfig {
  parentKey: string;
  labelPrefix: string;
  tabs: Record<string, string>;
  subTabs?: Record<string, Record<string, string>>;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  'automation': {
    label: 'Automatisation',
    tabs: {
      'agents': 'Agents',
      'flows': 'Flows'
    }
  },
  'documents': {
    label: 'Documents',
    tabs: {
      'folders': 'Dossiers',
      'trash': 'Corbeille'
    }
  },
  'contacts': {
    label: 'Contacts',
    tabs: {
      'directory': 'Annuaire'
    }
  },
  'teams': {
    label: 'Équipes',
    tabs: {
      'teams': 'Équipes'
    }
  }
};

const DETAIL_ROUTE_CONFIG: Record<string, DetailRouteConfig> = {
  'teams': {
    parentKey: 'teams',
    labelPrefix: 'Équipe',
    tabs: {
      'members': 'Membres',
      'rights': 'Droits'
    },
    subTabs: {
      'members': {
        'users': 'Utilisateurs',
        'subteams': 'Sous-équipes'
      }
    }
  }
};

interface SubDetailRouteConfig {
  parentLabelPrefix: string;
  labelPrefix: string;
  tabs: Record<string, string>;
}

const SUB_DETAIL_ROUTE_CONFIG: Record<string, SubDetailRouteConfig> = {
  'subteams': {
    parentLabelPrefix: 'Équipe',
    labelPrefix: 'Sous-équipe',
    tabs: {
      'members': 'Membres',
      'settings': 'Paramètres'
    }
  }
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, Divider, BreadcrumbModule, DrawerModule, SelectButtonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly sidebarService = inject(SidebarService);
  protected readonly themeService = inject(ThemeService);

  readonly sidebarCollapsed = this.sidebarService.collapsed;

  notificationsVisible = false;
  settingsVisible = false;

  themeModeOptions = [
    { label: 'Jour', value: 'light' },
    { label: 'Nuit', value: 'dark' }
  ];

  displayModeOptions = [
    { label: 'Tableau', value: 'table' },
    { label: 'Carte', value: 'card' }
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    )
  );

  readonly items = computed<MenuItem[]>(() => {
    const url = this.currentUrl() || '';
    const [path, queryString] = url.split('?');
    const segments = path.split('/').filter(Boolean);
    const routeKey = segments[0];
    const detailId = segments[1];
    const subRouteKey = segments[2];
    const subDetailId = segments[3];

    const config = ROUTE_CONFIG[routeKey];
    if (!config) {
      return [];
    }

    const items: MenuItem[] = [
      { label: config.label, routerLink: ['/', routeKey] }
    ];

    const params = new URLSearchParams(queryString || '');
    const tabId = params.get('tabs');
    const subTabId = params.get('subtabs');

    // Handle sub-detail routes like /teams/:teamId/subteams/:subteamId
    if (detailId && subRouteKey && subDetailId && SUB_DETAIL_ROUTE_CONFIG[subRouteKey]) {
      const subDetailConfig = SUB_DETAIL_ROUTE_CONFIG[subRouteKey];

      // Parent detail (Équipe #1)
      items.push({
        label: `${subDetailConfig.parentLabelPrefix} #${detailId}`,
        routerLink: ['/', routeKey, detailId],
        queryParams: { tabs: 'members', subtabs: 'subteams' }
      });

      // Sub-detail (Sous-équipe #101)
      items.push({
        label: `${subDetailConfig.labelPrefix} #${subDetailId}`,
        routerLink: ['/', routeKey, detailId, subRouteKey, subDetailId]
      });

      // Tab
      const defaultTab = Object.keys(subDetailConfig.tabs)[0];
      const activeTab = tabId && subDetailConfig.tabs[tabId] ? tabId : defaultTab;

      if (activeTab && subDetailConfig.tabs[activeTab]) {
        items.push({
          label: subDetailConfig.tabs[activeTab],
          routerLink: ['/', routeKey, detailId, subRouteKey, subDetailId],
          queryParams: { tabs: activeTab }
        });
      }
    } else if (detailId && DETAIL_ROUTE_CONFIG[routeKey]) {
      const detailConfig = DETAIL_ROUTE_CONFIG[routeKey];
      items.push({
        label: `${detailConfig.labelPrefix} #${detailId}`,
        routerLink: ['/', routeKey, detailId]
      });

      const defaultTab = Object.keys(detailConfig.tabs)[0];
      const activeTab = tabId && detailConfig.tabs[tabId] ? tabId : defaultTab;

      if (activeTab && detailConfig.tabs[activeTab]) {
        items.push({
          label: detailConfig.tabs[activeTab],
          routerLink: ['/', routeKey, detailId],
          queryParams: { tabs: activeTab }
        });

        const subTabsConfig = detailConfig.subTabs?.[activeTab];
        if (subTabsConfig) {
          const defaultSubTab = Object.keys(subTabsConfig)[0];
          const activeSubTab = subTabId && subTabsConfig[subTabId] ? subTabId : defaultSubTab;

          if (activeSubTab && subTabsConfig[activeSubTab]) {
            items.push({
              label: subTabsConfig[activeSubTab],
              routerLink: ['/', routeKey, detailId],
              queryParams: { tabs: activeTab, subtabs: activeSubTab }
            });
          }
        }
      }
    } else {
      const defaultTab = Object.keys(config.tabs)[0];
      const activeTab = tabId && config.tabs[tabId] ? tabId : defaultTab;

      if (activeTab && config.tabs[activeTab]) {
        items.push({
          label: config.tabs[activeTab],
          routerLink: ['/', routeKey],
          queryParams: { tabs: activeTab }
        });
      }
    }

    return items;
  });

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  openNotifications(): void {
    this.notificationsVisible = true;
  }

  openSettings(): void {
    this.settingsVisible = true;
  }

  onThemeModeChange(value: ThemeMode): void {
    this.themeService.setThemeMode(value);
  }

  onDisplayModeChange(value: DisplayMode): void {
    this.themeService.setDisplayMode(value);
  }
}
