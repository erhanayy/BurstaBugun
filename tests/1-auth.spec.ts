import { test, expect } from '@playwright/test';

test.describe('1. Yetkilendirme ve Sözleşmeler', () => {
  test('T1.1 Kayıt (Register) ve OTP', async ({ page }) => {
    // Kayıt sayfasına git
    await page.goto('/auth/register');
    // Form elemanlarının varlığını kontrol et
    await expect(page.getByRole('button', { name: /Kayıt Ol|Register/i })).toBeVisible();
    
    /* 
    NOT: Tam uçtan uca test için test veritabanı veya mock OTP kullanılmalıdır.
    await page.fill('input[name="email"]', 'test_bursiyer@example.com');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/OTP/i)).toBeVisible();
    */
  });

  test('T1.2 Oturum Açma (Login)', async ({ page }) => {
    await page.goto('/auth/login');
    // E-posta ve şifre inputlarının geldiğinden emin ol
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('T1.3 Sözleşme Kilidi (Contract Enforcer)', async ({ page }) => {
    /* 
    Örnek Akış:
    1. Yeni sözleşmesi eksik olan bir kullanıcı ile login olunur.
    2. Yönlendirme sonrası ekranda 'Sözleşme' veya 'Onay' metni beklenir.
    */
    await page.goto('/auth/login');
    // Login sonrası
    // await expect(page.getByRole('dialog', { name: /Sözleşme|KVKK/i })).toBeVisible();
  });
});
