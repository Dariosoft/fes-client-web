import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CATALOG_PAGE_SIZE_OPTIONS } from '../../../shared/config/catalog-search';
import { STOREFRONT_COPY } from '../constants';

type ProductPageSizeProps = {
  size: number;
  onSelectSize: (size: number) => void;
};

function activeIndexFor(size: number): number {
  const index = CATALOG_PAGE_SIZE_OPTIONS.findIndex((option) => option === size);

  return index === -1 ? 0 : index;
}

export function ProductPageSize({ size, onSelectSize }: ProductPageSizeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => activeIndexFor(size));
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current !== null && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      listboxRef.current?.focus();
    }
  }, [isOpen]);

  function open() {
    setActiveIndex(activeIndexFor(size));
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function selectOption(option: number) {
    setIsOpen(false);
    buttonRef.current?.focus();

    if (option !== size) {
      onSelectSize(option);
    }
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(
        (current) => (current + step + CATALOG_PAGE_SIZE_OPTIONS.length) % CATALOG_PAGE_SIZE_OPTIONS.length,
      );
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = CATALOG_PAGE_SIZE_OPTIONS[activeIndex];

      if (option !== undefined) {
        selectOption(option);
      }
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <span id={`${listboxId}-label`} className="font-display text-xs font-medium text-muted-foreground">
        {STOREFRONT_COPY.pageSize}
      </span>

      <div ref={containerRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={`${listboxId}-label ${listboxId}-value`}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              open();
            }
          }}
          onKeyDown={handleButtonKeyDown}
          className="inline-flex min-h-11 min-w-24 cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-border bg-card pr-4 pl-4 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span id={`${listboxId}-value`}>{size}</span>
          <ChevronDown
            aria-hidden="true"
            className={`size-4 shrink-0 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen ? (
          <div
            ref={listboxRef}
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            className="absolute top-full right-0 z-30 mt-1 w-full min-w-24 overflow-hidden rounded-xl border-2 border-border bg-card shadow-lg outline-none"
          >
            <ul id={listboxId} role="listbox" aria-labelledby={`${listboxId}-label`}>
              {CATALOG_PAGE_SIZE_OPTIONS.map((option, index) => (
                <li key={option} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={option === size}
                    tabIndex={-1}
                    onClick={() => {
                      selectOption(option);
                    }}
                    onMouseEnter={() => {
                      setActiveIndex(index);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 font-display text-sm font-semibold transition-colors ${
                      index === activeIndex ? 'bg-muted' : ''
                    } ${option === size ? 'text-primary' : 'text-foreground'}`}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
