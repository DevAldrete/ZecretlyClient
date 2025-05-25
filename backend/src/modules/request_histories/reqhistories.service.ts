import { RequestHistoryRepository } from "./reqhistories.repository";
import { CreateRequestHistoryInput, UpdateRequestHistoryBody } from "./reqhistories.schemas";

export class RequestHistoryService {
  private requestHistoryRepository: RequestHistoryRepository;

  constructor() {
    this.requestHistoryRepository = new RequestHistoryRepository();
  }

  async getAllRequestHistories() {
    try {
      return await this.requestHistoryRepository.findAll();
    } catch (error) {
      throw new Error(`Failed to fetch request histories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRequestHistoryById(id: string) {
    try {
      const history = await this.requestHistoryRepository.findById(id);
      if (!history) {
        throw new Error("Request history not found");
      }
      return history;
    } catch (error) {
      if (error instanceof Error && error.message === "Request history not found") {
        throw error;
      }
      throw new Error(`Failed to fetch request history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRequestHistoriesByRequestId(requestId: string) {
    try {
      return await this.requestHistoryRepository.findByRequestId(requestId);
    } catch (error) {
      throw new Error(`Failed to fetch request histories for request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRequestHistoriesByCollectionId(collectionId: string) {
    try {
      return await this.requestHistoryRepository.findByCollectionId(collectionId);
    } catch (error) {
      throw new Error(`Failed to fetch request histories for collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRequestHistoriesByWorkspaceId(workspaceId: string) {
    try {
      return await this.requestHistoryRepository.findByWorkspaceId(workspaceId);
    } catch (error) {
      throw new Error(`Failed to fetch request histories for workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRequestHistory(data: CreateRequestHistoryInput) {
    try {
      return await this.requestHistoryRepository.create(data);
    } catch (error) {
      throw new Error(`Failed to create request history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateRequestHistory(id: string, data: UpdateRequestHistoryBody) {
    try {
      const existingHistory = await this.requestHistoryRepository.findById(id);
      if (!existingHistory) {
        throw new Error("Request history not found");
      }

      return await this.requestHistoryRepository.update(id, data);
    } catch (error) {
      if (error instanceof Error && error.message === "Request history not found") {
        throw error;
      }
      throw new Error(`Failed to update request history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteRequestHistory(id: string) {
    try {
      const existingHistory = await this.requestHistoryRepository.findById(id);
      if (!existingHistory) {
        throw new Error("Request history not found");
      }

      return await this.requestHistoryRepository.deleteById(id);
    } catch (error) {
      if (error instanceof Error && error.message === "Request history not found") {
        throw error;
      }
      throw new Error(`Failed to delete request history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteRequestHistoriesByRequestId(requestId: string) {
    try {
      return await this.requestHistoryRepository.deleteByRequestId(requestId);
    } catch (error) {
      throw new Error(`Failed to delete request histories for request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteRequestHistoriesByCollectionId(collectionId: string) {
    try {
      return await this.requestHistoryRepository.deleteByCollectionId(collectionId);
    } catch (error) {
      throw new Error(`Failed to delete request histories for collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteRequestHistoriesByWorkspaceId(workspaceId: string) {
    try {
      return await this.requestHistoryRepository.deleteByWorkspaceId(workspaceId);
    } catch (error) {
      throw new Error(`Failed to delete request histories for workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
