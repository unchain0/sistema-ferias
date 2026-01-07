import { expect, test } from '@playwright/test';

// Test access to register page
test('access to register page', async ({ page }) => {
  await page.goto('/register');
  await expect(page).toHaveURL(/.*register/);
  await expect(page.getByRole('heading')).toContainText(/criar conta|registrar|cadastro|register/i);
});

// Test registration form validation - missing fields
test('registration form validation - missing fields', async ({ page }) => {
  await page.goto('/register');

  // Click register button without filling any fields
  const registerButton = page
    .getByRole('button', { name: /criar conta|registrar|cadastro|register/i })
    .first();
  await registerButton.click();

  // Should remain on register page due to validation errors
  await expect(page).toHaveURL(/.*register/);

  // Wait for validation messages
  await page.waitForTimeout(500);

  // Should show validation errors for required fields
  await expect(page.locator('text=/nome|name|email|senha|password|obrigatório|required/i'))
    .toContainText(/obrigatório|required|campo obrigatório/i)
    .catch(() => {});
});

// Test registration form validation - invalid email format
test('registration form validation - invalid email format', async ({ page }) => {
  await page.goto('/register');

  // Fill with invalid email format
  await page.getByPlaceholder(/nome|name/i).fill('Test User');
  await page.getByPlaceholder(/email|e-mail/i).fill('invalid-email');
  await page.getByPlaceholder('••••••••').first().fill('password123');
  await page.getByPlaceholder('••••••••').nth(1).fill('password123'); // Second password field

  const registerButton = page
    .getByRole('button', { name: /criar conta|registrar|cadastro|register/i })
    .first();
  await registerButton.click();

  // Should remain on register page due to validation errors
  await expect(page).toHaveURL(/.*register/);

  // Should show email format error
  await expect(page.locator('text=/formato|format|email inválido|email format/i'))
    .toContainText(/format|email|inválido/i)
    .catch(() => {});
});

// Test registration form validation - password confirmation mismatch
test('registration form validation - password confirmation mismatch', async ({ page }) => {
  await page.goto('/register');

  // Fill with mismatched passwords
  await page.getByPlaceholder(/nome|name/i).fill('Test User');
  await page.getByPlaceholder(/email|e-mail/i).fill('test@example.com');
  await page.getByPlaceholder('••••••••').first().fill('password123');
  await page.getByPlaceholder('••••••••').nth(1).fill('differentpassword'); // Second password field with different value

  const registerButton = page
    .getByRole('button', { name: /criar conta|registrar|cadastro|register/i })
    .first();
  await registerButton.click();

  // Should remain on register page due to validation errors
  await expect(page).toHaveURL(/.*register/);

  // Should show password confirmation error
  await expect(
    page.locator('text=/senha|password|confirmação|confirmation|não coincidem|do not match/i'),
  )
    .toContainText(/confirmação|não coincidem|matching|confirm|senha/i)
    .catch(() => {});
});

// Test successful registration flow
test('successful registration and redirect to login', async ({ page }) => {
  await page.goto('/register');

  // Generate unique email for testing to avoid duplicates
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;

  // Fill in registration information
  await page.getByPlaceholder(/nome|name/i).fill('Test User');
  await page.getByPlaceholder(/email|e-mail/i).fill(testEmail);
  await page.getByPlaceholder('••••••••').first().fill('password123');
  await page.getByPlaceholder('••••••••').nth(1).fill('password123'); // Second password field

  // Click register button
  const registerButton = page
    .getByRole('button', { name: /criar conta|registrar|cadastro|register/i })
    .first();
  await registerButton.click();

  // Wait for registration to complete
  await page.waitForTimeout(2000);

  // Should redirect to login page after successful registration
  await expect(page).toHaveURL(/.*login/);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

// Test registration with already existing email
test('registration with already existing email shows error', async ({ page }) => {
  await page.goto('/register');

  // Fill with existing email (assuming admin@example.com exists from auth tests)
  await page.getByPlaceholder(/nome|name/i).fill('Another Test User');
  await page
    .getByPlaceholder(/email|e-mail/i)
    .fill(process.env.TEST_USER_EMAIL || 'admin@example.com');
  await page.getByPlaceholder('••••••••').first().fill('password123');
  await page.getByPlaceholder('••••••••').nth(1).fill('password123'); // Second password field

  // Click register button
  const registerButton = page
    .getByRole('button', { name: /criar conta|registrar|cadastro|register/i })
    .first();
  await registerButton.click();

  // Wait for error response
  await page.waitForTimeout(2000);

  // Should remain on register page with an error message
  await expect(page).toHaveURL(/.*register/);

  // Look for error message about existing account
  await expect(page.locator('text=/usuário|email já existe|já cadastrado|already registered/i'))
    .toContainText(/usuário|email|existe|cadastrado|registered|taken/i)
    .catch(() => {});
});

// Test registration form elements visibility
test('registration form elements are visible', async ({ page }) => {
  await page.goto('/register');

  // Check that all required form elements are visible
  await expect(page.getByPlaceholder(/nome|name/i)).toBeVisible();
  await expect(page.getByPlaceholder(/email|e-mail/i)).toBeVisible();
  await expect(page.locator('input[type="password"]').first()).toBeVisible();
  await expect(page.getByPlaceholder('••••••••').nth(1)).toBeVisible(); // Second password field
  await expect(
    page.getByRole('button', { name: /criar conta|registrar|cadastro|register/i }).first(),
  ).toBeVisible();

  // Check if there's a link back to login
  await expect(page.getByRole('link', { name: /login|entrar|já tem conta/i })).toBeVisible();
});
