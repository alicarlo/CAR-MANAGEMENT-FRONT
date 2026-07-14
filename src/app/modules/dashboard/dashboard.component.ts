import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    imports: [RouterOutlet]
})
export class DashboardComponent implements OnInit {
  constructor(
    private _Router: Router,
    private _PermissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    const currentUrl = this._Router.url.replace(/\/+$/, '');
    if (currentUrl === '/layout/dashboard') {
      this._Router.navigateByUrl(this._PermissionsService.getFirstAllowedDashboardRoute());
    }
  }
}
