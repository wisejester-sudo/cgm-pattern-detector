import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfileSection } from '../ProfileSection'

// Mock fetch
global.fetch = jest.fn()

describe('ProfileSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<ProfileSection />)
    
    expect(screen.getByText(/loading profile information/i)).toBeInTheDocument()
  })

  it('renders profile data after loading', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      full_name: 'John Doe',
      phone: '555-0123',
      company_name: 'Test Company',
      company_phone: '555-0456',
      role: 'admin' as const,
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    })

    render(<ProfileSection />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('555-0123')).toBeInTheDocument()
  })

  it('allows editing profile', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      full_name: 'John Doe',
      phone: '555-0123',
      company_name: 'Test Company',
      company_phone: '555-0456',
      role: 'admin' as const,
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, profile: { ...mockProfile, full_name: 'Jane Doe' } }),
      })

    render(<ProfileSection />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click edit button
    fireEvent.click(screen.getByText('Edit Profile'))

    // Check that inputs are rendered
    expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument()

    // Change name
    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/user-profile',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('Jane Doe'),
        })
      )
    })
  })

  it('cancels editing', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      full_name: 'John Doe',
      phone: '555-0123',
      company_name: 'Test Company',
      company_phone: '555-0456',
      role: 'admin' as const,
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    })

    render(<ProfileSection />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click edit button
    fireEvent.click(screen.getByText('Edit Profile'))

    // Change name
    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } })

    // Cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Should revert to original name
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('shows error when profile fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<ProfileSection />)

    await waitFor(() => {
      expect(screen.queryByText(/loading profile information/i)).not.toBeInTheDocument()
    })

    // Should show profile even if fetch fails (empty state)
    expect(screen.getByText('Owner Profile')).toBeInTheDocument()
  })
})
