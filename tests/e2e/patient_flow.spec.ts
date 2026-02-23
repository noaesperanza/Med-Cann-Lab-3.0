import { test, expect } from '@playwright/test';

test.describe('Gestão de Pacientes', () => {
    test.beforeEach(async ({ page }) => {
        // Login como profissional antes de cada teste
        await page.goto('/login');
        await page.fill('input[type="email"]', 'phpg69@gmail.com');
        await page.fill('input[type="password"]', 'p6p7p8P9!');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('Criar Novo Paciente', async ({ page }) => {
        // Navegar para lista de pacientes
        await page.goto('/app/clinica/profissional/pacientes');

        // Clicar em "Novo Paciente" (ajuste o seletor se necessário)
        await page.getByRole('button', { name: /novo paciente/i }).click();

        // Preencher formulário (simulação)
        const uniqueEmail = `novo.paciente.${Date.now()}@teste.com`;
        await page.fill('input[name="name"]', 'Paciente Automação');
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="phone"]', '11999999999');

        // Submit
        await page.getByRole('button', { name: /salvar|criar/i }).click();

        // Verificar se aparece na lista ou mensagem de sucesso
        await expect(page.getByText('Paciente Automação')).toBeVisible();
    });
});
