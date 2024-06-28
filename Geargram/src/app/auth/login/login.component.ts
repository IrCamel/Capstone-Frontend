import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      eta: ['', [Validators.required, Validators.min(1)]],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      return;
    }

    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      nome: this.loginForm.value.nome,
      cognome: this.loginForm.value.cognome,
      eta: this.loginForm.value.eta,
      email: this.loginForm.value.email
    };

    this.authService.login(credentials).subscribe(
      data => {
        console.log('Login successful', data);
        this.router.navigate(['/homepage']);
      },
      error => {
        console.error('Login error', error);
        this.errorMessage = 'Login failed. Please try again.';
      }
    );
  }
}
