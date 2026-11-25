import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PublicationShop } from './PublicationShop';

describe('PublicationShop', () => {
  it('shows the public shop name under a shop heading', () => {
    render(<PublicationShop shop={{ name: 'Bazar del Sur', description: null }} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Tienda' })).toBeInTheDocument();
    expect(screen.getByText('Bazar del Sur')).toBeInTheDocument();
  });

  it('renders nothing when there is no shop', () => {
    const { container } = render(<PublicationShop shop={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
