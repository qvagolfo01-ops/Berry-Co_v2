"use client";

// 1. Define the props interface
type PriceRangeSliderProps = {
  minValue: string;
  maxValue: string;
  sliderValue: number;
  onMinChange: (val: string) => void;
  onMaxChange: (val: string) => void;
  onSliderChange: (val: number) => void;
};

// 2. Pass PriceRangeSliderProps to the component signature
export default function PriceRangeSlider({
  minValue,
  maxValue,
  sliderValue,
  onMinChange,
  onMaxChange,
  onSliderChange,
}: PriceRangeSliderProps) {
  return (
    <div className="rounded-2xl border border-dark/10 bg-cream p-4 space-y-3 text-dark">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-dark/80">
        Price Range
      </p>

      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max="500"
          value={sliderValue}
          onChange={(e) => {
            const val = Number(e.target.value);
            onSliderChange(val);
            onMaxChange(val.toString());
          }}
          className="w-full accent-brand cursor-pointer"
        />
        <p className="text-right text-[11px] font-bold text-dark">
          Max: ₱{sliderValue}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-dark/70">Min (₱)</label>
          <input
            type="number"
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder="0"
            className="w-full rounded-md border border-dark/40 bg-white px-2.5 py-1 text-xs font-bold text-dark outline-none"
          />
        </div>

        <span className="pt-4 text-xs font-bold text-dark">-</span>

        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-dark/70">Max (₱)</label>
          <input
            type="number"
            value={maxValue}
            onChange={(e) => {
              onMaxChange(e.target.value);
              if (e.target.value) onSliderChange(Number(e.target.value));
            }}
            placeholder="Any"
            className="w-full rounded-md border border-dark/40 bg-white px-2.5 py-1 text-xs font-bold text-dark outline-none"
          />
        </div>
      </div>
    </div>
  );
}