import { test, expect } from '@playwright/test';

import { mockCurrencyRates } from './fixtures/api-mocks';

test.describe('Calculadora', () => {
  test.beforeEach(async ({ page }) => {
    // La vista /calculator también renderiza el Conversor, que pide tasas al iniciar.
    await mockCurrencyRates(page);
    await page.goto('/calculator');
  });

  test('muestra 0 en la pantalla al arrancar', async ({ page }) => {
    await expect(page.getByTestId('display')).toHaveText('0');
  });

  test('realiza las operaciones básicas', async ({ page }) => {
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: 'Sumar', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: 'Igual', exact: true }).click();

    await expect(page.getByTestId('display')).toHaveText('5');
  });

  test('encadena operadores resolviendo primero el pendiente (5 + 3 × 2 = 16)', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: 'Sumar', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: 'Multiplicar', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: 'Igual', exact: true }).click();

    await expect(page.getByTestId('display')).toHaveText('16');
  });

  test('solo permite un punto decimal', async ({ page }) => {
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: 'Coma decimal', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: 'Coma decimal', exact: true }).click();
    await page.getByRole('button', { name: '5', exact: true }).click();

    await expect(page.getByTestId('display')).toHaveText('1.25');
  });

  test('división entre cero muestra Error y bloquea las teclas salvo CE', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: 'Dividir', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.getByRole('button', { name: 'Igual', exact: true }).click();

    const display = page.getByTestId('display');
    await expect(display).toHaveText('Error');

    await page.getByRole('button', { name: 'Sumar', exact: true }).click();
    await expect(display).toHaveText('Error');

    await page.getByRole('button', { name: 'CE', exact: true }).click();
    await expect(display).toHaveText('0');
  });

  test('memoria: M+ guarda, MR recupera y MC borra', async ({ page }) => {
    const mrButton = page.getByRole('button', { name: 'Recuperar memoria' });
    const mcButton = page.getByRole('button', { name: 'Borrar memoria' });
    const memoryBadge = page.getByTestId('memory-badge');

    await expect(mrButton).toBeDisabled();
    await expect(mcButton).toBeDisabled();
    await expect(memoryBadge).toHaveCount(0);

    await page.getByRole('button', { name: '7', exact: true }).click();
    await page.getByRole('button', { name: 'Sumar a memoria' }).click();

    await expect(memoryBadge).toHaveText('M: 7');
    await expect(mrButton).toBeEnabled();
    await expect(mcButton).toBeEnabled();

    await page.getByRole('button', { name: 'CE', exact: true }).click();
    await mrButton.click();
    await expect(page.getByTestId('display')).toHaveText('7');

    await mcButton.click();
    await expect(memoryBadge).toHaveCount(0);
    await expect(mrButton).toBeDisabled();
  });
});
