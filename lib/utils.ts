import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskFullName(fullName: string | null | undefined): string {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts.map(part => part[0]?.toUpperCase() + ".").join("");
}
