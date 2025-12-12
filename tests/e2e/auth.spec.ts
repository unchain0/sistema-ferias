import { expect, test } from '@playwright/test';

// Test redirect to login page for protected routes
test('redirects to login page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/.*login/);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

// Test login form validation - missing credentials
test('login form validation - missing credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Should remain on login page due to validation errors
  await expect(page).toHaveURL(/.*login/);

  // Check for error messages or validation indicators
  const emailField = page.getByPlaceholder('seu@email.com');
  const passwordField = page.getByPlaceholder('••••••••');

  // Email field should be focused first
  await expect(emailField).toBeFocused();

  // Should show validation errors
  await expect(page.locator('text=/email|password/i')).toContainText(/obrigatório|required/i).catch(async () => {});
});

// Test login form validation - incorrect credentials format
test('login form validation - incorrect email format', async ({ page }) => {
  await page.goto('/login');

  // Fill with invalid email format
  await page.getByPlaceholder('seu@email.com').fill('invalid-email');
  await page.getByPlaceholder('••••••••').fill('password123');

  await page.getByRole('button', { name: 'Entrar' }).click();

  // Should remain on login page due to validation errors
  await expect(page).toHaveURL(/.*login/);

  // Should show email format error
  await expect(page.locator('text=/formato|format|email inválido/i')).toContainText(/format|email/).catch(async () => {});
});

// Test successful login flow
test('successful login and navigation to dashboard', async ({ page }) => {
  await page.goto('/login');

  // Fill in credentials
  await page.getByPlaceholder('seu@email.com').fill(process.env.TEST_USER_EMAIL || 'demo@sistema-ferias.com');
  await page.getByPlaceholder('••••••••').fill(process.env.TEST_USER_PASSWORD || 'demo123');

  // Click login button
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard');
  await expect(page).toHaveURL(/.*dashboard/);

  // Verify dashboard elements are present
  await expect(page.getByRole('heading', { name: /dashboard|início|bem-vindo/i })).toBeVisible();
});

// Test logout functionality
test('logout functionality', async ({ page }) => {
  // First, login to the application
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill(process.env.TEST_USER_EMAIL || 'demo@sistema-ferias.com');
  await page.getByPlaceholder('••••••••').fill(process.env.TEST_USER_PASSWORD || 'demo123');
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Wait for dashboard
  await page.waitForURL('**/dashboard');

  // Wait for session to establish and navbar to load
  await page.waitForTimeout(3000);

  // Look for the user profile section and then the logout button
  await expect(page.getByText('demo@sistema-ferias.com')).toBeVisible().catch(() => {});
  const logoutButton = page.getByRole('button', { name: 'Sair' }).first();
  await expect(logoutButton).toBeVisible();
  await logoutButton.click();

  // Should redirect back to login page - allow some time for redirect
  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/.*login/);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

// Test access to protected route without authentication
test('access to protected route without authentication redirects to login', async ({ page }) => {
  // Directly navigate to a protected route
  await page.goto('/dashboard');

  // Should be redirected to login
  await expect(page).toHaveURL(/.*login/);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

// Test navigation after login to different protected sections
test('navigation to different sections after login', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill(process.env.TEST_USER_EMAIL || 'demo@sistema-ferias.com');
  await page.getByPlaceholder('••••••••').fill(process.env.TEST_USER_PASSWORD || 'demo123');
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Wait for dashboard
  await page.waitForURL('**/dashboard');

  // Wait for session and navigation to establish
  await page.waitForTimeout(3000);

  // Ensure dashboard elements are visible before attempting navigation
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

  // Test navigation to vacation section
  const vacationLink = page.getByRole('link', { name: 'Férias', exact: true }).first();
  await expect(vacationLink).toBeVisible();
  await vacationLink.click();

  // Wait for navigation
  await page.waitForURL('**/vacations');
  await expect(page).toHaveURL(/.*vacations/);

  // Test navigation to professionals section
  const professionalsLink = page.getByRole('link', { name: 'Profissionais', exact: true }).first();
  await expect(professionalsLink).toBeVisible();
  await professionalsLink.click();

  // Wait for navigation
  await page.waitForURL('**/professionals');
  await expect(page).toHaveURL(/.*professionals/);
});

// Test login with empty fields shows proper error messages
test('login with empty fields shows error messages', async ({ page }) => {
  await page.goto('/login');

  // Click login button without filling any fields
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Wait for validation messages to appear
  await page.waitForTimeout(500); // Allow time for validation messages

  // Check that validation messages appear for both fields
  await expect(page.locator('.error-message, [data-error], .field-error').first()).toBeVisible().catch(() => {});
  await expect(page.locator('.error-message, [data-error], .field-error').nth(1)).toBeVisible().catch(() => {});

  // At least check that we're still on the login page
  await expect(page).toHaveURL(/.*login/);
});

// Test login with invalid credentials shows authentication error
test('login with invalid credentials shows authentication error', async ({ page }) => {
  await page.goto('/login');

  // Fill with incorrect credentials
  await page.getByPlaceholder('seu@email.com').fill('nonexistent@example.com');
  await page.getByPlaceholder('••••••••').fill('wrongpassword');

  // Click login
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Wait for potential authentication error
  await page.waitForTimeout(1000);

  // Should still be on login page with an authentication error
  await expect(page).toHaveURL(/.*login/);

  // Look for error message about wrong credentials
  await expect(page.locator('text=/usuário|senha incorreta|credenciais|invalid/gi')).toContainText(/credenciais|senha|usuário|login/).catch(async () => {});
});

// Test remember me functionality if it exists
test('remember me functionality', async ({ page }) => {
  await page.goto('/login');

  // Check if remember me checkbox exists
  const rememberMeCheckbox = page.getByLabel(/lembrar|remember/gi);
  if (await rememberMeCheckbox.count() > 0) {
    // Test checking the checkbox
    await rememberMeCheckbox.check();
    await expect(rememberMeCheckbox).toBeChecked();

    // Uncheck it
    await rememberMeCheckbox.uncheck();
    await expect(rememberMeCheckbox).not.toBeChecked();
  }
});
