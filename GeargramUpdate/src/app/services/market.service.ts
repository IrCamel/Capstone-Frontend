import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private apiUrl = 'http://localhost:8080/prodotti';
  private categorieUrl = 'http://localhost:8080/categorie';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  getCategorie(): Observable<any> {
    return this.http.get(`${this.categorieUrl}`, { headers: this.getAuthHeaders() });
  }

  createProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, productData, { headers: this.getAuthHeaders() });
  }

  editProduct(productId: number, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}`, productData, { headers: this.getAuthHeaders() });
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`, { headers: this.getAuthHeaders() });
  }

  searchProducts(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { keyword },
      headers: this.getAuthHeaders()
    });
  }
}
