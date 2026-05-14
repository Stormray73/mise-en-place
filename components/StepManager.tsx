/**
 * @file StepManager.tsx
 * @responsibility Manages the dynamic list of instructions and timers for a recipe.
 * @dependencies RecipeSaveData (types), Button, Input
 */

import { RecipeSaveData } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface StepManagerProps {
  steps: RecipeSaveData["steps"];
  onChange: (steps: RecipeSaveData["steps"]) => void;
}

export function StepManager({ steps, onChange }: StepManagerProps) {
  const addStep = () => {
    onChange([...steps, { order: steps.length + 1, instruction: "" }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
    onChange(newSteps);
  };

  const updateStep = (
    index: number,
    updates: Partial<RecipeSaveData["steps"][0]>,
  ) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    onChange(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
        <h3 className="text-xl font-semibold">Instructions</h3>
        <Button type="button" onClick={addStep} variant="ghost" size="sm">
          Add Step
        </Button>
      </div>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-none w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-sm">
              {step.order}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <textarea
                placeholder={`Instruction for step ${step.order}`}
                value={step.instruction}
                onChange={(e) => updateStep(i, { instruction: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none text-white"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">Timer (min):</label>
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="None"
                    value={
                      step.timerInSeconds
                        ? Math.floor(step.timerInSeconds / 60)
                        : ""
                    }
                    onChange={(e) => {
                      const mins = parseInt(e.target.value);
                      updateStep(i, {
                        timerInSeconds: isNaN(mins) ? null : mins * 60,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Remove Step ${step.order}`}
              onClick={() => removeStep(i)}
              className="text-zinc-500 hover:text-red-500 transition-colors text-2xl leading-none self-start"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
