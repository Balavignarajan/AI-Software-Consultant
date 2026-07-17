import { and, asc, eq, isNull } from "drizzle-orm";
import { db, type DbExecutor } from "../../db/index.js";
import {
  consultations,
  conversationMessages,
} from "../../db/schema/index.js";

export type ConversationMessageRecord =
  typeof conversationMessages.$inferSelect;

export type CreateMessageData = {
  consultationId: string;
  organizationId: string;
  senderType: "user" | "assistant" | "system";
  message: string;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
};

export type UpdateMessageData = {
  message?: string;
  metadata?: Record<string, unknown> | null;
};

export class ConversationsRepository {
  async findConsultationByIdAndOrganization(
    consultationId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<{ id: string; organizationId: string } | null> {
    const [consultation] = await executor
      .select({
        id: consultations.id,
        organizationId: consultations.organizationId,
      })
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
      .orderBy(asc(conversationMessages.createdAt), asc(conversationMessages.id));
  }

  async findByIdAndOrganization(
    messageId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<ConversationMessageRecord | null> {
    const [message] = await executor
      .select()
      .from(conversationMessages)
      .where(
        and(
          eq(conversationMessages.id, messageId),
          eq(conversationMessages.organizationId, organizationId),
          isNull(conversationMessages.deletedAt),
        ),
      )
      .limit(1);

    return message ?? null;
  }

  async create(
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

  async update(
    messageId: string,
    organizationId: string,
    data: UpdateMessageData,
    executor: DbExecutor = db,
  ): Promise<ConversationMessageRecord> {
    const [message] = await executor
      .update(conversationMessages)
      .set(data)
      .where(
        and(
          eq(conversationMessages.id, messageId),
          eq(conversationMessages.organizationId, organizationId),
          isNull(conversationMessages.deletedAt),
        ),
      )
      .returning();

    if (!message) {
      throw new Error("Failed to update conversation message");
    }

    return message;
  }

  async softDelete(
    messageId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<ConversationMessageRecord> {
    const [message] = await executor
      .update(conversationMessages)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(conversationMessages.id, messageId),
          eq(conversationMessages.organizationId, organizationId),
          isNull(conversationMessages.deletedAt),
        ),
      )
      .returning();

    if (!message) {
      throw new Error("Failed to delete conversation message");
    }

    return message;
  }
}

export const conversationsRepository = new ConversationsRepository();
