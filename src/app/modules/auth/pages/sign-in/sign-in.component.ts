import { NgClass, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { LoginUser, UserResponse, UserSet } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({  
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  imports: [FormsModule, ReactiveFormsModule, RouterLink, AngularSvgIconModule, NgIf, ButtonComponent, NgClass],
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  loading: boolean= false;

  constructor(
    private readonly _formBuilder: FormBuilder, 
    private readonly _router: Router,
    private _ToastrService: ToastrService,
    private _AuthService: AuthService,
  ) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit() {
    this.submitted = true;
    const { email, password } = this.form.value;

    if (this.form.invalid) {

      return;
    }

    this.loading = true;
    const body: LoginUser = this.form.getRawValue();
    this._AuthService.loginUser(body).subscribe({
      next: async (response: UserResponse) => {
        if(response) {
          type UserPayload = Pick<UserSet, 'full_name' | 'role' | 'scope_list' | 'user_id'>;
          const { full_name, role, scope_list, user_id } = response;
          const payload: UserPayload = { full_name, role, scope_list, user_id };
          this._AuthService.setSession(response.access_token, payload);
          this._router.navigate(['/layout']);
          this._ToastrService.success('Bienvenido', 'Exito');
        }
        this.loading = false;
      },
      error: (err) => {
        this._ToastrService.error(err.error, 'Error');
        this.loading = false;
      },
    })
  }
}
