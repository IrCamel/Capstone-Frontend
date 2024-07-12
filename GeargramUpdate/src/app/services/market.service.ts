import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private apiUrl = 'http://localhost:8080/prodotti';
  private categorieUrl = 'http://localhost:8080/categorie';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: any, files: File[]): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('prodotto', JSON.stringify(productData));
    files.forEach(file => formData.append('files', file));
    return this.http.post<any>(`${this.apiUrl}`, formData);
  }

  editProduct(id: number, productData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, productData);
  }

  updateProductWithImages(id: number, productData: any, files: File[]): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('prodotto', JSON.stringify(productData));
    files.forEach(file => formData.append('files', file));
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getCategorie(): Observable<any[]> {
    return this.http.get<any[]>(`${this.categorieUrl}`);
  }

  searchProducts(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: {
        keyword: keyword
      }
    });
  }
}