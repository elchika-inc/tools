import { useMemo, useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { type EnigmaConfig, enigmaEncrypt, type RotorName } from "./utils/enigma";
import { toast, ToastToaster } from "@/components/ui/toast";

const ROTOR_OPTIONS: RotorName[] = ["I", "II", "III"];

function App() {
  const [input, setInput] = useState("");
  const [rotors, setRotors] = useState<[RotorName, RotorName, RotorName]>(["I", "II", "III"]);
  const [positions, setPositions] = useState<[number, number, number]>([0, 0, 0]);
  const config: EnigmaConfig = useMemo(() => ({ rotors, positions }), [rotors, positions]);
  const output = useMemo(() => {
    if (!input) return "";
    return enigmaEncrypt(input, config);
  }, [input, config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: "Copied!" });
    } catch {
      toast.add({ title: "Copy failed", type: "error" });
    }
  };

  const updateRotor = (index: number, value: RotorName) => {
    const newRotors = [...rotors] as [RotorName, RotorName, RotorName];
    newRotors[index] = value;
    setRotors(newRotors);
  };

  const updatePosition = (index: number, value: number) => {
    const newPositions = [...positions] as [number, number, number];
    newPositions[index] = value;
    setPositions(newPositions);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl">
          <header className="sr-only">
            <h1>Enigma Cipher Simulator</h1>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Enigma Cipher Simulator</CardTitle>
                <CardDescription>Historical Enigma machine simulation (Enigma I)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={`rotor-${ROTOR_OPTIONS[i]}`} className="space-y-2">
                      <Label htmlFor={`rotor-select-${i}`}>Rotor {i + 1}</Label>
                      <select
                        id={`rotor-select-${i}`}
                        className="w-full rounded-md border p-2"
                        value={rotors[i]}
                        onChange={(e) => updateRotor(i, e.target.value as RotorName)}
                      >
                        {ROTOR_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <Label htmlFor={`rotor-position-${i}`}>Position</Label>
                      <input
                        id={`rotor-position-${i}`}
                        type="number"
                        className="w-full rounded-md border p-2"
                        min={0}
                        max={25}
                        value={positions[i]}
                        onChange={(e) => updatePosition(i, Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="w-full rounded-md border p-3 font-mono text-sm"
                    rows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text..."
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="output">Output</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!output}
                      type="button"
                    >
                      Copy
                    </Button>
                  </div>
                  <textarea
                    id="output"
                    aria-label="Encrypted output"
                    className="w-full rounded-md border bg-gray-50 p-3 font-mono text-sm"
                    rows={4}
                    value={output}
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}

export default App;
