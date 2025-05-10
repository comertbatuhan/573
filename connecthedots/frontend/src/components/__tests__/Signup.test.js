import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../Signup';

describe('Signup Component', () => {
    test('renders signup form', () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    });
}); 