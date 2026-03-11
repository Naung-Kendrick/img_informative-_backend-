import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { ErrorMiddleware } from "./middlewares/error";
import connectDB from "./config/db";
import rateLimit from "express-rate-limit";

import userRouter from "./routes/user.route";
import categoryRouter from "./routes/category.route";
import newsRouter from "./routes/news.route";
import commentRouter from "./routes/comment.route";
import pageRouter from "./routes/page.route";
import contactRouter from "./routes/contact.route";
import announcementRouter from "./routes/announcement.route";
import districtRouter from "./routes/district.route";
import aboutRouter from "./routes/about.route";
import authRouter from "./routes/auth.route";
import statisticRouter from "./routes/statistic.route";
import contactInfoRouter from "./routes/contactInfo.route";
import reportRouter from "./routes/report.route";
import auditLogRouter from "./routes/auditLog.route";
import faqRouter from "./routes/faq.route";
import layoutRouter from "./routes/layout.route";
export const app = express();

// 🔌 Standard Express Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3001", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || "";

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("<h1>News Portal Backend is working...</h1>");
});

app.use('/users', userRouter);
app.use('/categories', categoryRouter);
app.use('/news', newsRouter);
app.use('/comments', commentRouter);
app.use('/pages', pageRouter);
app.use('/contacts', contactRouter);
app.use('/announcements', announcementRouter);
app.use('/districts', districtRouter);
app.use('/about', aboutRouter);
app.use('/statistics', statisticRouter);
app.use('/contact-info', contactInfoRouter);
app.use('/reports', reportRouter);
app.use('/api/audit-logs', auditLogRouter);
app.use('/faqs', faqRouter);
app.use('/layout', layoutRouter);

app.use('/api/auth', authRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} is not found!`,
    })
});

if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
        connectDB(dbUrl as string);
    });
}

app.use(ErrorMiddleware);
