import { Copy, Network, Search, Shuffle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CidrRange } from '@/utils/cidr';
import { cidrContainsIp, cidrsOverlap, isValidCidr, isValidIp, parseCidr } from '@/utils/cidr';
import { toast, ToastToaster } from "@/components/ui/toast";

function ResultRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-mono">{String(value)}</span>
    </div>
  );
}

export default function App() {
  const [cidrInput, setCidrInput] = useState('');
  const [cidrResult, setCidrResult] = useState<CidrRange | null>(null);
  const [cidrError, setCidrError] = useState('');

  const [containsCidr, setContainsCidr] = useState('');
  const [containsIp, setContainsIp] = useState('');
  const [containsResult, setContainsResult] = useState<boolean | null>(null);
  const [containsError, setContainsError] = useState('');

  const [overlapCidr1, setOverlapCidr1] = useState('');
  const [overlapCidr2, setOverlapCidr2] = useState('');
  const [overlapResult, setOverlapResult] = useState<boolean | null>(null);
  const [overlapError, setOverlapError] = useState('');
  const handleParse = () => {
    setCidrError('');
    if (!isValidCidr(cidrInput)) {
      setCidrError('Invalid CIDR notation. Example: 192.168.1.0/24');
      setCidrResult(null);
      return;
    }
    const result = parseCidr(cidrInput);
    setCidrResult(result);
  };

  const handleContainsCheck = () => {
    setContainsError('');
    if (!isValidCidr(containsCidr)) {
      setContainsError('Invalid CIDR notation.');
      setContainsResult(null);
      return;
    }
    if (!isValidIp(containsIp)) {
      setContainsError('Invalid IP address.');
      setContainsResult(null);
      return;
    }
    setContainsResult(cidrContainsIp(containsCidr, containsIp));
  };

  const handleOverlapCheck = () => {
    setOverlapError('');
    if (!isValidCidr(overlapCidr1)) {
      setOverlapError('Invalid CIDR 1 notation.');
      setOverlapResult(null);
      return;
    }
    if (!isValidCidr(overlapCidr2)) {
      setOverlapError('Invalid CIDR 2 notation.');
      setOverlapResult(null);
      return;
    }
    setOverlapResult(cidrsOverlap(overlapCidr1, overlapCidr2));
  };

  const copyResultToClipboard = async () => {
    if (!cidrResult) return;
    const text = [
      `CIDR: ${cidrResult.cidr}`,
      `Network: ${cidrResult.networkAddress}`,
      `Broadcast: ${cidrResult.broadcastAddress}`,
      `First Host: ${cidrResult.firstHost}`,
      `Last Host: ${cidrResult.lastHost}`,
      `Total Addresses: ${cidrResult.totalAddresses}`,
      `Subnet Mask: ${cidrResult.subnetMask}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const clearAll = () => {
    setCidrInput('');
    setCidrResult(null);
    setCidrError('');
    setContainsCidr('');
    setContainsIp('');
    setContainsResult(null);
    setContainsError('');
    setOverlapCidr1('');
    setOverlapCidr2('');
    setOverlapResult(null);
    setOverlapError('');
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CIDR Calculator</h1>
            <p className="text-muted-foreground">
              Calculate IP address ranges, check containment, and detect overlaps.
            </p>
          </header>

          <main className="space-y-6">
          {/* CIDR Parser */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                CIDR Range Calculator
              </CardTitle>
              <CardDescription>
                Enter a CIDR notation to calculate the IP address range.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="cidr-input">CIDR Notation</Label>
                  <Input
                    id="cidr-input"
                    placeholder="e.g. 192.168.1.0/24"
                    value={cidrInput}
                    onChange={(e) => setCidrInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleParse()}
                  />
                </div>
                <Button type="button" onClick={handleParse} disabled={!cidrInput}>
                  Calculate
                </Button>
              </div>
              {cidrError && <p role="alert" className="text-sm text-destructive">{cidrError}</p>}
              {cidrResult && (
                <div className="rounded-md border p-4 space-y-1">
                  <ResultRow label="CIDR" value={cidrResult.cidr} />
                  <ResultRow label="Network Address" value={cidrResult.networkAddress} />
                  <ResultRow label="Broadcast Address" value={cidrResult.broadcastAddress} />
                  <ResultRow label="First Host" value={cidrResult.firstHost} />
                  <ResultRow label="Last Host" value={cidrResult.lastHost} />
                  <ResultRow
                    label="Total Addresses"
                    value={cidrResult.totalAddresses.toLocaleString()}
                  />
                  <ResultRow label="Subnet Mask" value={cidrResult.subnetMask} />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear All
                </Button>
                <Button type="button" onClick={copyResultToClipboard} disabled={!cidrResult}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Result
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* IP Containment Checker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                IP Containment Check
              </CardTitle>
              <CardDescription>Check if an IP address belongs to a CIDR range.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr,1fr,auto] items-end">
                <div className="space-y-2">
                  <Label htmlFor="contains-cidr">CIDR Range</Label>
                  <Input
                    id="contains-cidr"
                    placeholder="e.g. 192.168.1.0/24"
                    value={containsCidr}
                    onChange={(e) => setContainsCidr(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contains-ip">IP Address</Label>
                  <Input
                    id="contains-ip"
                    placeholder="e.g. 192.168.1.100"
                    value={containsIp}
                    onChange={(e) => setContainsIp(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleContainsCheck}
                  disabled={!containsCidr || !containsIp}
                >
                  Check
                </Button>
              </div>
              {containsError && <p role="alert" className="text-sm text-destructive">{containsError}</p>}
              {containsResult !== null && (
                <div
                  className={`rounded-md border p-4 text-sm font-medium ${
                    containsResult
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-red-500 bg-red-50 text-red-900'
                  }`}
                >
                  {containsResult
                    ? `${containsIp} is within ${containsCidr}`
                    : `${containsIp} is NOT within ${containsCidr}`}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CIDR Overlap Checker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                CIDR Overlap Check
              </CardTitle>
              <CardDescription>Check if two CIDR ranges overlap.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr,1fr,auto] items-end">
                <div className="space-y-2">
                  <Label htmlFor="overlap-cidr1">CIDR Range 1</Label>
                  <Input
                    id="overlap-cidr1"
                    placeholder="e.g. 10.0.0.0/8"
                    value={overlapCidr1}
                    onChange={(e) => setOverlapCidr1(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overlap-cidr2">CIDR Range 2</Label>
                  <Input
                    id="overlap-cidr2"
                    placeholder="e.g. 10.1.0.0/16"
                    value={overlapCidr2}
                    onChange={(e) => setOverlapCidr2(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleOverlapCheck}
                  disabled={!overlapCidr1 || !overlapCidr2}
                >
                  Check
                </Button>
              </div>
              {overlapError && <p role="alert" className="text-sm text-destructive">{overlapError}</p>}
              {overlapResult !== null && (
                <div
                  className={`rounded-md border p-4 text-sm font-medium ${
                    overlapResult
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-900'
                      : 'border-green-500 bg-green-50 text-green-900'
                  }`}
                >
                  {overlapResult
                    ? `${overlapCidr1} and ${overlapCidr2} OVERLAP`
                    : `${overlapCidr1} and ${overlapCidr2} do NOT overlap`}
                </div>
              )}
            </CardContent>
          </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
