import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterModel } from '../models/register-model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) { }

  register(user: RegisterModel): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }
}
