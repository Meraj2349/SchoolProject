import "@/styles/LottieLoader.css";

export default function LottieLoader({
  size = "small",
  text = "Loading…",
  showText = true,
  className = "",
  type = "dots",
}) {
  const sizeClass =
    { small: "lottie-small", medium: "lottie-medium", large: "lottie-large" }[
      size
    ] ?? "lottie-small";

  const animation =
    type === "spinner" ? (
      <div className="simple-spinner">
        <div className="spinner-ring" />
      </div>
    ) : type === "pulse" ? (
      <div className="pulse-loader">
        <div className="pulse-dot" />
      </div>
    ) : (
      <div className="dots-loader">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    );

  return (
    <div className={`lottie-loader-container ${sizeClass} ${className}`}>
      <div className="lottie-animation">{animation}</div>
      {showText && <span className="lottie-text">{text}</span>}
    </div>
  );
}
