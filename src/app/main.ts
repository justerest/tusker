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

const employeeId = employeeAppService.createEmployee('Sergei');

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

server.get('/employee/:employeeId', (req, res) => {
  res.json(employeeRepository.getById(req.params.employeeId));
});

server.post('/employee', (req, res) => {
  res.json(employeeAppService.createEmployee(req.body.name));
});

server.get('/task', (_, res) => {
  res.json(
    taskRepository.getAll().map((task) => ({ ...task, spentTime: task.getSpentTime().toMin() })),
  );
});

server.post('/task', (req, res) => {
  res.json(taskAppService.createTask(req.body.title));
});

server.post('/task/:taskId/takeInWork/:employeeId', (req, res) => {
  res.json(taskAppService.takeTaskInWorkBy(employeeId, req.params.taskId));
});

server.post('/task/:taskId/complete', (req, res) => {
  res.json(taskAppService.completeTask(req.params.taskId));
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
