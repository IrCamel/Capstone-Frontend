import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  errorMessage: string | undefined;
  successMessage: string | undefined;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      eta: ['', [Validators.required, Validators.min(1)]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      avatar: ['']
    });
  }

  ngOnInit(): void {
  }

  get f() {
    return this.registerForm.controls;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const fileNameSpan = document.getElementById('file-chosen');
      if (fileNameSpan && this.selectedFile) {
        fileNameSpan.textContent = this.selectedFile.name;
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;

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
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Registration error', error);
        this.errorMessage = 'Registration failed. Please try again.';
      }
    );
  }

  triggerFileInputClick(): void {
    const fileInput = document.getElementById('avatar') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
