import {
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";

const iconMap = {
  success: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
  info: <InformationCircleIcon className="h-5 w-5 text-blue-600" />,
  warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />,
  error: <ExclamationCircleIcon className="h-5 w-5 text-red-600" />,
  increase: <PlusCircleIcon className="h-5 w-5 text-green-600" />,
  decrease: <MinusCircleIcon className="h-5 w-5 text-red-500" />,
};

const bgMap = {
  success: "bg-green-50 text-green-700 border-green-500",
  info: "bg-blue-50 text-blue-700 border-blue-500",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-500",
  error: "bg-red-50 text-red-700 border-red-500",
  increase: "bg-green-50 text-green-700 border-green-500",
  decrease: "bg-red-50 text-red-700 border-red-500",
};

export default function CustomToast({
  type,
  message,
  toast: _t,
}: {
  type: "success" | "info" | "warning" | "error" | "increase" | "decrease";
  message: string;
  toast: any;
}) {
  return (
    <div
      className={`flex items-center gap-3 w-full max-w-xs rounded-xl px-4 py-3 shadow-xl
        backdrop-blur-md bg-opacity-80 border-l-4 ${bgMap[type]} animate-[fadeIn_0.3s_ease-out]`}
      style={{
        fontSize: "0.85rem",
        lineHeight: "1.25rem",
        marginBottom: "8px",
        borderLeftColor: "currentColor",
      }}
    >
      <div className="flex items-center">{iconMap[type]}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
    </div>
  );
}
