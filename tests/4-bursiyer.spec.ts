import { test, expect } from '@playwright/test';

test.describe('4. Bursiyer (Aday) ve Referans (Değerlendirici)', () => {
  // test.use({ storageState: 'playwright/.auth/bursiyer.json' });

  test('T4.1 Başvuru Formu', async ({ page }) => {
    // await page.goto('/dashboard/applications/new');
    // await page.fill('input[name="tcNo"]', '12345678901');
    // await page.click('button:has-text("Kaydet ve İlerle")');
  });

  test('T4.2 Referans İsteği (Davet)', async ({ page }) => {
    // await page.goto('/dashboard/applications/my-application');
    // await page.click('text=Referans Ekle');
    // await page.fill('input[name="refEmail"]', 'muhtar@example.com');
  });

  test('T4.3 Referans Onayı', async ({ page }) => {
    // Referans yetkisiyle girildiğini varsayalım
    // test.use({ storageState: 'playwright/.auth/reference.json' });
    // await page.goto('/dashboard/invitations');
    // await page.click('button:has-text("Onaylıyorum (Gerçektir)")');
  });

  test('T4.4 Bildirim Zili Testi', async ({ page }) => {
    // await page.goto('/dashboard');
    // Bildirim ikonunda badge sayısının 1 arttığını doğrula
    // await expect(page.locator('.notification-badge')).toHaveText('1');
  });
});
