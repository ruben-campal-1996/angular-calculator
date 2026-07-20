import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../../environments/environment';

export type CurrencyCode = 'EUR' | 'USD' | 'JPY';

interface CurrencyFreaksResponse {
  date: string;
  base: string;
  rates: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly http = inject(HttpClient);

  private readonly ratesState = signal<Record<string, number> | null>(null);
  readonly rates = this.ratesState.asReadonly();
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  loadRates(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.http
      .get<CurrencyFreaksResponse>(environment.currencyFreaksApiUrl, {
        params: {
          apikey: environment.currencyFreaksApiKey,
          symbols: 'EUR,USD,JPY',
        },
      })
      .subscribe({
        next: (response) => {
          const parsedRates: Record<string, number> = { USD: 1 };
          for (const [code, value] of Object.entries(response.rates)) {
            parsedRates[code] = Number(value);
          }
          this.ratesState.set(parsedRates);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se han podido obtener las tasas de cambio.');
          this.loading.set(false);
        },
      });
  }

  convert(amount: number, from: CurrencyCode, to: CurrencyCode): number | null {
    const rates = this.ratesState();
    if (!rates || !rates[from] || !rates[to]) {
      return null;
    }

    if (from === to) {
      return amount;
    }

    const amountInUsd = amount / rates[from];
    return amountInUsd * rates[to];
  }
}
