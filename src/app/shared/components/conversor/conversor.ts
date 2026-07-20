import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { CurrencyCode, CurrencyService } from '../../services/currency/currency';

@Component({
  selector: 'app-conversor',
  imports: [DecimalPipe],
  templateUrl: './conversor.html',
})
export class Conversor implements OnInit {
  private readonly currencyService = inject(CurrencyService);

  protected readonly currencies: CurrencyCode[] = ['EUR', 'USD', 'JPY'];

  protected readonly amount = signal(1);
  protected readonly fromCurrency = signal<CurrencyCode>('EUR');
  protected readonly toCurrency = signal<CurrencyCode>('USD');

  protected readonly loading = this.currencyService.loading;
  protected readonly errorMessage = this.currencyService.errorMessage;

  protected readonly convertedAmount = computed(() =>
    this.currencyService.convert(this.amount(), this.fromCurrency(), this.toCurrency()),
  );

  ngOnInit(): void {
    this.currencyService.loadRates();
  }

  protected onAmountChange(rawValue: string): void {
    const parsedValue = Number(rawValue);
    this.amount.set(Number.isFinite(parsedValue) ? parsedValue : 0);
  }

  protected onFromCurrencyChange(rawValue: string): void {
    this.fromCurrency.set(rawValue as CurrencyCode);
  }

  protected onToCurrencyChange(rawValue: string): void {
    this.toCurrency.set(rawValue as CurrencyCode);
  }

  protected swapCurrencies(): void {
    const from = this.fromCurrency();
    const to = this.toCurrency();
    this.fromCurrency.set(to);
    this.toCurrency.set(from);
  }
}
