import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core';
import { ButtonComponent, InputComponent } from '../../../shared';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly firstname = signal('');
  protected readonly lastname = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  register(): void {
    // Reset error
    this.error.set(null);

    // Validation
    if (!this.firstname() || !this.lastname() || !this.email() || !this.password()) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.password().length < 8) {
      this.error.set('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    this.loading.set(true);

    this.authService.register({
      email: this.email(),
      firstname: this.firstname(),
      lastname: this.lastname(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set('Cette adresse email est déjà utilisée');
        } else {
          this.error.set('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }
}
