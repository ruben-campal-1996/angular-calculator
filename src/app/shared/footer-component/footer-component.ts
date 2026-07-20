import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoHeader } from '../components/logo-header/logo-header';

@Component({
  selector: 'app-footer-component',
  imports: [LogoHeader, RouterLink, RouterLinkActive],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css',
})
export class FooterComponent {}
