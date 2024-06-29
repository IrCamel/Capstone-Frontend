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
  public authService: AuthService;

  constructor(
    private formBuilder: FormBuilder,
    authService: AuthService,
    private postService: PostService
  ) {
    this.authService = authService;
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
      console.log('Form is invalid or file is not selected');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    console.log('Current user before creating post:', currentUser);

    if (!currentUser || !currentUser.user.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const postData = {
      titolo: this.postForm.value.titolo,
      descrizione: this.postForm.value.descrizione,
      userId: currentUser.user.id  // Assicurati che questo valore sia presente
    };

    const token = this.authService.getToken() ?? '';

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
        this.posts = data.map(post => ({ ...post, isCollapsed: true }));
      },
      error => {
        console.error('Error loading posts', error);
      }
    );
  }

  getImgUrl(imgUrl: string): string {
    return imgUrl;
  }

  toggleText(post: any): void {
    post.isCollapsed = !post.isCollapsed;
  }
}
