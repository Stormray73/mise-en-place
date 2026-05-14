/**
 * @file CloneMealModal.tsx
 * @responsibility Modal for cloning a meal to a different date within the current week.
 * @dependencies Modal, Button, React
 */

import React from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";

interface CloneMealModalProps {
  mealId: string;
  days: Date[];
  onClose: () => void;
  onClone: (mealId: string, targetDate: Date) => void;
}

export default function CloneMealModal({
  mealId,
  days,
  onClose,
  onClone,
}: CloneMealModalProps) {
  return (
    <Modal title="Clone Meal to Date" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {days.map((day) => (
          <Button
            key={day.toISOString()}
            onClick={() => onClone(mealId, day)}
            variant="ghost"
            className="py-6 text-xs"
          >
            {day.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Button>
        ))}
      </div>
    </Modal>
  );
}
