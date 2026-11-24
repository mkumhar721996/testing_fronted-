import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { amara, draft, json, mockApi, tomas } from './testApi'

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('creates an opening and returns to the list with a toast', async () => {
    mockApi({
      'GET /me': () => json({ isHrAdmin: true }),
      'GET /hiring-managers': () => json([tomas, amara]),
      'GET /openings': () => json([]),
      'POST /openings': () => json(draft, 201),
    })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Create a job opening' }))
    expect(screen.getByRole('heading', { name: 'New job opening' })).toBeInTheDocument()
    fireEvent.change(await screen.findByLabelText('Job title'), { target: { value: 'Product designer' } })
    fireEvent.change(screen.getByLabelText('Hiring manager'), { target: { value: 'm2' } })
    fireEvent.change(screen.getByLabelText('Number of vacancies'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create opening' }))
    expect(await screen.findByRole('heading', { name: 'Job openings' })).toBeInTheDocument()
    expect(
      screen.getByText('Product designer created as a draft. Publish it when it is ready for applications.'),
    ).toBeInTheDocument()
  })
})
