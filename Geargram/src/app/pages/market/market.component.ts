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
  selectedFiles: File[] = [];
  submitted = false;
  categories: any[] = [];
  currentIndex = 0;

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
      console.log('Categories loaded:', data); // Debugging line
      this.categories = data;
    });
  }

  get f() {
    return this.productForm.controls;
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.currentIndex = 0; // Reset the slider index when selecting a new product
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
    this.selectedFiles = [];
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.productForm.invalid || this.selectedFiles.length === 0) {
      return;
    }

    const productData = this.productForm.value;
    console.log('Submitting product:', productData); // Debugging line
    console.log('Selected files:', this.selectedFiles); // Debugging line

    this.marketService.createProduct(productData, this.selectedFiles).subscribe(
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

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.selectedProduct.imgUrl.length - 1) {
      this.currentIndex++;
    }
  }

  getImageUrl(imgUrls: string | string[]): string {
    if (Array.isArray(imgUrls)) {
      return imgUrls.length > 0 ? imgUrls[0] : 'assets/no-image.png';
    } else {
      return imgUrls || 'assets/no-image.png';
    }
  }
}
