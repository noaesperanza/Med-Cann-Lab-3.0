import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
    test('Login Profissional com Sucesso', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'phpg69@gmail.com');
        await page.fill('input[type="password"]', 'p6p7p8P9!');
        await page.click('button[type="submit"]');

        // Espera redirecionamento para dashboard
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.getByText('Ricardo Test')).toBeVisible();
    });

    test('Login Paciente com Sucesso', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'patient.test@medcannlab.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Espera redirecionamento para área do paciente
        await expect(page).toHaveURL(/.*paciente/);
    });

    test('Login Falha com Senha Errada', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'phpg69@gmail.com');
        await page.fill('input[type="password"]', 'senhaerrada');
        await page.click('button[type="submit"]');

        // Verifica mensagem de erro (ajuste o seletor conforme sua UI real)
        await expect(page.getByText('Invalid login credentials')).toBeVisible();
    });
});
