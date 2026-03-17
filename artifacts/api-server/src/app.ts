import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import router from "./routes";

const app: Express = express();

const SESSION_SECRET = process.env.SESSION_SECRET || "school-timetable-secret-key-change-in-production";

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use("/api", router);

export default app;
