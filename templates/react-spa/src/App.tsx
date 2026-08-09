import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  return (
    <ToastToaster>
      <div className="min-h-screen bg-background p-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>{{APP_TITLE}}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => toast.add({ title: "Hello!" })}>
              Click me
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToastToaster>
  );
}
