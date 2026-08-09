import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import {
  decodeCertificate,
  formatDistinguishedName,
  formatDate,
  type CertificateInfo,
} from '@/utils/certDecoder';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE_CERT = `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6
UA5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+s
WT8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qy
HB5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4xKz36l7lp283BWB9A
YhwfI8vUJTWTGTs9/K1xfxs4eP4ODCvqITdKcNnTiE8Sg68YxBG6WYJDSWJIWnRh
SZjGT0s6k68UG8ABBJW+yOR5Cqniv3n6Bk1DP7HY/1nIzn5bACqoHVOPzrfA1hx
WW+51T+DPwGFWLCxhBNTMREpb4JGFRGH+A/bwA2CJ0OJEISZ1FvD3/ByFZ4Okhk
VoigfH29V/yn9L+WVwMr6ZKVPNF85MJwFpk2TAGEzCjJdEp8UHejhaKf0n8a5cW6
mIWPpNEqIwH7TkSC7OMawjPPOsY9TT6s5RvxQfD0TwgjJFaiR/t3ZBPKCKwaYPp1
i5gqYfG6bYOEawBMoEWA0DfHAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogZiUvsJfk0fNjEhDQB/ec/5Y7M/aAW49C4u+8m0CVKK2b6
rky5l0e/0+gkGBJa0EPJU5Gf9gBQBIkAaGs3hDEaK6NKaEMok3LgSiQ1A2wMJfV
j3b2r0IJMiWDCgW37qPDPq0sSmBCgBN5Z2CyXPeCSEGa14MI7bGO9ZAL5Jr3vDss
Ny3cIGQyTyKQ0MoP0Jr69B2KCUAPBk8CVLM6a4r+baDaFhfkb8CAULH/G9x7mkqE
E8RD+mCJ3QWaMaFRLeZOrAWjFmqY5eUna9T/TWiuLf0Re2HS3R8hT1jlVfZ3xQ30
JKtGcoJj4VFGPzUhHpLtQmJawPKKnb0FoJYKo3LtNbOaOvLagd8KkjAcH7M3IEQR
s6SiU/KrnVnBqg8R7xT9LsjDWNz3M+KdANLb8sLcnafMosRD+znckXVCI9O/KXf4
wEyDWGUbfbPTB6ciA3hj8AJzXs5w3LHWP/ofjfDSIfsO2WxiQ/+GRKy/H0O2dE=
-----END CERTIFICATE-----`;

export default function App() {
  const [pemInput, setPemInput] = useState('');
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState('');
  const handleDecode = useCallback(() => {
    if (!pemInput.trim()) return;

    try {
      const info = decodeCertificate(pemInput);
      setCertInfo(info);
      setError('');
    } catch (e) {
      setCertInfo(null);
      setError(e instanceof Error ? e.message : 'Failed to decode certificate');
    }
  }, [pemInput]);

  const copyToClipboard = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: `Copied${label ? `: ${label}` : ''}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const loadSample = () => {
    setPemInput(SAMPLE_CERT);
  };

  const clearAll = () => {
    setPemInput('');
    setCertInfo(null);
    setError('');
  };

  const infoRows: { label: string; value: string }[] = certInfo
    ? [
        { label: 'Version', value: `v${certInfo.version}` },
        { label: 'Serial Number', value: certInfo.serialNumber },
        { label: 'Subject', value: formatDistinguishedName(certInfo.subject) },
        { label: 'Issuer', value: formatDistinguishedName(certInfo.issuer) },
        { label: 'Valid From', value: formatDate(certInfo.validFrom) },
        { label: 'Valid To', value: formatDate(certInfo.validTo) },
        {
          label: 'Status',
          value: certInfo.isExpired
            ? 'Expired'
            : `Valid (${certInfo.daysRemaining} days remaining)`,
        },
        { label: 'Signature Algorithm', value: certInfo.signatureAlgorithm },
        { label: 'Public Key', value: `${certInfo.publicKeyAlgorithm} ${certInfo.publicKeySize}` },
        ...(certInfo.subjectAltNames.length > 0
          ? [{ label: 'Subject Alt Names', value: certInfo.subjectAltNames.join(', ') }]
          : []),
      ]
    : [];

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SSL Certificate Decoder</h1>
            <p className="text-muted-foreground">
              PEM形式のSSL証明書をデコードして詳細情報を表示します。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>PEM Certificate Input</CardTitle>
              <CardDescription>
                PEM形式の証明書を貼り付けてください (-----BEGIN CERTIFICATE----- で始まるもの)。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                aria-label="PEM certificate input"
                className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                placeholder="-----BEGIN CERTIFICATE-----
  MIIFazCCA1OgAwIBAgIRAII...
  -----END CERTIFICATE-----"
                value={pemInput}
                onChange={(e) => setPemInput(e.target.value)}
              />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-between">
                <Button type="button" variant="outline" size="sm" onClick={loadSample}>
                  Load Sample
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={clearAll}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={handleDecode} disabled={!pemInput.trim()}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Decode
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {certInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {certInfo.isExpired ? (
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  )}
                  Certificate Details
                  <span
                    className={`text-sm px-2 py-0.5 rounded-full ${
                      certInfo.isExpired
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {certInfo.isExpired ? 'Expired' : 'Valid'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <Label className="w-40 text-right text-sm font-medium shrink-0 pt-2">
                        {row.label}
                      </Label>
                      <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all min-h-[36px]">
                        {row.value}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => copyToClipboard(row.value, row.label)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
