import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { PostService } from '../../services/posts.service';

@Component({
  selector: 'app-savedpost',
  templateUrl: './saved-post.component.html',
  styleUrls: ['./saved-post.component.scss']
})
export class SavedPostComponent implements OnInit {
  savedPosts: any[] = [];
  commentForm: FormGroup;
  isCommentModalOpen = false;
  comments: any[] = [];
  currentPostId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private postService: PostService
  ) {
    this.commentForm = this.formBuilder.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSavedPosts();
  }

  loadSavedPosts(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.error('CurrentUser is null or undefined');
      return;
    }

    if (!currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const token = this.authService.getToken() ?? '';

    this.postService.getSavedPosts(currentUser.id, token).subscribe(
      data => {
        console.log('Saved Posts Data:', data);
        this.savedPosts = data.map(post => ({
          ...post,
          isCollapsed: true,
          likedBy: post.likedBy || [],
          likedByCurrentUser: post.likedBy && post.likedBy.includes(currentUser.id),
          comments: post.comments || [],
          savedByCurrentUser: post.savedBy && post.savedBy.includes(currentUser.id)
        }));
        console.log('Processed Saved Posts:', this.savedPosts);
      },
      error => {
        console.error('Error loading saved posts', error);
      }
    );
  }

  toggleText(post: any): void {
    post.isCollapsed = !post.isCollapsed;
  }

  getImgUrl(imgUrl: string): string {
    return imgUrl;
  }

  toggleLike(post: any): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const token = this.authService.getToken() ?? '';

    this.postService.toggleLike(post.id, currentUser.id, token).subscribe(
      updatedPost => {
        post.likeCount = updatedPost.likeCount;
        post.likedByCurrentUser = !post.likedByCurrentUser; // Inverti lo stato del like
      },
      error => {
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
      updatedPost => {
        post.savedByCurrentUser = !post.savedByCurrentUser; // Inverti lo stato del salvataggio
      },
      error => {
        console.error('Error toggling save', error);
      }
    );
  }

  openCommentModal(postId: number): void {
    this.currentPostId = postId;
    this.isCommentModalOpen = true;
    this.loadComments(postId);
  }

  closeCommentModal(): void {
    this.isCommentModalOpen = false;
  }

  loadComments(postId: number): void {
    const token = this.authService.getToken() ?? '';
    this.postService.getCommentsByPostId(postId).subscribe(
      data => {
        this.comments = data;
        const post = this.savedPosts.find(p => p.id === postId);
        if (post) {
          post.comments = data; // Aggiorna il contatore dei commenti
        }
      },
      error => {
        console.error('Error loading comments', error);
      }
    );
  }

  onSubmitComment(): void {
    if (this.commentForm.invalid || !this.currentPostId) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken() ?? '';

    this.postService.addComment(this.currentPostId, currentUser.id, this.commentForm.value.content, token).subscribe(
      data => {
        this.comments.push(data);
        this.commentForm.reset();
        const post = this.savedPosts.find(p => p.id === this.currentPostId);
        if (post) {
          post.comments.push(data); // Aggiorna il contatore dei commenti
        }
      },
      error => {
        console.error('Error adding comment', error);
      }
    );
  }
}
