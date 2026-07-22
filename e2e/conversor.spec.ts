import { test, expect } from '@playwright/test';

import { mockCurrencyRates, mockCurrencyRatesError } from './fixtures/api-mocks';

test.describe('Conversor de divisas', () => {
  test('convierte con las divisas por defecto (1 EUR -> USD)', async ({ page }) => {
    await mockCurrencyRates(page);
    await page.goto('/calculator');

    await expect(page.getByTestId('conversion-result')).toHaveText('1 EUR = 2.00 USD');
  });

  test('actualiza el resultado al cambiar la cantidad', async ({ page }) => {
    await mockCurrencyRates(page);
    await page.goto('/calculator');

    await page.locator('#amount').fill('10');

    await expect(page.getByTestId('conversion-result')).toHaveText('10 EUR = 20.00 USD');
  });

  test('intercambia las divisas de origen y destino', async ({ page }) => {
    await mockCurrencyRates(page);
    await page.goto('/calculator');

    await page.getByRole('button', { name: 'Intercambiar divisas' }).click();

    await expect(page.locator('#from-currency')).toHaveValue('USD');
    await expect(page.locator('#to-currency')).toHaveValue('EUR');
  });

  test('muestra un mensaje de error si la API de tasas falla', async ({ page }) => {
    await mockCurrencyRatesError(page);
    await page.goto('/calculator');

    await expect(page.getByRole('alert')).toHaveText(
      'No se han podido obtener las tasas de cambio.',
    );
    await expect(page.getByTestId('conversion-result')).toHaveText('—');
  });
});
