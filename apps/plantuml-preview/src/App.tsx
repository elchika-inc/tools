import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  parsePlantUml,
  generateClassDiagramSvg,
  svgToPngDataUrl,
} from '@/utils/plantumlParser';
import { toast, ToastToaster } from "@/components/ui/toast";

const EXAMPLES: Record<string, string> = {
  basic: `@startuml
class Animal {
  +name: string
  -age: number
  +speak(): void
  +move(distance: number): void
}

class Dog {
  +breed: string
  +bark(): void
  +fetch(item: string): void
}

class Cat {
  -indoor: boolean
  +purr(): void
  +scratch(): void
}

Dog --|> Animal
Cat --|> Animal
@enduml`,
  patterns: `@startuml
interface Observer {
  +update(data: any): void
}

class Subject {
  -observers: Observer[]
  +attach(o: Observer): void
  +detach(o: Observer): void
  +notify(): void
}

class ConcreteObserver {
  -state: any
  +update(data: any): void
}

ConcreteObserver ..|> Observer
Subject --> Observer : notifies
@enduml`,
  service: `@startuml
class UserController <<controller>> {
  +getUser(id: string)
  +createUser(data: UserDTO)
  +deleteUser(id: string)
}

class UserService <<service>> {
  -repository: UserRepository
  +findById(id: string): User
  +create(data: UserDTO): User
  +delete(id: string): void
}

interface UserRepository <<repository>> {
  +findById(id: string): User
  +save(user: User): User
  +delete(id: string): void
}

class User <<entity>> {
  +id: string
  +name: string
  +email: string
  +createdAt: Date
}

UserController --> UserService
UserService --> UserRepository
UserRepository --> User
@enduml`,
};

export default function App() {
  const [input, setInput] = useState(EXAMPLES.basic);

  const diagram = useMemo(() => parsePlantUml(input), [input]);
  const svgOutput = useMemo(() => generateClassDiagramSvg(diagram), [diagram]);

  const handleCopySvg = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(svgOutput);
      toast.add({ title: 'SVG copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy SVG', type: "error" });
    }
  }, [svgOutput]);

  const handleDownloadSvg = useCallback(() => {
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [svgOutput]);

  const handleDownloadPng = useCallback(async () => {
    try {
      const dataUrl = await svgToPngDataUrl(svgOutput);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'class-diagram.png';
      a.click();
    } catch {
      toast.add({ title: 'Failed to export PNG', type: "error" });
    }
  }, [svgOutput]);

  const handleExampleChange = useCallback((value: string) => {
    if (EXAMPLES[value]) {
      setInput(EXAMPLES[value]);
    }
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">PlantUML Preview</h1>
            <p className="text-muted-foreground">
              UML class diagram from PlantUML-like syntax
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Example Templates</Label>
                  <Select onValueChange={handleExampleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an example..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Inheritance</SelectItem>
                      <SelectItem value="patterns">Observer Pattern</SelectItem>
                      <SelectItem value="service">Service Layer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class Diagram Syntax</Label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="class Name { ... }"
                    className="font-mono min-h-[350px]"
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>class Name &#123; +public -private #protected ~package &#125;</p>
                  <p>interface Name &#123; +method() &#125;</p>
                  <p>A --|&gt; B (extends), A ..|&gt; B (implements)</p>
                  <p>A --&gt; B (assoc), A --o B (aggregation), A --* B (composition)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCopySvg}>
                      Copy SVG
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadSvg}>
                      SVG
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadPng}>
                      PNG
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 min-h-[350px] bg-white overflow-auto">
                  {/* SVG generated from our parser with XML-escaped content, safe to render */}
                  <div dangerouslySetInnerHTML={{ __html: svgOutput }} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {diagram.classes.length} classes, {diagram.relations.length} relations
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
