export class CategoryFilterRequestDto {

    constructor() {
        this.name = '';
        this.companyId = 0;
        this.parentId = 0;
        this.isActive = true;
    }
    public name: string;
    public companyId: number;
    public parentId: number;
    public isActive: boolean;
}

export class CategoryRequestDto {

    constructor() {
        this.name = '';
        this.companyId = 0;
        this.fileId = 0;
        this.parentId = 0;
        this.sequenceNo = 0;
        this.isActive = true;
        this.remarks = "";
    }
    public name: string;
    public remarks: string;
    public companyId: number;
    public fileId: number;
    public parentId: number;
    public sequenceNo: number;
    public isActive: boolean;
}

