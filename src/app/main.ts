import express from 'express';
import { TaskAppService } from './TaskAppService';
import { InMemoryTaskRepository } from './repositories/InMemoryTaskRepository';
import { InMemoryEmployeeRepository } from './repositories/InMemoryEmployeeRepository';
import { TaskManager } from 'src/core/TaskManager';
import { EmployeeAppService } from './EmployeeAppService';
import { resolve } from 'path';

const taskRepository = new InMemoryTaskRepository();
const employeeRepository = new InMemoryEmployeeRepository();
const taskManager = new TaskManager(employeeRepository, taskRepository);
const taskAppService = new TaskAppService(taskRepository, employeeRepository, taskManager);
const employeeAppService = new EmployeeAppService(employeeRepository, taskRepository);

employeeAppService.createEmployee('Klevakin Sergey');
employeeAppService.createEmployee('Garan Stepan');
employeeAppService.createEmployee('Manager');

const hostname = '127.0.0.1';
const port = 3000;

const server = express();

server.use(express.static(resolve(__dirname, '../../public')));

server.use('/api', express.json());

server.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

server.get('/api/employee', (_, res) => {
  res.json(
    employeeRepository.getAll().map((employee) => ({
      ...employee,
      spentTime: employeeAppService.getEmployeeSpentTime(employee.id),
    })),
  );
});

server.post('/api/employee', (req, res) => {
  res.json(employeeAppService.createEmployee(req.body.name));
});

server.get('/api/task', (_, res) => {
  res.json(
    taskRepository.getAll().map((task) => ({
      ...task,
      spentTime: task.getSpentTime().toMin(),
      plannedTime: task.plannedTime.toMin(),
      neededTime: task.getNeededTime().toMin(),
      employeeName: task.getExecutorId()
        ? employeeRepository.getById(task.getExecutorId()!).name
        : '',
    })),
  );
});

server.post('/api/task', (req, res) => {
  res.json(taskAppService.createTask(req.body.title, req.body.plannedTime));
});

server.post('/api/takeTaskInWork/:taskId/:employeeId', (req, res) => {
  res.json(taskAppService.takeTaskInWorkBy(req.params.employeeId, req.params.taskId));
});

server.post('/api/snoozeTask/:taskId/', (req, res) => {
  res.json(taskAppService.snoozeTask(req.params.taskId));
});

server.post('/api/reportTaskProgress/:taskId/', (req, res) => {
  res.json(taskAppService.reportTaskProgress(req.params.taskId, req.body.progress));
});

server.post('/api/completeTask/:taskId', (req, res) => {
  res.json(taskAppService.completeTask(req.params.taskId));
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
