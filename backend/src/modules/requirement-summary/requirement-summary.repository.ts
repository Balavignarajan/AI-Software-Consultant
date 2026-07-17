import { and, asc, eq, isNull } from "drizzle-orm";
import { db, type DbExecutor } from "../../db/index.js";
import {
  aiGenerations,
  consultations,
  conversationMessages,
  organizations,
  requirementSummaries,
  type StructuredRequirementSummary,
} from "../../db/schema/index.js";

export type ConsultationRecord = typeof consultations.$inferSelect;
export type OrganizationRecord = typeof organizations.$inferSelect;
export type ConversationMessageRecord =
  typeof conversationMessages.$inferSelect;
export type RequirementSummaryRecord =
  typeof requirementSummaries.$inferSelect;

export type CreateAiGenerationData = {
  organizationId: string;
  consultationId: string;
  conversationMessageId: string | null;
  provider: string;
  model: string;
  promptType: string;
  promptVersion: string;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCost: string;
  status: "success" | "failed";
  errorMessage: string | null;
};

export type UpsertRequirementSummaryData = {
  organizationId: string;
  consultationId: string;
  summaryMarkdown: string;
  structuredSummary: StructuredRequirementSummary;
  version: number;
  status: "draft" | "finalized";
  generatedBy: "AI" | "USER";
};

export type UpdateRequirementSummaryData = {
  summaryMarkdown?: string;
  structuredSummary?: StructuredRequirementSummary;
  status?: "draft" | "finalized";
  generatedBy?: "AI" | "USER";
  version?: number;
};

export class RequirementSummaryRepository {
  async runInTransaction<T>(
    callback: (tx: DbExecutor) => Promise<T>,
  ): Promise<T> {
    return db.transaction(async (tx) => callback(tx));
  }

  async findConsultationByIdAndOrganization(
    consultationId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<ConsultationRecord | null> {
    const [consultation] = await executor
      .select()
      .from(consultations)
      .where(
        and(
          eq(consultations.id, consultationId),
          eq(consultations.organizationId, organizationId),
          isNull(consultations.deletedAt),
        ),
      )
      .limit(1);

    return consultation ?? null;
  }

  async findOrganizationById(
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<OrganizationRecord | null> {
    const [organization] = await executor
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.id, organizationId),
          isNull(organizations.deletedAt),
        ),
      )
      .limit(1);

    return organization ?? null;
  }

  async findMessagesByConsultation(
    consultationId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<ConversationMessageRecord[]> {
    return executor
      .select()
      .from(conversationMessages)
      .where(
        and(
          eq(conversationMessages.consultationId, consultationId),
          eq(conversationMessages.organizationId, organizationId),
          isNull(conversationMessages.deletedAt),
        ),
      )
      .orderBy(
        asc(conversationMessages.createdAt),
        asc(conversationMessages.id),
      );
  }

  async findByConsultationId(
    consultationId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<RequirementSummaryRecord | null> {
    const [summary] = await executor
      .select()
      .from(requirementSummaries)
      .where(
        and(
          eq(requirementSummaries.consultationId, consultationId),
          eq(requirementSummaries.organizationId, organizationId),
          isNull(requirementSummaries.deletedAt),
        ),
      )
      .limit(1);

    return summary ?? null;
  }

  async create(
    data: UpsertRequirementSummaryData,
    executor: DbExecutor = db,
  ): Promise<RequirementSummaryRecord> {
    const [summary] = await executor
      .insert(requirementSummaries)
      .values({
        organizationId: data.organizationId,
        consultationId: data.consultationId,
        summaryMarkdown: data.summaryMarkdown,
        structuredSummary: data.structuredSummary,
        version: data.version,
        status: data.status,
        generatedBy: data.generatedBy,
      })
      .returning();

    if (!summary) {
      throw new Error("Failed to create requirement summary");
    }

    return summary;
  }

  async update(
    summaryId: string,
    organizationId: string,
    data: UpdateRequirementSummaryData,
    executor: DbExecutor = db,
  ): Promise<RequirementSummaryRecord> {
    const [summary] = await executor
      .update(requirementSummaries)
      .set(data)
      .where(
        and(
          eq(requirementSummaries.id, summaryId),
          eq(requirementSummaries.organizationId, organizationId),
          isNull(requirementSummaries.deletedAt),
        ),
      )
      .returning();

    if (!summary) {
      throw new Error("Failed to update requirement summary");
    }

    return summary;
  }

  async createAiGeneration(
    data: CreateAiGenerationData,
    executor: DbExecutor = db,
  ): Promise<void> {
    await executor.insert(aiGenerations).values({
      organizationId: data.organizationId,
      consultationId: data.consultationId,
      conversationMessageId: data.conversationMessageId,
      provider: data.provider,
      model: data.model,
      promptType: data.promptType,
      promptVersion: data.promptVersion,
      requestTokens: data.requestTokens,
      responseTokens: data.responseTokens,
      totalTokens: data.totalTokens,
      latencyMs: data.latencyMs,
      estimatedCost: data.estimatedCost,
      status: data.status,
      errorMessage: data.errorMessage,
    });
  }
}

export const requirementSummaryRepository = new RequirementSummaryRepository();
