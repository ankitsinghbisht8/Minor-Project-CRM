import React from "react";

export function Pagination({ children }) {
  return (
    <nav role="navigation" aria-label="pagination" className="flex w-full items-center justify-center">
      {children}
    </nav>
  );
}

export function PaginationContent({ children }) {
  return (
    <ul className="flex flex-row items-center gap-4">
      {children}
    </ul>
  );
}

export function PaginationItem({ children }) {
  return (
    <li className="list-none">
      {children}
    </li>
  );
}

export function PaginationLink({ href = "#", isActive = false, onClick, children }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
      }}
      className={
        `inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm no-underline transition-colors ` +
        (isActive
          ? 'border-transparent bg-black text-white hover:bg-black'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50')
      }
    >
      {children}
    </a>
  );
}

export function PaginationPrevious({ href = '#', onClick }) {
  return (
    <PaginationLink href={href} onClick={onClick}>
      Previous
    </PaginationLink>
  );
}

export function PaginationNext({ href = '#', onClick }) {
  return (
    <PaginationLink href={href} onClick={onClick}>
      Next
    </PaginationLink>
  );
}

export function PaginationEllipsis() {
  return (
    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm text-gray-500">
      ...
    </span>
  );
}


