import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { PostService } from '../../services/posts.service';

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
  public authService: AuthService;
  isSubmittingComment = false;
  isDeletingComment = false;

  constructor(
    private formBuilder: FormBuilder,
    authService: AuthService,
    private postService: PostService
  ) {
    this.authService = authService;
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
    console.log('Current User ID:', this.authService.getCurrentUser().user.id);
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

    const currentUser = this.authService.getCurrentUser().user;
    console.log('Current User:', currentUser);

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
        this.posts.unshift({
          ...data,
          likedByCurrentUser: false,
          comments: [],
        }); // Aggiungi il nuovo post in cima alla lista
        this.closeModal();
      },
      (error) => {
        console.error('Error creating post', error);
      }
    );
  }

  loadPosts(): void {
    const currentUser = this.authService.getCurrentUser().user;
    this.postService.getAllPosts().subscribe(
      (data) => {
        this.posts = data.map((post) => {
          console.log('Post User ID:', post.userId); // Log the post user ID
          return {
            ...post,
            isCollapsed: true,
            likedBy: post.likedBy || [], // Assicura che likedBy sia un array
            likedByCurrentUser:
              post.likedBy && post.likedBy.includes(currentUser.id),
            comments: post.comments || [], // Assicura che comments sia un array
            savedByCurrentUser:
              post.savedBy && post.savedBy.includes(currentUser.id), // Controlla se il post è stato salvato dall'utente corrente
          };
        });
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
          post.comments = data; // Aggiorna il contatore dei commenti
        }
      },
      (error) => {
        console.error('Error loading comments', error);
      }
    );
  }

  onSubmitComment(): void {
    if (
      this.commentForm.invalid ||
      !this.currentPostId ||
      this.isSubmittingComment
    ) {
      return;
    }

    this.isSubmittingComment = true;

    const currentUser = this.authService.getCurrentUser().user;
    const token = this.authService.getToken() ?? '';

    this.postService
      .addComment(
        this.currentPostId,
        currentUser.id,
        this.commentForm.value.content,
        token
      )
      .subscribe(
        (data) => {
          // Assicuriamoci che il commento non venga duplicato
          this.comments = this.comments.filter(
            (comment) => comment.id !== data.id
          );
          this.comments.push(data);
          const post = this.posts.find((p) => p.id === this.currentPostId);
          if (post) {
            post.comments = post.comments.filter(
              (comment: any) => comment.id !== data.id
            );
            post.comments.push(data); // Aggiorna il contatore dei commenti
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

    const currentUser = this.authService.getCurrentUser().user;
    const token = this.authService.getToken() ?? '';

    this.postService.deleteComment(commentId, currentUser.id, token).subscribe(
      () => {
        this.comments = this.comments.filter(
          (comment) => comment.id !== commentId
        );
        const post = this.posts.find((p) => p.id === this.currentPostId);
        if (post) {
          post.comments = post.comments.filter(
            (comment: { id: number }) => comment.id !== commentId
          ); // Rimuovi il commento dalla lista dei commenti del post
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
    const currentUser = this.authService.getCurrentUser().user;
    console.log('Current User for Like:', currentUser);

    if (!currentUser || !currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const token = this.authService.getToken() ?? '';

    this.postService.toggleLike(post.id, currentUser.id, token).subscribe(
      (updatedPost) => {
        post.likeCount = updatedPost.likeCount;
        post.likedByCurrentUser = !post.likedByCurrentUser; // Inverti lo stato del like
      },
      (error) => {
        console.error('Error toggling like', error);
      }
    );
  }

  toggleSave(post: any): void {
    const currentUser = this.authService.getCurrentUser().user;
    console.log('Current User for Save:', currentUser);

    if (!currentUser || !currentUser.id) {
      console.error('User ID is null or undefined');
      return;
    }

    const token = this.authService.getToken() ?? '';

    this.postService.toggleSave(post.id, currentUser.id, token).subscribe(
      (updatedPost) => {
        post.savedByCurrentUser = !post.savedByCurrentUser; // Inverti lo stato del salvataggio
      },
      (error) => {
        console.error('Error toggling save', error);
      }
    );
  }

  deletePost(postId: number): void {
    const currentUser = this.authService.getCurrentUser().user;
    const token = this.authService.getToken() ?? '';

    this.postService.deletePost(postId, currentUser.id, token).subscribe(
      () => {
        this.posts = this.posts.filter((post) => post.id !== postId); // Rimuove il post dalla lista
      },
      (error) => {
        console.error('Error deleting post', error);
      }
    );
  }
}
