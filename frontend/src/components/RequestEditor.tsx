// Request editor component
import { useState, useEffect } from 'react';
import { Play, Save } from 'lucide-react';
import { useRequest, useUpdateRequest, useExecuteRequest } from '../lib/queries/requests';
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
import { HttpMethod, BodyType, AuthType } from '../lib/types';

interface RequestEditorProps {
  requestId: string;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const BODY_TYPES: BodyType[] = ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'];
const AUTH_TYPES: AuthType[] = ['none', 'bearer', 'basic', 'api-key', 'oauth2'];

export function RequestEditor({ requestId }: RequestEditorProps) {
  const { data: request, isLoading } = useRequest(requestId);
  const updateRequest = useUpdateRequest();
  const executeRequest = useExecuteRequest();

  const [formData, setFormData] = useState({
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

  const [response, setResponse] = useState<unknown>(null);
  const [isExecuting, setIsExecuting] = useState(false);

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
      });

      if (request.response) {
        try {
          setResponse(JSON.parse(request.response));
        } catch {
          setResponse({ body: request.response });
        }
      }
    }
  }, [request]);

  const handleSave = async () => {
    try {
      await updateRequest.mutateAsync({
        id: requestId,
        data: {
          ...formData,
          headers: Object.keys(formData.headers).length > 0 ? formData.headers : undefined,
          queryParams: Object.keys(formData.queryParams).length > 0 ? formData.queryParams : undefined,
          authDetails: Object.keys(formData.authDetails).length > 0 ? formData.authDetails : undefined,
        },
      });
      toast.success('Request saved successfully');
    } catch {
      toast.error('Failed to save request');
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const result = await executeRequest.mutateAsync({
        id: requestId,
        data: {},
      });
      setResponse(result);
      toast.success('Request executed successfully');
    } catch (error: unknown) {
      setResponse({
        error: true,
        message: (error as Error).message || 'Request failed',
        status: (error as { status?: number }).status || 0,
      });
      toast.error('Request execution failed');
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

  if (isLoading) {
    return <div className="p-6 space-y-4">
      <div className="h-8 bg-muted animate-pulse rounded" />
      <div className="h-64 bg-muted animate-pulse rounded" />
    </div>;
  }

  if (!request) {
    return <div className="p-6 text-center text-muted-foreground">Request not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="text-lg font-semibold"
            placeholder="Request name"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={updateRequest.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateRequest.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={handleExecute} disabled={isExecuting}>
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Send'}
          </Button>
        </div>
      </div>

      {/* Request Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={formData.method}
              onValueChange={(value: HttpMethod) => setFormData(prev => ({ ...prev, method: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.example.com/endpoint"
              className="flex-1"
            />
          </div>

          <Tabs defaultValue="headers" className="w-full">
            <TabsList>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="params">Params</TabsTrigger>
            </TabsList>

            <TabsContent value="headers" className="space-y-2">
              {Object.entries(formData.headers).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={key}
                    onChange={(e) => updateHeader(key, e.target.value, value)}
                    placeholder="Header name"
                    className="flex-1"
                  />
                  <Input
                    value={value}
                    onChange={(e) => updateHeader(key, key, e.target.value)}
                    placeholder="Header value"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => removeHeader(key)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addHeader}>
                Add Header
              </Button>
            </TabsContent>

            <TabsContent value="body" className="space-y-4">
              <Select
                value={formData.bodyType}
                onValueChange={(value: BodyType) => setFormData(prev => ({ ...prev, bodyType: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.bodyType !== 'none' && (
                <Textarea
                  value={formData.bodyContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, bodyContent: e.target.value }))}
                  placeholder="Request body"
                  className="min-h-32"
                />
              )}
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <Select
                value={formData.authType}
                onValueChange={(value: AuthType) => setFormData(prev => ({ ...prev, authType: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUTH_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.authType === 'bearer' && (
                <Input
                  value={(formData.authDetails.token as string) || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    authDetails: { ...prev.authDetails, token: e.target.value }
                  }))}
                  placeholder="Bearer token"
                />
              )}
            </TabsContent>

            <TabsContent value="params" className="space-y-2">
              {Object.entries(formData.queryParams).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={key}
                    onChange={(e) => {
                      const newParams = { ...formData.queryParams };
                      delete newParams[key];
                      if (e.target.value) {
                        newParams[e.target.value] = value;
                      }
                      setFormData(prev => ({ ...prev, queryParams: newParams }));
                    }}
                    placeholder="Parameter name"
                    className="flex-1"
                  />
                  <Input
                    value={value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      queryParams: { ...prev.queryParams, [key]: e.target.value }
                    }))}
                    placeholder="Parameter value"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => {
                    const newParams = { ...formData.queryParams };
                    delete newParams[key];
                    setFormData(prev => ({ ...prev, queryParams: newParams }));
                  }}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  queryParams: { ...prev.queryParams, '': '' }
                }));
              }}>
                Add Parameter
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
