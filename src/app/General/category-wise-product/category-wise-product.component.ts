import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, TrackByFunction } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CategoryFilterRequestDto } from '../../Model/Category';
import { ProductFilterDto } from '../../Model/Product';
import { CommonHelper } from '../../Shared/Service/common-helper.service';
import { HttpHelperService } from '../../Shared/Service/http-helper.service';
import { CategoryProductComponent } from '../category-product/category-product.component';

@Component({
  selector: 'app-category-wise-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CategoryProductComponent],
  templateUrl: './category-wise-product.component.html',
  styleUrl: './category-wise-product.component.scss',
  providers: [DatePipe],
})
export class CategoryWiseProductComponent implements OnInit {

  public categoryList:    any[]                   = [];
  public activeCategory:  any                     = null;
  public productCountMap: Record<number, number>  = {};
  public isLoading:       boolean                 = true;
  public skeletons:       null[]                  = Array(8).fill(null);

  public oCategoryFilterRequestDto = new CategoryFilterRequestDto();

  trackByCategory: TrackByFunction<any> = (_: number, item: any) => item.id;

  private emojiMap: Record<string, string> = {
    electronics: '📱', phone: '📱', mobile: '📱',
    fashion:     '👗', clothing: '👗', dress: '👗', shirt: '👔',
    food:        '🍔', grocery: '🛒', fruits: '🍎', vegetable: '🥦',
    furniture:   '🛋️', home: '🏠', decor: '🖼️',
    sports:      '⚽', fitness: '💪', gym: '🏋️',
    books:       '📚', education: '🎓',
    beauty:      '💄', cosmetics: '💄', health: '💊',
    toys:        '🧸', kids: '👶', baby: '🍼',
    tools:       '🔧', hardware: '⚙️',
    stationery:  '✏️', office: '🖊️',
    jewelry:     '💍', accessories: '👜', bag: '👜',
    shoes:       '👟', footwear: '👟',
    car:         '🚗', automobile: '🚗',
    pet:         '🐾',
  };

  constructor(
    private toast: ToastrService,
    private http:  HttpHelperService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

<<<<<<< HEAD
  public GetImageUrl(fileId: number): string {
    return `${this.http.appUrl}UploadedFile/GetImage/${fileId}`;
  }

  detailToGrid(params: any) {
    const eDiv = document.createElement('div');
    eDiv.innerHTML = ' <button class="btn btn-success p-0 px-1"> <i class="bi bi-eye-fill"></i> Detail</button>'
    eDiv.addEventListener('click', () => {
      this.router.navigateByUrl('transactions/' + params.data.transactionId)
    });
    return eDiv;
=======
  toggleCategory(item: any): void {
    this.activeCategory = this.activeCategory?.id === item.id ? null : item;
>>>>>>> 91261eaea39850a0f98dabcb9016f97598f2300b
  }

  clearActiveCategory(): void {
    this.activeCategory = null;
  }

  getCategoryEmoji(name: string = ''): string {
    const lower = name.toLowerCase();
    for (const key of Object.keys(this.emojiMap)) {
      if (lower.includes(key)) return this.emojiMap[key];
    }
    return '🏷️';
  }

  private loadCategories(): void {
    this.isLoading = true;
    const companyId = Number(CommonHelper.GetComapyId());
    this.oCategoryFilterRequestDto.companyId = companyId;
    this.oCategoryFilterRequestDto.parentId  = 0;
    this.oCategoryFilterRequestDto.isActive  = CommonHelper.booleanConvert(
      this.oCategoryFilterRequestDto.isActive
    );

    this.http.Post('Category/GetAllCategories', this.oCategoryFilterRequestDto)
      .subscribe({
        next: (res: any) => {
          this.categoryList = res ?? [];
          this.isLoading    = false;
          this.fetchProductCounts(companyId);
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err.ErrorMessage, 'Error!!', { progressBar: true });
        },
      });
  }

  private fetchProductCounts(companyId: number): void {
    if (!this.categoryList.length) return;

    const requests = this.categoryList.map(cat => {
      const filter = new ProductFilterDto();
      filter.companyId  = companyId;
      filter.categoryId = Number(cat.id);
      filter.isActive   = CommonHelper.booleanConvert(filter.isActive);

      return this.http.Post('Product/GetAllProducts', filter).pipe(
        map((products: any) => ({
          id:    cat.id,
          count: Array.isArray(products) ? products.length : 0,
        })),
        catchError(() => of({ id: cat.id, count: 0 }))
      );
    });

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const map: Record<number, number> = {};
        results.forEach(r => (map[r.id] = r.count));
        this.productCountMap = map;
      },
      error: () => {},
    });
  }
}