import { FileSystemRepository } from './FileSystemRepository';
import { Project } from 'src/core/project/Project';
import { ProjectRepository } from 'src/core/project/ProjectRepository';
import { Identity } from 'src/core/common/Identity';

export class FileSystemProjectRepository extends FileSystemRepository<Project>
  implements ProjectRepository {
  protected entityName = Project.name;
  protected serialize = Project.serialize;
  protected deserialize = Project.deserialize;

  exist(projectId: Project['id']): boolean {
    return this.getAll().some((project) => Identity.equals(project.id, projectId));
  }
}
