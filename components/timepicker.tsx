"use client";

import { useState } from "react";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TimePicker({ value, onChange }: TimePickerProps) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}