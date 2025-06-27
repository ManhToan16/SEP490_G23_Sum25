import React from "react";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  text = "Đang tải...",
  size = "md",
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: { spinner: "h-6 w-6", dot: "h-2 w-2", text: "text-sm" },
    md: { spinner: "h-10 w-10", dot: "h-2.5 w-2.5", text: "text-base" },
    lg: { spinner: "h-16 w-16", dot: "h-3 w-3", text: "text-lg" },
  };

  const { spinner, dot, text: textSize } = sizeMap[size];

  const spinnerStyle =
    "animate-spin rounded-full border-4 border-t-blue-600 border-b-green-400 border-l-blue-400 border-r-green-600 bg-transparent";

  const content = (
    <div className="flex flex-col items-center justify-center">
      {/* Spinner with animated dot in center */}
      <div className={`relative ${spinner}`}>
        <div className={`${spinnerStyle} w-full h-full`} />
        {/* Center dot */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div
            className={`bg-blue-500 animate-pulse rounded-full ${dot}`}
            style={{ animationDuration: "1.2s" }}
          />
        </div>
      </div>
      {text && (
        <p
          className={`mt-4 text-slate-600 font-medium ${textSize} text-center`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-8">{content}</div>;
};

export default Loading;
