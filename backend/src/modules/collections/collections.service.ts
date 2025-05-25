// src/modules/collections/collections.service.ts
import { CollectionRepository } from "./collections.repository";
import { CreateCollectionInput, UpdateCollectionBody } from "./collections.schemas";
import { WorkspaceRepository } from "../workspaces/workspaces.repository";

export class CollectionService {
  private repository: CollectionRepository;
  private workspaceRepository: WorkspaceRepository;

  constructor() {
    this.repository = new CollectionRepository(); // Or inject it for better testing
    this.workspaceRepository = new WorkspaceRepository();
  }

  async createCollection(data: CreateCollectionInput) {
    // Example business logic: Check for duplicate names (optionally within a workspace)
    // const existing = await this.repository.findByNameAndWorkspace(data.name, data.workspaceId);
    // if (existing) {
    //   throw new Error("A collection with this name already exists.");
    // }
    return this.repository.create(data);
  }

  async getAllCollections() {
    return this.repository.findAll();
  }

  async getCollectionsByWorkspace(workspaceId: string) {
    // First check if workspace exists
    const workspaceExists = await this.workspaceRepository.exists(workspaceId);
    if (!workspaceExists) {
      throw new Error("Workspace not found");
    }
    return this.repository.findByWorkspaceId(workspaceId);
  }

  async getCollectionById(id: string) {
    const collection = await this.repository.findById(id);
    if (!collection) {
      throw new Error("Collection not found"); // Or a custom NotFoundError
    }
    return collection;
  }

  async updateCollection(id: string, data: UpdateCollectionBody) {
    const collection = await this.repository.findById(id);
    if (!collection) {
      throw new Error("Collection not found");
    }
    // Add any other business logic before updating
    return this.repository.update(id, data);
  }

  async deleteCollection(id: string) {
    const collection = await this.repository.findById(id);
    if (!collection) {
      throw new Error("Collection not found");
    }
    await this.repository.deleteById(id);
    return { message: "Collection deleted successfully" }; // Or return the deleted item
  }
}
