import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitas standar ShadCN untuk penggabungan kelas Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
