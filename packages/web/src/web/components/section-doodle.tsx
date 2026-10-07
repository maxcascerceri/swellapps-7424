export function SectionDoodle({ variant }: { variant: 'idea' | 'conversation' }) {
  return <svg className="section-doodle" viewBox="0 0 120 110" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    {variant === 'idea' ? <>
      <path d="M42 74c-1-11-16-16-16-32 0-18 13-28 30-28 17 0 30 13 29 29-1 16-15 22-16 33" />
      <path d="m42 76 27 1-1 9-25-1-1-9Zm3 11 21 1-2 7-15 1-4-9Z" />
      <path d="m50 75-3-27c5 6 12 8 18-1l-5 29M37 36c1-6 6-10 11-12" />
      <path d="m57 5-1-9M94 19l8-8M99 44l12-1M17 18l-8-7M13 44 2 43" stroke="var(--orange)" />
      <path d="M79 94c11 0 18-5 23-13m-10 2 11-4-1 12" stroke="var(--orange)" />
    </> : <>
      <path d="M66 55c15-3 31 2 33 15 2 10-4 18-12 22l2 11-13-8c-13 2-27-3-29-13-1-4 0-8 2-12" />
      <path d="M22 24c18-7 45-6 53 8 8 14-3 29-19 32-7 2-14 1-21 0L18 75l4-17C6 50 7 31 22 24Z" />
      <path d="m27 40 29-2m-26 12 21-2" />
      <path d="m62 76 18 2m-19 6 11 1" stroke="var(--orange)" />
      <path d="m83 18 5-11m8 20 12-6M9 80 1 85" stroke="var(--orange)" />
    </>}
  </svg>;
}
