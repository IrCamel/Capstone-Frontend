import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();

    // Set up the auto logout based on token expiration
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        this.autoLogout(user.token);
      }
    }

  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }
  login(credentials: any): Observable<any> {
    return this.http.post<any>('http://localhost:8080/users/login', credentials)
      .pipe(map(user => {
        if (user && user.token) {
          const userWithAvatar = {
            ...user,
            avatar: user.avatar // Assicurati che l'avatar sia incluso
          };
          localStorage.setItem('currentUser', JSON.stringify(userWithAvatar));
          this.currentUserSubject.next(userWithAvatar);
        }
        return user;
      }));
  }

  register(user: any, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('user', JSON.stringify(user));
    formData.append('file', file);

    return this.http.post<any>('http://localhost:8080/users', formData)
      .pipe(map(response => {
        if (response && response.token) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
          this.autoLogout(response.token);  // Set up auto logout on registration
        }
        return response;
      }));
  }

  getToken(): string | null {
    return this.currentUserValue?.token || null;
  }

  getCurrentUser() {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      return currentUser;
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  autoLogout(jwt: string) {
    const expDate = this.jwtHelper.getTokenExpirationDate(jwt) as Date;
    const expMs = expDate.getTime() - new Date().getTime();
    setTimeout(() => {
      this.logout();
    }, expMs);
  }
}
