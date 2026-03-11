import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import Category from '../models/category.model';

// Mock the Mongoose Category model
vi.mock('../models/category.model', () => ({
    default: {
        find: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        countDocuments: vi.fn(),
    },
}));

// Mock Auth middleware to bypass security checks
vi.mock('../middlewares/auth', () => ({
    isAuthenticated: (req, res, next) => {
        req.user = { _id: '123' };
        next();
    },
    authorizeRoles: () => (req, res, next) => next(),
}));

describe('Category API Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /categories', () => {
        it('should return all categories', async () => {
            const mockCategories = [
                { _id: '1', title: 'Politics', description: 'Political news' },
                { _id: '2', title: 'Sports', description: 'Sports news' },
            ];

            const mockChain = {
                sort: vi.fn().mockResolvedValue(mockCategories)
            };

            vi.mocked(Category.find).mockReturnValue(mockChain as any);

            const response = await request(app).get('/categories');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.categories).toEqual(mockCategories);
        });
    });

    describe('POST /categories', () => {
        it('should create a new category', async () => {
            const newCategory = { title: 'Technology', description: 'Tech news' };
            const savedCategory = { _id: '3', ...newCategory, slug: 'technology', order: 0 };

            vi.mocked(Category.findOne).mockResolvedValue(null);
            vi.mocked(Category.countDocuments).mockResolvedValue(0);
            vi.mocked(Category.create).mockResolvedValue(savedCategory as any);

            const response = await request(app)
                .post('/categories')
                .send(newCategory);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.category.title).toBe(newCategory.title);
        });
    });
});
