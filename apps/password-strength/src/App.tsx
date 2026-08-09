import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { evaluateStrength } from '@/utils/passwordStrength';
import type { StrengthResult } from '@/utils/passwordStrength';
import { ToastToaster } from "@/components/ui/toast";

const strengthColors: Record<string, string> = {
  'very-weak': 'bg-red-500',
  weak: 'bg-orange-500',
  fair: 'bg-yellow-500',
  strong: 'bg-green-500',
  'very-strong': 'bg-emerald-600',
};

const strengthBarWidths: Record<number, string> = {
  0: 'w-1/5',
  1: 'w-2/5',
  2: 'w-3/5',
  3: 'w-4/5',
  4: 'w-full',
};

function CriteriaItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
          met ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {met ? '\u2713' : '\u2717'}
      </span>
      <span className={met ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </li>
  );
}

export default function App() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const result: StrengthResult | null = password ? evaluateStrength(password) : null;

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <main className="mx-auto max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Strength Checker</CardTitle>
              <CardDescription>
                Analyze password strength with entropy calculation and crack time estimation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to check..."
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>

              {result && (
                <>
                  {/* Strength Meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Strength</Label>
                      <span
                        className={`text-sm font-semibold ${
                          result.score <= 1
                            ? 'text-red-600'
                            : result.score === 2
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }`}
                      >
                        {result.label}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColors[result.level]} ${strengthBarWidths[result.score]}`}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">Entropy</p>
                      <p className="text-lg font-semibold">{result.entropy.toFixed(1)} bits</p>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">Estimated Crack Time</p>
                      <p className="text-lg font-semibold">{result.crackTime}</p>
                    </div>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-2">
                    <Label>Criteria</Label>
                    <ul className="space-y-1.5">
                      <CriteriaItem
                        met={result.criteria.minLength}
                        label={`Minimum 8 characters (${result.criteria.length} used)`}
                      />
                      <CriteriaItem met={result.criteria.hasUppercase} label="Uppercase letters (A-Z)" />
                      <CriteriaItem met={result.criteria.hasLowercase} label="Lowercase letters (a-z)" />
                      <CriteriaItem met={result.criteria.hasDigits} label="Numbers (0-9)" />
                      <CriteriaItem
                        met={result.criteria.hasSymbols}
                        label="Special characters (!@#$%^&*)"
                      />
                    </ul>
                  </div>

                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <Label>Suggestions</Label>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {result.suggestions.map((s) => (
                          <li key={s} className="flex items-start gap-2">
                            <span className="mt-0.5 text-yellow-500">!</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
