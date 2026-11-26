import React, { useState, useRef, useEffect } from "react";
import styles from "./DateTimePicker.module.css";
import { format, setHours, setMinutes } from "date-fns";
import { FaCalendarAlt, FaTimes, FaChevronDown } from "react-icons/fa";

// Choose one of these approaches:

// APPROACH 1: Use react-day-picker with minimal overrides
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Import base styles

// APPROACH 2: Use react-aria components (more modern, better a11y)
// import { DatePicker, TimeField } from "react-aria-components";
// import { Calendar } from "react-aria-components";

export default function DateTimePicker({
                                         value,
                                         onChange,
                                         minDate,
                                         maxDate,
                                         open,
                                         onOpenChange,
                                         placeholder = "Select date & time",
                                         timeStepMinutes = 15,
                                         desktopShift = 0, // NEW: Shift amount in pixels
                                         shiftBreakpoint = 768, // NEW: Breakpoint for when to apply shift
                                         dateOnly = false // NEW: hide the time-of-day selector
                                       }) {
  const [openState, setOpenState] = useState(false);
  const isControlled = typeof open !== "undefined";
  const isOpen = isControlled ? open : openState;
  const pickerRef = useRef(null);

  // Detect screen size for conditional shift
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= shiftBreakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= shiftBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shiftBreakpoint]);

  // Click outside handler
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!pickerRef.current) return;
      if (isOpen && !pickerRef.current.contains(e.target)) {
        if (isControlled) onOpenChange && onOpenChange(false);
        else setOpenState(false);
      }
    };

    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Escape") {
        if (isControlled) onOpenChange && onOpenChange(false);
        else setOpenState(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isControlled, onOpenChange]);

  const handleDateSelect = (date) => {
    if (!date) {
      onChange(null);
      return;
    }

    if (value) {
      onChange(
          setMinutes(
              setHours(date, value.getHours()),
              value.getMinutes()
          )
      );
    } else {
      const now = new Date();
      onChange(setMinutes(setHours(date, now.getHours()), Math.floor(now.getMinutes() / timeStepMinutes) * timeStepMinutes));
    }
  };

  const handleHourChange = (hour) => {
    if (!value) {
      const newDate = new Date();
      newDate.setHours(hour);
      newDate.setMinutes(0);
      onChange(newDate);
      return;
    }
    onChange(setHours(value, hour));
  };

  const handleMinuteChange = (minute) => {
    if (!value) {
      const newDate = new Date();
      newDate.setHours(newDate.getHours());
      newDate.setMinutes(minute);
      onChange(newDate);
      return;
    }
    onChange(setMinutes(value, minute));
  };

  const handleTimePreset = (hours, minutes) => {
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    onChange(newDate);
  };

  // Time presets
  const timePresets = [
    { label: "Morning", time: [9, 0] },
    { label: "Noon", time: [12, 0] },
    { label: "Afternoon", time: [15, 0] },
    { label: "Evening", time: [18, 0] },
    { label: "Now", time: [new Date().getHours(), Math.floor(new Date().getMinutes() / timeStepMinutes) * timeStepMinutes] }
  ];

  return (
      <div
          className={styles.container}
          ref={pickerRef}

      >
        {/* Trigger Input */}
        <div
            className={`${styles.inputWrapper} ${isOpen ? styles.inputWrapperActive : ''}`}
            onClick={(e) => {
              e.preventDefault();
              isControlled ? onOpenChange && onOpenChange(!isOpen) : setOpenState(v => !v);
            }}
            role="button"
            aria-label={placeholder}
            aria-expanded={isOpen}
            tabIndex={0}
        >
          <div className={styles.inputContent}>
            <FaCalendarAlt className={styles.inputIcon} />
            <span className={styles.inputText}>
            {value ? format(value, dateOnly ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm") : placeholder}
          </span>
          </div>
          <div className={styles.inputActions}>
            {value && (
                <button
                    type="button"
                    className={styles.clearButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(null);
                    }}
                    aria-label="Clear date"
                >
                  <FaTimes />
                </button>
            )}
            <FaChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ''}`} />
          </div>
        </div>

        {/* Calendar Overlay - Using Library's Styling */}
        {isOpen && (
            <div
                className={styles.calendarOverlay}
                style={isDesktop && desktopShift ? {
                  left: `-${desktopShift}px`,
                  transform: `translateX(-${desktopShift}px)`
                } : {}}

            >
              <div className={styles.calendarContent}>

                {/* React Day Picker - Let it use its own styles */}
                <DayPicker
                    mode="single"
                    selected={value ?? undefined}
                    onSelect={handleDateSelect}
                    disabled={[
                      minDate ? { before: minDate } : null,
                      maxDate ? { after: maxDate } : null
                    ].filter(Boolean)}
                    showOutsideDays
                    className={styles.dayPicker} // Only minimal positioning styles
                    captionLayout="dropdown-buttons"
                />

                {/* Time Selection */}
                {!dateOnly && (
                <div className={styles.timeSection}>
                  <div className={styles.timeSectionHeader}>
                    <h4>Select Time</h4>
                  </div>

                  {/* Quick Presets */}
                  <div className={styles.timePresets}>
                    {timePresets.map((preset, idx) => (
                        <button
                            key={idx}
                            className={styles.timePreset}
                            onClick={() => handleTimePreset(...preset.time)}
                        >
                          {preset.label}
                        </button>
                    ))}
                  </div>

                  {/* Custom Time Inputs */}
                  <div className={styles.timeInputs}>
                    <div className={styles.timeInputGroup}>
                      <label>Hour</label>
                      <select
                          value={value ? value.getHours() : new Date().getHours()}
                          onChange={(e) => handleHourChange(Number(e.target.value))}
                          className={styles.timeSelect}
                      >
                        {[...Array(24)].map((_, h) => (
                            <option key={h} value={h}>
                              {String(h).padStart(2, '0')}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.timeSeparator}>:</div>

                    <div className={styles.timeInputGroup}>
                      <label>Minute</label>
                      <select
                          value={value ? Math.floor(value.getMinutes() / timeStepMinutes) * timeStepMinutes : 0}
                          onChange={(e) => handleMinuteChange(Number(e.target.value))}
                          className={styles.timeSelect}
                      >
                        {Array.from(
                            { length: Math.floor(60 / timeStepMinutes) },
                            (_, i) => i * timeStepMinutes
                        ).map(m => (
                            <option key={m} value={m}>
                              {String(m).padStart(2, '0')}
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                )}

                {/* Footer */}
                <div className={styles.calendarFooter}>
                  <button
                      className={styles.cancelButton}
                      onClick={() => {
                        isControlled ? onOpenChange && onOpenChange(false) : setOpenState(false);
                      }}
                  >
                    Cancel
                  </button>
                  <button
                      className={styles.applyButton}
                      onClick={() => {
                        isControlled ? onOpenChange && onOpenChange(false) : setOpenState(false);
                      }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}