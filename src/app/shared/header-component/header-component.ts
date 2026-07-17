import { Component } from '@angular/core';
import { LogoHeader } from '../components/logo-header/logo-header';
import { NavHeader } from '../components/nav-header/nav-header';

@Component({
  selector: 'app-header-component',
  imports: [LogoHeader, NavHeader],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {}
