import { Project } from './Project';

export interface ProjectRepository {
  getById(projectId: Project['id']): Project;
  save(project: Project): void;
}
