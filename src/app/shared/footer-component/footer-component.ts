import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoHeader } from '../components/logo-header/logo-header';
import { SITE_NAV_LINK_ACTIVE_CLASS, SITE_NAV_LINK_CLASSES } from '../utils/site-nav-link-classes';

@Component({
  selector: 'app-footer-component',
  imports: [LogoHeader, RouterLink, RouterLinkActive],
  templateUrl: './footer-component.html',
})
export class FooterComponent {
  protected readonly linkClasses = SITE_NAV_LINK_CLASSES;
  protected readonly activeClass = SITE_NAV_LINK_ACTIVE_CLASS;
}
