import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { StorageService } from '../../../core';
import { ButtonComponent, InputComponent } from '../../../shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonComponent, InputComponent, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly loading = signal(false);

  login(): void {
    this.loading.set(true);

    // Simulation d'une connexion
    setTimeout(() => {
      this.storage.set('token', 'fake-jwt-token');
      this.router.navigate(['/']);
      this.loading.set(false);
    }, 1000);
  }
}
