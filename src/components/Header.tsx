import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
// home-icon.webp removed as per user request
import thaiCornerOrnament from "@/assets/thai-corner-ornament.png";

interface HeaderProps {
  icon?: string;
  iconAlt?: string;
}

/**
 * Level 1 Pure UI Shell with Level 2 live clock activation.
 * Initial render uses a static snapshot (no useEffect blocking paint).
 * After mount, setInterval ticks the clock every second.
 */

const getBangkokTime = () => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
  );
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
};

const Header = ({ icon, iconAlt = "Home" }: HeaderProps) => {
  const [time, setTime] = useState(getBangkokTime);

  // Level 2: Activate live ticking after mount
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getBangkokTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds } = time;
  const ampm = hours >= 12 ? "PM" : "AM";

  // Clock hand rotations
  const secondDeg = seconds * 6;
  const minuteDeg = (minutes + seconds / 60) * 6;
  const hourDeg = ((hours % 12) + minutes / 60) * 30;

  const romanNumbers = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  return (
    <header className="bg-primary relative overflow-hidden">
      {/* Thai Corner Ornament - Top Left */}
      <img
        src={thaiCornerOrnament}
        alt=""
        loading="lazy"
        className="absolute top-0 left-0 w-[120px] h-[120px] md:w-[180px] md:h-[180px] object-contain rotate-180 z-0"
      />
      
      {/* Right Thai corner ornament - mirrored */}
      <img
        src={thaiCornerOrnament}
        alt=""
        loading="lazy"
        className="absolute top-0 right-0 w-[120px] h-[120px] md:w-[180px] md:h-[180px] object-contain rotate-[-90deg] z-0"
      />

      {/* Desktop Layout - height 120px */}
      <div className="hidden md:block h-[120px] relative">
        <div 
          className="absolute top-1/2 flex items-center gap-4"
          style={{ 
            left: 'calc(50% - 3px)', 
            transform: 'translateX(-50%) translateY(-52%)' 
          }}
        >
          <Link to="/" aria-label="Back to Portal">
            <img
              src={logo}
              alt="IBB Service Logo"
              className="h-[100px] w-auto object-contain translate-y-[2px] hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>

          <div className="text-primary-foreground text-center">
            <h1 className="font-heading text-[1.6rem] lg:text-[1.8rem] xl:text-[2rem] font-bold tracking-normal">
              IBB Shuttle Service
            </h1>
            <p className="text-sm lg:text-base font-light mt-[3px]">
              Convenient and Reliable Shuttle
            </p>
          </div>

          {/* Clock - live ticking */}
          <div className="relative w-[100px] h-[100px] rounded-full border-[3px] border-primary-foreground bg-primary shadow-glow flex-shrink-0 ml-2 translate-y-[3px]">
            {romanNumbers.map((num, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const radius = 40;
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              return (
                <span
                  key={num}
                  className="absolute text-[0.4rem] font-bold text-primary-foreground"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {num}
                </span>
              );
            })}

            <div className="absolute top-[24px] left-1/2 -translate-x-1/2 text-[0.75rem] font-bold text-primary-foreground">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>

            <div className="absolute top-[58px] left-1/2 -translate-x-1/2 text-[0.55rem] font-bold text-primary-foreground">
              {ampm}
            </div>

            <div className="absolute top-[70px] left-1/2 -translate-x-1/2 text-[0.45rem] text-primary-foreground">
              GMT+7
            </div>

            <div className="absolute top-1/2 left-1/2 w-[4px] h-[4px] bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

            <div
              className="absolute bottom-1/2 left-1/2 w-[2px] h-[24px] bg-primary-foreground origin-bottom -translate-x-1/2 transition-transform duration-300"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />

            <div
              className="absolute bottom-1/2 left-1/2 w-[0.7px] h-[33px] bg-primary-foreground origin-bottom -translate-x-1/2 transition-transform duration-300"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />

            <div
              className="absolute bottom-1/2 left-1/2 w-[1.3px] h-[40px] bg-destructive origin-bottom -translate-x-1/2"
              style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Back to Portal">
            <img
              src={logo}
              alt="IBB Service Logo"
              className="h-[60px] sm:h-[74px] w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          <div className="text-primary-foreground space-y-1">
            <h1 className="font-heading text-[1rem] sm:text-[1.18rem] font-bold">IBB Shuttle Service</h1>
            <p className="text-[10px] sm:text-xs">Convenient and Reliable Shuttle</p>
          </div>
        </div>
        
        {/* Mobile Clock - live ticking */}
        <div className="relative w-[60px] h-[60px] sm:w-[75px] sm:h-[75px] rounded-full border-2 border-primary-foreground bg-primary shadow-glow flex-shrink-0">
          {romanNumbers.map((num, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const radius = 22;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            return (
              <span
                key={`mobile-${num}`}
                className="absolute text-[0.25rem] sm:text-[0.32rem] font-bold text-primary-foreground"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {num}
              </span>
            );
          })}

          <div className="absolute top-[12px] sm:top-[16px] left-1/2 -translate-x-1/2 text-[0.5rem] sm:text-[0.6rem] font-bold text-primary-foreground">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
          </div>

          <div className="absolute top-[34px] sm:top-[44px] left-1/2 -translate-x-1/2 text-[0.35rem] sm:text-[0.45rem] font-bold text-primary-foreground">
            {ampm}
          </div>

          <div className="absolute top-[43px] sm:top-[55px] left-1/2 -translate-x-1/2 text-[0.3rem] sm:text-[0.38rem] text-primary-foreground">
            GMT+7
          </div>

          <div className="absolute top-1/2 left-1/2 w-[2.5px] h-[2.5px] bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

          <div
            className="absolute bottom-1/2 left-1/2 w-[1.5px] h-[14px] sm:h-[18px] bg-primary-foreground origin-bottom -translate-x-1/2 transition-transform duration-300"
            style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
          />

          <div
            className="absolute bottom-1/2 left-1/2 w-[0.5px] h-[20px] sm:h-[25px] bg-primary-foreground origin-bottom -translate-x-1/2 transition-transform duration-300"
            style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
          />

          <div
              className="absolute bottom-1/2 left-1/2 w-[1px] h-[24px] sm:h-[30px] bg-destructive origin-bottom -translate-x-1/2"
              style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
