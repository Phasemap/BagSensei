import { Connection } from "@solana/web3.js"
import { registerScanJob, completeScanJob } from "./watchActiveScans"

interface JobSchedule {
  token: string
  intervalMs: number
  lastRun: number
  retries: number
  maxRetries: number
  active: boolean
}

const jobQueue: JobSchedule[] = []

export function scheduleJob(token: string, intervalMs: number, maxRetries = 3): void {
  jobQueue.push({
    token,
    intervalMs,
    lastRun: 0,
    retries: 0,
    maxRetries,
    active: true
  })
  console.log(`Scheduled job for token ${token} with interval ${intervalMs}ms`)
}

export function cancelJob(token: string): void {
  const job = jobQueue.find(j => j.token === token)
  if (job) {
    job.active = false
    console.log(`Cancelled job for token ${token}`)
  }
}

export async function runJobQueue(connection: Connection): Promise<void> {
  const now = Date.now()

  for (const job of jobQueue) {
    if (!job.active) continue

    if (now - job.lastRun >= job.intervalMs) {
      console.log(`Running scan for token ${job.token}`)
      registerScanJob(job.token)

      try {
        await new Promise(res => setTimeout(res, 500))

        completeScanJob(job.token)
        job.lastRun = now
        job.retries = 0
        console.log(`Job for token ${job.token} completed successfully`)
      } catch (err) {
        job.retries++
        console.warn(`Job failed for ${job.token}, attempt ${job.retries}/${job.maxRetries}`, err)

        if (job.retries >= job.maxRetries) {
          job.active = false
          console.error(`Job for token ${job.token} disabled after ${job.maxRetries} failures`)
        }
      }
    }
  }
}

export function listJobs(): void {
  console.table(
    jobQueue.map(j => ({
      token: j.token,
      interval: `${j.intervalMs}ms`,
      lastRun: j.lastRun ? new Date(j.lastRun).toISOString() : "never",
      retries: j.retries,
      maxRetries: j.maxRetries,
      active: j.active
    }))
  )
}
