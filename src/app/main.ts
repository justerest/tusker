import express from 'express';
import { MainAppService } from './MainAppService';
import { resolve } from 'path';
import { FileSystemTaskRepository } from './repositories/FileSystemTaskRepository';
import { FileSystemEmployeeRepository } from './repositories/FileSystemEmployeeRepository';
import { FileSystemBoardRepository } from './repositories/FileSystemBoardRepository';
import { FileSystemProjectRepository } from './repositories/FileSystemProjectRepository';
import { FileSystemTagRepository } from './repositories/FileSystemTagRepository';
import { TimeReportAppService } from 'src/app/TimeReportAppService';
import { Identity } from 'src/core/common/Identity';

const projectRepository = new FileSystemProjectRepository();
const boardRepository = new FileSystemBoardRepository();
const taskRepository = new FileSystemTaskRepository();
const employeeRepository = new FileSystemEmployeeRepository();
const tagRepository = new FileSystemTagRepository();
const timeReportAppService = new TimeReportAppService(taskRepository, tagRepository);
const mainAppService = new MainAppService(
  projectRepository,
  boardRepository,
  taskRepository,
  employeeRepository,
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
      tag: task.tagId,
    })),
  );
});

server.post('/api/task/:boardId', (req, res) => {
  res.json(mainAppService.createTask(req.params.boardId, req.body.title, req.body.plannedTime));
});

server.post('/api/takeTaskInWork/:taskId/:employeeId', (req, res) => {
  res.json(
    mainAppService.takeTaskInWorkForce(Identity.primary(req.params.employeeId), req.params.taskId),
  );
});

server.post('/api/snoozeTask/:taskId/', (req, res) => {
  res.json(mainAppService.snoozeTaskOrCancelCompletion(req.params.taskId));
});

server.post('/api/reportTaskProgress/:taskId/', (req, res) => {
  res.json(mainAppService.reportTaskProgress(req.params.taskId, req.body.progress));
});

server.post('/api/completeTask/:taskId', (req, res) => {
  res.json(mainAppService.completeTask(req.params.taskId));
});

server.get('/api/board/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const project = projectRepository.exist(projectId)
    ? projectRepository.getById(projectId)
    : mainAppService.createProjectWithBoard(projectId);
  res.json(boardRepository.getAllForProject(project.id));
});

server.post('/api/board/:projectId', (req, res) => {
  res.json(mainAppService.completeActiveBoardAndCreateNext(req.params.projectId));
});

server.get('/api/tag', (_, res) => {
  res.json(tagRepository.getAll());
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

server.post('/api/setTaskTag/:taskId/:tagId', (req, res) => {
  res.json(mainAppService.setTaskTag(req.params.taskId, req.params.tagId));
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
