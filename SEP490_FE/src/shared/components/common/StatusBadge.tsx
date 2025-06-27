import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { APPOINTMENT_STATUS } from "@/shared/constants/app";

type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = "md",
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case APPOINTMENT_STATUS.SCHEDULED:
      case "scheduled":
        return {
          label: "Đã lên lịch",
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        };

      case APPOINTMENT_STATUS.CONFIRMED:
      case "confirmed":
        return {
          label: "Đã xác nhận",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };

      case APPOINTMENT_STATUS.IN_PROGRESS:
      case "in-progress":
      case "in_progress":
        return {
          label: "Đang thực hiện",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        };

      case APPOINTMENT_STATUS.COMPLETED:
      case "completed":
        return {
          label: "Hoàn thành",
          variant: "default" as const,
          className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        };

      case APPOINTMENT_STATUS.CANCELLED:
      case "cancelled":
        return {
          label: "Đã hủy",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        };

      case APPOINTMENT_STATUS.NO_SHOW:
      case "no-show":
      case "no_show":
        return {
          label: "Không đến",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };

      // Medical Record Status
      case "draft":
        return {
          label: "Bản nháp",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800",
        };

      case "active":
        return {
          label: "Hoạt động",
          variant: "default" as const,
          className: "bg-green-100 text-green-800",
        };

      case "inactive":
        return {
          label: "Ngưng hoạt động",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800",
        };

      // Payment Status
      case "paid":
        return {
          label: "Đã thanh toán",
          variant: "default" as const,
          className: "bg-green-100 text-green-800",
        };

      case "unpaid":
        return {
          label: "Chưa thanh toán",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800",
        };

      case "partial":
        return {
          label: "Thanh toán một phần",
          variant: "secondary" as const,
          className: "bg-orange-100 text-orange-800",
        };

      // Priority Status
      case "high":
        return {
          label: "Cao",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800",
        };

      case "medium":
        return {
          label: "Trung bình",
          variant: "default" as const,
          className: "bg-orange-100 text-orange-800",
        };

      case "low":
        return {
          label: "Thấp",
          variant: "secondary" as const,
          className: "bg-green-100 text-green-800",
        };

      default:
        return {
          label: status,
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(sizeClasses[size], config.className, className)}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
