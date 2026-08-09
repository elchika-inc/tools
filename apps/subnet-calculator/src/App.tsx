import { Copy, Network, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SubnetInfo } from '@/utils/subnet';
import { calculateSubnet, isValidIp } from '@/utils/subnet';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [ipInput, setIpInput] = useState('192.168.1.0');
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState('');
  const handleCalculate = useCallback(() => {
    if (!isValidIp(ipInput)) {
      setError('Invalid IPv4 address');
      setResult(null);
      return;
    }
    if (cidr < 0 || cidr > 32) {
      setError('CIDR must be between 0 and 32');
      setResult(null);
      return;
    }
    setError('');
    setResult(calculateSubnet(ipInput, cidr));
  }, [ipInput, cidr]);

  const handleCidrSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCidr(value);
  };

  const handleCidrInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 32) {
      setCidr(value);
    }
  };

  const handleClear = () => {
    setIpInput('192.168.1.0');
    setCidr(24);
    setResult(null);
    setError('');
  };

  const copyResult = async () => {
    if (!result) return;
    const text = [
      `IP Address: ${result.ip}/${result.cidr}`,
      `Subnet Mask: ${result.subnetMask}`,
      `Network Address: ${result.networkAddress}`,
      `Broadcast Address: ${result.broadcastAddress}`,
      `First Host: ${result.firstHost}`,
      `Last Host: ${result.lastHost}`,
      `Total Hosts: ${result.totalHosts.toLocaleString()}`,
      `Usable Hosts: ${result.usableHosts.toLocaleString()}`,
      `Wildcard Mask: ${result.wildcardMask}`,
      `Binary Mask: ${result.binaryMask}`,
      `IP Class: ${result.ipClass}`,
      `Private: ${result.isPrivate ? 'Yes' : 'No'}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const rows: { label: string; value: string }[] = result
    ? [
        { label: 'IP Address', value: `${result.ip}/${result.cidr}` },
        { label: 'Subnet Mask', value: result.subnetMask },
        { label: 'Wildcard Mask', value: result.wildcardMask },
        { label: 'Network Address', value: result.networkAddress },
        { label: 'Broadcast Address', value: result.broadcastAddress },
        { label: 'First Usable Host', value: result.firstHost },
        { label: 'Last Usable Host', value: result.lastHost },
        { label: 'Total Hosts', value: result.totalHosts.toLocaleString() },
        { label: 'Usable Hosts', value: result.usableHosts.toLocaleString() },
        { label: 'Binary Mask', value: result.binaryMask },
        { label: 'IP Class', value: `Class ${result.ipClass}` },
        { label: 'Private Address', value: result.isPrivate ? 'Yes' : 'No' },
      ]
    : [];

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">IPv4 Subnet Calculator</h1>
            <p className="text-muted-foreground">
              Calculate subnet details from an IPv4 address and CIDR prefix length.
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Enter an IPv4 address and CIDR prefix.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[1fr,auto] items-end">
                <div className="space-y-2">
                  <Label htmlFor="ip-address">IPv4 Address</Label>
                  <Input
                    id="ip-address"
                    type="text"
                    placeholder="192.168.1.0"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidr-input">CIDR (/{cidr})</Label>
                  <Input
                    id="cidr-input"
                    type="number"
                    min={0}
                    max={32}
                    value={cidr}
                    onChange={handleCidrInput}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidr-slider">CIDR Slider</Label>
                <input
                  id="cidr-slider"
                  type="range"
                  min={0}
                  max={32}
                  value={cidr}
                  onChange={handleCidrSlider}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>/0</span>
                  <span>/8</span>
                  <span>/16</span>
                  <span>/24</span>
                  <span>/32</span>
                </div>
              </div>

              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button type="button" onClick={handleCalculate}>
                  <Network className="mr-2 h-4 w-4" /> Calculate
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Results</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.label} className="border-b last:border-b-0">
                          <td className="px-4 py-3 font-medium text-muted-foreground bg-muted/50 w-[200px]">
                            {row.label}
                          </td>
                          <td className="px-4 py-3 font-mono">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
