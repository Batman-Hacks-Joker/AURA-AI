"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Button } from "./button";
import { Progress } from "./progress";
import { useState, useEffect } from "react";

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, onUndo, duration, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            {onUndo && (
              <Button variant="outline" size="sm" onClick={() => onUndo()}>
                Undo
              </Button>
            )}
            <ToastClose />
            {duration && <ToastProgress duration={duration} />}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}


function ToastProgress({ duration }: { duration: number }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const interval = 100; // update every 100ms
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const newProgress = 100 - (currentStep / steps) * 100;
        setProgress(newProgress);
        if (newProgress <= 0) {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [duration]);

  return <Progress value={progress} className="absolute bottom-0 left-0 right-0 h-1 rounded-none" />;
}