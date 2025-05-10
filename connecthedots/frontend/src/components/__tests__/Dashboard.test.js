import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

describe('Dashboard Component', () => {
    test('renders dashboard', () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    });
}); 