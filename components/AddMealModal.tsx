/**
 * @file AddMealModal.tsx
 * @responsibility Modal for adding a new meal slot to a specific date.
 * @dependencies Modal, Button, Input, React
 */

import React, { useState } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const DEFAULT_SLOTS = ["Breakfast", "Lunch", "Dinner"];

interface AddMealModalProps {
  date: Date;
  onClose: () => void;
  onAdd: (date: Date, slot: string) => void;
}

export default function AddMealModal({
  date,
  onClose,
  onAdd,
}: AddMealModalProps) {
  const [customSlot, setCustomSlot] = useState("");

  return (
    <Modal title="Add Meal Slot" onClose={onClose}>
      <p className="text-zinc-400 text-sm mb-6">
        {date.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {DEFAULT_SLOTS.map((slot) => (
          <Button
            key={slot}
            onClick={() => onAdd(date, slot)}
            variant="ghost"
            className="py-6 text-lg"
          >
            {slot}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={customSlot}
          onChange={(e) => setCustomSlot(e.target.value)}
          placeholder="Custom Slot..."
        />
        <Button onClick={() => onAdd(date, customSlot)} disabled={!customSlot}>
          Add
        </Button>
      </div>
    </Modal>
  );
}
