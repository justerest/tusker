import express from 'express';
import { BoardAppService } from './BoardAppService';
import { TaskManager } from 'src/core/TaskManager';
import { resolve } from 'path';
import { FileSystemTaskRepository } from './repositories/FileSystemTaskRepository';
import { FileSystemEmployeeRepository } from './repositories/FileSystemEmployeeRepository';
import { FileSystemBoardRepository } from './repositories/FileSystemBoardRepository';
import { Board } from 'src/core/Board';
import { FileSystemTransactionManager } from './repositories/FileSystemTransactionManager';
import { FileSystemProjectRepository } from './repositories/FileSystemProjectRepository';
import { Project } from 'src/core/Project';

const projectRepository = new FileSystemProjectRepository();
const boardRepository = new FileSystemBoardRepository();
const taskRepository = new FileSystemTaskRepository();
const employeeRepository = new FileSystemEmployeeRepository();
const taskManager = new TaskManager(employeeRepository, taskRepository);
const boardAppService = new BoardAppService(
  projectRepository,
  boardRepository,
  taskRepository,
  employeeRepository,
  taskManager,
);

const currentProjectId = 1;
const currentBoardId = 1;

if (!projectRepository.getAll().find((project) => project.id === 1)) {
  FileSystemTransactionManager.instance.startTransaction();
  const project = new Project(currentBoardId);
  project.id = currentProjectId;
  projectRepository.save(project);
  FileSystemTransactionManager.instance.commitTransaction();
}

if (!boardRepository.getAll().find((board) => board.id === 1)) {
  FileSystemTransactionManager.instance.startTransaction();
  const board = new Board();
  board.id = 1;
  boardRepository.save(board);
  FileSystemTransactionManager.instance.commitTransaction();
}

if (!boardRepository.getAll().find((board) => board.id === 2)) {
  FileSystemTransactionManager.instance.startTransaction();
  const board = new Board();
  board.id = 2;
  boardRepository.save(board);
  FileSystemTransactionManager.instance.commitTransaction();
}

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
    boardAppService.addEmployee(
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
  res.json(boardAppService.createTask(req.params.boardId, req.body.title, req.body.plannedTime));
});

server.post('/api/takeTaskInWork/:taskId/:employeeId', (req, res) => {
  res.json(boardAppService.takeTaskInWorkBy(req.params.employeeId, req.params.taskId));
});

server.post('/api/snoozeTask/:taskId/', (req, res) => {
  res.json(boardAppService.snoozeTask(req.params.taskId));
});

server.post('/api/reportTaskProgress/:taskId/', (req, res) => {
  res.json(boardAppService.reportTaskProgress(req.params.taskId, req.body.progress));
});

server.post('/api/completeTask/:taskId', (req, res) => {
  res.json(boardAppService.completeTask(req.params.taskId));
});

server.get('/api/board', (_, res) => {
  res.json(boardRepository.getAllForProject(projectRepository.getById(currentProjectId)));
});

server.post('/api/board', (req, res) => {
  res.json(boardAppService.createBoard(currentProjectId));
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
