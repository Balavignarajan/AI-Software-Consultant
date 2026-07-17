import {
  and,
  asc,
  count,
  eq,
  ilike,
  isNull,
  sql,
  type SQL,
} from "drizzle-orm";
import { db, type DbExecutor } from "../../db/index.js";
import {
  aiGenerations,
  consultations,
  detectedFeatures,
  featureLibrary,
  organizations,
} from "../../db/schema/index.js";

export type FeatureLibraryRecord = typeof featureLibrary.$inferSelect;
export type ConsultationRecord = typeof consultations.$inferSelect;
export type OrganizationRecord = typeof organizations.$inferSelect;
export type DetectedFeatureRecord = typeof detectedFeatures.$inferSelect;

export type ListFeatureLibraryFilters = {
  organizationId: string;
  name?: string;
  category?: string;
  tag?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
};

export type CreateFeatureLibraryData = {
  organizationId: string;
  name: string;
  category: string;
  description: string;
  defaultComplexity: "LOW" | "MEDIUM" | "HIGH";
  defaultEstimatedHours: number;
  tags: string[];
  technologies: string[];
  notes: string | null;
  isActive: boolean;
};

export type UpdateFeatureLibraryData = {
  name?: string;
  category?: string;
  description?: string;
  defaultComplexity?: "LOW" | "MEDIUM" | "HIGH";
  defaultEstimatedHours?: number;
  tags?: string[];
  technologies?: string[];
  notes?: string | null;
  isActive?: boolean;
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

function buildListConditions(filters: ListFeatureLibraryFilters): SQL[] {
  const conditions: SQL[] = [
    eq(featureLibrary.organizationId, filters.organizationId),
    isNull(featureLibrary.deletedAt),
  ];

  if (filters.name) {
    conditions.push(ilike(featureLibrary.name, `%${filters.name}%`));
  }

  if (filters.category) {
    conditions.push(ilike(featureLibrary.category, `%${filters.category}%`));
  }

  if (filters.tag) {
    conditions.push(
      sql`${featureLibrary.tags} @> ${JSON.stringify([filters.tag])}::jsonb`,
    );
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(featureLibrary.isActive, filters.isActive));
  }

  return conditions;
}

export class FeatureLibraryRepository {
  async runInTransaction<T>(
    callback: (tx: DbExecutor) => Promise<T>,
  ): Promise<T> {
    return db.transaction(async (tx) => callback(tx));
  }

  async countByOrganization(
    filters: Omit<ListFeatureLibraryFilters, "page" | "pageSize">,
    executor: DbExecutor = db,
  ): Promise<number> {
    const conditions = buildListConditions({
      ...filters,
      page: 1,
      pageSize: 1,
    });

    const [result] = await executor
      .select({ value: count() })
      .from(featureLibrary)
      .where(and(...conditions));

    return Number(result?.value ?? 0);
  }

  async findManyByOrganization(
    filters: ListFeatureLibraryFilters,
    executor: DbExecutor = db,
  ): Promise<FeatureLibraryRecord[]> {
    const conditions = buildListConditions(filters);
    const offset = (filters.page - 1) * filters.pageSize;

    return executor
      .select()
      .from(featureLibrary)
      .where(and(...conditions))
      .orderBy(asc(featureLibrary.category), asc(featureLibrary.name))
      .limit(filters.pageSize)
      .offset(offset);
  }

  async findActiveByOrganization(
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<FeatureLibraryRecord[]> {
    return executor
      .select()
      .from(featureLibrary)
      .where(
        and(
          eq(featureLibrary.organizationId, organizationId),
          eq(featureLibrary.isActive, true),
          isNull(featureLibrary.deletedAt),
        ),
      )
      .orderBy(asc(featureLibrary.category), asc(featureLibrary.name));
  }

  async findByIdAndOrganization(
    featureId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<FeatureLibraryRecord | null> {
    const [feature] = await executor
      .select()
      .from(featureLibrary)
      .where(
        and(
          eq(featureLibrary.id, featureId),
          eq(featureLibrary.organizationId, organizationId),
          isNull(featureLibrary.deletedAt),
        ),
      )
      .limit(1);

    return feature ?? null;
  }

  async create(
    data: CreateFeatureLibraryData,
    executor: DbExecutor = db,
  ): Promise<FeatureLibraryRecord> {
    const [feature] = await executor
      .insert(featureLibrary)
      .values(data)
      .returning();

    if (!feature) {
      throw new Error("Failed to create feature library item");
    }

    return feature;
  }

  async update(
    featureId: string,
    organizationId: string,
    data: UpdateFeatureLibraryData,
    executor: DbExecutor = db,
  ): Promise<FeatureLibraryRecord> {
    const [feature] = await executor
      .update(featureLibrary)
      .set(data)
      .where(
        and(
          eq(featureLibrary.id, featureId),
          eq(featureLibrary.organizationId, organizationId),
          isNull(featureLibrary.deletedAt),
        ),
      )
      .returning();

    if (!feature) {
      throw new Error("Failed to update feature library item");
    }

    return feature;
  }

  async softDelete(
    featureId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<FeatureLibraryRecord> {
    const [feature] = await executor
      .update(featureLibrary)
      .set({ deletedAt: new Date(), isActive: false })
      .where(
        and(
          eq(featureLibrary.id, featureId),
          eq(featureLibrary.organizationId, organizationId),
          isNull(featureLibrary.deletedAt),
        ),
      )
      .returning();

    if (!feature) {
      throw new Error("Failed to delete feature library item");
    }

    return feature;
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

  async findDetectedFeaturesByConsultation(
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

export const featureLibraryRepository = new FeatureLibraryRepository();
