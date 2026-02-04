import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { UserService } from "@core/services";
import { BrandComponent, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent } from "@shared/components";

@Component({
    selector: "app-login",
    imports: [RouterLink, BrandComponent, FormsModule, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent],
    templateUrl: "./login.html",
    styleUrls: ["./login.scss"],
})
export class LoginComponent {
    private userService = inject(UserService);
    private router = inject(Router);

    email = '';
    password = '';
    error = '';

    onLogin(): void {
        if (this.userService.login(this.email, this.password)) {
            this.router.navigate(['/']);
        } else {
            this.error = 'Email ou mot de passe incorrect';
        }
    }
}
