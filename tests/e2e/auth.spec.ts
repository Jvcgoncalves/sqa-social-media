import { expect, test } from "@playwright/test";
import { AuthApi } from "../support/AuthApi";
import { TestData } from "../support/TestData";

test.describe("Fluxos E2E de autenticacao", () => {
  test("cadastro de novo usuario pelo navegador", async ({ page }) => {
    const user = TestData.user();

    await page.goto("/signup");
    await page.locator('input[type="email"]').fill(user.email);
    await page.locator('input[type="password"]').first().fill(user.password);
    await page.locator('input[type="password"]').nth(1).fill(user.password);
    await page.locator("form").getByRole("button", { name: "Criar Conta" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Feed de Posts" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Posts Curtidos" })).toBeVisible();
  });

  test("login de usuario existente pelo navegador", async ({ page, request }) => {
    const user = await AuthApi.createUser(request);

    await page.goto("/signin");
    await page.locator('input[type="email"]').fill(user.email);
    await page.locator('input[type="password"]').fill(user.password);
    await page.locator("form").getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Feed de Posts" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Posts Curtidos" })).toBeVisible();
  });
});
