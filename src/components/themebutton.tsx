"use client";
import { useTheme } from "next-themes";
import Image from "next/image";

type ThemeButtonProps = {
  className?: string;
};

const ThemeButton = ({ className = "" }: ThemeButtonProps) => {
  const { setTheme, theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex items-center justify-center w-10 h-10 bg-b-surface2 rounded-full cursor-pointer transition-all hover:shadow-md ${className}`}
    >
      <Image
        src={"/sun.2.png"}
        alt={"img"}
        className="w-7 h-7 object-contain  dark:invert-100 transition-transform duration-300"
        width={28}
        height={28}
      />
    </div>
  );
};

export default ThemeButton;
