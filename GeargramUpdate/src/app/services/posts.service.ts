import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/post';

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  createPost(postData: any, file: File, token: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('post', JSON.stringify(postData));
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}`, formData, { headers });
  }

  getAllPosts(): Observable<any[]> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}`, { headers });
  }

  deletePost(postId: number, userId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/${postId}/user/${userId}`, { headers });
  }

  getImageUrl(postId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/image-url/${postId}`, { responseType: 'text' });
  }

  toggleLike(postId: number, userId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/${postId}/like/${userId}`, {}, { headers });
  }

  addComment(postId: number, userId: number, content: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/${postId}/comment/${userId}`, content, { headers });
  }

  getCommentsByPostId(postId: number): Observable<any[]> {
    const token = this.authService.getToken() ?? '';
    console.log('getCommentsByPostId - Token:', token);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/${postId}/comments`, { headers });
  }

  deleteComment(commentId: number, userId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/comment/${commentId}/user/${userId}`, { headers });
  }

  toggleSave(postId: number, userId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/${postId}/save/${userId}`, {}, { headers });
  }

  getSavedPosts(userId: number, token: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/saved/${userId}`, { headers });
  }
}
