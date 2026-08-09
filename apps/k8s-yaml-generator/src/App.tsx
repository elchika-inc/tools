import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Plus, Trash2 } from 'lucide-react';
import {
  generateDeployment,
  generateService,
  generateConfigMap,
  generateSecret,
  defaultDeploymentConfig,
  defaultServiceConfig,
  defaultConfigMapConfig,
  defaultSecretConfig,
  type ResourceType,
  type DeploymentConfig,
  type ServiceConfig,
  type ConfigMapConfig,
  type SecretConfig,
} from '@/utils/k8sGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [resourceType, setResourceType] = useState<ResourceType>('Deployment');
  const [depConfig, setDepConfig] = useState<DeploymentConfig>({ ...defaultDeploymentConfig });
  const [svcConfig, setSvcConfig] = useState<ServiceConfig>({ ...defaultServiceConfig });
  const [cmConfig, setCmConfig] = useState<ConfigMapConfig>({ ...defaultConfigMapConfig });
  const [secretConfig, setSecretConfig] = useState<SecretConfig>({ ...defaultSecretConfig });
  const output = useMemo(() => {
    switch (resourceType) {
      case 'Deployment':
        return generateDeployment(depConfig);
      case 'Service':
        return generateService(svcConfig);
      case 'ConfigMap':
        return generateConfigMap(cmConfig);
      case 'Secret':
        return generateSecret(secretConfig);
    }
  }, [resourceType, depConfig, svcConfig, cmConfig, secretConfig]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">K8s YAML Generator</h1>
            <p className="text-muted-foreground">
              Generate Kubernetes Deployment, Service, ConfigMap, and Secret YAML templates.
            </p>
          </header>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label>Resource Type</Label>
                <Select value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deployment">Deployment</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="ConfigMap">ConfigMap</SelectItem>
                    <SelectItem value="Secret">Secret</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              {resourceType === 'Deployment' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deployment Config</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={depConfig.name} onChange={(e) => setDepConfig({ ...depConfig, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Namespace</Label>
                        <Input value={depConfig.namespace} onChange={(e) => setDepConfig({ ...depConfig, namespace: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Image</Label>
                        <Input value={depConfig.image} onChange={(e) => setDepConfig({ ...depConfig, image: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Replicas</Label>
                        <Input type="number" value={depConfig.replicas} onChange={(e) => setDepConfig({ ...depConfig, replicas: parseInt(e.target.value) || 1 })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Container Port</Label>
                        <Input type="number" value={depConfig.containerPort} onChange={(e) => setDepConfig({ ...depConfig, containerPort: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Resources</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="CPU request (e.g. 100m)" value={depConfig.resources.requestsCpu} onChange={(e) => setDepConfig({ ...depConfig, resources: { ...depConfig.resources, requestsCpu: e.target.value } })} />
                        <Input placeholder="Memory request (e.g. 128Mi)" value={depConfig.resources.requestsMemory} onChange={(e) => setDepConfig({ ...depConfig, resources: { ...depConfig.resources, requestsMemory: e.target.value } })} />
                        <Input placeholder="CPU limit (e.g. 500m)" value={depConfig.resources.limitsCpu} onChange={(e) => setDepConfig({ ...depConfig, resources: { ...depConfig.resources, limitsCpu: e.target.value } })} />
                        <Input placeholder="Memory limit (e.g. 256Mi)" value={depConfig.resources.limitsMemory} onChange={(e) => setDepConfig({ ...depConfig, resources: { ...depConfig.resources, limitsMemory: e.target.value } })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Environment Variables</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setDepConfig({ ...depConfig, envVars: [...depConfig.envVars, { name: '', value: '' }] })}>
                          <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      </div>
                      {depConfig.envVars.map((env, i) => (
                        <div key={i} className="flex gap-2">
                          <Input placeholder="KEY" value={env.name} onChange={(e) => { const envVars = [...depConfig.envVars]; envVars[i] = { ...envVars[i], name: e.target.value }; setDepConfig({ ...depConfig, envVars }); }} />
                          <Input placeholder="value" value={env.value} onChange={(e) => { const envVars = [...depConfig.envVars]; envVars[i] = { ...envVars[i], value: e.target.value }; setDepConfig({ ...depConfig, envVars }); }} />
                          <Button type="button" variant="ghost" size="sm" onClick={() => setDepConfig({ ...depConfig, envVars: depConfig.envVars.filter((_, j) => j !== i) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {resourceType === 'Service' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Config</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={svcConfig.name} onChange={(e) => setSvcConfig({ ...svcConfig, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Namespace</Label>
                        <Input value={svcConfig.namespace} onChange={(e) => setSvcConfig({ ...svcConfig, namespace: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={svcConfig.type} onValueChange={(v) => setSvcConfig({ ...svcConfig, type: v as ServiceConfig['type'] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ClusterIP">ClusterIP</SelectItem>
                            <SelectItem value="NodePort">NodePort</SelectItem>
                            <SelectItem value="LoadBalancer">LoadBalancer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Port</Label>
                        <Input type="number" value={svcConfig.port} onChange={(e) => setSvcConfig({ ...svcConfig, port: parseInt(e.target.value) || 80 })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Port</Label>
                        <Input type="number" value={svcConfig.targetPort} onChange={(e) => setSvcConfig({ ...svcConfig, targetPort: parseInt(e.target.value) || 80 })} />
                      </div>
                      {svcConfig.type === 'NodePort' && (
                        <div className="space-y-2">
                          <Label>Node Port</Label>
                          <Input type="number" value={svcConfig.nodePort || ''} onChange={(e) => setSvcConfig({ ...svcConfig, nodePort: parseInt(e.target.value) || undefined })} placeholder="30000-32767" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Selector (app label)</Label>
                      <Input value={svcConfig.selector.app || ''} onChange={(e) => setSvcConfig({ ...svcConfig, selector: { app: e.target.value } })} placeholder="my-app" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {resourceType === 'ConfigMap' && (
                <Card>
                  <CardHeader>
                    <CardTitle>ConfigMap Config</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={cmConfig.name} onChange={(e) => setCmConfig({ ...cmConfig, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Namespace</Label>
                        <Input value={cmConfig.namespace} onChange={(e) => setCmConfig({ ...cmConfig, namespace: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Data</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setCmConfig({ ...cmConfig, data: [...cmConfig.data, { key: '', value: '' }] })}>
                          <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      </div>
                      {cmConfig.data.map((entry, i) => (
                        <div key={i} className="flex gap-2">
                          <Input placeholder="key" value={entry.key} onChange={(e) => { const data = [...cmConfig.data]; data[i] = { ...data[i], key: e.target.value }; setCmConfig({ ...cmConfig, data }); }} />
                          <Input placeholder="value" value={entry.value} onChange={(e) => { const data = [...cmConfig.data]; data[i] = { ...data[i], value: e.target.value }; setCmConfig({ ...cmConfig, data }); }} />
                          <Button type="button" variant="ghost" size="sm" onClick={() => setCmConfig({ ...cmConfig, data: cmConfig.data.filter((_, j) => j !== i) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {resourceType === 'Secret' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Secret Config</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={secretConfig.name} onChange={(e) => setSecretConfig({ ...secretConfig, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Namespace</Label>
                        <Input value={secretConfig.namespace} onChange={(e) => setSecretConfig({ ...secretConfig, namespace: e.target.value })} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Type</Label>
                        <Select value={secretConfig.type} onValueChange={(v) => setSecretConfig({ ...secretConfig, type: v as SecretConfig['type'] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Opaque">Opaque</SelectItem>
                            <SelectItem value="kubernetes.io/tls">kubernetes.io/tls</SelectItem>
                            <SelectItem value="kubernetes.io/dockerconfigjson">kubernetes.io/dockerconfigjson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Data (values will be base64 encoded)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setSecretConfig({ ...secretConfig, data: [...secretConfig.data, { key: '', value: '' }] })}>
                          <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      </div>
                      {secretConfig.data.map((entry, i) => (
                        <div key={i} className="flex gap-2">
                          <Input placeholder="key" value={entry.key} onChange={(e) => { const data = [...secretConfig.data]; data[i] = { ...data[i], key: e.target.value }; setSecretConfig({ ...secretConfig, data }); }} />
                          <Input placeholder="value (plain text)" value={entry.value} onChange={(e) => { const data = [...secretConfig.data]; data[i] = { ...data[i], value: e.target.value }; setSecretConfig({ ...secretConfig, data }); }} />
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSecretConfig({ ...secretConfig, data: secretConfig.data.filter((_, j) => j !== i) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="lg:sticky lg:top-8 self-start">
              <CardHeader>
                <CardTitle>Generated YAML</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="rounded-md bg-muted p-4 font-mono text-sm overflow-auto whitespace-pre max-h-[600px]">
                  {output}
                </pre>
                <div className="flex justify-end">
                  <Button type="button" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
