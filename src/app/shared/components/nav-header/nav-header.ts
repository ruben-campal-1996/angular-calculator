import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-header.html',
  styleUrl: './nav-header.css',
})
export class NavHeader {}
