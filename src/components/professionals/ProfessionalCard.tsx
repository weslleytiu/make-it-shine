import React from "react";
import { Mail, Phone, MoreHorizontal, FileEdit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Professional } from "@/lib/schemas";

const DAYS_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<(typeof DAYS_ORDER)[number], string> = {
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
  sun: "S",
};

interface ProfessionalCardProps {
  professional: Professional;
  onEdit: (professional: Professional) => void;
  onDelete: (id: string) => void;
}

export function ProfessionalCard({ professional, onEdit, onDelete }: ProfessionalCardProps) {
  const availability = professional.availability as Record<string, boolean>;

  const statusStyles: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    vacation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    inactive: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="w-full overflow-hidden border-border/60 bg-card shadow-soft transition-shadow duration-200 hover:shadow-soft-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">{professional.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 rounded-lg"
                aria-label="Open menu"
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(professional)}>
                <FileEdit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => onDelete(professional.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Contact */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground/80" />
            <span className="truncate text-sm">{professional.email}</span>
          </div>
          {professional.phone && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground/80" />
              <span className="truncate text-sm">{professional.phone}</span>
            </div>
          )}
        </div>

        {/* Status & Rate */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[professional.status] ?? statusStyles.inactive}`}
          >
            {professional.status}
          </span>
          <span className="font-semibold text-foreground">£{professional.ratePerHour}/h</span>
        </div>

        {/* Availability */}
        <div className="flex gap-2">
          <TooltipProvider>
            {DAYS_ORDER.map((dayKey) => {
              const isAvailable = availability[dayKey];
              return (
                <Tooltip key={dayKey}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        isAvailable
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground/50"
                      }`}
                    >
                      {DAY_LABELS[dayKey]}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isAvailable ? "Available" : "Unavailable"}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
