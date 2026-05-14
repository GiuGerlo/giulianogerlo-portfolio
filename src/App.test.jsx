import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

test('renders Home on /', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Home page/i)).toBeInTheDocument();
});

test('renders 404 on unknown route', () => {
  render(
    <MemoryRouter initialEntries={['/no-existe']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText('404')).toBeInTheDocument();
});
