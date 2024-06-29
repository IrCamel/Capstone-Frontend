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
      return;
    }

    const currentUser = this.authService.getCurrentUser().user;
    console.log('Current User:', currentUser);

    if (!currentUser || !currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const postData = {
      titolo: this.postForm.value.titolo,
      descrizione: this.postForm.value.descrizione,
      userId: currentUser.id
    };

    const token = this.authService.getToken() ?? '';

    this.postService.createPost(postData, this.selectedFile, token).subscribe(
      data => {
        this.posts.unshift(data); // Aggiungi il nuovo post in cima alla lista
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

  toggleLike(post: any): void {
    const currentUser = this.authService.getCurrentUser().user;
    console.log('Current User for Like:', currentUser);

    if (!currentUser || !currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const token = this.authService.getToken() ?? '';

    this.postService.toggleLike(post.id, currentUser.id, token).subscribe(
      updatedPost => {
        post.likeCount = updatedPost.likeCount;
      },
      error => {
        console.error('Error toggling like', error);
      }
    );
  }

  trackByPostId(index: number, post: any): number {
    return post.id;
  }
}
