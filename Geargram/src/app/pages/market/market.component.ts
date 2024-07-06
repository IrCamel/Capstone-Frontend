import { Component, OnInit } from '@angular/core';
import { MarketService } from '../../services/market.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {
  products: any[] = [];
  selectedProduct: any = null;
  showModal = false;
  productForm: FormGroup;
  selectedFile: File | null = null;
  submitted = false;
  categories: any[] = [];

  constructor(
    private marketService: MarketService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.productForm = this.formBuilder.group({
      nomeProdotto: ['', Validators.required],
      descrizioneProdotto: ['', Validators.required],
      prezzo: ['', [Validators.required, Validators.min(0)]],
      nomeCategoria: ['', Validators.required],
      userId: [this.authService.currentUserValue?.id || '', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.marketService.getProducts().subscribe(data => {
      console.log('Products loaded:', data); // Debugging line
      this.products = data;
    });
  }

  loadCategories(): void {
    this.marketService.getCategorie().subscribe(data => {
      this.categories = data;
    });
  }

  get f() {
    return this.productForm.controls;
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
  }

  closeProductDetails(): void {
    this.selectedProduct = null;
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.submitted = false;
    this.productForm.reset();
    this.selectedFile = null;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.productForm.invalid || !this.selectedFile) {
      return;
    }

    const productData = this.productForm.value;

    this.marketService.createProduct(productData, this.selectedFile).subscribe(
      response => {
        console.log('Product created successfully', response);
        this.closeModal();
        this.loadProducts(); // Refresh the product list
      },
      error => {
        console.error('Error creating product', error);
      }
    );
  }

  navigateToUserProfile(userId: number | null): void {
    if (userId !== null) {
      this.router.navigate(['/profilo', userId]);
    }
  }
}
