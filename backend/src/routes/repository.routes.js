import express from 'express';
import { connectRepository, getRepositoryDetails, getRepositoryTree, getFileContent } from '../controllers/repository.controller.js';

const router = express.Router();

router.post('/connect', connectRepository);
router.get('/:owner/:repo', getRepositoryDetails);
router.get('/:owner/:repo/tree', getRepositoryTree);
router.get('/:owner/:repo/files', getFileContent);
export default router;