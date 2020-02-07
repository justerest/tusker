import { TagRepository } from './TagRepository';
import { Tag } from './Tag';
import { assert } from 'src/utils/assert';
import { Employee } from '../employee/Employee';
import { TaskRepository } from '../task/TaskRepository';
import { Time } from '../task/Time';

export class TagService {
  constructor(private tagRepository: TagRepository, private taskRepository: TaskRepository) {}

  createTag(name: string): Tag {
    assert(!this.tagRepository.findByName(name), 'Tag name already used');
    const tag = new Tag();
    tag.id = name;
    tag.name = name;
    return tag;
  }

  getSpentTimeFor(tag: Tag, employee: Employee, from: Date, to?: Date): Time {
    const tasks = this.taskRepository.getAllByEmployee(employee.id);
    return tag.getSpentTimeFor(
      employee.id,
      tasks
        .filter((task) => task.creationDate > from)
        .filter((task) => !to || task.creationDate < to),
    );
  }
}
