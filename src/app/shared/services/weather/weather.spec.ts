import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { WeatherService } from './weather';

function ciudad(overrides: Partial<{ name: string; skyId: string; skyDescription: string; max: string; min: string }> = {}) {
  return {
    name: overrides.name ?? 'Oviedo',
    stateSky: { id: overrides.skyId ?? '13', description: overrides.skyDescription ?? 'Intervalos nubosos' },
    temperatures: { max: overrides.max ?? '22', min: overrides.min ?? '11' },
  };
}

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadProvinces', () => {
    it('pide la lista de provincias, la mapea y la ordena alfabéticamente', () => {
      service.loadProvinces();

      const req = httpMock.expectOne(environment.currencyElTiempoNetListaProvincias);
      req.flush({
        provincias: [
          { CODPROV: '50', NOMBRE_PROVINCIA: 'Zaragoza' },
          { CODPROV: '33', NOMBRE_PROVINCIA: 'Asturias' },
          { CODPROV: '28', NOMBRE_PROVINCIA: 'Madrid' },
        ],
      });

      expect(service.provinces()).toEqual([
        { codProv: '33', name: 'Asturias' },
        { codProv: '28', name: 'Madrid' },
        { codProv: '50', name: 'Zaragoza' },
      ]);
    });

    it('guarda un mensaje de error si la petición falla', () => {
      service.loadProvinces();

      const req = httpMock.expectOne(() => true);
      req.flush('fallo', { status: 500, statusText: 'Server Error' });

      expect(service.errorMessage()).toBe('No se ha podido obtener la lista de provincias.');
      expect(service.provinces()).toEqual([]);
    });

    it('no repite la petición si las provincias ya estaban cargadas', () => {
      service.loadProvinces();
      httpMock
        .expectOne(() => true)
        .flush({ provincias: [{ CODPROV: '33', NOMBRE_PROVINCIA: 'Asturias' }] });

      service.loadProvinces();

      httpMock.expectNone(environment.currencyElTiempoNetListaProvincias);
    });
  });

  describe('loadProvinceForecast', () => {
    it('sustituye [CODPROV] en la URL y corrige el mojibake de los textos', () => {
      service.loadProvinceForecast('33');

      expect(service.loading()).toBe(true);

      const expectedUrl = environment.currencyElTiempoNetTiempoProvincia.replace('[CODPROV]', '33');
      const req = httpMock.expectOne(expectedUrl);

      req.flush({
        today: { p: 'mantendrÃ¡ la estabilidad' },
        tomorrow: { p: 'lluvia prÃ³xima' },
        provincia: { NOMBRE_PROVINCIA: 'Asturias' },
        ciudades: [ciudad({ name: 'Avilés', skyId: '26', skyDescription: 'Lluvia', max: '18', min: '10' })],
      });

      expect(service.loading()).toBe(false);
      expect(service.provinceForecast()).toEqual({
        provinceName: 'Asturias',
        today: 'mantendrá la estabilidad',
        tomorrow: 'lluvia próxima',
        cities: [
          {
            name: 'Avilés',
            skyDescription: 'Lluvia',
            skyId: '26',
            temperatureMax: '18',
            temperatureMin: '10',
          },
        ],
      });
    });

    it('guarda un mensaje de error si la petición falla', () => {
      service.loadProvinceForecast('33');

      const req = httpMock.expectOne(() => true);
      req.flush('fallo', { status: 500, statusText: 'Server Error' });

      expect(service.errorMessage()).toBe('No se ha podido obtener el tiempo de la provincia.');
      expect(service.loading()).toBe(false);
    });
  });

  describe('loadNationalForecast', () => {
    it('corrige el mojibake de cada párrafo y mapea las ciudades', () => {
      service.loadNationalForecast();

      const req = httpMock.expectOne(environment.currencyElTiempoNetNacional);
      req.flush({
        elaborado: '2026-07-21T08:00:00',
        descripcion_prediccion: { p: ['AÃ±o estable', 'sin cambios'] },
        ciudades: [ciudad({ name: 'Madrid' }), ciudad({ name: 'Barcelona' })],
      });

      const forecast = service.nationalForecast();
      expect(forecast?.elaborado).toBe('2026-07-21T08:00:00');
      expect(forecast?.paragraphs).toEqual(['Año estable', 'sin cambios']);
      expect(forecast?.cities.map((city) => city.name)).toEqual(['Madrid', 'Barcelona']);
    });

    it('guarda un mensaje de error si la petición falla', () => {
      service.loadNationalForecast();

      const req = httpMock.expectOne(() => true);
      req.flush('fallo', { status: 500, statusText: 'Server Error' });

      expect(service.errorMessage()).toBe('No se ha podido obtener el tiempo nacional.');
      expect(service.loading()).toBe(false);
    });

    it('no repite la petición si ya había una previsión nacional cargada', () => {
      service.loadNationalForecast();
      httpMock.expectOne(() => true).flush({
        elaborado: '',
        descripcion_prediccion: { p: [] },
        ciudades: [],
      });

      service.loadNationalForecast();

      httpMock.expectNone(environment.currencyElTiempoNetNacional);
    });
  });
});
