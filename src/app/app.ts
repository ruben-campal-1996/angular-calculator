import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header-component/header-component';
import { HomeView } from './features/pages/home-page/home-view/home-view';
import { FooterComponent } from "./shared/footer-component/footer-component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomeView, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('VUE');
}
