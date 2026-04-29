import { test, expect } from '@playwright/test';

test.describe('3. Sponsor (Fon Yönetimi ve Havuz)', () => {
  // test.use({ storageState: 'playwright/.auth/sponsor.json' });

  test('T3.1 Fon Oluşturma', async ({ page }) => {
    // await page.goto('/dashboard/funds');
    // await page.click('text=Yeni Fon');
    // await page.fill('input[name="fundName"]', 'Eğitim Destek Fonu');
    // await page.fill('input[name="capacity"]', '5');
    // await page.fill('input[name="monthlyLimit"]', '1000');
    // await page.click('button[type="submit"]');
  });

  test('T3.2 Davet Gönderme', async ({ page }) => {
    // await page.goto('/dashboard/funds/1'); // Örnek fon ID
    // await page.click('text=Yeni Davet Gönder');
  });

  test('T3.3 Havuz Kontrolü (Bursiyer Havuzu)', async ({ page }) => {
    // await page.goto('/dashboard/pool');
    // await expect(page.locator('.bursiyer-card')).toHaveCountGreaterThan(0);
  });

  test('T3.4 Karar ve Atama (Limit Engelleyicisi)', async ({ page }) => {
    /* 
    Öğrenciyi seçerken aylık limiti aşma durumu simüle edilir.
    */
    // await page.goto('/dashboard/pool');
    // await page.click('button:has-text("Fona Ekle")');
    // Limit uyarısı AlertTriangle'ın çıktığını doğrula
    // await expect(page.locator('.alert-triangle')).toBeVisible();
  });
});
