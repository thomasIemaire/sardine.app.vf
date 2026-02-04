import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { StorageService } from '../services';

const TOKEN_KEY = 'auth_token';

export const authGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router = inject(Router);

  const token = storage.get<string>(TOKEN_KEY);

  if (token) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

export const guestGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router = inject(Router);

  const token = storage.get<string>(TOKEN_KEY);

  if (!token) {
    return true;
  }

  return router.createUrlTree(['/']);
};
