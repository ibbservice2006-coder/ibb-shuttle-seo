interface SplitColorTextProps {
  text: string;
  className?: string;
  leftColor?: string;
  rightColor?: string;
}

const SplitColorText = ({
  text,
  className = "",
  leftColor = "white",
  rightColor = "hsl(var(--gold))",
}: SplitColorTextProps) => {
  return (
    <span className={className}>
      {text.split("").map((char, i) =>
        char === " " ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <span
            key={i}
            className="inline-block bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${leftColor} 50%, ${rightColor} 50%)`,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
            }}
          >
            {char}
          </span>
        )
      )}
    </span>
  );
};

export default SplitColorText;
