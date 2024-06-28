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
    console.log('PostService initialized with AuthService:', this.authService);
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
    console.log('getAllPosts - Token:', token);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}`, { headers });
  }
}