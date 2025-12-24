"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./Options.module.css";

export default function Options({
  options = ["Option 1", "Option 2", "Option 3", "Option 4"],
  storageKey = "selectedOption",
}: {
  options?: string[];
  storageKey?: string;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (saved !== null) setSelectedOption(saved);
  }, [storageKey]);

  const handleOptionClick = useCallback(
    (option: string) => {
      setSelectedOption(option);
      try {
        window.localStorage.setItem(storageKey, option);
      } catch {
        /* ignore storage errors */
      }
    },
    [storageKey]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, option: string) => {
      const key = e.key || (e as any).code;
      if (key === "Enter" || key === " " || key === "Spacebar" || key === "Space") {
        e.preventDefault();
        handleOptionClick(option);
      }
    },
    [handleOptionClick]
  );

  const memoOptions = useMemo(() => options, [options]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Options</h1>
      <div>
        {memoOptions.map((opt) => {
          const isSelected = selectedOption === opt;
          const className = `${styles.button} ${isSelected ? styles.selected : selectedOption ? styles.faded : ""}`;

          return (
            <button
              key={opt}
              className={className}
              onClick={() => handleOptionClick(opt)}
              onKeyDown={(e) => handleKeyDown(e, opt)}
              aria-pressed={isSelected}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selectedOption ? (
        <p style={{ marginTop: 8, color: "#374151" }}>
          Selected: <strong>{selectedOption}</strong>
        </p>
      ) : (
        <p style={{ marginTop: 8, color: "#6b7280" }}>No selection yet</p>
      )}
    </div>
  );
}