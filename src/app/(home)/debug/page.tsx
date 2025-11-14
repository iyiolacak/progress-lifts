"use client"

import { useEffect, useState } from "react"
import { getDB, resetDBForTests } from "@/localdb/db"
import type { EntryDocType } from "@/localdb/schema/entry"
import type { JobDocType } from "@/localdb/schema/jobs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Database, FileText, Briefcase, ScrollText, RefreshCw, Plus, List, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugPage() {
  const [status, setStatus] = useState<string>("idle")
  const [statusType, setStatusType] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [entries, setEntries] = useState<Record<string, unknown>[]>([])
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([])
  const [logs, setLogs] = useState<Record<string, unknown>[]>([])
  const [dbReady, setDbReady] = useState<boolean>(false)

  function errMsg(e: unknown) {
    if (e instanceof Error) return e.message
    try {
      return String(e)
    } catch {
      return "Unknown error"
    }
  }

  function updateStatus(message: string, type: "idle" | "loading" | "success" | "error" = "idle") {
    setStatus(message)
    setStatusType(type)
  }

  async function initDB() {
    updateStatus("Initializing database...", "loading")
    try {
      const db = await getDB()
      setDbReady(true)

      // Get collection counts
      try {
        const eCount = (await db.collections.entries.find().exec()).length
        const jCount = (await db.collections.jobs.find().exec()).length
        updateStatus(`Database ready — ${eCount} entries, ${jCount} jobs`, "success")
      } catch {
        updateStatus("Database ready", "success")
      }
    } catch (err: unknown) {
      updateStatus("Database initialization failed: " + errMsg(err), "error")
    }
  }

  async function listEntries() {
    updateStatus("Loading entries...", "loading")
    try {
      const db = await getDB()
      if (!db.collections?.entries) throw new Error("Entries collection missing")
      const rows = await db.collections.entries.find().exec()
      type RxDoc = { toJSON?: () => Record<string, unknown> }
      setEntries(rows.map((r: RxDoc) => (r.toJSON ? r.toJSON() : (r as unknown as Record<string, unknown>))))
      updateStatus(`Loaded ${rows.length} entries`, "success")
    } catch (err: unknown) {
      updateStatus("Failed to load entries: " + errMsg(err), "error")
    }
  }

  async function createSampleEntry() {
    updateStatus("Creating sample entry...", "loading")
    try {
      const db = await getDB()
      if (!db.collections?.entries) throw new Error("Entries collection missing")
      const now = Date.now()
      const payload: EntryDocType = {
        id: crypto.randomUUID(),
        kind: "text",
        content: { phaseA: { entryText: "Debug sample entry at " + new Date(now).toISOString() } },
        createdAt: now,
        updatedAt: now,
        givenContext: [],
      } as EntryDocType
      const doc = await db.collections.entries.insert(payload)
      updateStatus("Created entry: " + (doc?.id ?? "unknown"), "success")
      await listEntries()
    } catch (err: unknown) {
      updateStatus("Failed to create entry: " + errMsg(err), "error")
    }
  }

  async function enqueueJobForLastEntry() {
    updateStatus("Enqueuing job...", "loading")
    try {
      const db = await getDB()
      if (!db.collections?.jobs) throw new Error("Jobs collection missing")
      const last = entries[entries.length - 1]
      if (!last) throw new Error("No entries available — create one first")
      const now = Date.now()
      const job: JobDocType = {
        id: crypto.randomUUID(),
        type: "processEntry",
        entryId: last.id as string,
        status: "pending",
        attempts: 0,
        maxAttempts: 3,
        createdAt: now,
        updatedAt: now,
      } as JobDocType
      const inserted = await db.collections.jobs.insert(job)
      updateStatus("Enqueued job: " + (inserted?.id ?? "unknown"), "success")
      await listJobs()
    } catch (err: unknown) {
      updateStatus("Failed to enqueue job: " + errMsg(err), "error")
    }
  }

  async function listJobs() {
    updateStatus("Loading jobs...", "loading")
    try {
      const db = await getDB()
      if (!db.collections?.jobs) throw new Error("Jobs collection missing")
      const rows = await db.collections.jobs.find().exec()
      type RxDoc = { toJSON?: () => Record<string, unknown> }
      setJobs(rows.map((r: RxDoc) => (r.toJSON ? r.toJSON() : (r as unknown as Record<string, unknown>))))
      updateStatus(`Loaded ${rows.length} jobs`, "success")
    } catch (err: unknown) {
      updateStatus("Failed to load jobs: " + errMsg(err), "error")
    }
  }

  async function listLogs() {
    updateStatus("Loading logs...", "loading")
    try {
      const db = await getDB()
      if (!db.collections?.logs) throw new Error("Logs collection missing")
      const rows = await db.collections.logs.find().limit(100).exec()
      type RxDoc = { toJSON?: () => Record<string, unknown> }
      setLogs(rows.map((r: RxDoc) => (r.toJSON ? r.toJSON() : (r as unknown as Record<string, unknown>))))
      updateStatus(`Loaded ${rows.length} logs (max 100)`, "success")
    } catch (err: unknown) {
      updateStatus("Failed to load logs: " + errMsg(err), "error")
    }
  }

  async function resetDB() {
    updateStatus("Resetting database...", "loading")
    try {
      await resetDBForTests()
      setDbReady(false)
      setEntries([])
      setJobs([])
      setLogs([])
      updateStatus("Database reset — re-initialize to continue", "success")
    } catch (err: unknown) {
      updateStatus("Failed to reset database: " + errMsg(err), "error")
    }
  }

  useEffect(() => {
    // Auto-initialize on mount
    initDB()
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-3">
        </div>

        {/* Status Alert */}
        {status !== "idle" && (
          <Alert variant={statusType === "error" ? "destructive" : "default"}>
            <AlertCircle className="h-5 w-5" strokeWidth={2.5} />
            <AlertDescription className="flex items-center justify-between text-base">
              <span>{status}</span>
              {dbReady && (
                <Badge variant="secondary" className="ml-2 text-sm">
                  Connected
                </Badge>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Database Actions</CardTitle>
            <CardDescription className="text-base">Perform operations on your local database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={initDB} variant="default">
                <RefreshCw className="mr-2 h-5 w-5" strokeWidth={2.5} />
                Initialize DB
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <Button onClick={createSampleEntry} disabled={!dbReady} variant="secondary">
                <Plus className="mr-2 h-5 w-5" strokeWidth={2.5} />
                Create Entry
              </Button>
              <Button onClick={listEntries} disabled={!dbReady} variant="secondary">
                <List className="mr-2 h-5 w-5" strokeWidth={2.5} />
                List Entries
              </Button>
              <Button
                onClick={enqueueJobForLastEntry}
                disabled={!dbReady || entries.length === 0}
                variant="secondary"
                size="sm"
              >
                <Briefcase className="mr-2 h-5 w-5" strokeWidth={2.5} />
                Enqueue Job
              </Button>
              <Button onClick={listJobs} disabled={!dbReady} variant="secondary">
                <List className="mr-2 h-5 w-5" strokeWidth={2.5} />
                List Jobs
              </Button>
              <Button onClick={listLogs} disabled={!dbReady} variant="secondary">
                <ScrollText className="mr-2 h-5 w-5" strokeWidth={2.5} />
                List Logs
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <Button onClick={resetDB} variant="destructive">
                <Trash2 className="mr-2 h-5 w-5" strokeWidth={2.5} />
                Reset DB
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Tabs */}
        <Tabs defaultValue="entries" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entries" className="gap-2 text-base">
              <FileText className="h-5 w-5" strokeWidth={2.5} />
              Entries ({entries.length})
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2 text-base">
              <Briefcase className="h-5 w-5" strokeWidth={2.5} />
              Jobs ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2 text-base">
              <ScrollText className="h-5 w-5" strokeWidth={2.5} />
              Logs ({logs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Entries Collection</CardTitle>
                <CardDescription className="text-base">All entries stored in the local database</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border">
                  <pre className="p-4 text-base font-mono">
                    {entries.length > 0
                      ? JSON.stringify(entries, null, 2)
                      : "No entries found. Create a sample entry to get started."}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Jobs Collection</CardTitle>
                <CardDescription className="text-base">Background jobs and their processing status</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border">
                  <pre className="p-4 text-base font-mono">
                    {jobs.length > 0
                      ? JSON.stringify(jobs, null, 2)
                      : "No jobs found. Enqueue a job for an entry to see it here."}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Logs Collection</CardTitle>
                <CardDescription className="text-base">
                  System logs and activity records (limited to 100 most recent)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border">
                  <pre className="p-4 text-base font-mono">
                    {logs.length > 0
                      ? JSON.stringify(logs, null, 2)
                      : "No logs found. Database activity will be logged here."}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
