import { and, asc, eq, isNull } from "drizzle-orm";
import { db, type DbExecutor } from "../../db/index.js";
import {
  aiGenerations,
  consultations,
  conversationMessages,
  organizations,
} from "../../db/schema/index.js";

export type ConsultationRecord = typeof consultations.$inferSelect;
export type OrganizationRecord = typeof organizations.$inferSelect;
export type ConversationMessageRecord =
  typeof conversationMessages.$inferSelect;
export type AiGenerationRecord = typeof aiGenerations.$inferSelect;

export type CreateMessageData = {
  consultationId: string;
  organizationId: string;
  senderType: "user" | "assistant" | "system";
  message: string;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
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

export class ChatRepository {
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

  async createMessage(
    data: CreateMessageData,
    executor: DbExecutor = db,
  ): Promise<ConversationMessageRecord> {
    const [message] = await executor
      .insert(conversationMessages)
      .values({
        consultationId: data.consultationId,
        organizationId: data.organizationId,
        senderType: data.senderType,
        message: data.message,
        metadata: data.metadata,
        createdBy: data.createdBy,
      })
      .returning();

    if (!message) {
      throw new Error("Failed to create conversation message");
    }

    return message;
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

  async createAiGeneration(
    data: CreateAiGenerationData,
    executor: DbExecutor = db,
  ): Promise<AiGenerationRecord> {
    const [generation] = await executor
      .insert(aiGenerations)
      .values({
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
      })
      .returning();

    if (!generation) {
      throw new Error("Failed to create AI generation record");
    }

    return generation;
  }
}

export const chatRepository = new ChatRepository();
