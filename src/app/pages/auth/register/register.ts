import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { BrandComponent, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent } from "@shared/components";

@Component({
    selector: "app-register",
    imports: [RouterLink, BrandComponent, FormsModule, FieldComponent, FormComponent, PasswordFieldComponent, TextFieldComponent],
    templateUrl: "./register.html",
    styleUrls: ["./register.scss"],
})
export class RegisterComponent {
    email = '';
    password = '';
    confirmPassword = '';

    onRegister(): void {
        console.log('Register:', this.email, this.password);
    }
}
