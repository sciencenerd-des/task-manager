"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

// Format an epoch (local-midnight) timestamp for a <input type="date"> using
// local date parts — toISOString() would shift the day in +offset timezones.
function toLocalDateInput(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

interface CreateTaskDialogProps {
  projectId: Id<"projects">;
  defaultStatus: TaskStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({
  projectId,
  defaultStatus,
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createTask = useMutation(api.tasks.create);
  const parseText = useAction(api.tasks.parseText);
  const [nlText, setNlText] = useState("");
  const [parsing, setParsing] = useState(false);

  const handleAutofill = async () => {
    const text = nlText.trim();
    if (!text) return;
    setParsing(true);
    try {
      const parsed = await parseText({ text });
      if (parsed.title) setTitle(parsed.title);
      if (parsed.description) setDescription(parsed.description);
      setPriority(parsed.priority);
      setDueDate(parsed.dueDate ? toLocalDateInput(parsed.dueDate) : "");
    } catch (error) {
      console.error("Failed to parse task text:", error);
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status: defaultStatus,
        priority,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        projectId,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 rounded-md border border-dashed border-input p-3">
              <Label htmlFor="nl" className="flex items-center gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Describe it in plain English
              </Label>
              <Textarea
                id="nl"
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                placeholder={'e.g. "urgent: submit the GST return by friday"'}
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAutofill}
                disabled={parsing || !nlText.trim()}
              >
                {parsing ? "Parsing..." : "Autofill fields"}
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 py-2 px-3 text-xs font-medium rounded-md border transition-colors",
                      priority === p
                        ? "border-foreground bg-muted"
                        : "border-input hover:bg-muted/50"
                    )}
                    style={{
                      borderColor:
                        priority === p ? PRIORITY_COLORS[p] : undefined,
                    }}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
