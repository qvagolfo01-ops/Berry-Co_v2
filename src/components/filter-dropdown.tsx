"use client";

interface FilterDropdownProps {
  label: string; // e.g. "Category", "Series", "Tags", "Brand"
  options: string[]; // List of available options
  searchValue: string; // Current text typed into search input
  selectedValues: string[]; // Array of currently selected filter items
  onSearchChange: (val: string) => void;
  onSelectChange: (values: string[]) => void;
}

export default function FilterDropdown({
  label,
  options,
  searchValue,
  selectedValues,
  onSearchChange,
  onSelectChange,
}: FilterDropdownProps) {
  // 🔍 1. Filter out already-selected items AND items that don't match search query
  const availableOptions = options.filter(
    (opt) =>
      !selectedValues.includes(opt) &&
      opt.toLowerCase().includes(searchValue.toLowerCase().trim())
  );

  const handleAdd = (item: string) => {
    if (item && !selectedValues.includes(item)) {
      onSelectChange([...selectedValues, item]);
      onSearchChange(""); // Reset search bar after choosing an option
    }
  };

  const handleRemove = (item: string) => {
    onSelectChange(selectedValues.filter((v) => v !== item));
  };

  // Label formatting for dropdown placeholder
  const selectPlaceholder =
    label.toLowerCase() === "tags" ? "Add a tag" : `Add ${label}`;

  return (
    <div className="rounded-2xl border border-dark/10 bg-[#EDE3D0] p-4 shadow-xs">
      {/* 📌 Block Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-dark/80">
          {label}
        </span>
        <span className="text-[11px] font-semibold text-dark/60">
          {selectedValues.length} selected
        </span>
      </div>

      <div className="space-y-2.5">
        {/* 🔍 Search Text Field */}
        <div className="flex items-center gap-2 rounded-full border border-dark/30 bg-white px-3.5 py-2 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-dark/60"
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
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && availableOptions.length > 0) {
                e.preventDefault();
                handleAdd(availableOptions[0]); // Selects first match on Enter
              }
            }}
            placeholder={`Search ${label}`}
            className="w-full bg-transparent text-xs font-medium text-dark outline-none placeholder:text-dark/40"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-xs font-bold text-dark/40 hover:text-dark px-1 cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* 🔽 Filtered Dropdown */}
        <select
          value=""
          onChange={(e) => handleAdd(e.target.value)}
          className="w-full rounded-full border border-dark/30 bg-white px-3.5 py-2 text-xs font-bold text-dark/90 outline-none cursor-pointer focus:border-brand"
        >
          <option value="" disabled hidden>
            {selectPlaceholder}
          </option>
          {availableOptions.length === 0 ? (
            <option value="" disabled>
              {searchValue ? "No matching options" : "No more options"}
            </option>
          ) : (
            availableOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))
          )}
        </select>
      </div>

      {/* 🏷️ Active Selected Filter Badges */}
      {selectedValues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedValues.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleRemove(val)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-brand/90 transition-colors"
            >
              {val}
              <span>×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}