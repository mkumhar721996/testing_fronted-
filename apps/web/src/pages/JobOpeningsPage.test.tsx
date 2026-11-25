import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { amara, draft, json, mockApi, published } from '../testApi'
import JobOpeningsPage from './JobOpeningsPage'

afterEach(() => vi.unstubAllGlobals())

const hrRoutes = (openings = [published, draft]) => ({
  'GET /me': () => json({ isHrAdmin: true }),
  'GET /openings': () => json(openings),
})

const renderPage = (props: Partial<React.ComponentProps<typeof JobOpeningsPage>> = {}) =>
  render(<JobOpeningsPage onNew={() => {}} onEdit={() => {}} onToast={() => {}} {...props} />)

describe('JobOpeningsPage', () => {
  it('shows a loading state first', () => {
    mockApi({ ...hrRoutes(), 'GET /openings': () => new Promise<Response>(() => {}) })
    renderPage()
    expect(screen.getByRole('status', { name: 'Loading job openings' })).toBeInTheDocument()
  })

  it('lists openings with manager, vacancies and status', async () => {
    mockApi(hrRoutes())
    renderPage()
    expect(await screen.findByText('Tomas Eriksen')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('2 openings, 1 in draft')).toBeInTheDocument()
    const row = screen.getByText('Product designer').closest('tr')!
    expect(within(row).getByText('Amara Okafor')).toBeInTheDocument()
    expect(within(row).getByText('1')).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    mockApi(hrRoutes([]))
    renderPage()
    expect(await screen.findByText('No job openings yet')).toBeInTheDocument()
  })

  it('shows an error and retries', async () => {
    let fail = true
    mockApi({
      ...hrRoutes(),
      'GET /openings': () => (fail ? json({ error: 'down' }, 500) : json([published])),
    })
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not load job openings.')
    fail = false
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Tomas Eriksen')).toBeInTheDocument()
  })

  it('publishes a draft through the confirmation dialog', async () => {
    const onToast = vi.fn()
    const fetchMock = mockApi({
      ...hrRoutes(),
      'POST /openings/o2/publish': () => json({ ...draft, status: 'Published' }),
    })
    renderPage({ onToast })
    fireEvent.click(await screen.findByRole('button', { name: 'Publish Product designer' }))
    const dialog = screen.getByRole('dialog', { name: 'Publish this opening?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publish opening' }))
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/openings/o2/publish'),
      expect.objectContaining({ method: 'POST' }),
    )
    expect(screen.queryByRole('button', { name: 'Publish Product designer' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Published')).toHaveLength(2)
    expect(onToast).toHaveBeenCalledWith(
      'Product designer published. Applications can now be made against it.',
    )
  })

  it('cancels the dialog without publishing', async () => {
    const fetchMock = mockApi(hrRoutes())
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Publish Product designer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/publish'), expect.anything())
  })

  it('disables publishing for non-HR users', async () => {
    mockApi({ ...hrRoutes(), 'GET /me': () => json({ isHrAdmin: false }) })
    renderPage()
    expect(await screen.findByText(/Only HR admins can change job openings/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Publish Product designer, HR admins only' }),
    ).toBeDisabled()
  })

  it('offers Edit to HR admins and View to everyone else (AC6)', async () => {
    const onEdit = vi.fn()
    mockApi(hrRoutes())
    const { unmount } = renderPage({ onEdit })
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Product designer' }))
    expect(onEdit).toHaveBeenCalledWith(draft)
    unmount()
    mockApi({ ...hrRoutes(), 'GET /me': () => json({ isHrAdmin: false }) })
    renderPage({ onEdit })
    expect(await screen.findByRole('button', { name: 'View Product designer' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Edit / })).not.toBeInTheDocument()
  })

  it('highlights a newly created opening', async () => {
    mockApi(hrRoutes([{ ...draft, hiringManager: amara }]))
    renderPage({ highlightId: 'o2' })
    const row = (await screen.findByText('Product designer')).closest('tr')!
    expect(row).toHaveAttribute('data-new', 'true')
  })
})
