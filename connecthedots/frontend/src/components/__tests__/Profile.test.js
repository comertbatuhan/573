import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../Profile';

describe('Profile Component', () => {
    test('renders profile', () => {
        render(
            <BrowserRouter>
                <Profile />
            </BrowserRouter>
        );
        expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
    });
}); 