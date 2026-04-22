import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RewardCard from '../RewardCard'

describe('RewardCard Component Interactions', () => {
    const mockReward = { id: 1, title: 'Free Coffee', description: 'Get one free coffee', type: 'discount' as const, value: 100, active: true }

    it('renders the primary reward title and description correctly', () => {
        render(<RewardCard reward={mockReward as any} onToggleActive={() => {}} />)
        expect(screen.getByText('Free Coffee')).toBeInTheDocument()
        expect(screen.getByText('Get one free coffee')).toBeInTheDocument()
    })

    it('displays active status properly based dynamically on props', () => {
        render(<RewardCard reward={mockReward as any} onToggleActive={() => {}} />)
        expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('shows inactive status tag when active is inherently false', () => {
        render(<RewardCard reward={{...mockReward, active: false} as any} onToggleActive={() => {}} />)
        expect(screen.getByText('Inactive')).toBeInTheDocument()
    })

    it('triggers onToggleActive upstream binding when the toggle switch is triggered', () => {
        const toggleMock = vi.fn()
        render(<RewardCard reward={mockReward as any} onToggleActive={toggleMock} />)
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
        expect(toggleMock).toHaveBeenCalledWith(1)
    })

    it('shows delete confirmation only sequentially after initial delete click is dispatched', () => {
        render(<RewardCard reward={mockReward as any} onToggleActive={() => {}} onDelete={() => {}} />)
        // Should securely not be visible in DOM until interaction
        expect(screen.queryByText(/Delete reward "Free Coffee"\? This cannot be undone/i)).not.toBeInTheDocument()
        
        const deleteBtn = screen.getByText('Delete reward')
        fireEvent.click(deleteBtn)
        
        expect(screen.getByText(/Delete reward "Free Coffee"\? This cannot be undone/i)).toBeInTheDocument()
    })
})
