import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProductImage } from '../../../shared/api/catalog/types';
import { ProductImageCarousel } from './ProductImageCarousel';

const images: ProductImage[] = [
  { id: 'image-1', url: 'https://cdn.fes.test/front.webp' },
  { id: 'image-2', url: 'https://cdn.fes.test/back.webp' },
  { id: 'image-3', url: 'https://cdn.fes.test/detail.webp' },
];

describe('ProductImageCarousel', () => {
  it('shows a single image without controls', () => {
    render(<ProductImageCarousel images={[images[0]]} productName="Mate" />);

    expect(screen.getByRole('img', { name: 'Mate' })).toHaveAttribute(
      'src',
      'https://cdn.fes.test/front.webp',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
  });

  it('starts on the first image and reports the position', () => {
    render(<ProductImageCarousel images={images} productName="Mate" />);

    expect(screen.getByRole('img', { name: 'Mate — 1' })).toHaveAttribute(
      'src',
      'https://cdn.fes.test/front.webp',
    );
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('advances and wraps around with the next and previous controls', () => {
    render(<ProductImageCarousel images={images} productName="Mate" />);

    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    expect(screen.getByRole('img', { name: 'Mate — 2' })).toHaveAttribute(
      'src',
      'https://cdn.fes.test/back.webp',
    );
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Foto anterior' }));
    expect(screen.getByRole('img', { name: 'Mate — 3' })).toHaveAttribute(
      'src',
      'https://cdn.fes.test/detail.webp',
    );
  });
});
