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
  isEditing = false;
  searchKeyword: string = '';
  croppedImage: any = '';

  constructor(
    private marketService: MarketService,
    private formBuilder: FormBuilder,
    public authService: AuthService,
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
      console.log('Products loaded:', data);
      this.products = data;
    });
  }

  loadCategories(): void {
    this.marketService.getCategorie().subscribe(data => {
      console.log('Categories loaded:', data);
      this.categories = data;
    });
  }

  get f() {
    return this.productForm.controls;
  }

  selectProduct(product: any): void {
    console.log('Selected product:', product);
    this.selectedProduct = product;
    this.currentIndex = 0;
  }

  closeProductDetails(): void {
    console.log('Closing product details');
    this.selectedProduct = null;
  }

  openModal(isEditing: boolean): void {
    console.log('Opening modal:', isEditing ? 'Editing' : 'Creating');
    this.showModal = true;
    this.isEditing = isEditing;
    this.resetForm();

    if (isEditing && this.selectedProduct) {
      this.productForm.patchValue({
        nomeProdotto: this.selectedProduct.nomeProdotto,
        descrizioneProdotto: this.selectedProduct.descrizioneProdotto,
        prezzo: this.selectedProduct.prezzo,
        nomeCategoria: this.selectedProduct.categoria[0]?.nomeCategoria,
        userId: this.authService.currentUserValue?.id || ''
      });
    }
    console.log('userId set to:', this.productForm.controls['userId'].value);
  }

  closeModal(): void {
    console.log('Closing modal');
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.submitted = false;
    this.productForm.reset();
    this.selectedFiles = [];
    this.productForm.controls['userId'].setValue(this.authService.currentUserValue?.id || '');
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      console.log('Selected files:', this.selectedFiles);
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        this.croppedImage = e.target.result;
      };
      fileReader.readAsDataURL(this.selectedFiles[0]);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    console.log('Form submitted. Valid:', this.productForm.valid, 'Editing:', this.isEditing);

    if (this.productForm.invalid || (!this.isEditing && this.selectedFiles.length === 0)) {
      console.log('Form is invalid or no files selected.');
      return;
    }

    const productData = this.productForm.value;
    console.log('Submitting product:', productData);
    console.log('Selected files:', this.selectedFiles);

    if (this.isEditing && this.selectedProduct) {
      console.log('Editing product:', this.selectedProduct.id);
      if (this.selectedFiles.length > 0) {
        this.marketService.updateProductWithImages(this.selectedProduct.id, productData, this.selectedFiles).subscribe(
          response => {
            console.log('Product edited successfully', response);
            this.updateProductList(response);
            this.selectedProduct = response; // Aggiorna selectedProduct con i nuovi dati
            this.closeModal();
          },
          error => {
            console.error('Error editing product', error);
          }
        );
      } else {
        this.marketService.editProduct(this.selectedProduct.id, productData).subscribe(
          response => {
            console.log('Product edited successfully', response);
            this.updateProductList(response);
            this.selectedProduct = response; // Aggiorna selectedProduct con i nuovi dati
            this.closeModal();
          },
          error => {
            console.error('Error editing product', error);
          }
        );
      }
    } else {
      console.log('Creating product');
      this.marketService.createProduct(productData, this.selectedFiles).subscribe(
        response => {
          console.log('Product created successfully', response);
          this.products.push(response);
          this.closeModal();
        },
        error => {
          console.error('Error creating product', error);
        }
      );
    }
  }

  searchProducts(): void {
    if (this.searchKeyword.trim() !== '') {
      this.marketService.searchProducts(this.searchKeyword).subscribe(data => {
        console.log('Search results:', data);
        this.products = data;
      }, error => {
        console.error('Error searching products:', error);
      });
    } else {
      this.loadProducts();
    }
  }

  updateProductList(updatedProduct: any): void {
    const index = this.products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = updatedProduct;
    } else {
      this.products.push(updatedProduct);
    }
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

  editProduct(product: any): void {
    console.log('Editing product:', product);
    if (product.username !== this.authService.currentUserValue?.username) {
      alert('Non sei autorizzato a modificare questo prodotto');
      return;
    }

    this.selectedProduct = product;
    this.openModal(true);
  }

  deleteProduct(productId: number): void {
    const product = this.products.find(p => p.id === productId);
    if (product && product.username !== this.authService.currentUserValue?.username) {
      alert('Non sei autorizzato a eliminare questo prodotto');
      return;
    }

    this.marketService.deleteProduct(productId).subscribe(
      response => {
        console.log('Product deleted successfully', response);
        this.products = this.products.filter(p => p.id !== productId);
        this.closeProductDetails();
      },
      error => {
        console.error('Error deleting product', error);
        alert('Error deleting product: ' + error.message);
      }
    );
  }
}
