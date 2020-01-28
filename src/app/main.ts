import express from 'express';
import { TaskAppService } from './TaskAppService';
import { InMemoryTaskRepository } from './repositories/InMemoryTaskRepository';
import { InMemoryEmployeeRepository } from './repositories/InMemoryEmployeeRepository';
import { TaskManager } from 'src/core/TaskManager';
import { EmployeeAppService } from './EmployeeAppService';

const taskRepository = new InMemoryTaskRepository();
const employeeRepository = new InMemoryEmployeeRepository();
const taskManager = new TaskManager(employeeRepository, taskRepository);
const taskAppService = new TaskAppService(taskRepository, employeeRepository, taskManager);
const employeeAppService = new EmployeeAppService(employeeRepository, taskRepository);

employeeAppService.createEmployee('Sergei');
employeeAppService.createEmployee('Andrei');
employeeAppService.createEmployee('Ivan');

taskAppService.createTask('Super Task');
taskAppService.createTask('Easy Task');
taskAppService.createTask('New Task');
taskAppService.createTask('Old Task');

const hostname = '127.0.0.1';
const port = 3000;

const server = express();

server.use(express.json());

server.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

server.get('/employee', (_, res) => {
  res.json(employeeRepository.getAll());
});

server.post('/employee', (req, res) => {
  res.json(employeeAppService.createEmployee(req.body.name));
});

server.get('/task', (_, res) => {
  res.json(
    taskRepository.getAll().map((task) => ({
      ...task,
      spentTime: task.getSpentTime().toMin(),
      employeeName: task.getExecutorId()
        ? employeeRepository.getById(task.getExecutorId()!).name
        : '',
    })),
  );
});

server.post('/task', (req, res) => {
  res.json(taskAppService.createTask(req.body.title));
});

server.post('/takeTaskInWork/:taskId/:employeeId', (req, res) => {
  res.json(taskAppService.takeTaskInWorkBy(req.params.employeeId, req.params.taskId));
});

server.post('/completeTask/:taskId', (req, res) => {
  res.json(taskAppService.completeTask(req.params.taskId));
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
