import { test, expect } from '@playwright/test'

interface Opening {
  id: string
  title: string
  hiringManager: { id: string; name: string }
  vacancies: number
  status: 'Draft' | 'Published'
  createdAt: string
}

// The Backend API is stubbed at the network edge: this checks the Web App's happy path, not the API.
test('HR admin creates an opening, sees it as Draft, then publishes it', async ({ page }) => {
  const openings: Opening[] = []
  const manager = { id: 'm1', name: 'Tomas Eriksen' }

  await page.route('**/me', (r) => r.fulfill({ json: { isHrAdmin: true } }))
  await page.route('**/hiring-managers', (r) => r.fulfill({ json: [manager] }))
  await page.route('**/openings', async (r) => {
    if (r.request().method() === 'POST') {
      const body = r.request().postDataJSON()
      const created: Opening = {
        id: 'o1',
        title: body.title,
        hiringManager: manager,
        vacancies: body.vacancies,
        status: 'Draft',
        createdAt: new Date().toISOString(),
      }
      openings.push(created)
      return r.fulfill({ status: 201, json: created })
    }
    return r.fulfill({ json: openings })
  })
  await page.route('**/openings/o1/publish', (r) => {
    openings[0].status = 'Published'
    return r.fulfill({ json: openings[0] })
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Create a job opening' }).click()
  await page.getByLabel('Job title').fill('Product designer')
  await page.getByLabel('Hiring manager').selectOption({ label: 'Tomas Eriksen' })
  await page.getByLabel('Number of vacancies').fill('3')
  await page.getByRole('button', { name: 'Create opening' }).click()

  const row = page.getByRole('row', { name: /Product designer/ })
  await expect(row.getByText('Draft')).toBeVisible()
  await expect(row.getByText('Tomas Eriksen')).toBeVisible()

  await page.getByRole('button', { name: 'Publish Product designer' }).click()
  await page.getByRole('button', { name: 'Publish opening' }).click()
  await expect(row.getByText('Published')).toBeVisible()
})
