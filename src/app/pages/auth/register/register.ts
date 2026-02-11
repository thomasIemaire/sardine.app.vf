import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService, UserService } from "@core/services";
import { BrandComponent, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent } from "@shared/components";

@Component({
    selector: "app-register",
    imports: [RouterLink, BrandComponent, FormsModule, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent],
    templateUrl: "./register.html",
    styleUrls: ["./register.scss"],
})
export class RegisterComponent {
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private router = inject(Router);

    firstName = '';
    lastName = '';
    email = '';
    password = '';
    confirmPassword = '';
    error = signal('');
    loading = signal(false);

    onRegister(): void {
        // Validation
        if (this.password !== this.confirmPassword) {
            this.error.set('Les mots de passe ne correspondent pas');
            return;
        }

        if (this.password.length < 8) {
            this.error.set('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        this.error.set('');
        this.loading.set(true);

        this.authService.register({
            email: this.email,
            password: this.password,
            first_name: this.firstName,
            last_name: this.lastName
        }).subscribe({
            next: () => {
                // Load user data after successful registration
                this.userService.loadCurrentUser().subscribe({
                    next: () => {
                        this.loading.set(false);
                        this.router.navigate(['/']);
                    },
                    error: () => {
                        this.loading.set(false);
                        this.router.navigate(['/']);
                    }
                });
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err.error?.detail || 'Une erreur est survenue lors de l\'inscription');
            }
        });
    }
}
