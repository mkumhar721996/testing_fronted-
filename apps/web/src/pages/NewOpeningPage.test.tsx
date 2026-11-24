import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { amara, draft, json, mockApi, tomas } from '../testApi'
import NewOpeningPage from './NewOpeningPage'

afterEach(() => vi.unstubAllGlobals())

const baseRoutes = {
  'GET /me': () => json({ isHrAdmin: true }),
  'GET /hiring-managers': () => json([tomas, amara]),
}

const renderPage = (props: Partial<React.ComponentProps<typeof NewOpeningPage>> = {}) =>
  render(<NewOpeningPage onCreated={() => {}} onCancel={() => {}} {...props} />)

async function fill(title = 'Product designer', manager = 'Amara Okafor', vacancies = '1') {
  fireEvent.change(await screen.findByLabelText('Job title'), { target: { value: title } })
  fireEvent.change(screen.getByLabelText('Hiring manager'), {
    target: { value: (await screen.findByRole('option', { name: manager })).getAttribute('value') },
  })
  fireEvent.change(screen.getByLabelText('Number of vacancies'), { target: { value: vacancies } })
}

describe('NewOpeningPage', () => {
  it('shows each field error and does not call the API when fields are empty', async () => {
    const fetchMock = mockApi(baseRoutes)
    renderPage()
    await screen.findByRole('option', { name: 'Tomas Eriksen' })
    fireEvent.click(screen.getByRole('button', { name: 'Create opening' }))
    expect(await screen.findByText('Enter a job title.')).toBeInTheDocument()
    expect(screen.getByText('Choose a hiring manager.')).toBeInTheDocument()
    expect(screen.getByText('Enter a vacancy count of 1 or more.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('The opening was not created.')
    expect(screen.getByLabelText('Job title')).toHaveFocus()
    expect(screen.getByLabelText('Job title')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/openings'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('shows the Draft status up front', async () => {
    mockApi(baseRoutes)
    renderPage()
    expect(await screen.findByText('Draft')).toBeInTheDocument()
  })

  it('creates the opening with the entered values', async () => {
    const onCreated = vi.fn()
    const fetchMock = mockApi({ ...baseRoutes, 'POST /openings': () => json(draft, 201) })
    renderPage({ onCreated })
    await fill('Product designer', 'Amara Okafor', '3')
    fireEvent.click(screen.getByRole('button', { name: 'Create opening' }))
    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledWith(draft, false))
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!
    expect(JSON.parse(post[1]!.body as string)).toEqual({
      title: 'Product designer',
      hiringManagerId: 'm2',
      vacancies: 3,
    })
  })

  it('resets the form for "Create and add another"', async () => {
    const onCreated = vi.fn()
    mockApi({ ...baseRoutes, 'POST /openings': () => json(draft, 201) })
    renderPage({ onCreated })
    await fill()
    fireEvent.click(screen.getByRole('button', { name: 'Create and add another' }))
    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledWith(draft, true))
    expect(screen.getByLabelText('Job title')).toHaveValue('')
    expect(screen.getByLabelText('Job title')).toHaveFocus()
  })

  it('surfaces an API refusal and keeps the input', async () => {
    mockApi({ ...baseRoutes, 'POST /openings': () => json({ error: 'Choose a hiring manager.' }, 400) })
    renderPage()
    await fill()
    fireEvent.click(screen.getByRole('button', { name: 'Create opening' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a hiring manager.')
    expect(screen.getByLabelText('Job title')).toHaveValue('Product designer')
  })

  it('disables the form for non-HR users', async () => {
    mockApi({ ...baseRoutes, 'GET /me': () => json({ isHrAdmin: false }) })
    renderPage()
    expect(
      await screen.findByText('Only HR admins can create job openings. Your account does not have this permission.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Job title')).toBeDisabled()
    expect(screen.getByLabelText('Hiring manager')).toBeDisabled()
    expect(screen.getByLabelText('Number of vacancies')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create opening' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Back to job openings' })).toBeEnabled()
  })
})
