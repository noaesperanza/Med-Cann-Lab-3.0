import { test, expect } from '@playwright/test';

test.describe('Segurança e RLS', () => {
    test('Médico deve acessar lista de pacientes', async ({ page }) => {
        // Login Médico
        await page.goto('/login');
        await page.fill('input[type="email"]', 'phpg69@gmail.com');
        await page.fill('input[type="password"]', 'p6p7p8P9!');
        await page.click('button[type="submit"]');

        // Acessar rota protegida
        await page.goto('/app/clinica/profissional/pacientes');
        await expect(page).toHaveURL(/.*pacientes/);
        await expect(page.getByText('Lista de Pacientes')).toBeVisible();
    });

    test('Paciente NÃO deve acessar área médica', async ({ page }) => {
        // Login Paciente
        await page.goto('/login');
        await page.fill('input[type="email"]', 'patient.test@medcannlab.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Tentar acessar rota de médico
        await page.goto('/app/clinica/profissional/pacientes');

        // Deve ser redirecionado ou receber erro (Ajuste conforme lógica do app)
        // Aqui assumimos que redireciona para dashboard do paciente ou login
        await expect(page).not.toHaveURL(/.*profissional\/pacientes/);
        await expect(page).toHaveURL(/.*paciente|login/);
    });
});
