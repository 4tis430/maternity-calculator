import { test, expect } from "@playwright/test"

test("landing page shows welcome and login", async ({ page }) => {
  await page.goto("/")
  await page.waitForLoadState("domcontentloaded")

  const logoutButton = page.getByRole("button", { name: "Logout" })
  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click()
  }

  await expect(page.getByRole("heading", { name: /ברוכים הבאים/ })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible()
})
