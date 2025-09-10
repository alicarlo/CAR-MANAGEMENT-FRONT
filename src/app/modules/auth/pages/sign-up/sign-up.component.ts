import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RegisterUser } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, AngularSvgIconModule, ButtonComponent],
})
export class SignUpComponent implements OnInit {
  saveForm! : FormGroup;
  error_messages = {
		'full_name':[
				{type: 'required', message: 'Nombre completo es requerido'},
		],
		'email':[
			{type: 'required', message: 'Correo es requerido'},
		],
		'password':[
			{type: 'required', message: 'Contrasena es requerido'},
		]
	}
  loading: boolean = false;
  constructor(
     private _FormBuilder: FormBuilder,
     private _AuthService: AuthService,
     private _ToastrService: ToastrService,
     private _Location: Location
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.saveForm = this._FormBuilder.group({
      full_name:  new FormControl ('',Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
			email:  new FormControl ('',Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(20)])),
      password:  new FormControl ('',Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(20)])),
      address_street_1:  new FormControl (''),
      address_street_2: new FormControl (''),
      address_state: new FormControl (''),
      address_city: new FormControl (''),
      address_zip: new FormControl (''),
      address_country: new FormControl (''),
  	});
  }
  createUser() {
    if (this.saveForm.invalid) {
      return;
    }

    this.loading = true;
    const body: RegisterUser = this.saveForm.getRawValue();
    console.log(body)
    this._AuthService.registerUser(body).subscribe({
        next: async (response: any) => {
          if(response) {
            this._ToastrService.success('Registro exitoso', 'Exito');
            this.loading = false;
            this._Location.back();  
            return;
          }
          this.loading = false;
        },
        error: (err) => {
          let error = err[0].msg ? err[0].msg : err;
          this._ToastrService.error(error, 'Error');
          this.loading = false;
        },
      })
  }
}
