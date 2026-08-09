import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  COMMON_MODES,
  DEFAULT_PERMISSIONS,
  octalToPermissions,
  type Permissions,
  permissionsToOctal,
  permissionsToSymbolic,
} from '@/utils/chmod';
import { toast, ToastToaster } from "@/components/ui/toast";

const ROLES = ['owner', 'group', 'others'] as const;
const PERMS = ['read', 'write', 'execute'] as const;
const PERM_LABELS = { read: 'R', write: 'W', execute: 'X' };
const ROLE_LABELS = { owner: 'Owner', group: 'Group', others: 'Others' };

export default function App() {
  const [permissions, setPermissions] = useState<Permissions>(DEFAULT_PERMISSIONS);
  const octal = useMemo(() => permissionsToOctal(permissions), [permissions]);
  const symbolic = useMemo(() => permissionsToSymbolic(permissions), [permissions]);

  const toggle = (role: (typeof ROLES)[number], perm: (typeof PERMS)[number]) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }));
  };

  const setFromOctal = (val: string) => {
    const perms = octalToPermissions(val);
    if (perms) setPermissions(perms);
  };

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Chmod Calculator</h1>
            <p className="text-muted-foreground">
              ファイルパーミッションの数値/記号表記を相互変換します。
            </p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>チェックボックスで権限を設定してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2" />
                      {PERMS.map((p) => (
                        <th key={p} className="text-center py-2 w-20">
                          {PERM_LABELS[p]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROLES.map((role) => (
                      <tr key={role} className="border-b">
                        <td className="py-2 font-medium">{ROLE_LABELS[role]}</td>
                        {PERMS.map((perm) => (
                          <td key={perm} className="text-center py-2">
                            <input
                              type="checkbox"
                              aria-label={`${ROLE_LABELS[role]} ${perm}`}
                              checked={permissions[role][perm]}
                              onChange={() => toggle(role, perm)}
                              className="h-5 w-5 rounded border-input cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Octal</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-3xl font-mono font-bold">{octal}</code>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => copyValue(octal)}
                        aria-label="Copy octal value"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Label className="text-xs text-muted-foreground" htmlFor="octal-input">
                        直接入力:
                      </Label>
                      <input
                        id="octal-input"
                        type="text"
                        maxLength={3}
                        value={octal}
                        onChange={(e) => setFromOctal(e.target.value)}
                        className="w-16 text-center rounded border border-input bg-background px-2 py-1 text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Symbolic</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xl font-mono">{symbolic}</code>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => copyValue(symbolic)}
                        aria-label="Copy symbolic value"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <code className="text-xs text-muted-foreground font-mono block">
                      chmod {octal}
                    </code>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">よく使うモード</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {COMMON_MODES.map((m) => (
                      <button
                        type="button"
                        key={m.octal}
                        onClick={() => setFromOctal(m.octal)}
                        className="px-2 py-1 rounded text-xs border hover:bg-muted transition-colors font-mono"
                      >
                        {m.octal} ({m.desc})
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
