import React from 'react';
import { useRequestHistories, RequestHistoryEntry } from '../lib/queries/requestHistoryQueries';
import { Badge } from './ui/badge'; // Using Badge for status
import { ScrollArea } from './ui/scroll-area'; // For potentially long lists
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'; // For structured display

interface RequestHistoryListProps {
  selectedRequestId: string | null | undefined;
}

const RequestHistoryList: React.FC<RequestHistoryListProps> = ({ selectedRequestId }) => {
  const { 
    data: histories, 
    isLoading, 
    isError, 
    error 
  } = useRequestHistories(selectedRequestId);

  if (!selectedRequestId) {
    return <p className="p-4 text-sm text-muted-foreground">No request selected. Select a request to see its execution history.</p>;
  }

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading history...</p>;
  }

  if (isError) {
    return <p className="p-4 text-sm text-red-500">Error fetching history: {error?.message || 'Unknown error'}</p>;
  }

  if (!histories || histories.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">No execution history found for this request.</p>;
  }

  const getStatusColor = (statusCode?: number) => {
    if (statusCode === undefined) return 'bg-gray-400';
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-500';
    if (statusCode >= 300 && statusCode < 400) return 'bg-yellow-500';
    if (statusCode >= 400 && statusCode < 500) return 'bg-orange-500';
    if (statusCode >= 500) return 'bg-red-500';
    return 'bg-gray-400';
  };

  return (
    <ScrollArea className="h-[300px] p-1"> {/* Adjust height as needed */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Executed At</TableHead>
            <TableHead className="w-[80px]">Method</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="text-right w-[100px]">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {histories.map((entry: RequestHistoryEntry) => (
            <TableRow key={entry.id} className="text-xs hover:bg-muted/50 cursor-pointer" title="Click to view details (Not implemented)">
              <TableCell>{new Date(entry.executedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">{entry.method}</Badge>
              </TableCell>
              <TableCell>
                {entry.responseStatusCode !== undefined ? (
                  <Badge 
                    className={`text-white text-xs px-2 py-0.5 rounded-full ${getStatusColor(entry.responseStatusCode)}`}
                  >
                    {entry.responseStatusCode}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">N/A</Badge>
                )}
              </TableCell>
              <TableCell className="truncate max-w-[200px]" title={entry.url}>{entry.url}</TableCell>
              <TableCell className="text-right">
                {entry.durationMs !== undefined ? `${entry.durationMs} ms` : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {histories.length === 0 && (
         <TableCaption>No execution history found for this request.</TableCaption>
      )}
    </ScrollArea>
  );
};

export default RequestHistoryList;
