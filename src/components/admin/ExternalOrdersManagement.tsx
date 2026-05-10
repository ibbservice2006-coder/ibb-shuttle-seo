import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, RefreshCw, ExternalLink, Link2, Copy, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExternalOrder {
  id: string;
  platform_name: string;
  external_order_id: string;
  booking_id: string | null;
  status: string;
  order_data: Record<string, unknown> | null;
  customer_data: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  created_at: string;
  synced_at: string | null;
  booking?: {
    booking_number: string;
    status: string;
    pickup_datetime: string;
    final_price: number;
    currency: string;
  } | null;
}

const PLATFORM_COLORS: Record<string, string> = {
  klook: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  kkday: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  viator: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  default: "bg-gray-500/20 text-gray-700 border-gray-500/30",
};

export const ExternalOrdersManagement = () => {
  const [orders, setOrders] = useState<ExternalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [webhookInfoOpen, setWebhookInfoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/external-webhook`;

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("external_platform_orders")
      .select(`
        *,
        booking:bookings(
          booking_number,
          status,
          pickup_datetime,
          final_price,
          currency
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching external orders",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOrders((data as ExternalOrder[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const copyWebhookUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({ title: "Webhook URL copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.external_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.platform_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_data?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.booking?.booking_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold font-montserrat text-foreground">
          External Platform Orders
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </Badge>
          <Button onClick={() => setWebhookInfoOpen(true)} variant="outline" size="sm">
            <Link2 className="h-4 w-4 mr-2" />
            Webhook Info
          </Button>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order ID, platform, or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>External Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>IBB Booking</TableHead>
              <TableHead>Platform Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Synced</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No external orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Badge className={PLATFORM_COLORS[order.platform_name] || PLATFORM_COLORS.default}>
                      {order.platform_name.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      {order.external_order_id}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_data?.name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_data?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.booking ? (
                      <div>
                        <p className="font-medium text-primary">{order.booking.booking_number}</p>
                        <p className="text-sm text-muted-foreground capitalize">{order.booking.status}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not linked</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {order.booking ? (
                      <span>
                        {order.booking.currency} {order.booking.final_price?.toLocaleString()}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.synced_at
                      ? format(new Date(order.synced_at), "MMM dd, HH:mm")
                      : format(new Date(order.created_at), "MMM dd, HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Webhook Info Dialog */}
      <Dialog open={webhookInfoOpen} onOpenChange={setWebhookInfoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>External Platform Webhook Configuration</DialogTitle>
            <DialogDescription>
              Configure your external platforms (Klook, KKday, Viator) to send webhooks to this endpoint.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Webhook URL</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 bg-muted rounded-md text-sm break-all">
                  {webhookUrl}
                </code>
                <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Request Format (JSON)</label>
              <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`{
  "platform": "klook",        // klook, kkday, viator
  "order_id": "KL-123456",
  "status": "confirmed",      // new, confirmed, paid, cancelled, completed
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+66812345678"
  },
  "booking": {
    "pickup_datetime": "2024-01-15T09:00:00Z",
    "pickup_location": "Suvarnabhumi Airport",
    "dropoff_location": "Khao San Road",
    "vehicle_type": "sedan",   // sedan, van, bus
    "passenger_count": 2,
    "special_requests": "Child seat needed"
  },
  "payment": {
    "total": 1500,
    "currency": "THB",
    "paid": true
  }
}`}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Headers</label>
                <pre className="mt-1 p-3 bg-muted rounded-md text-xs">
{`Content-Type: application/json
x-webhook-secret: [your-secret]`}
                </pre>
              </div>
              <div>
                <label className="text-sm font-medium">Status Mapping</label>
                <div className="mt-1 p-3 bg-muted rounded-md text-xs space-y-1">
                  <p><strong>new/pending</strong> → pending_payment</p>
                  <p><strong>confirmed/paid</strong> → pending_assignment</p>
                  <p><strong>cancelled</strong> → cancelled</p>
                  <p><strong>completed</strong> → completed</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
