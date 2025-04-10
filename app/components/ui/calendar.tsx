import * as React from "react";

const Calendar = ({
  selectedDate,
  onChange,
}: {
  selectedDate?: Date; // Make it optional
  onChange: (date: Date) => void;
}) => {
  return (
    <input
      type="date"
      value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
      onChange={(e) => {
        if (e.target.value) {
          onChange(new Date(e.target.value));
        }
      }}
      className="px-3 py-2 border rounded-md w-full"
    />
  );
};

export { Calendar };
