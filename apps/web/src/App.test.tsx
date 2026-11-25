import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { amara, draft, json, mockApi, tomas } from './testApi'

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('edits an opening and returns to the refreshed list with a toast', async () => {
    let title = 'Product designer'
    mockApi({
      'GET /me': () => json({ isHrAdmin: true }),
      'GET /openings': () => json([{ ...draft, title }]),
      'PATCH /openings/o2': () => {
        title = 'Senior Engineer'
        return json({ ...draft, title })
      },
    })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Product designer' }))
    fireEvent.change(await screen.findByLabelText('Job title'), { target: { value: 'Senior Engineer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByRole('heading', { name: 'Job openings' })).toBeInTheDocument()
    expect(await screen.findByText('Senior Engineer')).toBeInTheDocument()
    expect(screen.getByText('Senior Engineer saved. It is still a draft.')).toBeInTheDocument()
  })

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
