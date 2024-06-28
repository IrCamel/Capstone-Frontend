import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { PostService } from '../../services/posts.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  postForm: FormGroup;
  isModalOpen = false;
  submitted = false;
  selectedFile: File | null = null;
  posts: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private postService: PostService
  ) {
    console.log('HomepageComponent initialized with AuthService:', this.authService);
    this.postForm = this.formBuilder.group({
      titolo: ['', Validators.required],
      descrizione: ['', Validators.required],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  get f() { return this.postForm.controls; }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.postForm.invalid || !this.selectedFile) {
      return;
    }

    const postData = {
      titolo: this.postForm.value.titolo,
      descrizione: this.postForm.value.descrizione
    };

    const token = this.authService.getToken() ?? '';
    console.log('onSubmit - Token:', token);

    this.postService.createPost(postData, this.selectedFile, token).subscribe(
      data => {
        this.loadPosts();
        this.closeModal();
      },
      error => {
        console.error('Error creating post', error);
      }
    );
  }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe(
      data => {
        this.posts = data;
      },
      error => {
        console.error('Error loading posts', error);
      }
    );
  }
}
