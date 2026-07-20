import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header-component/header-component';
import { FooterComponent } from "./shared/footer-component/footer-component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  host: {
    class: 'flex min-h-dvh flex-col',
  },
})
export class App {
  protected readonly title = signal('VUE');
}
