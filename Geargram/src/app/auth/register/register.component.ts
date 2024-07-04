import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      eta: ['', [Validators.required, Validators.min(1)]],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      avatar: [null, Validators.required] // Aggiungi il controllo per l'avatar
    });
  }

  get f() { return this.registerForm.controls; }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.registerForm.patchValue({
        avatar: this.selectedFile
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.invalid || !this.selectedFile) {
      return;
    }

    const formData = {
      nome: this.registerForm.value.nome,
      cognome: this.registerForm.value.cognome,
      eta: this.registerForm.value.eta,
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(formData, this.selectedFile).subscribe(
      data => {
        console.log('Registration successful', data);
        this.successMessage = 'Registration successful!';
        this.registerForm.reset();
        this.submitted = false;
        this.router.navigate(['/homepage']);
      },
      error => {
        console.error('Registration error', error);
        this.errorMessage = 'Registration failed. Please try again.';
      }
    );
  }
}
