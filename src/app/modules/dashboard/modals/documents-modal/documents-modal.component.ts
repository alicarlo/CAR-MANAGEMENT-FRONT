import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Inject, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ClientsService } from 'src/app/core/services/clients/clients.service';
import { CreateClientError } from 'src/app/core/models/error';
import { Clients } from 'src/app/core/models/clients.model';
import  moment from 'moment';
import { STATUS } from 'src/app/core/constants/global';
import { TypeDocumentsService } from 'src/app/core/services/typeDocuments/type-documents.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-documents-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, MatSelectModule, MatInputModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  templateUrl: './documents-modal.component.html',
  styleUrl: './documents-modal.component.css'
})
export class DocumentsModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  typeDocument: any = [];
  error_messages={
    'document_type_id':[
			{type: 'required', message: 'Campo es requerido'},
		],
		'descriptions':[
      {type: 'required', message: 'Campo es requerido'},
		],
		'file':[
			{type: 'required', message: 'Archivo es requerido'},
		],
    'car_id':[
			{type: 'required', message: 'Auto es requerido'},
		],
	}

  sexOptions = ['male', 'female'];
  todayStr = new Date().toISOString().slice(0, 10); 
  status = [STATUS.ACTIVE, STATUS.INACTIVE]; 


  maxSizeBytes = 25 * 1024 * 1024; // 25MB
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileIcon: string = 'insert_drive_file';
  fileExt: string = '';

  carFilterControl = new FormControl('');
  cars: any[] = [];
  filteredCars: any[] = [];
  carsDropdownOpen = false;
  selectedCarLabel = '';
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<DocumentsModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _ClientsService: ClientsService,
    private _TypeDocumentsService: TypeDocumentsService,
    private _AuthService: AuthService,
    private _CarsService: CarsService
  ) {}

  ngOnInit(): void {
    this.init();
    this.getTypeDocument();

     this.carFilterControl.valueChanges.subscribe(term => {
        const value = (term || '').toString().toLowerCase().trim();

        this.filteredCars = this.cars.filter(car => {
          const text = `${car.make} ${car.model} ${car.plate || ''}`.toLowerCase();
          return text.includes(value);
        });
      });

    // carga los autos
    this.getCars();
  }


  toggleCarsDropdown() {
  this.carsDropdownOpen = !this.carsDropdownOpen;
  if (this.carsDropdownOpen) {
    // limpiar filtro al abrir
    this.carFilterControl.setValue('');
    this.filteredCars = [...this.cars];
  }
}

closeCarsDropdown() {
  this.carsDropdownOpen = false;
}

selectCar(car: any) {
  this.selectedCarLabel = `${car.make} - ${car.model}`;
  this.saveForm.patchValue({ car_id: car.id }); // ajusta si tu form se llama diferente
  this.closeCarsDropdown();
}

  init() {
    this.saveForm = this._FormBuilder.group({
      document_type_id: new FormControl (this.data.row === null ? '' : this.data.row.document_type_id,Validators.compose([Validators.required])),
      descriptions: new FormControl (this.data.row === null ? '' : this.data.row.descriptions,Validators.compose([Validators.required])),
      file: new FormControl (this.data.row === null ? '' : this.data.row.file,Validators.compose([Validators.required])),
      id: new FormControl (this.data.row === null ? '' : this.data.row.id,),
      car_id: new FormControl (this.data.row === null ? '' : this.data.row.car_id,),
  	});

  }

  

  getCars() {
    this._CarsService.getCars('',500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.cars = response.items.map((r: any) => ({ ...r }));
          // importante: inicializar la lista filtrada
          this.filteredCars = [...this.cars];
          }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }


  getTypeDocument() {
    this._TypeDocumentsService.getTypeDocument(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.typeDocument = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

  async save() {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched(); 
      return;
    }
    this.loading = true;
    try {
      const formData = new FormData();
      let carArray = [this.saveForm.value.car_id]
      formData.append('car_id', this.saveForm.value.car_id);
      formData.append('document_type_id', this.saveForm.value.document_type_id);
      formData.append('descriptions', this.saveForm.value.descriptions);
      formData.append('file', this.saveForm.value.file);
      if (this.data.row !== null) {
        // formData.append('id', this.saveForm.value.id);
      }
      const token = this._AuthService.tokenValue;
      const response = await fetch(`https://automotriz-api.naatteam.com/document/${this.saveForm.value.id}`, {
        method: this.data.row == null ? 'POST' : 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        this.loading = false;
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      this.loading = false;
      this.close(true);
    } catch (err: any) {
      this.loading = false;
      this._ToastrService.error(err.message, 'Error');
    }
    
  }

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }

  get attachmentCtrl() {
    return this.saveForm.get('file');
  }

  get isImage() {
    return !!this.selectedFile?.type?.startsWith('image/');
  }
  get isVideo() {
    return !!this.selectedFile?.type?.startsWith('video/');
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;

    this.removePreviewOnly();
    this.attachmentCtrl?.setErrors(null);

    if (!file) {
      this.attachmentCtrl?.setValue(null);
      return;
    }

    if (!this.isAllowedType(file)) {
      this.attachmentCtrl?.setErrors({ invalidType: true });
      this.attachmentCtrl?.markAsTouched();
      return;
    }

    if (file.size > this.maxSizeBytes) {
      this.attachmentCtrl?.setErrors({ maxSize: true });
      this.attachmentCtrl?.markAsTouched();
      return;
    }

    this.selectedFile = file;
    this.attachmentCtrl?.setValue(file);
    this.attachmentCtrl?.markAsDirty();

    this.fileIcon = this.resolveIcon(file);
    this.fileExt = this.getExt(file.name);

    if (this.isImage || this.isVideo) {
      this.previewUrl = URL.createObjectURL(file);
    }
  }

  removeFile() {
    this.removePreviewOnly();
    this.selectedFile = null;
    this.fileIcon = 'insert_drive_file';
    this.fileExt = '';
    this.attachmentCtrl?.setValue(null);
    this.attachmentCtrl?.markAsDirty();

    const input = document.getElementById('attachmentInput') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  private removePreviewOnly() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  private isAllowedType(file: File): boolean {
    const t = (file.type || '').toLowerCase();
    const ext = this.getExt(file.name);

    const okMime =
      t.startsWith('image/') ||
      t.startsWith('video/') ||
      t === 'application/pdf' ||
      t === 'application/msword' ||
      t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const okExt =
      ['.jpg','.jpeg','.png','.gif','.webp','.svg',
      '.mp4','.mov','.webm','.mkv',
      '.pdf','.doc','.docx'].includes(ext);

    return okMime || okExt;
  }

  private resolveIcon(file: File): string {
    const t = (file.type || '').toLowerCase();
    const ext = this.getExt(file.name);

    if (t.startsWith('image/') || ['.jpg','.jpeg','.png','.gif','.webp','.svg'].includes(ext)) return 'image';
    if (t.startsWith('video/') || ['.mp4','.mov','.webm','.mkv'].includes(ext)) return 'movie';
    if (t === 'application/pdf' || ext === '.pdf') return 'picture_as_pdf';
    if (t === 'application/msword' || t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.doc' || ext === '.docx') return 'description';
    return 'insert_drive_file';
  }

  private getExt(name: string): string {
    const i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i).toLowerCase() : '';
  }
}
