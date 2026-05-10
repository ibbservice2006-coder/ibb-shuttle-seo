import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Users, Building2 } from "lucide-react";
import { format } from "date-fns";

interface AffiliateApplication {
  id: string;
  company_name: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  affiliate_type: string;
  commission_rate: number;
  total_earnings: number | null;
  is_active: boolean | null;
  created_at: string;
}

export const PartnersManagement = () => {
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch partner applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({ is_active: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Partner Approved",
        description: "The partner application has been approved",
      });
      fetchApplications();
    } catch (error) {
      console.error("Error approving partner:", error);
      toast({
        title: "Error",
        description: "Failed to approve partner",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("affiliates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Application Rejected",
        description: "The partner application has been rejected",
      });
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting partner:", error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeactivate = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Partner Deactivated",
        description: "The partner has been deactivated",
      });
      fetchApplications();
    } catch (error) {
      console.error("Error deactivating partner:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate partner",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = applications.filter(a => !a.is_active).length;
  const activeCount = applications.filter(a => a.is_active).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-montserrat">Partners Management</h1>
        <p className="text-muted-foreground">Manage partner applications and active partners</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" />
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-500" />
              Active Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Partners</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No partner applications yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      {app.company_name || "-"}
                    </TableCell>
                    <TableCell>{app.contact_name}</TableCell>
                    <TableCell>{app.contact_email}</TableCell>
                    <TableCell>{app.commission_rate}%</TableCell>
                    <TableCell>
                      {app.is_active ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(app.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!app.is_active ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(app.id)}
                              disabled={processingId === app.id}
                            >
                              {processingId === app.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(app.id)}
                              disabled={processingId === app.id}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivate(app.id)}
                            disabled={processingId === app.id}
                          >
                            {processingId === app.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Deactivate"
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
