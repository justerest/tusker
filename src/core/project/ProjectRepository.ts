import { Project } from './Project';

export interface ProjectRepository {
  getById(projectId: Project['id']): Project;
  exist(projectId: Project['id']): boolean;
  save(project: Project): void;
}
