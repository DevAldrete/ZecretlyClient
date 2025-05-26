// Request editor component
import { useState, useEffect, useRef } from 'react';
import { Play, Save, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'; // Added icons for placeholder
import { gsap } from 'gsap';
import { useRequestById, useUpdateRequest, useExecuteRequest } from '../lib/queries/requestQueries';
import RequestHistoryList from './RequestHistoryList'; // Import RequestHistoryList
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { HttpMethod, BodyType, AuthType, RequestModel } from '../lib/queries/requestQueries'; // UPDATED IMPORT for RequestModel

interface RequestEditorProps {
  selectedRequestId: string | null | undefined; // RENAMED and typed prop
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const BODY_TYPES: BodyType[] = ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'];
const AUTH_TYPES: AuthType[] = ['none', 'bearer', 'basic', 'api-key', 'oauth2'];

export function RequestEditor({ selectedRequestId }: RequestEditorProps) { // RENAMED prop
  // Use the hook created in Step 2. Assuming 'useRequest' was a placeholder or from a different file.
  const { data: request, isLoading, isError, error } = useRequestById(selectedRequestId); 
  const updateRequest = useUpdateRequest(); // This would need to be adapted if its internals rely on the old useRequest
  const executeRequest = useExecuteRequest(); // Same as above

  // Handle null/undefined selectedRequestId before calling hooks or rendering
  if (!selectedRequestId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-slate-800/30">
        <Info size={48} className="mb-4 text-blue-500" />
        <h2 className="text-2xl font-semibold mb-2 text-slate-700 dark:text-slate-200">Welcome to ZecretlyClient</h2>
        <p className="mb-1 text-slate-600 dark:text-slate-400">
          Select a workspace, then a collection, and then a request from the sidebar to start working.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          You can also create new items using the {'"Create New..."'} or {'"+ New..."'} buttons in the sidebar.
        </p>
      </div>
    );
  }

  const [formData, setFormData] = useState<Partial<RequestModel>>({
    name: '',
    method: 'GET' as HttpMethod,
    url: '',
    headers: {} as Record<string, string>,
    bodyType: 'none' as BodyType,
    bodyContent: '',
    queryParams: {} as Record<string, string>,
    authType: 'none' as AuthType,
    authDetails: {} as Record<string, unknown>,
    description: '',
  });

  // Refined response state to hold structured data or error
  interface ExecutionResult {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    body?: any;
    durationMs?: number;
    error?: boolean; // true if it's a client-side error or API error wrapper
    message?: string; // Error message
  }
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const responseCardRef = useRef<HTMLDivElement>(null); // Ref for GSAP animation
  const [showResponseHeaders, setShowResponseHeaders] = useState(false);


  useEffect(() => {
    // GSAP animation for response card
    if (executionResult && responseCardRef.current) {
      gsap.fromTo(responseCardRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    } else if (!executionResult && responseCardRef.current) {
      // Optionally hide it or prepare for next animation
       gsap.set(responseCardRef.current, { opacity: 0 });
    }
  }, [executionResult]);

  useEffect(() => {
    if (request) {
      setFormData({
        name: request.name,
        method: request.method,
        url: request.url,
        headers: request.headers || {},
        bodyType: request.bodyType || 'none',
        bodyContent: request.bodyContent || '',
        queryParams: request.queryParams || {},
        authType: request.authType || 'none',
        authDetails: request.authDetails || {},
        description: request.description || '',
        // Ensure all fields from RequestModel are considered if needed by form
      });

      // Attempt to parse response if it exists
      // This part might need adjustment based on actual response structure from execution
      if (request.response && typeof request.response === 'string') { 
        try {
          setResponse(JSON.parse(request.response));
        } catch {
          setResponse({ body: request.response });
        }
      }
    }
  }, [request]);

  const handleSave = async () => {
    if (!selectedRequestId) return; // Should not happen if button is disabled or not shown
    try {
      await updateRequest.mutateAsync({
        id: selectedRequestId, // Use selectedRequestId
        data: {
          // Cast formData to the expected payload type for updateRequest mutation
          // This requires knowing what useUpdateRequest expects. Assuming it's { ...formData } for now.
          // It's crucial that formData aligns with the expected structure.
          name: formData.name!,
          method: formData.method!,
          url: formData.url!,
          headers: formData.headers && Object.keys(formData.headers).length > 0 ? formData.headers : undefined,
          bodyType: formData.bodyType,
          bodyContent: formData.bodyContent,
          queryParams: formData.queryParams && Object.keys(formData.queryParams).length > 0 ? formData.queryParams : undefined,
          authType: formData.authType,
          authDetails: formData.authDetails && Object.keys(formData.authDetails).length > 0 ? formData.authDetails : undefined,
          description: formData.description,
          // Include other fields from RequestModel as necessary, ensure types match
          // For example, if status is part of the update payload:
          // status: formData.status || 0, // or whatever default/current status is
        },
      });
      toast.success('Request saved successfully');
    } catch (e) {
      console.error("Save error:", e);
      toast.error('Failed to save request');
    }
  };

  const handleExecute = async () => {
    if (!selectedRequestId) return;
    setIsExecuting(true);
    setExecutionResult(null); // Clear previous results
    gsap.set(responseCardRef.current, { opacity: 0 }); // Prepare for animation

    try {
      const responseFromMutation = await executeRequest.mutateAsync({
        id: selectedRequestId,
        data: {}, // Assuming no specific overrides for now
      });

      // Assuming responseFromMutation.data contains { status, statusText, headers, body, durationMs }
      if (responseFromMutation.success && responseFromMutation.data) {
        setExecutionResult({
          status: responseFromMutation.data.status,
          statusText: responseFromMutation.data.statusText,
          headers: responseFromMutation.data.headers,
          body: responseFromMutation.data.body,
          durationMs: responseFromMutation.data.durationMs,
        });
        toast.success(responseFromMutation.message || 'Request executed successfully');
      } else {
        // Handle cases where success is true but data might be missing, or success is false
        setExecutionResult({
          error: true,
          message: responseFromMutation.message || 'Execution failed or returned unexpected data',
          status: responseFromMutation.data?.status, // Include status if available
        });
        toast.error(responseFromMutation.message || 'Execution failed');
      }
    } catch (error: any) { // Catching 'any' to access error.message
      setExecutionResult({
        error: true,
        message: error.message || 'An unexpected error occurred during execution.',
        status: error.status, // If error object has status
      });
      toast.error(error.message || 'Request execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const addHeader = () => {
    setFormData(prev => ({
      ...prev,
      headers: { ...prev.headers, '': '' }
    }));
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers };
      if (oldKey !== newKey) {
        delete newHeaders[oldKey];
      }
      if (newKey) {
        newHeaders[newKey] = value;
      }
      return { ...prev, headers: newHeaders };
    });
  };

  const removeHeader = (key: string) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  // Loading and error states from useRequestById
  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertTriangle size={48} className="mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">Error Loading Request</h2>
        <p className="mb-1 text-slate-600 dark:text-slate-400">{error?.message || 'Failed to load request details.'}</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">Please try selecting the request again or check your connection.</p>
      </div>
    );
  }
  
  if (!request) {
    // This case should be hit if selectedRequestId is valid but useRequestById returns no data without an error
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertTriangle size={48} className="mb-4 text-yellow-500" />
        <h2 className="text-xl font-semibold mb-2 text-yellow-600 dark:text-yellow-400">Request Not Found</h2>
        <p className="mb-1 text-slate-600 dark:text-slate-400">The selected request could not be found.</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">It might have been deleted or there was an issue retrieving its details.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4"> {/* Adjusted padding and spacing */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
        <Input
          value={formData.name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="text-xl font-semibold flex-grow dark:bg-slate-800 dark:border-slate-700"
          placeholder="Request name"
        />
        <div className="flex gap-2 self-end sm:self-center">
          <Button onClick={handleSave} disabled={updateRequest.isPending || isLoading} variant="outline" className="dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700">
            <Save className="h-4 w-4 mr-2" />
            {updateRequest.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={handleExecute} disabled={isExecuting || isLoading} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Send'}
          </Button>
        </div>
      </div>

      {/* Request Configuration Card */}
      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader className="pb-2 pt-4"> {/* Reduced padding for denser look */}
          <CardTitle className="text-lg">Request Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2"> {/* Reduced padding */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={formData.method}
              onValueChange={(value: HttpMethod) => setFormData(prev => ({ ...prev, method: value }))}
            >
              <SelectTrigger className="w-full sm:w-36 dark:bg-slate-700 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800">
                {HTTP_METHODS.map((method) => (
                  <SelectItem key={method} value={method} className="dark:hover:bg-slate-700">{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={formData.url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 dark:bg-slate-700 dark:border-slate-600"
            />
          </div>

          <Tabs defaultValue="headers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10 dark:bg-slate-700/50">
              <TabsTrigger value="headers" className="dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white">Headers</TabsTrigger>
              <TabsTrigger value="body" className="dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white">Body</TabsTrigger>
              <TabsTrigger value="auth" className="dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white">Auth</TabsTrigger>
              <TabsTrigger value="params" className="dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white">Params</TabsTrigger>
            </TabsList>

            {/* Headers Tab */}
            <TabsContent value="headers" className="mt-3 space-y-2">
              {Object.entries(formData.headers || {}).map(([key, value], index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={key}
                    onChange={(e) => updateHeader(key, e.target.value, value as string)}
                    placeholder="Header name"
                    className="flex-1 text-sm dark:bg-slate-700 dark:border-slate-600"
                  />
                  <Input
                    value={value as string}
                    onChange={(e) => updateHeader(key, key, e.target.value)}
                    placeholder="Header value"
                    className="flex-1 text-sm dark:bg-slate-700 dark:border-slate-600"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeHeader(key)} className="text-slate-500 hover:text-red-500 dark:hover:text-red-400">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addHeader} className="text-xs dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                Add Header
              </Button>
            </TabsContent>

            {/* Body Tab */}
            <TabsContent value="body" className="mt-3 space-y-3">
              <Select
                value={formData.bodyType || 'none'}
                onValueChange={(value: BodyType) => setFormData(prev => ({ ...prev, bodyType: value }))}
              >
                <SelectTrigger className="w-full sm:w-48 dark:bg-slate-700 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800">
                  {BODY_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="dark:hover:bg-slate-700">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.bodyType !== 'none' && (
                <Textarea
                  value={formData.bodyContent || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, bodyContent: e.target.value }))}
                  placeholder="Request body"
                  className="min-h-[120px] text-sm dark:bg-slate-700 dark:border-slate-600"
                />
              )}
            </TabsContent>

            {/* Auth Tab */}
            <TabsContent value="auth" className="mt-3 space-y-3">
              <Select
                value={formData.authType || 'none'}
                onValueChange={(value: AuthType) => setFormData(prev => ({ ...prev, authType: value, authDetails: {} }))} // Reset details on type change
              >
                <SelectTrigger className="w-full sm:w-48 dark:bg-slate-700 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800">
                  {AUTH_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="dark:hover:bg-slate-700">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.authType === 'bearer' && (
                <Input
                  type="password"
                  value={(formData.authDetails?.token as string) || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    authDetails: { ...prev.authDetails, token: e.target.value }
                  }))}
                  placeholder="Bearer token"
                  className="dark:bg-slate-700 dark:border-slate-600"
                />
              )}
              {/* TODO: Add inputs for other auth types like Basic Auth user/pass */}
            </TabsContent>
            
            {/* Query Params Tab */}
            <TabsContent value="params" className="mt-3 space-y-2">
              {Object.entries(formData.queryParams || {}).map(([key, value], index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={key}
                    onChange={(e) => { /* existing logic */ }}
                    placeholder="Parameter name"
                    className="flex-1 text-sm dark:bg-slate-700 dark:border-slate-600"
                  />
                  <Input
                    value={value as string}
                    onChange={(e) => { /* existing logic */ }}
                    placeholder="Parameter value"
                    className="flex-1 text-sm dark:bg-slate-700 dark:border-slate-600"
                  />
                   <Button variant="ghost" size="icon" onClick={() => { /* existing logic */ }} className="text-slate-500 hover:text-red-500 dark:hover:text-red-400">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => { /* existing logic */ }} className="text-xs dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                Add Parameter
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Display Area */}
      {isExecuting && (
        <Card className="mt-4 dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader className="py-3">
            <CardTitle className="text-md">Response</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Sending request...</p>
          </CardContent>
        </Card>
      )}

      {executionResult && (
        <Card ref={responseCardRef} className="mt-4 opacity-0 dark:bg-slate-800/50 dark:border-slate-700"> {/* Initial opacity for GSAP */}
          <CardHeader className="py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-md">Response</CardTitle>
              {executionResult.durationMs !== undefined && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Time: {executionResult.durationMs} ms
                </span>
              )}
            </div>
            {executionResult.status !== undefined && (
               <div className={`text-sm font-semibold mt-1 ${
                executionResult.error || (executionResult.status >= 400) 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-green-600 dark:text-green-400'
              }`}>
                Status: {executionResult.status} {executionResult.statusText || ''}
              </div>
            )}
          </CardHeader>
          <CardContent className="py-3">
            {executionResult.error && executionResult.message && (
              <div className="text-red-500 dark:text-red-400 text-sm">
                <p><strong>Error:</strong> {executionResult.message}</p>
              </div>
            )}

            {!executionResult.error && (
              <Tabs defaultValue="body" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto sm:h-9 dark:bg-slate-700/50 text-xs">
                  <TabsTrigger value="body" className="text-xs dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white">Body</TabsTrigger>
                  <TabsTrigger value="headers" className="text-xs dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white">Headers</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white">History</TabsTrigger>
                </TabsList>
                <TabsContent value="body" className="mt-2">
                  <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded-md overflow-auto text-xs whitespace-pre-wrap break-all">
                    {typeof executionResult.body === 'string' 
                      ? executionResult.body 
                      : JSON.stringify(executionResult.body, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="headers" className="mt-2">
                  {executionResult.headers && Object.keys(executionResult.headers).length > 0 ? (
                    <div className="space-y-1 text-xs">
                      {Object.entries(executionResult.headers).map(([key, value]) => (
                        <div key={key} className="flex">
                          <strong className="w-32 sm:w-40 truncate text-slate-600 dark:text-slate-300">{key}:</strong>
                          <span className="truncate text-slate-800 dark:text-slate-200">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">No headers returned.</p>
                  )}
                </TabsContent>
                <TabsContent value="history" className="mt-2"> {/* New History Tab Content */}
                  <RequestHistoryList selectedRequestId={selectedRequestId} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
      {/* Fallback History display if no current executionResult, but a request is selected */}
      {!isExecuting && !executionResult && selectedRequestId && (
         <Card className="mt-4 dark:bg-slate-800/50 dark:border-slate-700">
           <CardHeader className="py-3"><CardTitle className="text-md">History</CardTitle></CardHeader>
           <CardContent className="py-3">
             <RequestHistoryList selectedRequestId={selectedRequestId} />
           </CardContent>
         </Card>
      )}
    </div>
  );
}
