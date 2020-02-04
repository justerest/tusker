import express from 'express';
import { MainAppService } from './MainAppService';
import { TaskManager } from 'src/core/TaskManager';
import { resolve } from 'path';
import { FileSystemTaskRepository } from './repositories/FileSystemTaskRepository';
import { FileSystemEmployeeRepository } from './repositories/FileSystemEmployeeRepository';
import { FileSystemBoardRepository } from './repositories/FileSystemBoardRepository';
import { FileSystemProjectRepository } from './repositories/FileSystemProjectRepository';
import { ProjectService } from 'src/core/ProjectService';

const projectRepository = new FileSystemProjectRepository();
const boardRepository = new FileSystemBoardRepository();
const taskRepository = new FileSystemTaskRepository();
const employeeRepository = new FileSystemEmployeeRepository();
const projectService = new ProjectService(boardRepository, employeeRepository);
const taskManager = new TaskManager(employeeRepository, taskRepository, boardRepository);
const mainAppService = new MainAppService(
  projectRepository,
  boardRepository,
  taskRepository,
  employeeRepository,
  taskManager,
  projectService,
);

const hostname = '127.0.0.1';
const port = 3000;
const server = express();

server.use(express.static(resolve(__dirname, '../../public')));
server.get('/:path', (req, res, next) => {
  if (!req.params.path?.startsWith('api')) {
    res.sendFile(resolve(__dirname, '../../public', 'index.html'));
  } else {
    next();
  }
});
server.use('/api', express.json());
server.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

server.get('/api/employee/:boardId', (req, res) => {
  res.json(
    employeeRepository
      .getAllForBoard(boardRepository.getById(req.params.boardId))
      .map((employee) => ({
        ...employee,
        dailyAmount: employee.workingTime.getAmount().toMin(),
        todaySpentTime: employee.workingTime.getTodaySpentTime().toMin(),
      })),
  );
});

server.post('/api/employee/:boardId', (req, res) => {
  res.json(
    mainAppService.addEmployee(
      req.params.boardId,
      req.body.name,
      req.body.workStart,
      req.body.workEnd,
    ),
  );
});

server.get('/api/task/:boardId', (req, res) => {
  res.json(
    taskRepository.getAllForBoard(req.params.boardId).map((task) => ({
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

server.post('/api/task/:boardId', (req, res) => {
  res.json(mainAppService.createTask(req.params.boardId, req.body.title, req.body.plannedTime));
});

server.post('/api/takeTaskInWork/:taskId/:employeeId', (req, res) => {
  res.json(mainAppService.takeTaskInWorkBy(req.params.employeeId, req.params.taskId));
});

server.post('/api/snoozeTask/:taskId/', (req, res) => {
  res.json(mainAppService.snoozeTask(req.params.taskId));
});

server.post('/api/reportTaskProgress/:taskId/', (req, res) => {
  res.json(mainAppService.reportTaskProgress(req.params.taskId, req.body.progress));
});

server.post('/api/completeTask/:taskId', (req, res) => {
  res.json(mainAppService.completeTask(req.params.taskId));
});

server.get('/api/board/:projectId', (req, res) => {
  res.json(
    boardRepository.getAllForProject(mainAppService.getProjectOrCreate(req.params.projectId)),
  );
});

server.post('/api/board/:projectId', (req, res) => {
  res.json(mainAppService.createBoard(req.params.projectId));
});

server.post('/api/incrementBoard/:projectId', (req, res) => {
  res.json(mainAppService.incrementProjectActiveBoard(req.params.projectId));
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
