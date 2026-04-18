export default function LottieLoader({
  size = "small",
  text = "Loading…",
  showText = true,
  className = "",
  type = "dots",
}) {
  const sizeMap = {
    small: { anim: "w-10 h-10", text: "text-xs" },
    medium: { anim: "w-15 h-15", text: "text-sm" },
    large: { anim: "w-20 h-20", text: "text-base" },
  };
  const sizes = sizeMap[size] ?? sizeMap.small;

  const animation =
    type === "spinner" ? (
      <div className="flex items-center justify-center w-full h-full">
        <div
          className="rounded-full border-2 border-[rgba(102,126,234,0.3)] border-t-[#667eea] animate-spin"
          style={{ width: 24, height: 24 }}
        />
      </div>
    ) : type === "pulse" ? (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 bg-[#667eea] rounded-full animate-pulse" />
      </div>
    ) : (
      <div className="flex gap-1.5 items-center justify-center">
        <style>{`
          @keyframes dotBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
          .dot-bounce { animation: dotBounce 1.4s infinite ease-in-out; }
          .dot-bounce-1 { animation-delay: -0.32s; }
          .dot-bounce-2 { animation-delay: -0.16s; }
          .dot-bounce-3 { animation-delay: 0s; }
        `}</style>
        <div className="w-2.5 h-2.5 bg-[#667eea] rounded-full dot-bounce dot-bounce-1" />
        <div className="w-2.5 h-2.5 bg-[#667eea] rounded-full dot-bounce dot-bounce-2" />
        <div className="w-2.5 h-2.5 bg-[#667eea] rounded-full dot-bounce dot-bounce-3" />
      </div>
    );

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-lg ${className}`}
    >
      <div
        className={`flex items-center justify-center relative ${sizes.anim}`}
      >
        {animation}
      </div>
      {showText && (
        <span className={`${sizes.text} text-gray-500 font-medium text-center`}>
          {text}
        </span>
      )}
    </div>
  );
}
