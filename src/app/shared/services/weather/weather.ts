import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../../environments/environment';

export interface Province {
  codProv: string;
  name: string;
}

export interface CityForecast {
  name: string;
  skyDescription: string;
  skyId: string;
  temperatureMax: string;
  temperatureMin: string;
}

export interface ProvinceForecast {
  provinceName: string;
  today: string;
  tomorrow: string;
  cities: CityForecast[];
}

export interface NationalForecast {
  elaborado: string;
  paragraphs: string[];
}

interface ProvinciasResponse {
  provincias: { CODPROV: string; NOMBRE_PROVINCIA: string }[];
}

interface ProvinciaForecastResponse {
  today: { p: string };
  tomorrow: { p: string };
  provincia: { NOMBRE_PROVINCIA: string };
  ciudades: {
    name: string;
    stateSky: { id: string; description: string };
    temperatures: { max: string; min: string };
  }[];
}

interface NacionalResponse {
  elaborado: string;
  descripcion_prediccion: { p: string[] };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  private readonly provincesState = signal<Province[]>([]);
  readonly provinces = this.provincesState.asReadonly();

  private readonly provinceForecastState = signal<ProvinceForecast | null>(null);
  readonly provinceForecast = this.provinceForecastState.asReadonly();

  private readonly nationalForecastState = signal<NationalForecast | null>(null);
  readonly nationalForecast = this.nationalForecastState.asReadonly();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  loadProvinces(): void {
    if (this.provincesState().length > 0) {
      return;
    }

    this.http.get<ProvinciasResponse>(environment.currencyElTiempoNetListaProvincias).subscribe({
      next: (response) => {
        const provinces = response.provincias
          .map((provincia) => ({ codProv: provincia.CODPROV, name: provincia.NOMBRE_PROVINCIA }))
          .sort((a, b) => a.name.localeCompare(b.name));
        this.provincesState.set(provinces);
      },
      error: () => {
        this.errorMessage.set('No se ha podido obtener la lista de provincias.');
      },
    });
  }

  loadProvinceForecast(codProv: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const url = environment.currencyElTiempoNetTiempoProvincia.replace('[CODPROV]', codProv);

    this.http.get<ProvinciaForecastResponse>(url).subscribe({
      next: (response) => {
        this.provinceForecastState.set({
          provinceName: response.provincia.NOMBRE_PROVINCIA,
          today: response.today.p,
          tomorrow: response.tomorrow.p,
          cities: response.ciudades.map((ciudad) => ({
            name: ciudad.name,
            skyDescription: ciudad.stateSky.description,
            skyId: ciudad.stateSky.id,
            temperatureMax: ciudad.temperatures.max,
            temperatureMin: ciudad.temperatures.min,
          })),
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se ha podido obtener el tiempo de la provincia.');
        this.loading.set(false);
      },
    });
  }

  loadNationalForecast(): void {
    if (this.nationalForecastState()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get<NacionalResponse>(environment.currencyElTiempoNetNacional).subscribe({
      next: (response) => {
        this.nationalForecastState.set({
          elaborado: response.elaborado,
          paragraphs: response.descripcion_prediccion.p,
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se ha podido obtener el tiempo nacional.');
        this.loading.set(false);
      },
    });
  }
}
