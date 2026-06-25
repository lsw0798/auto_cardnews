import { Redis } from "@upstash/redis"
import type { PipelineState, StepId, StepResult } from "@/types"

const ALL_STEPS: StepId[] = ["search", "curate", "template", "image", "assemble"]
const JOB_KEY_PREFIX = "cardnews:job:"
const JOB_INDEX_KEY = "cardnews:jobs"
const JOB_TTL_SECONDS = 60 * 60 * 24

let redisClient: Redis | null = null

function makeInitialStepResult(stepId: StepId): StepResult {
  return { stepId, status: "pending", agentLog: [] }
}

function makeInitialSteps(): Record<StepId, StepResult> {
  return Object.fromEntries(ALL_STEPS.map((id) => [id, makeInitialStepResult(id)])) as Record<StepId, StepResult>
}

function getRedis(): Redis {
  if (redisClient) return redisClient

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    throw new Error(
      "Upstash KV 환경변수가 필요합니다. UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN 또는 KV_REST_API_URL/KV_REST_API_TOKEN을 설정하세요."
    )
  }

  redisClient = new Redis({ url, token })
  return redisClient
}

function jobKey(jobId: string): string {
  return `${JOB_KEY_PREFIX}${jobId}`
}

export async function createJob(jobId: string, keyword: string): Promise<PipelineState> {
  const now = new Date().toISOString()
  const state: PipelineState = {
    jobId,
    keyword,
    status: "idle",
    currentStep: null,
    steps: makeInitialSteps(),
    outputs: {},
    createdAt: now,
    updatedAt: now,
  }

  const redis = getRedis()
  await redis.set(jobKey(jobId), state, { ex: JOB_TTL_SECONDS })
  await redis.zadd(JOB_INDEX_KEY, { score: Date.now(), member: jobId })
  return state
}

export async function getJob(jobId: string): Promise<PipelineState | undefined> {
  const state = await getRedis().get<PipelineState>(jobKey(jobId))
  return state ?? undefined
}

export async function updateJob(
  jobId: string,
  updater: (state: PipelineState) => PipelineState
): Promise<PipelineState | undefined> {
  const redis = getRedis()
  const current = await getJob(jobId)
  if (!current) return undefined

  const updated = updater({ ...current, updatedAt: new Date().toISOString() })
  await redis.set(jobKey(jobId), updated, { ex: JOB_TTL_SECONDS })
  return updated
}

export async function listJobs(): Promise<PipelineState[]> {
  const redis = getRedis()
  const jobIds = await redis.zrange<string[]>(JOB_INDEX_KEY, 0, 49, { rev: true })
  const jobs = await Promise.all(jobIds.map((id) => getJob(id)))
  return jobs.filter((job): job is PipelineState => Boolean(job))
}
