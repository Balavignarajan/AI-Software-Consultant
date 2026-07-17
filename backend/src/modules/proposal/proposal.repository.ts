import { and, asc, eq, isNull } from "drizzle-orm";
import { db, type DbExecutor } from "../../db/index.js";
import {
  aiGenerations,
  consultations,
  detectedFeatures,
  organizations,
  projectEstimations,
  projectProposals,
  requirementSummaries,
} from "../../db/schema/index.js";

export type ConsultationRecord = typeof consultations.$inferSelect;
export type OrganizationRecord = typeof organizations.$inferSelect;
export type RequirementSummaryRecord =
  typeof requirementSummaries.$inferSelect;
export type DetectedFeatureRecord = typeof detectedFeatures.$inferSelect;
export type ProjectEstimationRecord = typeof projectEstimations.$inferSelect;
export type ProjectProposalRecord = typeof projectProposals.$inferSelect;

export type CreateProposalData = {
  organizationId: string;
  consultationId: string;
  requirementSummaryId: string;
  estimationId: string;
  title: string;
  executiveSummary: string;
  scopeOfWork: string[];
  deliverables: string[];
  timeline: string;
  assumptions: string;
  exclusions: string;
  pricingNotes: string;
  proposalMarkdown: string;
  generatedBy: "AI" | "USER";
  version: number;
  status: "DRAFT" | "REVIEWED" | "APPROVED";
};

export type UpdateProposalData = {
  requirementSummaryId?: string;
  estimationId?: string;
  title?: string;
  executiveSummary?: string;
  scopeOfWork?: string[];
  deliverables?: string[];
  timeline?: string;
  assumptions?: string;
  exclusions?: string;
  pricingNotes?: string;
  proposalMarkdown?: string;
  generatedBy?: "AI" | "USER";
  version?: number;
  status?: "DRAFT" | "REVIEWED" | "APPROVED";
};

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

export class ProposalRepository {
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

  async findRequirementSummaryByConsultation(
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

  async findFeaturesByConsultation(
    consultationId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<DetectedFeatureRecord[]> {
    return executor
      .select()
      .from(detectedFeatures)
      .where(
        and(
          eq(detectedFeatures.consultationId, consultationId),
          eq(detectedFeatures.organizationId, organizationId),
          isNull(detectedFeatures.deletedAt),
        ),
      )
      .orderBy(
        asc(detectedFeatures.featureCategory),
        asc(detectedFeatures.featureName),
      );
  }

  async findEstimationByConsultation(
    consultationId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<ProjectEstimationRecord | null> {
    const [estimation] = await executor
      .select()
      .from(projectEstimations)
      .where(
        and(
          eq(projectEstimations.consultationId, consultationId),
          eq(projectEstimations.organizationId, organizationId),
          isNull(projectEstimations.deletedAt),
        ),
      )
      .limit(1);

    return estimation ?? null;
  }

  async findByConsultationId(
    consultationId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<ProjectProposalRecord | null> {
    const [proposal] = await executor
      .select()
      .from(projectProposals)
      .where(
        and(
          eq(projectProposals.consultationId, consultationId),
          eq(projectProposals.organizationId, organizationId),
          isNull(projectProposals.deletedAt),
        ),
      )
      .limit(1);

    return proposal ?? null;
  }

  async create(
    data: CreateProposalData,
    executor: DbExecutor = db,
  ): Promise<ProjectProposalRecord> {
    const [proposal] = await executor
      .insert(projectProposals)
      .values(data)
      .returning();

    if (!proposal) {
      throw new Error("Failed to create project proposal");
    }

    return proposal;
  }

  async update(
    proposalId: string,
    organizationId: string,
    data: UpdateProposalData,
    executor: DbExecutor = db,
  ): Promise<ProjectProposalRecord> {
    const [proposal] = await executor
      .update(projectProposals)
      .set(data)
      .where(
        and(
          eq(projectProposals.id, proposalId),
          eq(projectProposals.organizationId, organizationId),
          isNull(projectProposals.deletedAt),
        ),
      )
      .returning();

    if (!proposal) {
      throw new Error("Failed to update project proposal");
    }

    return proposal;
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

export const proposalRepository = new ProposalRepository();
