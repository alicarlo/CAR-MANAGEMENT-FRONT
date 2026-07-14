import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MenuService } from '../../services/menu.service';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [AngularSvgIconModule, NavbarMenuComponent, ProfileMenuComponent, NavbarMobileComponent],
})
export class NavbarComponent implements OnInit {
  constructor(
    private menuService: MenuService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  get currentUserLabel() {
    const user = this.authService.user();
    const fullName = String(user?.full_name ?? '').trim();
    const roleName = String(user?.role?.name ?? '').trim();

    if (fullName && roleName) {
      return `${fullName} - ${roleName}`;
    }

    return fullName || roleName || '';
  }

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }
}
