import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyCode, CurrencyService } from '../../services/currency/currency';
import { Conversor } from './conversor';

/**
 * 1 EUR = 0.5 USD, 1 JPY = 2 USD (base USD), para que las conversiones
 * esperadas en los tests sean fáciles de calcular a mano.
 */
class FakeCurrencyService {
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly loadRates = vi.fn();
  // Signal (no una propiedad plana): convertedAmount() es un computed() que
  // solo vuelve a evaluarse cuando una signal leída dentro de convert() cambia.
  readonly ratesAvailable = signal(true);

  private readonly usdRates: Record<CurrencyCode, number> = { EUR: 0.5, USD: 1, JPY: 2 };

  convert(amount: number, from: CurrencyCode, to: CurrencyCode): number | null {
    if (!this.ratesAvailable()) {
      return null;
    }
    if (from === to) {
      return amount;
    }
    return (amount / this.usdRates[from]) * this.usdRates[to];
  }
}

describe('Conversor', () => {
  let component: Conversor;
  let fixture: ComponentFixture<Conversor>;
  let fakeCurrencyService: FakeCurrencyService;

  beforeEach(async () => {
    fakeCurrencyService = new FakeCurrencyService();

    await TestBed.configureTestingModule({
      imports: [Conversor],
      providers: [{ provide: CurrencyService, useValue: fakeCurrencyService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Conversor);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function getSelect(id: string): HTMLSelectElement {
    return fixture.nativeElement.querySelector(`#${id}`);
  }

  function getInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#amount');
  }

  function getResultText(): string {
    return fixture.nativeElement
      .querySelector('[role="status"][aria-live="polite"]')
      .textContent.trim();
  }

  function selectValue(select: HTMLSelectElement, value: string): void {
    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function setAmount(raw: string): void {
    const input = getInput();
    input.value = raw;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pide las tasas de cambio al iniciar', () => {
    expect(fakeCurrencyService.loadRates).toHaveBeenCalledTimes(1);
  });

  it('muestra EUR como origen y USD como destino por defecto', () => {
    expect(getSelect('from-currency').value).toBe('EUR');
    expect(getSelect('to-currency').value).toBe('USD');
  });

  it('el resultado por defecto convierte 1 EUR a USD', () => {
    expect(getResultText()).toBe('1 EUR = 2.00 USD');
  });

  it('cambia la divisa de origen y destino al elegir en los desplegables', () => {
    selectValue(getSelect('from-currency'), 'JPY');
    selectValue(getSelect('to-currency'), 'EUR');

    expect(getSelect('from-currency').value).toBe('JPY');
    expect(getSelect('to-currency').value).toBe('EUR');
  });

  it('intercambia origen y destino al pulsar el botón de intercambio', () => {
    const swapButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[aria-label="Intercambiar divisas"]',
    );

    swapButton.click();
    fixture.detectChanges();

    expect(getSelect('from-currency').value).toBe('USD');
    expect(getSelect('to-currency').value).toBe('EUR');
  });

  describe('cantidad introducida (conversión por defecto EUR -> USD, x2)', () => {
    it.each([
      { raw: '5', expected: '5 EUR = 10.00 USD' },
      { raw: '3.5', expected: '3.5 EUR = 7.00 USD' },
      { raw: '-10', expected: '-10 EUR = -20.00 USD' },
      { raw: 'abc', expected: '0 EUR = 0.00 USD' },
      { raw: '', expected: '0 EUR = 0.00 USD' },
    ])('interpreta "$raw" y muestra "$expected"', ({ raw, expected }) => {
      setAmount(raw);

      expect(getResultText()).toBe(expected);
    });
  });

  it('muestra un guion cuando el servicio no puede convertir', () => {
    fakeCurrencyService.ratesAvailable.set(false);
    fixture.detectChanges();

    expect(getResultText()).toBe('—');
  });

  it('muestra el mensaje de carga mientras se piden las tasas', () => {
    fakeCurrencyService.loading.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cargando tasas de cambio...');
  });

  it('muestra el mensaje de error del servicio', () => {
    fakeCurrencyService.errorMessage.set('No se han podido obtener las tasas de cambio.');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert.textContent.trim()).toBe('No se han podido obtener las tasas de cambio.');
  });
});
