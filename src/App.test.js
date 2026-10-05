import { render, screen } from '@testing-library/react'
import CheckInPage from './pages/CheckInPage'

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({
        configured: true,
        venueName: 'Test venue',
        radiusMeters: 100,
        maxAccuracyMeters: 80,
      }),
    })
  )
})

test('renders check-in page', async () => {
  render(<CheckInPage />)
  expect(
    await screen.findByRole('heading', { name: /mark your attendance/i })
  ).toBeInTheDocument()
})
