// Simplified toast implementation
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

interface ToastContextType {
  toasts: ToasterToast[]
  toast: (props: Omit<ToasterToast, "id">) => void
  dismiss: (id?: string) => void
}

// Simplified toast implementation
const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

// Simple toast function that just shows an alert for now
function toast({ title, description, variant }: Omit<ToasterToast, "id">) {
  // In a real implementation, this would add a toast to the UI
  // For now, we'll just show an alert
  console.log(`Toast: ${variant === 'destructive' ? 'Error' : 'Info'} - ${title}${description ? `: ${description}` : ''}`);

  // Return a dummy object
  return {
    id: Math.random().toString(),
    dismiss: () => {},
    update: () => {},
  };
}

function useToast() {
  // This is a simplified implementation
  return {
    toasts: [],
    toast,
    dismiss: () => {},
  };
}

export { useToast, toast }
