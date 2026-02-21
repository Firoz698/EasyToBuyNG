import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, TrackByFunction } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  CategoryFilterRequestDto,
  CategoryRequestDto,
} from '../../Model/Category';
import { AGGridHelper } from '../../Shared/Service/AGGridHelper';
import { AuthService } from '../../Shared/Service/auth.service';
import { CommonHelper } from '../../Shared/Service/common-helper.service';
import { HttpHelperService } from '../../Shared/Service/http-helper.service';
import { PaginationComponent } from '../../Shared/pagination/pagination.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AgGridAngular,
    PaginationComponent,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  providers: [DatePipe],
})
export class CategoryComponent implements OnInit {
  private categoryGridApi!: any;
  public DeafultCol = AGGridHelper.DeafultCol;
  public rowData!: any[];
  public categoryList: any[] = [];
  public oCategoryFilterRequestDto = new CategoryFilterRequestDto();
  public oCategoryRequestDto = new CategoryRequestDto();

  public categoryId = 0;
  // pagination setup
  public pageIndex: number = 1;
  public totalRecords: number = 0;
  public totalPages: number = 0;
  public hasPreviousPage: boolean = false;
  public hasNextPage: boolean = false;
  public totalPageNumbers: number[] = [];

  public colDefsTransection: any[] = [
    {
      valueGetter: 'node.rowIndex + 1',
      headerName: 'SL',
      width: 90,
      editable: false,
      checkboxSelection: false,
    },
    { field: 'name', width: 150, headerName: 'Category Name', filter: true },
    {
      field: 'subCategoryName',
      width: 150,
      headerName: 'Sub Category Name',
      filter: true,
    },
    { field: 'remarks', headerName: 'Remarks' },
    { field: 'isActive', headerName: 'Status' },
  ];
  trackByFn: TrackByFunction<any> | any;
  trackByCategory: TrackByFunction<any> | any;
  trackByCategoryFrom: TrackByFunction<any> | any;
  constructor(
    public authService: AuthService,
    private toast: ToastrService,
    private http: HttpHelperService,
    private router: Router,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.GetCategorys();
    this.GetCategory();
  }

  PageChange(event: any) {
    this.pageIndex = Number(event);
    this.GetCategory();
  }

  onGridReadyTransection(params: any) {
    this.categoryGridApi = params.api;
    this.rowData = [];
  }

  detailToGrid(params: any) {
    const eDiv = document.createElement('div');
    eDiv.innerHTML =
      ' <button class="btn btn-success p-0 px-1"> <i class="bi bi-eye-fill"></i> Detail</button>';
    eDiv.addEventListener('click', () => {
      this.router.navigateByUrl('transactions/' + params.data.transactionId);
    });
    return eDiv;
  }

  Filter() {
    this.GetCategory();
  }

  private GetCategory() {
    let currentUser = CommonHelper.GetUser();
    this.oCategoryFilterRequestDto.companyId = Number(currentUser?.companyId);
    this.oCategoryFilterRequestDto.parentId = Number(
      this.oCategoryFilterRequestDto.parentId,
    );
    this.oCategoryFilterRequestDto.isActive = CommonHelper.booleanConvert(
      this.oCategoryFilterRequestDto.isActive,
    );
    // After the hash is generated, proceed with the API call
    this.http
      .Post(
        `Category/GetCategory?pageNumber=${this.pageIndex}`,
        this.oCategoryFilterRequestDto,
      )
      .subscribe(
        (res: any) => {
          console.log(res);
          this.rowData = res.items;
          this.pageIndex = res.pageIndex;
          this.totalPages = res.totalPages;
          this.totalRecords = res.totalRecords;
          this.hasPreviousPage = res.hasPreviousPage;
          this.hasNextPage = res.hasNextPage;
          this.totalPageNumbers = CommonHelper.generateNumbers(
            this.pageIndex,
            this.totalPages,
          );
          this.categoryGridApi.sizeColumnsToFit();
        },
        (err) => {
          this.toast.error(err.ErrorMessage, 'Error!!', { progressBar: true });
        },
      );
  }

  private GetCategorys() {
    let currentUser = CommonHelper.GetUser();
    this.oCategoryFilterRequestDto.companyId = Number(currentUser?.companyId);
    this.oCategoryFilterRequestDto.parentId = 0;
    this.oCategoryFilterRequestDto.isActive = CommonHelper.booleanConvert(
      this.oCategoryFilterRequestDto.isActive,
    );
    // After the hash is generated, proceed with the API call
    this.http
      .Post(`Category/GetAllCategories`, this.oCategoryFilterRequestDto)
      .subscribe(
        (res: any) => {
          this.categoryList = res;
        },
        (err) => {
          this.toast.error(err.ErrorMessage, 'Error!!', { progressBar: true });
        },
      );
  }

  public InsertCategory() {
    if (this.oCategoryRequestDto.name == '') {
      this.toast.warning('Please enter name', 'Warning!!', {
        progressBar: true,
      });
      return;
    }
    let currentUser = CommonHelper.GetUser();
    this.oCategoryRequestDto.companyId = Number(currentUser.companyId);
    this.oCategoryRequestDto.parentId = Number(
      this.oCategoryRequestDto.parentId,
    );
    this.oCategoryRequestDto.isActive = CommonHelper.booleanConvert(
      this.oCategoryRequestDto.isActive,
    );
    // After the hash is generated, proceed with the API call
    this.http
      .Post(`Category/InsertCategory`, this.oCategoryRequestDto)
      .subscribe(
        (res: any) => {
          CommonHelper.CommonButtonClick('closeCommonModel');
          this.GetCategory();
          this.toast.success('Data Save Successfully!!', 'Success!!', {
            progressBar: true,
          });
        },
        (err) => {
          this.toast.error(err.ErrorMessage, 'Error!!', { progressBar: true });
        },
      );
  }

  public UpdateCategory() {
    if (this.oCategoryRequestDto.name == '') {
      this.toast.warning('Please enter name', 'Warning!!', {
        progressBar: true,
      });
      return;
    }
    let currentUser = CommonHelper.GetUser();
    this.oCategoryFilterRequestDto.companyId = Number(currentUser.companyId);
    this.oCategoryFilterRequestDto.parentId = Number(
      this.oCategoryFilterRequestDto.parentId,
    );
    this.oCategoryRequestDto.isActive = CommonHelper.booleanConvert(
      this.oCategoryRequestDto.isActive,
    );
    // After the hash is generated, proceed with the API call
    this.http
      .Post(
        `Category/UpdateCategory/${this.categoryId}`,
        this.oCategoryRequestDto,
      )
      .subscribe(
        (res: any) => {
          CommonHelper.CommonButtonClick('closeCommonModel');
          this.GetCategory();
          this.toast.success('Data Update Successfully!!', 'Success!!', {
            progressBar: true,
          });
        },
        (err) => {
          this.toast.error(err.ErrorMessage, 'Error!!', { progressBar: true });
        },
      );
  }
  public DeleteCategory() {
    this.oCategoryRequestDto.isActive = CommonHelper.booleanConvert(
      this.oCategoryRequestDto.isActive,
    );
    // After the hash is generated, proceed with the API call
    this.http
      .Post(
        `Category/DeleteCategory/${this.categoryId}`,
        this.oCategoryRequestDto,
      )
      .subscribe(
        (res: any) => {
          CommonHelper.CommonButtonClick('closeCommonDelete');
          this.GetCategory();
          this.toast.success('Data Delete Successfully!!', 'Success!!', {
            progressBar: true,
          });
        },
        (err) => {
          this.toast.error(err.ErrorMessage, 'Error!!', { progressBar: true });
        },
      );
  }
  add() {
    CommonHelper.CommonButtonClick('openCommonModel');
    this.oCategoryRequestDto = new CategoryRequestDto();
    this.categoryId = 0;
  }

  edit() {
    let getSelectedItem = AGGridHelper.GetSelectedRow(this.categoryGridApi);
    if (getSelectedItem == null) {
      this.toast.warning('Please select an item', 'Warning!!', {
        progressBar: true,
      });
    }
    this.categoryId = Number(getSelectedItem.id);
    this.oCategoryRequestDto.name = getSelectedItem.name;
    this.oCategoryRequestDto.parentId = Number(getSelectedItem.parentId);
    this.oCategoryRequestDto.sequenceNo = Number(getSelectedItem.sequenceNo);
    this.oCategoryRequestDto.isActive = CommonHelper.booleanConvert(
      getSelectedItem.isActive,
    );
    this.oCategoryRequestDto.remarks = getSelectedItem.remarks;
    CommonHelper.CommonButtonClick('openCommonModel');
  }

  delete() {
    let getSelectedItem = AGGridHelper.GetSelectedRow(this.categoryGridApi);
    if (getSelectedItem == null) {
      this.toast.warning('Please select an item', 'Warning!!', {
        progressBar: true,
      });
    }
    this.categoryId = Number(getSelectedItem.id);
    this.oCategoryRequestDto.name = getSelectedItem.name;
    this.oCategoryRequestDto.parentId = Number(getSelectedItem.parentId);
    this.oCategoryRequestDto.sequenceNo = Number(getSelectedItem.sequenceNo);
    this.oCategoryRequestDto.isActive = getSelectedItem.isActive;
    this.oCategoryRequestDto.remarks = getSelectedItem.remarks;
    CommonHelper.CommonButtonClick('openCommonDelete');
  }

  public onFileChange(event: any): void {
    debugger;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.http.UploadFile(`UploadedFile/Upload`, file).subscribe(
        (res: any) => {
          this.oCategoryRequestDto.fileId = res.id;
        },
        (err) => {
          console.log(err.ErrorMessage);
        },
      );
    }
  }

  public onPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.pageIndex--;
      this.GetCategory();
    }
  }

  public onPage(pageNumber: number): void {
    if (this.hasNextPage) {
      this.pageIndex = pageNumber;
      this.GetCategory();
    }
  }

  public onNextPage(): void {
    if (this.hasNextPage) {
      this.pageIndex++;
      this.GetCategory();
    }
  }
}
