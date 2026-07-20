import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'calculator', pathMatch: 'full' },
  {
    path: 'calculator',
    loadComponent: () =>
      import('./features/pages/home-page/home-view/home-view').then((m) => m.HomeView),
  },
  {
    path: 'weather',
    loadComponent: () =>
      import('./features/pages/weather/weather-view/weather-view').then((m) => m.WeatherView),
  },
];
