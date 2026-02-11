import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService, UserService } from "@core/services";
import { BrandComponent, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent } from "@shared/components";

@Component({
    selector: "app-login",
    imports: [RouterLink, BrandComponent, FormsModule, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent],
    templateUrl: "./login.html",
    styleUrls: ["./login.scss"],
})
export class LoginComponent {
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private router = inject(Router);

    email = '';
    password = '';
    error = signal('');
    loading = signal(false);

    onLogin(): void {
        this.error.set('');
        this.loading.set(true);

        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: () => {
                // Load user data after successful login
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
                this.error.set(err.error?.detail || 'Email ou mot de passe incorrect');
            }
        });
    }
}
