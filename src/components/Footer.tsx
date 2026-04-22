import facebookIcon from "@/assets/icons/facebook.png";
import wechatIcon from "@/assets/icons/wechat.png";
import lineIcon from "@/assets/icons/line.png";
import whatsappIcon from "@/assets/icons/whatsapp.png";
import instagramIcon from "@/assets/icons/instagram.png";
import kakaotalkIcon from "@/assets/icons/kakaotalk.png";
import messengerIcon from "@/assets/icons/messenger-new.png";
import telegramIcon from "@/assets/icons/telegram.png";
import thaiOrnament from "@/assets/thai-corner-ornament.png";
import { useLevel2Language } from "@/hooks/useLevel2Language";

const socialLinks = [
  { name: "Facebook", icon: facebookIcon, url: "https://facebook.com" },
  { name: "WeChat", icon: wechatIcon, url: "https://wechat.com" },
  { name: "Line", icon: lineIcon, url: "https://line.me" },
  { name: "WhatsApp", icon: whatsappIcon, url: "https://whatsapp.com" },
  { name: "Instagram", icon: instagramIcon, url: "https://instagram.com" },
  { name: "KakaoTalk", icon: kakaotalkIcon, url: "https://www.kakaocorp.com/page/service/service/KakaoTalk" },
  { name: "Messenger", icon: messengerIcon, url: "https://www.messenger.com" },
  { name: "Telegram", icon: telegramIcon, url: "https://telegram.org" },
];

const Footer = () => {
  const { t } = useLevel2Language();

  return (
    <footer id="contact" className="bg-primary py-10 md:py-12 relative overflow-hidden">
      <img
        src={thaiOrnament}
        alt=""
        loading="lazy"
        className="absolute bottom-0 left-0 w-[120px] h-[120px] md:w-[180px] md:h-[180px] object-contain scale-x-[-1] z-0"
      />
      <img
        src={thaiOrnament}
        alt=""
        loading="lazy"
        className="absolute bottom-0 right-0 w-[120px] h-[120px] md:w-[180px] md:h-[180px] object-contain z-0"
      />

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="space-y-2 mb-6">
          <p className="text-primary-foreground text-sm md:text-base">
            5 Soi Takham 20 Yaek 8 Takham Road Bangkuntien Bangkok Thailand 10150
          </p>
          <p className="text-primary-foreground text-sm md:text-base">
            Phone: <a href="tel:+66661654629" className="hover:underline">+66-66-165-4629</a> |
            Email: <a href="mailto:support@ibbshuttleservice.com" className="hover:underline">support@ibbshuttleservice.com</a>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden hover:scale-110 transition-transform duration-300 animate-bounce-hover"
              aria-label={social.name}
            >
              <img
                src={social.icon}
                alt={social.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>

        <p className="text-primary-foreground/80 text-sm">
          © {new Date().getFullYear()} {t('footer.copyright', 'IBB Shuttle Service. All rights reserved.')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
