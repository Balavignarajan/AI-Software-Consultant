import { and, asc, eq, isNull } from "drizzle-orm";
import { db, type DbExecutor } from "../../db/index.js";
import {
  aiGenerations,
  consultations,
  detectedFeatures,
  organizations,
  requirementSummaries,
} from "../../db/schema/index.js";

export type ConsultationRecord = typeof consultations.$inferSelect;
export type OrganizationRecord = typeof organizations.$inferSelect;
export type RequirementSummaryRecord =
  typeof requirementSummaries.$inferSelect;
export type DetectedFeatureRecord = typeof detectedFeatures.$inferSelect;

export type CreateDetectedFeatureData = {
  organizationId: string;
  consultationId: string;
  requirementSummaryId: string;
  featureName: string;
  featureCategory: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  complexity: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: string;
  aiReasoning: string;
};

export type UpdateDetectedFeatureData = {
  featureName?: string;
  featureCategory?: string;
  description?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  complexity?: "LOW" | "MEDIUM" | "HIGH";
  manuallyVerified?: boolean;
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

export class FeatureDetectionRepository {
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
        asc(detectedFeatures.priority),
        asc(detectedFeatures.featureName),
      );
  }

  async findFeatureByIdAndOrganization(
    featureId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<DetectedFeatureRecord | null> {
    const [feature] = await executor
      .select()
      .from(detectedFeatures)
      .where(
        and(
          eq(detectedFeatures.id, featureId),
          eq(detectedFeatures.organizationId, organizationId),
          isNull(detectedFeatures.deletedAt),
        ),
      )
      .limit(1);

    return feature ?? null;
  }

  async softDeleteByConsultation(
    consultationId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<void> {
    await executor
      .update(detectedFeatures)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(detectedFeatures.consultationId, consultationId),
          eq(detectedFeatures.organizationId, organizationId),
          isNull(detectedFeatures.deletedAt),
        ),
      );
  }

  async createMany(
    features: CreateDetectedFeatureData[],
    executor: DbExecutor = db,
  ): Promise<DetectedFeatureRecord[]> {
    if (features.length === 0) {
      return [];
    }

    return executor.insert(detectedFeatures).values(features).returning();
  }

  async update(
    featureId: string,
    organizationId: string,
    data: UpdateDetectedFeatureData,
    executor: DbExecutor = db,
  ): Promise<DetectedFeatureRecord> {
    const [feature] = await executor
      .update(detectedFeatures)
      .set(data)
      .where(
        and(
          eq(detectedFeatures.id, featureId),
          eq(detectedFeatures.organizationId, organizationId),
          isNull(detectedFeatures.deletedAt),
        ),
      )
      .returning();

    if (!feature) {
      throw new Error("Failed to update detected feature");
    }

    return feature;
  }

  async softDelete(
    featureId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<DetectedFeatureRecord> {
    const [feature] = await executor
      .update(detectedFeatures)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(detectedFeatures.id, featureId),
          eq(detectedFeatures.organizationId, organizationId),
          isNull(detectedFeatures.deletedAt),
        ),
      )
      .returning();

    if (!feature) {
      throw new Error("Failed to delete detected feature");
    }

    return feature;
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

export const featureDetectionRepository = new FeatureDetectionRepository();
