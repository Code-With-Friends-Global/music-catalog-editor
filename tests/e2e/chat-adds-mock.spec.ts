import { expect, test } from '@playwright/test';

test('chat message adds a mock album and track', async ({ page }) => {
  await page.route('**/api/chat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reply: 'Mock assistant reply',
        triggerGif: false,
        gifQuery: null,
      }),
    });
  });

  await page.route('**/api/gif*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: 'https://example.com/mock.gif',
        title: 'Mock GIF',
      }),
    });
  });

  await page.goto('/');

  await expect(page.getByText('Albums: 3')).toBeVisible();
  await expect(page.getByText('Tracks: 5')).toBeVisible();

  const messageBox = page.getByRole('textbox', { name: 'Message' });
  await messageBox.fill('Please add a mock album and a mock track to my catalog.');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('Albums: 4')).toBeVisible();
  await expect(page.getByText('Tracks: 6')).toBeVisible();
  await expect(page.getByText(/I also added the mock album/i)).toBeVisible();
});