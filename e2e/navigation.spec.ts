import { test, expect } from '@playwright/test';

import { mockCurrencyRates, mockProvinceForecast, mockProvinces } from './fixtures/api-mocks';

test.describe('Navegación', () => {
  test.beforeEach(async ({ page }) => {
    await mockCurrencyRates(page);
    await mockProvinces(page);
    await mockProvinceForecast(page);
  });

  test('la raíz redirige a /calculator', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/calculator$/);
  });

  test('el header y el footer persisten al navegar, y el enlace activo lleva aria-current', async ({
    page,
  }) => {
    await page.goto('/calculator');

    const mainNav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(mainNav.getByRole('link', { name: 'Calculator' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByTestId('display')).toBeVisible();

    await mainNav.getByRole('link', { name: 'Weather' }).click();

    await expect(page).toHaveURL(/\/weather$/);
    await expect(mainNav.getByRole('link', { name: 'Weather' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(mainNav.getByRole('link', { name: 'Calculator' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );

    // El header y el footer no forman parte del router-outlet, deben seguir presentes.
    await expect(page.locator('app-header-component')).toBeVisible();
    await expect(page.locator('app-footer-component')).toBeVisible();
  });
});
