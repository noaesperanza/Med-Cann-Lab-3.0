import { test, expect } from '@playwright/test';

test.describe('Fluxo Clínico IMRE', () => {
    test.beforeEach(async ({ page }) => {
        // Login como paciente
        await page.goto('/login');
        await page.fill('input[type="email"]', 'patient.test@medcannlab.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*paciente/);
    });

    test('Iniciar Avaliação IMRE', async ({ page }) => {
        // Navegar para avaliação
        await page.goto('/app/paciente/avaliacao/imre');

        // Verificar se a página carregou
        await expect(page.getByText('Inventário de Medicina Receptiva')).toBeVisible();

        // Iniciar
        await page.getByRole('button', { name: /iniciar|começar/i }).click();

        // Verificar passo 1
        await expect(page.getByText('Passo 1')).toBeVisible();

        // Simular preenchimento (ajuste conforme os campos reais)
        // await page.click('text=Opção A');
        // await page.click('button:has-text("Próximo")');
    });
});
