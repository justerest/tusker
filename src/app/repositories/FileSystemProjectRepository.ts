import { FileSystemRepository } from './FileSystemRepository';
import { Project } from 'src/core/Project';
import { ProjectRepository } from 'src/core/ProjectRepository';

export class FileSystemProjectRepository extends FileSystemRepository<Project>
  implements ProjectRepository {
  protected entityName = Project.name;
  protected serialize = Project.serialize;
  protected deserialize = Project.deserialize;
}
