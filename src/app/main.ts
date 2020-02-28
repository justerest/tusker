import express from 'express';
import { BoardAppService } from './BoardAppService';
import { resolve } from 'path';
import { FileSystemTaskRepository } from './repositories/FileSystemTaskRepository';
import { FileSystemEmployeeRepository } from './repositories/FileSystemEmployeeRepository';
import { FileSystemBoardRepository } from './repositories/FileSystemBoardRepository';
import { FileSystemProjectRepository } from './repositories/FileSystemProjectRepository';
import { FileSystemTagRepository } from './repositories/FileSystemTagRepository';
import { Identity } from 'src/core/common/Identity';
import { TaskAppService } from './TaskAppService';
import { TaskManager } from 'src/core/task-manager/TaskManager';
import { FileSystemTimeTrackerRepository } from './repositories/FileSystemTimeTrackerRepository';
import { TimeReportAppService } from './TimeReportAppService';

const projectRepository = new FileSystemProjectRepository();
const boardRepository = new FileSystemBoardRepository();
const taskRepository = new FileSystemTaskRepository();
const employeeRepository = new FileSystemEmployeeRepository();
const tagRepository = new FileSystemTagRepository();
const timeTrackerRepository = new FileSystemTimeTrackerRepository();
const taskManager = new TaskManager(timeTrackerRepository, taskRepository);
const boardAppService = new BoardAppService(projectRepository, boardRepository, employeeRepository);
const taskAppService = new TaskAppService(boardRepository, taskRepository, taskManager);
const timeReportAppService = new TimeReportAppService(
  taskRepository,
  tagRepository,
  timeTrackerRepository,
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
  const board = boardRepository.getById(req.params.boardId);
  const employees = employeeRepository.getAllForBoard(board);
  res.json(
    employees.map((employee) => ({
      ...employee,
      dailyAmount: board.getEmployeePlannedTime(employee.id).toMin(),
      todaySpentTime: board.getEmployeeSpentTime(employee.id).toMin(),
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
  const board = boardRepository.getById(req.params.boardId);
  res.json(
    taskRepository.getAllForBoard(req.params.boardId).map((task) => ({
      ...task,
      status: taskManager.isTaskInWork(task.id)
        ? 'InWork'
        : board.isTaskCompleted(task.id)
        ? 'Completed'
        : taskManager.getFullTaskSpentTime(task.id).toMs() > 0
        ? 'Snoozed'
        : 'Planned',
      spentTime: taskManager.getFullTaskSpentTime(task.id).toMin(),
      plannedTime: task.plannedTime.toMin(),
      neededTime: task.getNeededTime().toMin(),
      employeeName: task.getExecutorIds().length
        ? employeeRepository.getById(task.getExecutorIds()[0]).name
        : '',
      tag: task.tagId,
    })),
  );
});

server.post('/api/task/:boardId', (req, res) => {
  res.json(taskAppService.createTask(req.params.boardId, req.body.title, req.body.plannedTime));
});

server.post('/api/takeTaskInWork/:taskId/:employeeId', (req, res) => {
  res.json(
    taskAppService.startWorkOnTask(
      Identity.primary(req.params.employeeId),
      Identity.primary(req.params.taskId),
    ),
  );
});

server.post('/api/snoozeTask/:taskId/', (req, res) => {
  res.json(taskAppService.snoozeTask(Identity.primary(req.params.taskId)));
});

server.post('/api/reportTaskProgress/:taskId/', (req, res) => {
  res.json(taskAppService.reportTaskProgress(req.params.taskId, req.body.progress));
});

server.post('/api/completeTask/:taskId', (req, res) => {
  res.json(taskAppService.completeTask(req.params.taskId));
});

server.get('/api/board/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const project = projectRepository.exist(projectId)
    ? projectRepository.getById(projectId)
    : boardAppService.createProjectWithBoard(projectId);
  res.json(boardRepository.getAllForProject(project.id));
});

server.post('/api/board/:projectId', (req, res) => {
  res.json(boardAppService.completeActiveBoardAndCreateNext(req.params.projectId));
});

server.get('/api/tag', (_, res) => {
  res.json(tagRepository.getAll());
});

server.post('/api/setTaskTag/:taskId/:tagId', (req, res) => {
  res.json(taskAppService.setTaskTag(req.params.taskId, req.params.tagId));
});

server.get('/api/report/:employeeId', (req, res) => {
  res.json(
    timeReportAppService
      .getTimeReports(Identity.primary(req.params.employeeId))
      .map((timeReport) => ({
        tag: timeReport.tag?.id,
        date: timeReport.date.toDate(),
        spentTime: timeReport.spentTime.toHr(),
      })),
  );
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
