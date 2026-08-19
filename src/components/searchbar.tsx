"use client";

type SearchBarProps = {
  value?: string;
  onChange?: (val: string) => void;
};

export default function SearchBar({ value = "", onChange }: SearchBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto my-4 px-4">
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Looking for something?"
          className="w-full rounded-full border border-dark/40 bg-cream py-2.5 pl-10 pr-10 text-xs font-semibold text-dark placeholder:text-dark/50 shadow-sm outline-none focus:border-dark"
        />
        <svg
          className="absolute left-3.5 h-4 w-4 text-dark/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}