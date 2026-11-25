import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { json, mockApi, publicOpening } from '../testApi'
import JobDetailPage from './JobDetailPage'

afterEach(() => vi.unstubAllGlobals())

describe('JobDetailPage', () => {
  it('shows the full job detail (AC2, AC8)', async () => {
    mockApi({ 'GET /public/openings/o1': () => json(publicOpening) })
    render(<JobDetailPage id="o1" onToast={() => {}} />)
    expect(await screen.findByRole('heading', { name: publicOpening.title })).toBeInTheDocument()
    expect(screen.getByText('Berlin, Germany')).toBeInTheDocument()
    expect(screen.getByText('Contract, 12 months')).toBeInTheDocument()
    expect(screen.getByText('15 January 2027')).toBeInTheDocument()
    expect(
      screen.getByText('Join the finance team to build and maintain our rolling 18-month forecast.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'About the role' })).toBeInTheDocument()
    expect(screen.getByText('Own the forecast model').tagName).toBe('LI')
  })

  it('tells the visitor applying is a separate step', async () => {
    mockApi({ 'GET /public/openings/o1': () => json(publicOpening) })
    const onToast = vi.fn()
    render(<JobDetailPage id="o1" onToast={onToast} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Apply for this job' }))
    expect(onToast).toHaveBeenCalledWith('Applying opens in a separate step')
  })

  it('shows the not-found page on a 404 (AC5)', async () => {
    mockApi({ 'GET /public/openings/x': () => json({ error: 'Job not found.' }, 404) })
    render(<JobDetailPage id="x" onToast={() => {}} />)
    expect(await screen.findByRole('heading', { name: "We can't find that job" })).toBeInTheDocument()
    expect(screen.queryByText('Apply for this job')).not.toBeInTheDocument()
  })

  it('shows an error alert on other failures', async () => {
    mockApi({ 'GET /public/openings/x': () => json({ error: 'boom' }, 500) })
    render(<JobDetailPage id="x" onToast={() => {}} />)
    expect(await screen.findByText("We couldn't load the open jobs.")).toBeInTheDocument()
  })
})
