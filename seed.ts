import mongoose from "mongoose";
import "dotenv/config";
import UserModel from "./src/models/user.model";
import CategoryModel from "./src/models/category.model";
import DistrictModel from "./src/models/district.model";

/**
 * PRODUCTION-READY SEED SCRIPT
 * Populates with REAL Categories and Districts used in the Department's portal.
 */
const seedData = async () => {
    try {
        if (!process.env.DB_URL) {
            throw new Error("DB_URL is not defined in .env file");
        }

        await mongoose.connect(process.env.DB_URL as string);
        console.log("✅ Connected to MongoDB");

        // ── 1. Seed Users ──────────────────────────────────────────────────
        const roles = [
            { name: "Regular User", email: "user@example.com", role: 0 },
            { name: "Staff Member", email: "staff@example.com", role: 1 },
            { name: "Admin User", email: "admin@example.com", role: 2 },
            { name: "Root Admin", email: "root@example.com", role: 3 }
        ];

        for (const r of roles) {
            const user = await UserModel.findOne({ email: r.email });
            if (!user) {
                await UserModel.create({
                    name: r.name,
                    email: r.email,
                    password: "password123",
                    phone: "09123456789",
                    role: r.role,
                    active: true,
                });
                console.log(`👤 Created User: ${r.name}`);
            }
        }

        // ── 2. Seed Categories ─────────────────────────────────────────────
        // TRUNCATE old categories to remove mock data
        await CategoryModel.deleteMany({});
        console.log("🧹 Cleared old mock categories");

        const categories = [
            {
                title: "Activities",
                slug: "activities",
                order: 1,
                description: "Department field activities, engagement, and operational news."
            },
            {
                title: "Services",
                slug: "services",
                order: 2,
                description: "Official public services, e-Government portal updates, and documentation guides."
            },
            {
                title: "Announcement & Directives",
                slug: "announcements",
                order: 3,
                description: "Official statements, rules, regulations, and departmental directives."
            },
            {
                title: "About Us",
                slug: "about",
                order: 4,
                description: "Department mission, history, and structural information news."
            }
        ];

        for (const cat of categories) {
            await CategoryModel.create({ ...cat, createdBy: "System Seeder" });
            console.log(`📁 Created Category: ${cat.title}`);
        }

        // ── 3. Seed Districts ──────────────────────────────────────────────
        await DistrictModel.deleteMany({});
        console.log("🧹 Cleared old mock districts");

        const districts = [
            {
                name: "Kyaukme District",
                coverImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1000",
                address: "Namhsan Township, Northern Shan State",
                phone: "09-123456789",
                mapUrl: "https://maps.google.com"
            },
            {
                name: "Muse District",
                coverImage: "https://images.unsplash.com/photo-1542640244-7e672d6cef21?auto=format&fit=crop&q=80&w=1000",
                address: "Kutkai Township, Northern Shan State",
                phone: "09-987654321",
                mapUrl: "https://maps.google.com"
            },
            {
                name: "Lashio District",
                coverImage: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000",
                address: "Lashio Township, Northern Shan State",
                phone: "09-555444333",
                mapUrl: "https://maps.google.com"
            },
            {
                name: "Mongmit District",
                coverImage: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000",
                address: "Mongmit Township, Northern Shan State",
                phone: "09-555444333",
                mapUrl: "https://maps.google.com"
            }
        ];

        for (const d of districts) {
            await DistrictModel.create(d);
            console.log(`📍 Created District: ${d.name}`);
        }

        console.log("✨ Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
};

seedData();
