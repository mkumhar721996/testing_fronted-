import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { draft, json, mockApi, published } from '../testApi'
import EditOpeningPage from './EditOpeningPage'

afterEach(() => vi.unstubAllGlobals())

const hrRoutes = { 'GET /me': () => json({ isHrAdmin: true }) }

const renderPage = (opening = published, props: Partial<React.ComponentProps<typeof EditOpeningPage>> = {}) =>
  render(<EditOpeningPage opening={opening} onBack={() => {}} onSaved={() => {}} {...props} />)

const patchBody = (fetchMock: ReturnType<typeof mockApi>) => {
  const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
  return call ? JSON.parse(call[1]!.body as string) : undefined
}

describe('EditOpeningPage', () => {
  it('shows a loading state, then the form filled from the opening', async () => {
    mockApi(hrRoutes)
    renderPage()
    expect(screen.getByRole('status', { name: 'Loading job opening' })).toBeInTheDocument()
    expect(await screen.findByLabelText('Job title')).toHaveValue('Senior backend engineer')
    expect(screen.getByLabelText('Description')).toHaveValue('Backend role')
    expect(screen.getByLabelText('Number of vacancies')).toHaveValue(2)
  })

  it('sends vacancies on a Draft (AC1)', async () => {
    const fetchMock = mockApi({ ...hrRoutes, 'PATCH /openings/o2': () => json({ ...draft, title: 'Senior Engineer' }) })
    const onSaved = vi.fn()
    renderPage(draft, { onSaved })
    fireEvent.change(await screen.findByLabelText('Job title'), { target: { value: 'Senior Engineer' } })
    fireEvent.change(screen.getByLabelText('Number of vacancies'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(patchBody(fetchMock)).toEqual({ title: 'Senior Engineer', description: 'Design the onboarding flow.', vacancies: 4 })
  })

  it('locks vacancies and omits them on a Published opening (AC4)', async () => {
    const fetchMock = mockApi({
      ...hrRoutes,
      'PATCH /openings/o1': () => json({ ...published, title: 'Staff Engineer' }),
      'GET /portal/openings': () => json([]),
    })
    renderPage()
    expect(await screen.findByLabelText('Number of vacancies')).toBeDisabled()
    expect(screen.getByText('The vacancy count is locked once an opening is published. It stays at 2.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Job title'), { target: { value: 'Staff Engineer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Saved just now. The portal now shows these details.')
    expect(patchBody(fetchMock)).toEqual({ title: 'Staff Engineer', description: 'Backend role' })
  })

  it('changes the portal card after Save and not while typing (AC5)', async () => {
    mockApi({
      ...hrRoutes,
      'PATCH /openings/o1': () => json({ ...published, title: 'Principal Engineer' }),
      'GET /portal/openings': () => json([{ id: 'o1', title: 'Principal Engineer', description: 'Backend role', vacancies: 2 }]),
    })
    renderPage()
    const card = within(await screen.findByRole('complementary'))
    fireEvent.change(screen.getByLabelText('Job title'), { target: { value: 'Principal Engineer' } })
    expect(card.getByRole('heading', { level: 4 })).toHaveTextContent('Senior backend engineer')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Saved just now. The portal now shows these details.')
    expect(card.getByRole('heading', { level: 4 })).toHaveTextContent('Principal Engineer')
  })

  it('shows field errors, focuses the first and sends nothing', async () => {
    const fetchMock = mockApi(hrRoutes)
    renderPage()
    fireEvent.change(await screen.findByLabelText('Job title'), { target: { value: ' ' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Enter a job title.')).toBeInTheDocument()
    expect(screen.getByText('Enter a description so candidates know what the role involves.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Your changes were not saved.')
    expect(screen.getByLabelText('Job title')).toHaveFocus()
    expect(patchBody(fetchMock)).toBeUndefined()
  })

  it('keeps the edits and offers Try again when saving fails', async () => {
    mockApi({ ...hrRoutes, 'PATCH /openings/o1': () => json({ error: 'down' }, 500) })
    renderPage()
    fireEvent.change(await screen.findByLabelText('Job title'), { target: { value: 'Staff Engineer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not save your changes.')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByLabelText('Job title')).toHaveValue('Staff Engineer')
  })

  it('shows Saving… while pending', async () => {
    mockApi({ ...hrRoutes, 'PATCH /openings/o1': () => new Promise<Response>(() => {}) })
    renderPage()
    await screen.findByLabelText('Job title')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled()
  })

  it('disables the form for non-HR users (AC6)', async () => {
    mockApi({ 'GET /me': () => json({ isHrAdmin: false }) })
    renderPage()
    expect(await screen.findByText(/Only HR admins can edit job openings/)).toBeInTheDocument()
    expect(screen.getByLabelText('Job title')).toBeDisabled()
    expect(screen.getByLabelText('Description')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'Back to job openings' })).toHaveLength(2)
  })
})
