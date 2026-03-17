import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import schoolsRouter from "./schools";
import teachersRouter from "./teachers";
import classesRouter from "./classes";
import timetableRouter from "./timetable";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(schoolsRouter);
router.use(teachersRouter);
router.use(classesRouter);
router.use(timetableRouter);

export default router;
