import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('renders the sign-in screen', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /sign in to aegis/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
