import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";

export interface ServiceCardProps {
  href: string;
  isExternal?: boolean;
  image: string;
  icon: React.ReactNode;
  title: string;
  titleLine2: string;
  description: string;
  features: { icon: React.ReactNode; text: string }[];
  ctaText: string;
}

const hoverAnimation = {
  scale: 1.05,
  y: -15,
  boxShadow: "0 40px 80px rgba(191, 149, 63, 0.4), 0 0 40px rgba(191, 149, 63, 0.2)",
  transition: { type: "spring" as const, stiffness: 300, damping: 20 },
};

const tapAnimation = { scale: 0.98 };

const ServiceCard = ({ href, isExternal, image, icon, title, titleLine2, description, features, ctaText }: ServiceCardProps) => {
  const CardContent = () => (
    <div className="h-full w-full bg-[#162032] flex flex-col relative rounded-[42px] overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[130px] h-8 bg-black rounded-b-[18px] z-20" />
      <div 
        className="h-[40%] w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url('${image}')` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-5 left-6">
          <div className="text-yellow-400 mb-2">{icon}</div>
          <h2 className="text-3xl font-bold text-white leading-none tracking-wide mt-2">
            {title}<br />{titleLine2}
          </h2>
        </div>
        {isExternal && (
          <div className="absolute top-10 right-6 text-white/50">
            <ExternalLink size={20} />
          </div>
        )}
      </div>
      <div className="flex-1 p-8 flex flex-col">
        <p className="text-gray-300 text-base mb-6 leading-relaxed">{description}</p>
        <div className="space-y-5">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-gray-400 text-base">
              <div className="w-8 text-yellow-500">{feature.icon}</div>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] bg-clip-text text-transparent">
            {ctaText}
          </span>
          <ArrowRight className="text-[#bf953f]" size={20} />
        </div>
      </div>
    </div>
  );

  const frameClass = "block w-[320px] md:w-[380px] h-[620px] md:h-[720px] rounded-[50px] p-[8px] bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] via-[#b38728] to-[#aa771c] shadow-[0_25px_60px_rgba(0,0,0,0.6)]";

  if (isExternal) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={frameClass}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
      >
        <CardContent />
      </motion.a>
    );
  }

  const MotionLink = motion(Link);
  return (
    <MotionLink to={href} className={frameClass} whileHover={hoverAnimation} whileTap={tapAnimation}>
      <CardContent />
    </MotionLink>
  );
};

export default ServiceCard;
