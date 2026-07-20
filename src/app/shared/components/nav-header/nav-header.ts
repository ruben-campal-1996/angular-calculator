import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SITE_NAV_LINK_ACTIVE_CLASS, SITE_NAV_LINK_CLASSES } from '../../utils/site-nav-link-classes';

@Component({
  selector: 'app-nav-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-header.html',
})
export class NavHeader {
  protected readonly linkClasses = SITE_NAV_LINK_CLASSES;
  protected readonly activeClass = SITE_NAV_LINK_ACTIVE_CLASS;
}
