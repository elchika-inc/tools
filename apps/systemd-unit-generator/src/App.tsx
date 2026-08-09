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
  generateServiceUnit,
  generateTimerUnit,
  defaultServiceConfig,
  defaultTimerConfig,
  type UnitType,
  type ServiceConfig,
  type TimerConfig,
} from '@/utils/systemdGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [unitType, setUnitType] = useState<UnitType>('service');
  const [svcConfig, setSvcConfig] = useState<ServiceConfig>({ ...defaultServiceConfig });
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({ ...defaultTimerConfig });
  const output = useMemo(() => {
    return unitType === 'service'
      ? generateServiceUnit(svcConfig)
      : generateTimerUnit(timerConfig);
  }, [unitType, svcConfig, timerConfig]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const updateSvc = (partial: Partial<ServiceConfig>) => {
    setSvcConfig({ ...svcConfig, ...partial });
  };

  const updateTimer = (partial: Partial<TimerConfig>) => {
    setTimerConfig({ ...timerConfig, ...partial });
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
            <h1 className="text-3xl font-bold tracking-tight">Systemd Unit Generator</h1>
            <p className="text-muted-foreground">
              Generate systemd service and timer unit files from form inputs.
            </p>
          </header>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label>Unit Type</Label>
                <Select value={unitType} onValueChange={(v) => setUnitType(v as UnitType)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service (.service)</SelectItem>
                    <SelectItem value="timer">Timer (.timer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              {unitType === 'service' ? (
                <>
                  <Card>
                    <CardHeader><CardTitle>Unit Section</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={svcConfig.description} onChange={(e) => updateSvc({ description: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>After</Label>
                        <Input value={svcConfig.after} onChange={(e) => updateSvc({ after: e.target.value })} placeholder="network.target" />
                      </div>
                      <div className="space-y-2">
                        <Label>Requires</Label>
                        <Input value={svcConfig.requires} onChange={(e) => updateSvc({ requires: e.target.value })} placeholder="postgresql.service" />
                      </div>
                      <div className="space-y-2">
                        <Label>Wants</Label>
                        <Input value={svcConfig.wants} onChange={(e) => updateSvc({ wants: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Service Section</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={svcConfig.type} onValueChange={(v) => updateSvc({ type: v as ServiceConfig['type'] })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simple">simple</SelectItem>
                              <SelectItem value="forking">forking</SelectItem>
                              <SelectItem value="oneshot">oneshot</SelectItem>
                              <SelectItem value="notify">notify</SelectItem>
                              <SelectItem value="idle">idle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Restart</Label>
                          <Select value={svcConfig.restart} onValueChange={(v) => updateSvc({ restart: v as ServiceConfig['restart'] })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">no</SelectItem>
                              <SelectItem value="always">always</SelectItem>
                              <SelectItem value="on-success">on-success</SelectItem>
                              <SelectItem value="on-failure">on-failure</SelectItem>
                              <SelectItem value="on-abnormal">on-abnormal</SelectItem>
                              <SelectItem value="on-abort">on-abort</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>ExecStart</Label>
                        <Input value={svcConfig.execStart} onChange={(e) => updateSvc({ execStart: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>ExecStop (optional)</Label>
                        <Input value={svcConfig.execStop} onChange={(e) => updateSvc({ execStop: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>User</Label>
                          <Input value={svcConfig.user} onChange={(e) => updateSvc({ user: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Group</Label>
                          <Input value={svcConfig.group} onChange={(e) => updateSvc({ group: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>WorkingDirectory</Label>
                        <Input value={svcConfig.workingDirectory} onChange={(e) => updateSvc({ workingDirectory: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>RestartSec</Label>
                        <Input value={svcConfig.restartSec} onChange={(e) => updateSvc({ restartSec: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Environment Variables</CardTitle>
                      <Button type="button" variant="outline" size="sm" onClick={() => updateSvc({ environment: [...svcConfig.environment, { key: '', value: '' }] })}>
                        <Plus className="mr-1 h-4 w-4" /> Add
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {svcConfig.environment.map((env, i) => (
                        <div key={i} className="flex gap-2">
                          <Input placeholder="KEY" value={env.key} onChange={(e) => { const environment = [...svcConfig.environment]; environment[i] = { ...environment[i], key: e.target.value }; updateSvc({ environment }); }} />
                          <Input placeholder="value" value={env.value} onChange={(e) => { const environment = [...svcConfig.environment]; environment[i] = { ...environment[i], value: e.target.value }; updateSvc({ environment }); }} />
                          <Button type="button" variant="ghost" size="sm" onClick={() => updateSvc({ environment: svcConfig.environment.filter((_, j) => j !== i) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {svcConfig.environment.length === 0 && (
                        <p className="text-sm text-muted-foreground">No environment variables.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="privatetmp" checked={svcConfig.enablePrivateTmp} onChange={(e) => updateSvc({ enablePrivateTmp: e.target.checked })} className="rounded" />
                        <Label htmlFor="privatetmp">PrivateTmp</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="protectsys" checked={svcConfig.enableProtectSystem} onChange={(e) => updateSvc({ enableProtectSystem: e.target.checked })} className="rounded" />
                        <Label htmlFor="protectsys">ProtectSystem</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="sandbox" checked={svcConfig.enableSandbox} onChange={(e) => updateSvc({ enableSandbox: e.target.checked })} className="rounded" />
                        <Label htmlFor="sandbox">Sandbox (NoNewPrivileges, ProtectHome, ReadOnly)</Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Install Section</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <Label>WantedBy</Label>
                      <Input value={svcConfig.wantedBy} onChange={(e) => updateSvc({ wantedBy: e.target.value })} />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader><CardTitle>Timer Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={timerConfig.description} onChange={(e) => updateTimer({ description: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>OnCalendar (cron-like schedule)</Label>
                        <Input value={timerConfig.onCalendar} onChange={(e) => updateTimer({ onCalendar: e.target.value })} placeholder="*-*-* 00:00:00" />
                      </div>
                      <div className="space-y-2">
                        <Label>OnBootSec (optional, e.g. 5min)</Label>
                        <Input value={timerConfig.onBootSec} onChange={(e) => updateTimer({ onBootSec: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>OnUnitActiveSec (optional, e.g. 1h)</Label>
                        <Input value={timerConfig.onUnitActiveSec} onChange={(e) => updateTimer({ onUnitActiveSec: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="persistent" checked={timerConfig.persistent} onChange={(e) => updateTimer({ persistent: e.target.checked })} className="rounded" />
                        <Label htmlFor="persistent">Persistent</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Unit (service to trigger)</Label>
                        <Input value={timerConfig.unit} onChange={(e) => updateTimer({ unit: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>WantedBy</Label>
                        <Input value={timerConfig.wantedBy} onChange={(e) => updateTimer({ wantedBy: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <Card className="lg:sticky lg:top-8 self-start">
              <CardHeader>
                <CardTitle>Generated Unit File</CardTitle>
                <CardDescription>
                  {unitType === 'service' ? 'my-app.service' : 'my-app.timer'}
                </CardDescription>
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
