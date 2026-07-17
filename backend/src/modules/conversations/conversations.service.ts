import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger/logger.js";
import type { ConversationMessageDto } from "./conversations.dto.js";
import {
  conversationsRepository,
  type ConversationMessageRecord,
} from "./conversations.repository.js";
import type {
  CreateMessageInput,
  UpdateMessageInput,
} from "./conversations.validation.js";

function toMessageDto(
  message: ConversationMessageRecord,
): ConversationMessageDto {
  return {
    id: message.id,
    consultationId: message.consultationId,
    organizationId: message.organizationId,
    senderType: message.senderType,
    message: message.message,
    metadata: message.metadata ?? null,
    createdBy: message.createdBy,
    createdAt: message.createdAt,
  };
}

export class ConversationsService {
  private async assertConsultationAccess(
    consultationId: string,
    organizationId: string,
  ): Promise<void> {
    const consultation =
      await conversationsRepository.findConsultationByIdAndOrganization(
        consultationId,
        organizationId,
      );

    if (!consultation) {
      throw new AppError("Consultation not found", HTTP_STATUS.NOT_FOUND);
    }
  }

  async listByConsultation(
    organizationId: string,
    consultationId: string,
  ): Promise<ConversationMessageDto[]> {
    await this.assertConsultationAccess(consultationId, organizationId);

    const messages = await conversationsRepository.findMessagesByConsultation(
      consultationId,
      organizationId,
    );

    return messages.map(toMessageDto);
  }

  async createUserMessage(
    organizationId: string,
    consultationId: string,
    createdBy: string,
    input: CreateMessageInput,
  ): Promise<ConversationMessageDto> {
    await this.assertConsultationAccess(consultationId, organizationId);

    const message = await conversationsRepository.create({
      consultationId,
      organizationId,
      senderType: "user",
      message: input.message,
      metadata: input.metadata ?? null,
      createdBy,
    });

    logger.info(
      `Conversation message created: ${message.id} for consultation ${consultationId}`,
    );

    return toMessageDto(message);
  }

  async updateUserMessage(
    organizationId: string,
    messageId: string,
    input: UpdateMessageInput,
  ): Promise<ConversationMessageDto> {
    const existing = await conversationsRepository.findByIdAndOrganization(
      messageId,
      organizationId,
    );

    if (!existing) {
      throw new AppError("Message not found", HTTP_STATUS.NOT_FOUND);
    }

    if (existing.senderType !== "user") {
      throw new AppError(
        "Only user messages can be edited",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const message = await conversationsRepository.update(
      messageId,
      organizationId,
      {
        message: input.message,
        metadata: input.metadata,
      },
    );

    logger.info(`Conversation message updated: ${message.id}`);

    return toMessageDto(message);
  }

  async remove(
    organizationId: string,
    messageId: string,
  ): Promise<void> {
    const existing = await conversationsRepository.findByIdAndOrganization(
      messageId,
      organizationId,
    );

    if (!existing) {
      throw new AppError("Message not found", HTTP_STATUS.NOT_FOUND);
    }

    await conversationsRepository.softDelete(messageId, organizationId);
    logger.info(`Conversation message soft-deleted: ${messageId}`);
  }
}

export const conversationsService = new ConversationsService();
