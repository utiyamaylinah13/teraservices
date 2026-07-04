import { Router } from 'express';
import { createChild, getChildById, getMyChildren } from '../controllers/childController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
export const childRouter = Router();
childRouter.post('/create-child', authMiddleware, createChild);
childRouter.get('/my-children', authMiddleware, getMyChildren);
childRouter.get('/:id', authMiddleware, getChildById);
//# sourceMappingURL=childRoutes.js.map