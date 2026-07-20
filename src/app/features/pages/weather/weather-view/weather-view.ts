import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { WeatherService } from '../../../../shared/services/weather/weather';
import { getSkyIconPath } from '../../../../shared/utils/sky-icon';

type WeatherMode = 'provincia' | 'nacional';

@Component({
  selector: 'app-weather-view',
  imports: [NgOptimizedImage],
  templateUrl: './weather-view.html',
  styleUrl: './weather-view.css',
})
export class WeatherView implements OnInit {
  private readonly weatherService = inject(WeatherService);

  protected readonly mode = signal<WeatherMode>('provincia');
  protected readonly selectedProvinceCode = signal('33');

  protected readonly provinces = this.weatherService.provinces;
  protected readonly provinceForecast = this.weatherService.provinceForecast;
  protected readonly nationalForecast = this.weatherService.nationalForecast;
  protected readonly loading = this.weatherService.loading;
  protected readonly errorMessage = this.weatherService.errorMessage;

  protected readonly getSkyIconPath = getSkyIconPath;

  ngOnInit(): void {
    this.weatherService.loadProvinces();
    this.weatherService.loadProvinceForecast(this.selectedProvinceCode());
  }

  protected onModeChange(mode: WeatherMode): void {
    this.mode.set(mode);
    if (mode === 'nacional') {
      this.weatherService.loadNationalForecast();
    }
  }

  protected onProvinceChange(codProv: string): void {
    this.selectedProvinceCode.set(codProv);
    this.weatherService.loadProvinceForecast(codProv);
  }
}
