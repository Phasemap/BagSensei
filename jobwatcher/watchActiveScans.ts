// scan-jobs.ts

export type ScanStatus = "running" | "completed" | "failed"

export interface ScanJob {
  token: string
  startTime: number
  status: ScanStatus
  endTime?: number
  attempts: number
  error?: string
}

type Logger = (msg: string) => void

const scanJobs = new Map<string, ScanJob>()


export function registerScanJob(
  token: string,
  opts: { replace?: boolean; now?: number } = {}
): ScanJob {
  const now = opts.now ?? Date.now()
  const existing = scanJobs.get(token)

  if (existing?.status === "running" && !opts.replace) {
    return existing
  }

  const job: ScanJob = {
    token,
    startTime: now,
    status: "running",
    attempts: existing ? existing.attempts + 1 : 1,
  }
  scanJobs.set(token, job)
  return job
}

export function completeScanJob(token: string, opts: { now?: number } = {}): ScanJob | undefined {
  const job = scanJobs.get(token)
  if (!job || job.status !== "running") return job
  job.status = "completed"
  job.endTime = opts.now ?? Date.now()
  return job
}

export function failScanJob(
  token: string,
  error?: string,
  opts: { now?: number } = {}
): ScanJob | undefined {
  const job = scanJobs.get(token)
  if (!job || job.status !== "running") return job
  job.status = "failed"
  job.error = error
  job.endTime = opts.now ?? Date.now()
  return job
}

export function restartScanJob(token: string, opts: { now?: number } = {}): ScanJob {
  const now = opts.now ?? Date.now()
  const existing = scanJobs.get(token)
  const attempts = existing ? existing.attempts + 1 : 1
  const job: ScanJob = {
    token,
    startTime: now,
    status: "running",
    attempts,
  }
  scanJobs.set(token, job)
  return job
}

/** Return all jobs with status "running", sorted by startTime asc. */
export function getRunningJobs(): ScanJob[] {
  return [...scanJobs.values()]
    .filter((j) => j.status === "running")
    .sort((a, b) => a.startTime - b.startTime)
}

/** Get a snapshot of all jobs. */
export function getAllJobs(): ScanJob[] {
  return [...scanJobs.values()].sort((a, b) => a.startTime - b.startTime)
}

/** Remove a job from the registry (any status). */
export function removeScanJob(token: string): boolean {
  return scanJobs.delete(token)
}

/** Clear the registry. */
export function clearScanJobs(): void {
  scanJobs.clear()
}

/** Basic stats across the registry. */
export function getScanStats(): {
  total: number
  running: number
  completed: number
  failed: number
} {
  const all = [...scanJobs.values()]
  const running = all.filter((j) => j.status === "running").length
  const completed = all.filter((j) => j.status === "completed").length
  const failed = all.filter((j) => j.status === "failed").length
  return { total: all.length, running, completed, failed }
}

/** Human-friendly elapsed formatter (e.g., "1h 03m 02s"). */
function fmtElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const parts = []
  if (h) parts.push(`${h}h`)
  parts.push(String(m).padStart(2, "0") + "m")
  parts.push(String(sec).padStart(2, "0") + "s")
  return parts.join(" ")
}

/** Print a concise summary of active scans. */
export function printActiveScanSummary(log: Logger = console.log): void {
  const running = getRunningJobs()
  log(`Currently running ${running.length} scan(s):`)
  const now = Date.now()
  for (const job of running) {
    const elapsedMs = now - job.startTime
    log(`• ${job.token} — ${fmtElapsed(elapsedMs)} elapsed (attempt ${job.attempts})`)
  }
}

/**
 * Run an async scan task with automatic lifecycle transitions.
 * - Registers (or restarts with replace=true) before execution
 * - Marks job completed/failed on resolution
 */
export async function runScan<T>(
  token: string,
  task: () => Promise<T>,
  opts: { replace?: boolean; now?: number; onErrorLog?: Logger } = {}
): Promise<T> {
  registerScanJob(token, { replace: opts.replace ?? true, now: opts.now })
  try {
    const result = await task()
    completeScanJob(token)
    return result
  } catch (err: any) {
    failScanJob(token, err?.message || String(err))
    opts.onErrorLog?.(`Scan "${token}" failed: ${err?.message || err}`)
    throw err
  }
}
