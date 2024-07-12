import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { PostService } from '../../services/posts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  postForm: FormGroup;
  commentForm: FormGroup;
  isModalOpen = false;
  isCommentModalOpen = false;
  submitted = false;
  selectedFile: File | null = null;
  posts: any[] = [];
  comments: any[] = [];
  currentPostId: number | null = null;
  isSubmittingComment = false;
  isDeletingComment = false;
  currentUser: any;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private postService: PostService,
    private router: Router
  ) {
    this.postForm = this.formBuilder.group({
      titolo: ['', Validators.required],
      descrizione: ['', Validators.required],
      imageUrl: [''],
    });

    this.commentForm = this.formBuilder.group({
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPosts();
    this.currentUser = this.authService.getCurrentUser();
  }

  get f() {
    return this.postForm.controls;
  }

  get cf() {
    return this.commentForm.controls;
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openCommentModal(postId: number): void {
    this.currentPostId = postId;
    this.isCommentModalOpen = true;
    this.loadComments(postId);
  }

  closeCommentModal(): void {
    this.isCommentModalOpen = false;
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

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const postData = {
      titolo: this.postForm.value.titolo,
      descrizione: this.postForm.value.descrizione,
      userId: currentUser.id,
    };

    const token = this.authService.getToken() ?? '';

    this.postService.createPost(postData, this.selectedFile, token).subscribe(
      (data) => {
        const newPost = {
          ...data,
          likedByCurrentUser: false,
          comments: [],
        };
        this.posts.unshift(newPost); // Aggiungi il nuovo post in cima alla lista
        this.closeModal();
      },
      (error) => {
        console.error('Error creating post', error);
      }
    );
  }

  loadPosts(): void {
    const currentUser = this.authService.getCurrentUser();
    this.postService.getAllPosts().subscribe(
      (data) => {
        this.posts = data.map((post) => ({
          ...post,
          isCollapsed: true,
          likedBy: post.likedBy || [],
          likedByCurrentUser: post.likedBy && post.likedBy.includes(currentUser.id),
          comments: post.comments || [],
          savedByCurrentUser: post.savedBy && post.savedBy.includes(currentUser.id),
          avatar: post.userAvatar
        }));
      },
      (error) => {
        console.error('Error loading posts', error);
      }
    );
  }

  loadComments(postId: number): void {
    const token = this.authService.getToken() ?? '';
    this.postService.getCommentsByPostId(postId).subscribe(
      (data) => {
        this.comments = data;
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
          post.comments = data;
        }
      },
      (error) => {
        console.error('Error loading comments', error);
      }
    );
  }

  onSubmitComment(): void {
    if (this.commentForm.invalid || !this.currentPostId || this.isSubmittingComment) {
      return;
    }

    this.isSubmittingComment = true;

    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken() ?? '';

    this.postService
      .addComment(this.currentPostId, currentUser.id, this.commentForm.value.content, token)
      .subscribe(
        (data) => {
          this.comments.push(data);
          const post = this.posts.find((p) => p.id === this.currentPostId);
          if (post) {
            post.comments.push(data);
          }
          this.commentForm.reset();
          this.isSubmittingComment = false;
        },
        (error) => {
          console.error('Error adding comment', error);
          this.isSubmittingComment = false;
        }
      );
  }

  deleteComment(commentId: number): void {
    if (this.currentPostId === null || this.isDeletingComment) {
      return;
    }

    this.isDeletingComment = true;

    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken() ?? '';

    this.postService.deleteComment(commentId, currentUser.id, token).subscribe(
      () => {
        this.comments = this.comments.filter((comment) => comment.id !== commentId);
        const post = this.posts.find((p) => p.id === this.currentPostId);
        if (post) {
          post.comments = post.comments.filter((comment: { id: number; }) => comment.id !== commentId);
        }
        this.isDeletingComment = false;
      },
      (error) => {
        console.error('Error deleting comment', error);
        this.isDeletingComment = false;
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
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const token = this.authService.getToken() ?? '';

    this.postService.toggleLike(post.id, currentUser.id, token).subscribe(
      (updatedPost) => {
        post.likeCount = updatedPost.likeCount;
        post.likedByCurrentUser = !post.likedByCurrentUser;
      },
      (error) => {
        console.error('Error toggling like', error);
      }
    );
  }

  toggleSave(post: any): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const token = this.authService.getToken() ?? '';

    this.postService.toggleSave(post.id, currentUser.id, token).subscribe(
      (updatedPost) => {
        post.savedByCurrentUser = !post.savedByCurrentUser;
      },
      (error) => {
        console.error('Error toggling save', error);
      }
    );
  }

  deletePost(postId: number): void {
    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken() ?? '';

    this.postService.deletePost(postId, currentUser.id, token).subscribe(
      () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
      },
      (error) => {
        console.error('Error deleting post', error);
      }
    );
  }

  navigateToUserProfile(userId: number | null): void {
    if (userId !== null) {
      this.router.navigate(['/profilo', userId]);
    }
  }
}
