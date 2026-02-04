import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { BrandComponent, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent } from "@shared/components";

@Component({
    selector: "app-login",
    imports: [RouterLink, BrandComponent, FormsModule, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent],
    templateUrl: "./login.html",
    styleUrls: ["./login.scss"],
})
export class LoginComponent {
    email = '';
    password = '';

    onLogin(): void {
        console.log('Login:', this.email, this.password);
    }
}
