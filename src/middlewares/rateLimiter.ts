import rateLimit from "express-rate-limit";

/**
 * 🛰️ Global API Rate Limiter
 * 🎯 Goal: Prevent general DDoS and abuse across all endpoints.
 */
export const apiLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: "draft-8", // newest standard
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 30 minutes.",
    },
});

/**
 * 🔐 Strict Login Limiter
 * 🎯 Goal: Mitigate Brute-force and Dictionary attacks on authentication.
 */
export const loginLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // Limit to 5 attempts
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many failed login attempts. Please try again after 30 minutes.",
    },
});

/**
 * 📨 Spam Protection Limiter
 * 🎯 Goal: Prevent automated bot submissions for contacts and reports.
 */
export const spamLimiter = rateLimit({
    windowMs: 120 * 60 * 1000, // 2 hours
    max: 3, // Limit each IP to 3 submissions per hour
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Submission limit reached. Please try again in 2 hours to prevent spam.",
    },
});
