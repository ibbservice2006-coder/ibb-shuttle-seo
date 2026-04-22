import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User, Car, Phone, Star } from 'lucide-react';

interface TrackingInfoProps {
  booking: {
    bookingNumber: string;
    status: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDatetime: string;
    passengerCount: number;
    vehicleType: string;
    guestName?: string;
  };
  vehicle?: {
    licensePlate?: string;
    brand?: string;
    model?: string;
  } | null;
  driver?: {
    name: string;
    phone: string;
    rating: number;
  } | null;
  eta?: string | null;
  lastUpdate?: string | null;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'รอดำเนินการ', variant: 'secondary' },
  pending_payment: { label: 'รอชำระเงิน', variant: 'secondary' },
  pending_assignment: { label: 'รอจัดรถ', variant: 'secondary' },
  confirmed: { label: 'ยืนยันแล้ว', variant: 'default' },
  assigned: { label: 'จัดรถแล้ว', variant: 'default' },
  in_progress: { label: 'กำลังเดินทาง', variant: 'default' },
  completed: { label: 'เสร็จสิ้น', variant: 'outline' },
  cancelled: { label: 'ยกเลิก', variant: 'destructive' },
};

const vehicleTypeLabels: Record<string, string> = {
  car: 'รถเก๋ง',
  van: 'รถตู้',
  bus: 'รถบัส',
};

const TrackingInfo = ({ booking, vehicle, driver, eta, lastUpdate }: TrackingInfoProps) => {
  const statusInfo = statusLabels[booking.status] || { label: booking.status, variant: 'secondary' as const };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs} วินาทีที่แล้ว`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} นาทีที่แล้ว`;
    return formatDateTime(dateString);
  };

  return (
    <div className="space-y-4">
      {/* Booking Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">หมายเลขการจอง</CardTitle>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="text-2xl font-bold text-primary">{booking.bookingNumber}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {booking.guestName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{booking.guestName}</span>
            </div>
          )}
          
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">จุดรับ</p>
              <p>{booking.pickupLocation}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">จุดส่ง</p>
              <p>{booking.dropoffLocation}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateTime(booking.pickupDatetime)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span>{vehicleTypeLabels[booking.vehicleType] || booking.vehicleType} • {booking.passengerCount} คน</span>
          </div>
        </CardContent>
      </Card>

      {/* ETA Card */}
      {eta && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">เวลาโดยประมาณ</p>
              <p className="text-2xl font-bold text-primary">{eta}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle & Driver Info */}
      {(vehicle || driver) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">ข้อมูลรถและคนขับ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicle && (
              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  {vehicle.brand && vehicle.model && (
                    <p>{vehicle.brand} {vehicle.model}</p>
                  )}
                  {vehicle.licensePlate && (
                    <p className="text-muted-foreground">ทะเบียน: {vehicle.licensePlate}</p>
                  )}
                </div>
              </div>
            )}
            
            {driver && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.name}</span>
                </div>
                
                {driver.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${driver.phone}`} className="text-primary hover:underline">
                      {driver.phone}
                    </a>
                  </div>
                )}
                
                {driver.rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{driver.rating.toFixed(1)}</span>
                  </div>
                )}
              </>
            )}
            
            {lastUpdate && (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                อัปเดตล่าสุด: {formatLastUpdate(lastUpdate)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackingInfo;
