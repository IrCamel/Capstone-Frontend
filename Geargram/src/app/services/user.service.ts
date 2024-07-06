import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() });
  }

  followUser(followerId: number, followeeId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${followerId}/follow/${followeeId}`, {}, { headers: this.getAuthHeaders() });
  }

  toggleFollow(followerId: number, followeeId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${followerId}/follow/${followeeId}`, {}, { headers: this.getAuthHeaders() });
  }
}
