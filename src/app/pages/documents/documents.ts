import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { SpacesService } from '../../core/services';
import { SpaceListItem } from '../../models';
import { TabbedPageComponent, PageTab } from '../../shared';
import { FoldersTabComponent } from './tabs/folders/folders-tab';
import { TrashTabComponent } from './tabs/trash/trash-tab';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [TabbedPageComponent, FoldersTabComponent, TrashTabComponent],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly spacesService = inject(SpacesService);

  readonly tabs: PageTab[] = [
    { id: 'folders', label: 'Dossiers' },
    { id: 'trash', label: 'Corbeille' }
  ];

  readonly folderId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

  // Spaces management
  private readonly spaces = signal<SpaceListItem[]>([]);
  private readonly selectedSpaceId = signal<string | null>(null);

  // Computed current space ID - defaults to personal space
  readonly currentSpaceId = computed(() => {
    const selected = this.selectedSpaceId();
    if (selected) return selected;

    // Default to personal space
    const personalSpace = this.spaces().find(s => s.isPersonal);
    return personalSpace?._id ?? null;
  });

  constructor() {
    // Load spaces on init
    effect(() => {
      this.loadSpaces();
    }, { allowSignalWrites: true });
  }

  private loadSpaces(): void {
    this.spacesService.getMySpaces().subscribe({
      next: (spaces) => {
        this.spaces.set(spaces);
        // Auto-select personal space if no space selected
        if (!this.selectedSpaceId()) {
          const personalSpace = spaces.find(s => s.isPersonal);
          if (personalSpace) {
            this.selectedSpaceId.set(personalSpace._id);
          } else if (spaces.length > 0) {
            this.selectedSpaceId.set(spaces[0]._id);
          }
        }
      },
      error: (error) => console.error('Error loading spaces:', error)
    });
  }

  selectSpace(spaceId: string): void {
    this.selectedSpaceId.set(spaceId);
  }
}
