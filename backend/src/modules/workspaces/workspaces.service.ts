// src/modules/workspaces/workspaces.service.ts
import { WorkspaceRepository } from "./workspaces.repository";
import { CreateWorkspaceInput, UpdateWorkspaceBody } from "./workspaces.schemas";
import { CollectionRepository } from "../collections/collections.repository";
import { EnvironmentRepository } from "../environments/environments.repository";
import { RequestHistoryRepository } from "../request_histories/reqhistories.repository";
import { RequestRepository } from "../requests/requests.repository";

export class WorkspaceService {
  private repository: WorkspaceRepository;
  private collectionRepository: CollectionRepository;
  private environmentRepository: EnvironmentRepository;
  private requestHistoryRepository: RequestHistoryRepository;
  private requestRepository: RequestRepository;

  constructor() {
    this.repository = new WorkspaceRepository();
    this.collectionRepository = new CollectionRepository();
    this.environmentRepository = new EnvironmentRepository();
    this.requestHistoryRepository = new RequestHistoryRepository();
    this.requestRepository = new RequestRepository();
  }

  async createWorkspace(data: CreateWorkspaceInput) {
    return this.repository.create(data);
  }

  async getAllWorkspaces() {
    return this.repository.findAll();
  }

  async getWorkspaceById(id: string) {
    const workspace = await this.repository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    return workspace;
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceBody) {
    const workspace = await this.repository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    return this.repository.update(id, data);
  }

  async deleteWorkspace(id: string) {
    const workspace = await this.repository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Delete related entities first to avoid foreign key constraint violations
    // 1. Delete request histories first (they may reference collections and requests)
    await this.requestHistoryRepository.deleteByWorkspaceId(id);

    // 2. Get all collections in this workspace and delete their requests
    const collections = await this.collectionRepository.findByWorkspaceId(id);
    for (const collection of collections) {
      await this.requestRepository.deleteByCollectionId(collection.id);
    }

    // 3. Delete collections (now that their requests are gone)
    await this.collectionRepository.deleteByWorkspaceId(id);

    // 4. Delete environments
    await this.environmentRepository.deleteByWorkspaceId(id);

    // 5. Finally delete the workspace
    await this.repository.deleteById(id);
    return { message: "Workspace deleted successfully" };
  }
}
