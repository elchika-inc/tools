import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Upload, Download, ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import {
  parse,
  formatDateTime,
  formatRRule,
  eventToIcs,
  type ICalEvent,
} from '@/utils/icalParser';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [events, setEvents] = useState<ICalEvent[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedEvent, setSelectedEvent] = useState<ICalEvent | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const handleParse = () => {
    try {
      const parsed = parse(input);
      setEvents(parsed);
      setSelectedEvent(null);

      // Set calendar to first event's month
      const firstEvent = parsed.find((e) => e.dtstart);
      if (firstEvent?.dtstart) {
        setCalendarMonth(new Date(firstEvent.dtstart.getFullYear(), firstEvent.dtstart.getMonth(), 1));
      }

      toast.add({ title: `${parsed.length} item(s) parsed` });
    } catch (e) {
      toast.add({
        title: 'Parse failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        type: "error",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
    };
    reader.readAsText(file);
  };

  const handleExportEvent = (event: ICalEvent) => {
    const ics = eventToIcs(event);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.summary || 'event'}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
    setEvents([]);
    setSelectedEvent(null);
  };

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { date: Date; events: ICalEvent[]; isCurrentMonth: boolean }[] = [];

    // Days from previous month
    const startDow = firstDay.getDay();
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, events: [], isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dayEvents = events.filter((event) => {
        if (!event.dtstart) return false;
        return (
          event.dtstart.getFullYear() === year &&
          event.dtstart.getMonth() === month &&
          event.dtstart.getDate() === d
        );
      });
      days.push({ date, events: dayEvents, isCurrentMonth: true });
    }

    // Remaining days to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, events: [], isCurrentMonth: false });
    }

    return days;
  }, [calendarMonth, events]);

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'VEVENT': return 'Event';
      case 'VTODO': return 'Todo';
      case 'VJOURNAL': return 'Journal';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'VEVENT': return 'bg-blue-100 text-blue-800';
      case 'VTODO': return 'bg-amber-100 text-amber-800';
      case 'VJOURNAL': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">iCalendar Parser</h1>
            <p className="text-muted-foreground">
              Parse iCalendar (.ics) files. View events, todos, and journals in list or calendar view. Export individual events.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Upload an .ics file or paste iCalendar content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".ics,.ical,.ifb,.icalendar"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                    <Upload className="h-4 w-4" /> Upload .ics
                  </div>
                </label>
              </div>

              <textarea
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder={'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Meeting\nDTSTART:20240115T100000\nDTEND:20240115T110000\nEND:VEVENT\nEND:VCALENDAR'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <div className="flex gap-2">
                <Button type="button" onClick={handleParse} disabled={!input}>
                  Parse
                </Button>
                <Button type="button" variant="outline" onClick={clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {events.length > 0 && (
            <>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="mr-2 h-4 w-4" /> List View
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="mr-2 h-4 w-4" /> Calendar View
                </Button>
              </div>

              {viewMode === 'list' ? (
                <div className="grid gap-4">
                  {events.map((event, index) => (
                    <Card
                      key={event.uid || index}
                      className={`cursor-pointer transition-shadow hover:shadow-md ${
                        selectedEvent === event ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedEvent(selectedEvent === event ? null : event)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadgeColor(event.type)}`}
                              >
                                {getTypeLabel(event.type)}
                              </span>
                              {event.status && (
                                <span className="text-xs text-muted-foreground">{event.status}</span>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg truncate">{event.summary || '(No title)'}</h3>
                            <div className="text-sm text-muted-foreground space-y-1 mt-1">
                              {event.dtstart && (
                                <p>
                                  {formatDateTime(event.dtstart)}
                                  {event.dtend && ` - ${formatDateTime(event.dtend)}`}
                                </p>
                              )}
                              {event.due && <p>Due: {formatDateTime(event.due)}</p>}
                              {event.location && <p>Location: {event.location}</p>}
                              {event.rrule && <p>Recurrence: {formatRRule(event.rrule)}</p>}
                            </div>

                            {selectedEvent === event && (
                              <div className="mt-4 space-y-2 text-sm border-t pt-4">
                                {event.description && (
                                  <div>
                                    <Label className="font-medium">Description</Label>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                                  </div>
                                )}
                                {event.categories.length > 0 && (
                                  <div>
                                    <Label className="font-medium">Categories</Label>
                                    <p className="text-muted-foreground">{event.categories.join(', ')}</p>
                                  </div>
                                )}
                                {event.organizer && (
                                  <div>
                                    <Label className="font-medium">Organizer</Label>
                                    <p className="text-muted-foreground">{event.organizer}</p>
                                  </div>
                                )}
                                {event.uid && (
                                  <div>
                                    <Label className="font-medium">UID</Label>
                                    <p className="text-muted-foreground text-xs">{event.uid}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(JSON.stringify(event, null, 2));
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportEvent(event);
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Button type="button" variant="outline" size="sm" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <CardTitle>
                        {calendarMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                      </CardTitle>
                      <Button type="button" variant="outline" size="sm" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-px bg-border">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="bg-muted p-2 text-center text-sm font-medium">
                          {day}
                        </div>
                      ))}
                      {calendarDays.map((day, index) => (
                        <div
                          key={index}
                          className={`bg-background p-2 min-h-[80px] ${
                            day.isCurrentMonth ? '' : 'opacity-40'
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
                          {day.events.map((event, eIndex) => (
                            <div
                              key={eIndex}
                              className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer ${getTypeBadgeColor(event.type)}`}
                              onClick={() => setSelectedEvent(event)}
                              title={event.summary}
                            >
                              {event.summary || '(No title)'}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
