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

const hostname = '127.0.0.1';
const port = 3000;

const server = express();

server.get('/employee/:employeeId', (req, res) => {
  res.json(employeeRepository.getById(req.params.employeeId));
});

server.post('/employee', (req, res) => {
  res.json(employeeAppService.createEmployee(req.body.name));
});

server.post('/task', (req, res) => {
  res.json(taskAppService.createTask(req.body.name));
});

server.post('/task/:taskId/takeInWork/:employeeId', (req, res) => {
  res.json(taskAppService.takeTaskInWorkBy(req.params.employeeId, req.params.taskId));
});

server.get('/task/:taskId', (req, res) => {
  res.json(taskAppService.getTaskSpentTime(req.params.taskId));
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
