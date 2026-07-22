import { test, expect } from '@playwright/test';

import { mockNationalForecast, mockProvinceForecast, mockProvinces } from './fixtures/api-mocks';

test.describe('El tiempo', () => {
  test.beforeEach(async ({ page }) => {
    await mockProvinces(page);
    await mockProvinceForecast(page);
    await mockNationalForecast(page);
    await page.goto('/weather');
  });

  test('muestra la previsión de Asturias por defecto', async ({ page }) => {
    await expect(page.getByText('Cielo despejado en Asturias.')).toBeVisible();

    const cityList = page.getByTestId('city-list');
    await expect(cityList.getByText('Oviedo')).toBeVisible();
    await expect(cityList.getByRole('img', { name: 'Despejado' })).toBeVisible();
  });

  test('cambia a la previsión nacional', async ({ page }) => {
    await page.getByRole('button', { name: 'Nacional' }).click();

    await expect(page.getByText('Estabilidad en gran parte del territorio.')).toBeVisible();
    await expect(page.getByTestId('city-list').getByText('Madrid')).toBeVisible();
  });

  test('cambia de provincia y recarga la previsión', async ({ page }) => {
    await expect(page.getByText('Cielo despejado en Asturias.')).toBeVisible();

    await page.locator('#province-select').selectOption('28');

    await expect(page.getByText('Calor intenso en Madrid.')).toBeVisible();
    await expect(page.getByTestId('city-list').getByText('Alcalá de Henares')).toBeVisible();
  });
});
