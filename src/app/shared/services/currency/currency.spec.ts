import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { CurrencyCode, CurrencyService } from './currency';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadRates', () => {
    it('pide las tasas a la API y las guarda, con USD siempre a 1', () => {
      expect(service.loading()).toBe(false);

      service.loadRates();
      expect(service.loading()).toBe(true);
      expect(service.errorMessage()).toBeNull();

      const req = httpMock.expectOne((request) => request.url === environment.currencyFreaksApiUrl);
      expect(req.request.params.get('apikey')).toBe(environment.currencyFreaksApiKey);
      expect(req.request.params.get('symbols')).toBe('EUR,USD,JPY');

      req.flush({ date: '2026-07-21', base: 'USD', rates: { EUR: '0.92', JPY: '149.5' } });

      expect(service.loading()).toBe(false);
      expect(service.rates()).toEqual({ USD: 1, EUR: 0.92, JPY: 149.5 });
    });

    it('guarda un mensaje de error si la petición falla', () => {
      service.loadRates();

      const req = httpMock.expectOne(() => true);
      req.flush('fallo', { status: 500, statusText: 'Server Error' });

      expect(service.errorMessage()).toBe('No se han podido obtener las tasas de cambio.');
      expect(service.loading()).toBe(false);
      expect(service.rates()).toBeNull();
    });

    it('no lanza una segunda petición mientras la primera está en curso', () => {
      service.loadRates();
      service.loadRates();

      const req = httpMock.expectOne(() => true);
      req.flush({ date: '', base: 'USD', rates: {} });
    });
  });

  describe('convert', () => {
    it('devuelve null si las tasas todavía no se han cargado', () => {
      expect(service.convert(10, 'EUR', 'USD')).toBeNull();
    });

    describe('con tasas cargadas (1 EUR = 0.5 USD, 1 JPY = 2 USD)', () => {
      beforeEach(() => {
        service.loadRates();
        const req = httpMock.expectOne(() => true);
        req.flush({ date: '2026-07-21', base: 'USD', rates: { EUR: '0.5', JPY: '2' } });
      });

      it.each([
        { amount: 10, from: 'EUR' as CurrencyCode, to: 'USD' as CurrencyCode, expected: 20 },
        { amount: 10, from: 'USD' as CurrencyCode, to: 'EUR' as CurrencyCode, expected: 5 },
        { amount: 10, from: 'EUR' as CurrencyCode, to: 'JPY' as CurrencyCode, expected: 40 },
        { amount: 100, from: 'JPY' as CurrencyCode, to: 'EUR' as CurrencyCode, expected: 25 },
      ])('convierte $amount $from -> $to en $expected', ({ amount, from, to, expected }) => {
        expect(service.convert(amount, from, to)).toBeCloseTo(expected);
      });

      it('devuelve el mismo importe cuando origen y destino coinciden', () => {
        expect(service.convert(42, 'EUR', 'EUR')).toBe(42);
      });

      it('devuelve null si se pide una divisa sin tasa cargada', () => {
        expect(service.convert(10, 'EUR', 'GBP' as CurrencyCode)).toBeNull();
      });
    });
  });
});
