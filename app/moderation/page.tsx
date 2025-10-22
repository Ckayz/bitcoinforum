'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { normalizeSingle } from '@/lib/supabase-utils';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Shield, Flag, Ban, Eye, Trash2, Lock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ReportUser = { username: string };

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  content_type: string;
  content_id: string;
  reporter: ReportUser;       // a single object, not an array
  reported_user: ReportUser;  // a single object, not an array
}



export default function ModerationPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    checkModeratorStatus();
  }, [user]);

  useEffect(() => {
    if (isModerator) {
      fetchReports();
    }
  }, [isModerator, activeTab]);

  const checkModeratorStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('role, is_moderator')
      .eq('id', user.id)
      .single();

    if (data && (data.role === 'verified' || data.is_moderator)) {
      setIsModerator(true);
    }
    setLoading(false);
  };

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('reports')
        .select(`
          id,
          reason,
          description,
          status,
          created_at,
          content_type,
          content_id,
          reporter:users!reports_reporter_id_fkey(username),
          reported_user:users!reports_reported_user_id_fkey(username)
        `)
        .order('created_at', { ascending: false });
  
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }
  
      const { data } = await query;

      // Normalize: Supabase returns joins as arrays
      const transformedData: Report[] = (data || []).map((r: any) => ({
        ...r,
        reporter: normalizeSingle(r.reporter) || { username: 'Unknown' },
        reported_user: normalizeSingle(r.reported_user) || { username: 'Unknown' },
      }));

      setReports(transformedData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports', {
        description: 'Please try refreshing the page'
      });
    }
  };
  

  const handleReportAction = async (reportId: string, action: 'dismiss' | 'resolve') => {
    const actionText = action === 'dismiss' ? 'dismiss' : 'resolve';

    setConfirmDialog({
      isOpen: true,
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Report`,
      description: `Are you sure you want to ${actionText} this report? This action cannot be undone.`,
      variant: action === 'dismiss' ? 'warning' : 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('reports')
            .update({
              status: action === 'dismiss' ? 'dismissed' : 'resolved',
              reviewed_at: new Date().toISOString(),
              reviewed_by: user?.id
            })
            .eq('id', reportId);

          if (!error) {
            toast.success(`Report ${action === 'dismiss' ? 'dismissed' : 'resolved'}`, {
              description: 'The report status has been updated'
            });
            fetchReports();
          } else {
            toast.error('Failed to update report', {
              description: 'Please try again'
            });
          }
        } catch (error) {
          console.error('Error updating report:', error);
          toast.error('Failed to update report');
        }
      }
    });
  };

  const deleteContent = (contentType: string, contentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Content',
      description: `Are you sure you want to permanently delete this ${contentType}? This action cannot be undone and will remove the content from the forum.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from(contentType === 'thread' ? 'threads' : contentType === 'post' ? 'posts' : 'comments')
            .update({
              is_deleted: true,
              deleted_by: user?.id,
              deleted_at: new Date().toISOString()
            })
            .eq('id', contentId);

          if (!error) {
            // Log moderation action
            await supabase.from('moderation_actions').insert([{
              moderator_id: user?.id,
              action_type: `delete_${contentType}`,
              target_type: contentType,
              target_id: contentId,
              reason: 'Content moderation'
            }]);
            toast.success('Content deleted', {
              description: 'The content has been removed from the forum'
            });
            fetchReports();
          } else {
            toast.error('Failed to delete content');
          }
        } catch (error) {
          console.error('Error deleting content:', error);
          toast.error('Failed to delete content');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <CardTitle className="text-red-400">Access Restricted</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                This page is only accessible to moderators and verified users with moderation privileges.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getReasonBadge = (reason: string) => {
    const colors = {
      spam: 'bg-yellow-500/20 text-yellow-400',
      harassment: 'bg-red-500/20 text-red-400',
      inappropriate: 'bg-purple-500/20 text-purple-400',
      misinformation: 'bg-orange-500/20 text-orange-400',
      off_topic: 'bg-blue-500/20 text-blue-400',
      other: 'bg-gray-500/20 text-gray-400'
    };
    return colors[reason as keyof typeof colors] || colors.other;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      reviewed: 'bg-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/20 text-green-400',
      dismissed: 'bg-gray-500/20 text-gray-400'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold">Content Moderation</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Flag className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-400">Pending Reports</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {reports.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Under Review</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {reports.filter(r => r.status === 'reviewed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-400">
                    {reports.filter(r => r.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Ban className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-400">Dismissed</p>
                  <p className="text-2xl font-bold text-gray-400">
                    {reports.filter(r => r.status === 'dismissed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Under Review</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            <TabsTrigger value="all">All Reports</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {reports.length === 0 ? (
                <EmptyState
                  icon={Flag}
                  title="No reports found"
                  description={`There are no ${activeTab === 'all' ? '' : activeTab + ' '}reports at the moment.`}
                />
              ) : (
                reports.map((report) => (
                  <Card key={report.id} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Flag className="h-5 w-5 text-red-500" />
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getReasonBadge(report.reason)}>
                                {report.reason.replace('_', ' ')}
                              </Badge>
                              <Badge className={getStatusBadge(report.status)}>
                                {report.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        {report.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteContent(report.content_type, report.content_id)}
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReportAction(report.id, 'dismiss')}
                              className="border-gray-500"
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReportAction(report.id, 'resolve')}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Reporter</p>
                          <p className="text-white">{report.reporter?.username || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Reported User</p>
                          <p className="text-white">{report.reported_user?.username || 'Unknown'}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-1">Content Type</p>
                        <Badge variant="outline" className="border-zinc-600">
                          {report.content_type}
                        </Badge>
                      </div>

                      {report.description && (
                        <div className="p-3 bg-zinc-800 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">Additional Details</p>
                          <p className="text-white text-sm">{report.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText="Confirm"
      />
    </div>
  );
}
