"use client";

import { useState } from "react";

// DST adds 1 hour (3600 seconds) to the standard offset.
// supportsDst: true  — region observes Daylight Saving Time
// supportsDst: false — region does not observe DST (offset is fixed year-round)
const DST_OFFSET_SEC = 3600;

export interface Timezone {
  label: string;
  offsetSec: number;
  supportsDst: boolean;
}

export const TIMEZONES: Timezone[] = [
  { label: "GMT-12:00 — Baker Island, Howland Island",             offsetSec: -43200, supportsDst: false },
  { label: "GMT-11:00 — Samoa Standard Time (SST)",                offsetSec: -39600, supportsDst: false },
  { label: "GMT-10:00 — Hawaii-Aleutian Standard Time (HAST)",     offsetSec: -36000, supportsDst: false },
  { label: "GMT-09:30 — Marquesas Islands Time",                   offsetSec: -34200, supportsDst: false },
  { label: "GMT-09:00 — Alaska Standard Time (AKST)",              offsetSec: -32400, supportsDst: true  },
  { label: "GMT-08:00 — Pacific Standard Time (PST)",              offsetSec: -28800, supportsDst: true  },
  { label: "GMT-07:00 — Mountain Standard Time (MST)",             offsetSec: -25200, supportsDst: true  },
  { label: "GMT-06:00 — Central Standard Time (CST)",              offsetSec: -21600, supportsDst: true  },
  { label: "GMT-05:00 — Eastern Standard Time (EST)",              offsetSec: -18000, supportsDst: true  },
  { label: "GMT-04:00 — Atlantic Standard Time (AST)",             offsetSec: -14400, supportsDst: true  },
  { label: "GMT-03:30 — Newfoundland Standard Time (NST)",         offsetSec: -12600, supportsDst: true  },
  { label: "GMT-03:00 — Argentina / Brasilia Time (ART/BRT)",      offsetSec: -10800, supportsDst: false },
  { label: "GMT-02:00 — South Georgia Time (GST)",                 offsetSec:  -7200, supportsDst: false },
  { label: "GMT-01:00 — Azores Standard Time (AZOST)",             offsetSec:  -3600, supportsDst: true  },
  { label: "GMT+00:00 — Greenwich Mean Time (GMT) / UTC",          offsetSec:      0, supportsDst: false },
  { label: "GMT+01:00 — Central European Time (CET)",              offsetSec:   3600, supportsDst: true  },
  { label: "GMT+02:00 — Eastern European Time (EET)",              offsetSec:   7200, supportsDst: true  },
  { label: "GMT+03:00 — Moscow Standard Time (MSK)",               offsetSec:  10800, supportsDst: false },
  { label: "GMT+03:30 — Iran Standard Time (IRST)",                offsetSec:  12600, supportsDst: true  },
  { label: "GMT+04:00 — Gulf Standard Time (GST)",                 offsetSec:  14400, supportsDst: false },
  { label: "GMT+04:30 — Afghanistan Time (AFT)",                   offsetSec:  16200, supportsDst: false },
  { label: "GMT+05:00 — Pakistan Standard Time (PKT)",             offsetSec:  18000, supportsDst: false },
  { label: "GMT+05:30 — India Standard Time (IST)",                offsetSec:  19800, supportsDst: false },
  { label: "GMT+05:45 — Nepal Time (NPT)",                         offsetSec:  20700, supportsDst: false },
  { label: "GMT+06:00 — Bangladesh Standard Time (BST)",           offsetSec:  21600, supportsDst: false },
  { label: "GMT+06:30 — Myanmar Time (MMT)",                       offsetSec:  23400, supportsDst: false },
  { label: "GMT+07:00 — Indochina Time (ICT)",                     offsetSec:  25200, supportsDst: false },
  { label: "GMT+08:00 — China Standard Time (CST) / Singapore (SGT)", offsetSec: 28800, supportsDst: false },
  { label: "GMT+08:45 — Aus. Central Western Standard Time (ACWST)", offsetSec: 31500, supportsDst: false },
  { label: "GMT+09:00 — Japan Standard Time (JST) / Korea (KST)", offsetSec:  32400, supportsDst: false },
  { label: "GMT+09:30 — Australian Central Standard Time (ACST)",  offsetSec:  34200, supportsDst: true  },
  { label: "GMT+10:00 — Australian Eastern Standard Time (AEST)",  offsetSec:  36000, supportsDst: true  },
  { label: "GMT+10:30 — Lord Howe Standard Time (LHST)",           offsetSec:  37800, supportsDst: true  },
  { label: "GMT+11:00 — Solomon Islands Time (SBT)",               offsetSec:  39600, supportsDst: false },
  { label: "GMT+12:00 — New Zealand Standard Time (NZST)",         offsetSec:  43200, supportsDst: true  },
  { label: "GMT+12:45 — Chatham Islands Standard Time (CHAST)",    offsetSec:  45900, supportsDst: true  },
  { label: "GMT+13:00 — Tonga Time (TOT)",                         offsetSec:  46800, supportsDst: false },
  { label: "GMT+14:00 — Line Islands Time (LINT)",                 offsetSec:  50400, supportsDst: false },
];

interface TimezoneSelectProps {
  /** The base (standard time) offset in seconds. The component manages DST internally. */
  value?: number;
  /** Whether DST is on (controlled). Omit to let the component manage it internally. */
  dst?: boolean;
  /**
   * Called whenever the timezone or DST toggle changes.
   * offsetSec is the effective offset (standard + DST if active).
   * dst indicates whether DST is currently applied.
   */
  onChange?: (offsetSec: number, dst: boolean) => void;
  /** Wrapper div className */
  className?: string;
  /** Select element className */
  selectClassName?: string;
  id?: string;
  name?: string;
}

export default function TimezoneSelect({
  value,
  dst,
  onChange,
  className = "",
  selectClassName = "",
  id,
  name,
}: TimezoneSelectProps) {
  const [baseOffset, setBaseOffset] = useState<number>(value ?? 0);
  const [dstEnabled, setDstEnabled] = useState<boolean>(dst ?? false);

  const isDstControlled = dst !== undefined;
  const isDstOn = isDstControlled ? dst : dstEnabled;

  // Always look up by the base (standard) offset
  const activeBase = value !== undefined ? value : baseOffset;
  const activeTz = TIMEZONES.find((tz) => tz.offsetSec === activeBase);
  const dstApplicable = activeTz?.supportsDst ?? false;

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBase = Number(e.target.value);
    const newTz = TIMEZONES.find((tz) => tz.offsetSec === newBase);
    // Reset DST if the new timezone doesn't support it
    const effectiveDst = isDstOn && (newTz?.supportsDst ?? false);
    if (!isDstControlled) setBaseOffset(newBase);
    if (!isDstControlled) setDstEnabled(effectiveDst);
    onChange?.(newBase + (effectiveDst ? DST_OFFSET_SEC : 0), effectiveDst);
  };

  const handleDstToggle = () => {
    if (!dstApplicable) return;
    const next = !isDstOn;
    if (!isDstControlled) setDstEnabled(next);
    onChange?.(activeBase + (next ? DST_OFFSET_SEC : 0), next);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 ${className}`}>
      <select
        id={id}
        name={name}
        value={activeBase}
        onChange={handleTimezoneChange}
        className={`flex-1 min-w-0 px-4 py-2.5 text-base text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all ${selectClassName}`}
      >
        {TIMEZONES.map((tz) => (
          <option key={tz.offsetSec} value={tz.offsetSec}>
            {tz.label}
          </option>
        ))}
      </select>

      <label
        title={
          dstApplicable
            ? "Toggle Daylight Saving Time (+1 hour)"
            : "This timezone does not observe DST"
        }
        className={`flex items-center justify-center gap-2 select-none text-sm font-medium whitespace-nowrap px-4 py-2.5 rounded-lg border transition-all ${
          dstApplicable
            ? "cursor-pointer text-slate-700 border-slate-300 bg-white hover:bg-slate-50 shadow-sm"
            : "cursor-not-allowed text-slate-400 border-slate-200 bg-slate-50 opacity-70"
        }`}
      >
        <input
          type="checkbox"
          checked={isDstOn && dstApplicable}
          onChange={handleDstToggle}
          disabled={!dstApplicable}
          className={`w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 ${
            dstApplicable ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        />
        <span>DST</span>
        {dstApplicable && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ml-1 ${
            isDstOn ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
          }`}>
            +1h
          </span>
        )}
      </label>
    </div>
  );
}