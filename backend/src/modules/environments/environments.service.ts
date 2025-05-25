import { EnvironmentRepository } from "./environments.repository";
import { CreateEnvironmentInput, UpdateEnvironmentBody } from "./environments.schemas";

export class EnvironmentService {
  private environmentRepository: EnvironmentRepository;

  constructor() {
    this.environmentRepository = new EnvironmentRepository();
  }

  async getAllEnvironments() {
    try {
      return await this.environmentRepository.findAll();
    } catch (error) {
      throw new Error(`Failed to fetch environments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getEnvironmentById(id: string) {
    try {
      const environment = await this.environmentRepository.findById(id);
      if (!environment) {
        throw new Error("Environment not found");
      }
      return environment;
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        throw error;
      }
      throw new Error(`Failed to fetch environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getEnvironmentsByWorkspaceId(workspaceId: string) {
    try {
      return await this.environmentRepository.findByWorkspaceId(workspaceId);
    } catch (error) {
      throw new Error(`Failed to fetch environments for workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActiveEnvironmentByWorkspaceId(workspaceId: string) {
    try {
      return await this.environmentRepository.findActiveByWorkspaceId(workspaceId);
    } catch (error) {
      throw new Error(`Failed to fetch active environment for workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createEnvironment(data: CreateEnvironmentInput) {
    try {
      // If this is set as active, deactivate others in the same workspace
      if (data.isActive && data.workspaceId) {
        // We'll handle this in the activation logic
        const newEnvironment = await this.environmentRepository.create({
          ...data,
          isActive: false, // Create as inactive first
        });

        // Then activate it (which will deactivate others)
        return await this.environmentRepository.activateEnvironment(newEnvironment.id, data.workspaceId);
      }

      return await this.environmentRepository.create(data);
    } catch (error) {
      throw new Error(`Failed to create environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateEnvironment(id: string, data: UpdateEnvironmentBody) {
    try {
      // Check if environment exists
      const existingEnvironment = await this.environmentRepository.findById(id);
      if (!existingEnvironment) {
        throw new Error("Environment not found");
      }

      // First update the environment with all the provided data except isActive
      const { isActive, ...updateData } = data;
      let updatedEnvironment = existingEnvironment;

      // Update other fields if provided
      if (Object.keys(updateData).length > 0) {
        updatedEnvironment = await this.environmentRepository.update(id, updateData);
      }

      // If setting as active, handle activation logic after updating other fields
      if (isActive === true) {
        return await this.environmentRepository.activateEnvironment(id, data.workspaceId);
      }

      return updatedEnvironment;
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        throw error;
      }
      throw new Error(`Failed to update environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteEnvironment(id: string) {
    try {
      const existingEnvironment = await this.environmentRepository.findById(id);
      if (!existingEnvironment) {
        throw new Error("Environment not found");
      }

      return await this.environmentRepository.deleteById(id);
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        throw error;
      }
      throw new Error(`Failed to delete environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async activateEnvironment(id: string, workspaceId?: string) {
    try {
      return await this.environmentRepository.activateEnvironment(id, workspaceId);
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        throw error;
      }
      throw new Error(`Failed to activate environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deactivateEnvironment(id: string) {
    try {
      const existingEnvironment = await this.environmentRepository.findById(id);
      if (!existingEnvironment) {
        throw new Error("Environment not found");
      }

      return await this.environmentRepository.deactivateEnvironment(id);
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        throw error;
      }
      throw new Error(`Failed to deactivate environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateEnvironmentVariable(id: string, key: string, value: string) {
    try {
      return await this.environmentRepository.updateVariable(id, key, value);
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        throw error;
      }
      throw new Error(`Failed to update environment variable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeEnvironmentVariable(id: string, key: string) {
    try {
      return await this.environmentRepository.removeVariable(id, key);
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        throw error;
      }
      throw new Error(`Failed to remove environment variable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resolveVariables(environmentId: string, text: string): Promise<string> {
    try {
      const environment = await this.environmentRepository.findById(environmentId);
      if (!environment || !environment.variables) {
        return text;
      }

      const variables = environment.variables as Record<string, string>;
      let resolvedText = text;

      // Replace variables in the format {{variableName}}
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        resolvedText = resolvedText.replace(regex, value);
      });

      return resolvedText;
    } catch (error) {
      throw new Error(`Failed to resolve variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
