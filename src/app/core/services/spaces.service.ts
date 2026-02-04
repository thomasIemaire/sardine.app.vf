import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SpaceListItem, SpaceResponse } from '../../models';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class SpacesService {
  private readonly http = inject(HttpService);

  /**
   * US-B1: Get all spaces (personal + teams)
   */
  getMySpaces(): Observable<SpaceListItem[]> {
    return this.http.get<SpaceListItem[]>('/spaces');
  }

  /**
   * Get space details
   */
  getSpace(spaceId: string): Observable<SpaceResponse> {
    return this.http.get<SpaceResponse>(`/spaces/${spaceId}`);
  }
}
