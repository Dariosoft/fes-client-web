import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProductImage } from '../../../../shared/api/catalog/types';
import { PublicationGallery } from './PublicationGallery';

const images: ProductImage[] = [
  { id: 'image-1', url: 'https://cdn.fes.test/front.webp' },
  { id: 'image-2', url: 'https://cdn.fes.test/back.webp' },
];

describe('PublicationGallery', () => {
  it('renders the shared carousel and keeps each image alt', () => {
    render(<PublicationGallery images={images} productName="Zapatillas urbanas" />);

    expect(screen.getByRole('img', { name: 'Zapatillas urbanas — 1' })).toHaveAttribute(
      'src',
      'https://cdn.fes.test/front.webp',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));

    expect(screen.getByRole('img', { name: 'Zapatillas urbanas — 2' })).toHaveAttribute(
      'src',
      'https://cdn.fes.test/back.webp',
    );
  });

  it('shows a decorative marker when there are no images', () => {
    const { container } = render(<PublicationGallery images={[]} productName="Mate" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('Sin imagen');
  });
});
