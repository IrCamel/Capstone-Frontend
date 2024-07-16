import { Component, OnInit } from '@angular/core';
import { MarketService } from '../../services/market.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { NgxCroppedEvent, NgxPhotoEditorService } from 'ngx-photo-editor';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {
  products: any[] = [];
  selectedProduct: any = null;
  showModal = false;
  showCropper = false;
  productForm: FormGroup;
  selectedFiles: File[] = [];
  submitted = false;
  categories: any[] = [];
  currentIndex = 0;
  isEditing = false;
  searchKeyword: string = '';
  output?: NgxCroppedEvent;

  constructor(
    private marketService: MarketService,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private photoService: NgxPhotoEditorService,
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
    this.photoService.open(event, {
      aspectRatio: 4 / 4,
      autoCropArea: 1
    }).subscribe(data => {
      this.output = data;
      this.showCropper = true;
      // Non chiudere il modale di creazione prodotto
    });
  }

  applyCrop(): void {
    this.showCropper = false;
    this.showModal = true; // Riapri il modal di creazione prodotto
  }

  cancelCrop(): void {
    this.showCropper = false;
    this.showModal = true; // Riapri il modal di creazione prodotto
  }

  onSubmit(): void {
    this.submitted = true;
    console.log('Form submitted. Valid:', this.productForm.valid, 'Editing:', this.isEditing);

    if (this.productForm.invalid || (!this.isEditing && !this.output)) {
      console.log('Form is invalid or no image selected.');
      return;
    }

    const productData = this.productForm.value;
    console.log('Submitting product:', productData);

    const formData = new FormData();
    formData.append('prodotto', JSON.stringify(productData));

    if (this.output && this.output.base64) {
      const file = this.dataURLtoFile(this.output.base64, 'cropped-image.png');
      formData.append('files', file); // Cambia 'image' in 'files'
    }

    if (!this.isEditing && !this.output) {
      formData.append('files', new Blob([])); // Aggiungi una parte vuota per 'files'
    }

    if (this.isEditing && this.selectedProduct) {
      console.log('Editing product:', this.selectedProduct.id);
      this.marketService.editProduct(this.selectedProduct.id, formData).subscribe(
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
      console.log('Creating product');
      this.marketService.createProduct(formData).subscribe(
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

  dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    if (!arr[0] || !arr[1]) {
      throw new Error('Invalid data URL');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error('Invalid mime type in data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
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
