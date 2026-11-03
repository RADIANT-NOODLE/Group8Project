import "./DateRangeFilter.css";

/*
=========================================================
DATE RANGE FILTER

A "Date submitted" filter for record lists: quick presets
plus a custom From / To range. Pages keep the value in state
and filter their records with inDateRange().

    const [dateRange, setDateRange] = useState(ALL_DATES);
    <DateRangeFilter id="complaints-date" value={dateRange} onChange={setDateRange} />
    records.filter((record) => inDateRange(record.createdAt, dateRange));
=========================================================
*/

export const ALL_DATES = Object.freeze({ preset: "all", from: "", to: "" });

const PRESETS = [
    { value: "all", label: "All time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "month", label: "This month" },
    { value: "custom", label: "Custom range" },
];

const DAY = 24 * 60 * 60 * 1000;

/** The [start, end] timestamps a range covers, or null for "all time". */
function bounds(range) {
    const now = new Date();

    switch (range?.preset) {
        case "7d":
            return [now.getTime() - 7 * DAY, Infinity];
        case "30d":
            return [now.getTime() - 30 * DAY, Infinity];
        case "month":
            return [new Date(now.getFullYear(), now.getMonth(), 1).getTime(), Infinity];
        case "custom": {
            // dates from <input type="date"> are local days; include the whole "to" day
            const start = range.from ? new Date(`${range.from}T00:00:00`).getTime() : -Infinity;
            const end = range.to ? new Date(`${range.to}T23:59:59.999`).getTime() : Infinity;
            return [start, end];
        }
        default:
            return null;
    }
}

export function isDateFilterActive(range) {
    if (!range || range.preset === "all") return false;
    if (range.preset === "custom") return Boolean(range.from || range.to);
    return true;
}

/** Does a record dated `value` fall inside `range`? Undated records only show for "all time". */
export function inDateRange(value, range) {
    const limits = bounds(range);
    if (!limits) return true;

    const time = new Date(value).getTime();
    if (!value || Number.isNaN(time)) return false;

    return time >= limits[0] && time <= limits[1];
}

export default function DateRangeFilter({ id, value = ALL_DATES, onChange, label = "Date submitted" }) {
    const range = value || ALL_DATES;
    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
    ].join("-");

    return (
        <div className="date-range-filter">
            <div className="date-range-field">
                <label htmlFor={`${id}-preset`}>{label}</label>
                <select
                    id={`${id}-preset`}
                    value={range.preset}
                    onChange={(event) => onChange({ ...range, preset: event.target.value })}
                >
                    {PRESETS.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                            {preset.label}
                        </option>
                    ))}
                </select>
            </div>

            {range.preset === "custom" && (
                <>
                    <div className="date-range-field">
                        <label htmlFor={`${id}-from`}>From</label>
                        <input
                            id={`${id}-from`}
                            type="date"
                            value={range.from}
                            max={range.to || today}
                            onChange={(event) => onChange({ ...range, from: event.target.value })}
                        />
                    </div>
                    <div className="date-range-field">
                        <label htmlFor={`${id}-to`}>To</label>
                        <input
                            id={`${id}-to`}
                            type="date"
                            value={range.to}
                            min={range.from || undefined}
                            max={today}
                            onChange={(event) => onChange({ ...range, to: event.target.value })}
                        />
                    </div>
                </>
            )}

            {isDateFilterActive(range) && (
                <button type="button" className="date-range-clear" onClick={() => onChange(ALL_DATES)}>
                    Clear dates
                </button>
            )}
        </div>
    );
}
