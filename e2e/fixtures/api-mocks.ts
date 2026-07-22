import type { Page } from '@playwright/test';

interface CityFixture {
  name: string;
  stateSky: { id: string; description: string };
  temperatures: { max: string; min: string };
}

function cityFixture(
  name: string,
  skyId: string,
  description: string,
  min: string,
  max: string,
): CityFixture {
  return { name, stateSky: { id: skyId, description }, temperatures: { max, min } };
}

export async function mockCurrencyRates(page: Page): Promise<void> {
  await page.route('**/v2.0/rates/latest**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        date: '2026-07-22 00:00:00+00',
        base: 'USD',
        rates: { EUR: '0.5', JPY: '2' },
      }),
    });
  });
}

export async function mockCurrencyRatesError(page: Page): Promise<void> {
  await page.route('**/v2.0/rates/latest**', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });
}

export async function mockProvinces(page: Page): Promise<void> {
  await page.route('**/json/v3/provincias', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        provincias: [
          { CODPROV: '33', NOMBRE_PROVINCIA: 'Asturias' },
          { CODPROV: '28', NOMBRE_PROVINCIA: 'Madrid' },
        ],
      }),
    });
  });
}

const PROVINCE_FORECASTS: Record<string, unknown> = {
  '33': {
    today: { p: 'Cielo despejado en Asturias.' },
    tomorrow: { p: 'Intervalos nubosos.' },
    provincia: { NOMBRE_PROVINCIA: 'Asturias' },
    ciudades: [cityFixture('Oviedo', '11', 'Despejado', '12', '22')],
  },
  '28': {
    today: { p: 'Calor intenso en Madrid.' },
    tomorrow: { p: 'Tormentas por la tarde.' },
    provincia: { NOMBRE_PROVINCIA: 'Madrid' },
    ciudades: [cityFixture('Alcalá de Henares', '51', 'Tormenta', '20', '38')],
  },
};

export async function mockProvinceForecast(page: Page): Promise<void> {
  await page.route('**/json/v3/provincias/*', async (route) => {
    const codProv = new URL(route.request().url()).pathname.split('/').pop() ?? '33';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(PROVINCE_FORECASTS[codProv] ?? PROVINCE_FORECASTS['33']),
    });
  });
}

export async function mockNationalForecast(page: Page): Promise<void> {
  await page.route('**/json/v3/general', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        elaborado: '2026-07-22 08:00',
        descripcion_prediccion: { p: ['Estabilidad en gran parte del territorio.'] },
        ciudades: [cityFixture('Madrid', '11', 'Despejado', '18', '32')],
      }),
    });
  });
}
