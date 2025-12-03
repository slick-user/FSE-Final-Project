import { test, expect } from '@playwright/test';
import { mockAdminApi, mockAdminSession } from './adminMocks.js';

const baseURL = 'http://localhost:5000';

test.beforeEach(async ({ page }) => {
 
  await page.route(/.*\.(css|js|png|jpg|jpeg|svg|ico|html)$/, r => r.continue());
  await page.route('**/client/**', r => r.continue());

  await mockAdminApi(page);

  await mockAdminSession(page);

  await page.goto(`${baseURL}/admin.html`);
});

async function openPanel(page, panelId) {
  await page.locator(`#${panelId}`).click();
  await expect(page.locator('h2')).toBeVisible();  // ensures panel loaded
}

test.describe('Stops Panel', () => {

  test('Add Stop', async ({ page }) => {
    await openPanel(page, 'stops-panel-btn');

    await page.locator('#stop-name').fill('Test Stop');
    await page.locator('#stop-zone').selectOption('Islamabad');

    await page.locator('#add-stop-form button[type="submit"]').click();

    await expect(page.locator('#stop-form-message')).toContainText(/success|added/i);
  });


  test('Delete Stop', async ({ page }) => {
    await openPanel(page, 'stops-panel-btn');

    page.once('dialog', d => d.accept()); // confirm delete

    await page.locator('#stops-data-table-body tr:first-child button.delete-btn').click();

    // UI does AJAX → quick wait
    await page.waitForTimeout(200);

    // Table must still be visible
    await expect(page.locator('#stops-data-table-body')).toBeVisible();
  });

});

test.describe('Buses Panel', () => {

  test('Add Bus', async ({ page }) => {
    await openPanel(page, 'buses-panel-btn');

    await page.locator('#bus-id').fill('BUS-XYZ');
    await page.locator('#bus-driver').fill('New Driver');

    await page.locator('#add-bus-form button[type="submit"]').click();

    await expect(page.locator('#bus-form-message')).toContainText(/success/i);
  });


  test('Delete Bus', async ({ page }) => {
    await openPanel(page, 'buses-panel-btn');

    page.once('dialog', d => d.accept());

    await page.locator('#buses-data-table-body tr:first-child button.delete-btn').click();

    await page.waitForTimeout(200);

    await expect(page.locator('#buses-data-table-body')).toBeVisible();
  });

});


test.describe('Routes Panel', () => {

  test('Add Route', async ({ page }) => {
    await openPanel(page, 'routes-panel-btn');

    await page.locator('#route-name').fill('New Route');
    await page.locator('#route-from').selectOption('1');
    await page.locator('#route-to').selectOption('2');

    await page.locator('#add-route-form button[type="submit"]').click();

    await expect(page.locator('#route-form-message')).toContainText(/success/i);
  });


  test('Delete Route', async ({ page }) => {
    await openPanel(page, 'routes-panel-btn');

    page.once('dialog', d => d.accept());
    await page.locator('#routes-data-table-body tr:first-child button.delete-btn').click();
    await page.waitForTimeout(200);

    await expect(page.locator('#routes-data-table-body')).toBeVisible();
  });

});


test.describe('Schedules Panel', () => {

  test('Add Schedule', async ({ page }) => {
    await openPanel(page, 'schedules-panel-btn');

    await page.locator('#schedule-route').selectOption('1');
    await page.locator('#schedule-bus').selectOption('1');
    await page.locator('#schedule-time').fill('09:30');

    await page.locator('#add-schedule-form button[type="submit"]').click();

    await expect(page.locator('#schedule-form-message')).toContainText(/success/i);
  });


  test('Delete Schedule', async ({ page }) => {
    await openPanel(page, 'schedules-panel-btn');

    page.once('dialog', d => d.accept());

    await page.locator('#schedules-data-table-body tr:first-child button.delete-btn').click();
    await page.waitForTimeout(200);
    await expect(page.locator('#schedules-data-table-body')).toBeVisible();
  });

});

