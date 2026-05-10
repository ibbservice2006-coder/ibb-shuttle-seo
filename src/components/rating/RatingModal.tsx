import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/ibb/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  driverId: string;
  customerId?: string;
  guestUserId?: string;
  driverName?: string;
  onRatingSubmitted?: () => void;
}

const translations = {
  en: {
    title: "Rate Your Trip",
    description: "How was your experience with",
    placeholder: "Share your experience (optional)",
    submit: "Submit Rating",
    submitting: "Submitting...",
    success: "Thank you for your feedback!",
    error: "Failed to submit rating",
    ratingRequired: "Please select a rating"
  },
  th: {
    title: "ให้คะแนนทริปของคุณ",
    description: "ประสบการณ์ของคุณกับ",
    placeholder: "แชร์ประสบการณ์ของคุณ (ไม่บังคับ)",
    submit: "ส่งคะแนน",
    submitting: "กำลังส่ง...",
    success: "ขอบคุณสำหรับความคิดเห็น!",
    error: "ไม่สามารถส่งคะแนนได้",
    ratingRequired: "กรุณาเลือกคะแนน"
  }
};

const RatingModal = ({
  isOpen,
  onClose,
  bookingId,
  driverId,
  customerId,
  guestUserId,
  driverName,
  onRatingSubmitted
}: RatingModalProps) => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t.ratingRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        driver_id: driverId,
        customer_id: customerId || null,
        guest_user_id: guestUserId || null,
        rating,
        comment: comment.trim() || null
      });

      if (error) throw error;

      // Update driver's average rating
      await updateDriverRating(driverId);

      toast.success(t.success);
      onRatingSubmitted?.();
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDriverRating = async (driverId: string) => {
    try {
      // Get all reviews for this driver
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("driver_id", driverId);

      if (error) throw error;

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        
        await supabase
          .from("drivers")
          .update({ rating: Math.round(avgRating * 10) / 10 })
          .eq("id", driverId);
      }
    } catch (error) {
      console.error("Error updating driver rating:", error);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`h-10 w-10 ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{t.title}</DialogTitle>
          <DialogDescription className="text-center">
            {t.description} {driverName || "your driver"}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {renderStars()}
          
          <Textarea
            placeholder={t.placeholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="w-full"
          >
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
