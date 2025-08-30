'use client';

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { updateModeratorApplication } from '@/lib/actions/admin.action';
import { formatDistance } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ModeratorApplication } from '@/types';

interface ModeratorApplicationsTableProps {
  applications: ModeratorApplication[];
}

const ModeratorApplicationsTable = ({ applications }: ModeratorApplicationsTableProps) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processedIds, setProcessedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ModeratorApplication | null>(null);
  const [remainingApplications, setRemainingApplications] = useState<ModeratorApplication[]>(applications);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    
    try {
      const result = await updateModeratorApplication({ applicationId: id, status });
      
      if (result.success) {
        // Add to processed IDs and remove from the active applications list
        setProcessedIds(prev => [...prev, id]);
        setRemainingApplications(prev => prev.filter(app => app.id !== id));
        
        // Close details popup if this was the application being viewed
        if (selectedApplication?.id === id) {
          setSelectedApplication(null);
        }
        
        // Close expanded row if this was expanded
        if (expandedId === id) {
          setExpandedId(null);
        }
        
        // Refresh the server component data
        router.refresh();
      } else {
        alert(result.message || 'Error updating application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('An error occurred while updating the application');
    } finally {
      setProcessingId(null);
    }
  };

  // Toggle expanded application details
  const toggleExpandRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // View full application details
  const viewApplicationDetails = (application: ModeratorApplication) => {
    setSelectedApplication(application);
  };

  return (
    <>
      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-900 border-b border-gray-800">
              <TableHead className="text-gray-300"></TableHead>
              <TableHead className="text-gray-300">Applicant</TableHead>
              <TableHead className="text-gray-300">Company</TableHead>
              <TableHead className="text-gray-300">Position</TableHead>
              <TableHead className="text-gray-300">Date</TableHead>
              <TableHead className="text-gray-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {remainingApplications.length > 0 ? (
              remainingApplications.map((application) => (
                <React.Fragment key={application.id}>
                  <TableRow 
                    className="border-b border-gray-800 hover:bg-gray-900"
                  >
                    <TableCell className="w-10">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => toggleExpandRow(application.id)}
                      >
                        {expandedId === application.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      <div>{application.userName}</div>
                      <div className="text-gray-400 text-sm">{application.email}</div>
                    </TableCell>
                    <TableCell className="text-gray-300">{application.company}</TableCell>
                    <TableCell className="text-gray-300">{application.position}</TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {formatDistance(new Date(application.createdAt), new Date(), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 border-blue-800"
                          onClick={() => viewApplicationDetails(application)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-700 hover:bg-green-800"
                          onClick={() => handleUpdateStatus(application.id, 'approved')}
                          disabled={processingId === application.id}
                        >
                          {processingId === application.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          disabled={processingId === application.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded row with verification details */}
                  {expandedId === application.id && (
                    <TableRow className="bg-gray-900/50">
                      <TableCell colSpan={6}>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Verification Information</h4>
                            <ul className="space-y-2 text-sm">
                              <li>
                                <span className="text-gray-400">Company Website:</span>{' '}
                                <a href={application.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center">
                                  {application.companyWebsite} <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                              </li>
                              <li>
                                <span className="text-gray-400">Work Email:</span>{' '}
                                <span className="text-white">{application.workEmail}</span>
                              </li>
                              <li>
                                <span className="text-gray-400">LinkedIn:</span>{' '}
                                <a href={application.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center">
                                  Profile <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                              </li>
                              {application.employeeId && (
                                <li>
                                  <span className="text-gray-400">Employee ID:</span>{' '}
                                  <span className="text-white">{application.employeeId}</span>
                                </li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Application Reason</h4>
                            <p className="text-gray-300 text-sm">{application.reason}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                  No pending applications
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Application Details Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="bg-gray-950 text-white border border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Applicant</h3>
                  <p className="text-white">{selectedApplication.userName}</p>
                  <p className="text-blue-400">{selectedApplication.email}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Company</h3>
                  <p className="text-white">{selectedApplication.company}</p>
                  <p className="text-blue-400">
                    <a 
                      href={selectedApplication.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center hover:underline"
                    >
                      {selectedApplication.companyWebsite} <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Position</h3>
                  <p className="text-white">{selectedApplication.position}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Work Email</h3>
                  <p className="text-white">{selectedApplication.workEmail}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">LinkedIn Profile</h3>
                  <p className="text-blue-400">
                    <a 
                      href={selectedApplication.linkedinProfile} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center hover:underline"
                    >
                      View Profile <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </p>
                </div>
                
                {selectedApplication.employeeId && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">Employee ID</h3>
                    <p className="text-white">{selectedApplication.employeeId}</p>
                  </div>
                )}
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Application Date</h3>
                  <p className="text-white">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                </div>
                
                {selectedApplication.verificationDocumentURL && (
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">Verification Document</h3>
                    <p className="text-blue-400">
                      <a 
                        href={selectedApplication.verificationDocumentURL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center hover:underline"
                      >
                        View Document <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400">Application Reason</h3>
                <p className="text-white p-4 bg-black/50 rounded-lg border border-gray-800">{selectedApplication.reason}</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleUpdateStatus(selectedApplication.id, 'rejected');
                    setSelectedApplication(null);
                  }}
                  disabled={processingId === selectedApplication.id}
                >
                  Reject Application
                </Button>
                <Button
                  className="bg-green-700 hover:bg-green-800"
                  onClick={() => {
                    handleUpdateStatus(selectedApplication.id, 'approved');
                    setSelectedApplication(null);
                  }}
                  disabled={processingId === selectedApplication.id}
                >
                  Approve Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModeratorApplicationsTable; 