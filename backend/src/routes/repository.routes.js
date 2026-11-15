import express from 'express';
import { connectRepository, getRepositoryDetails } from '../controllers/repository.controller.js';

const router = express.Router();

router.post('/connect', connectRepository);
router.get('/:owner/:repo', getRepositoryDetails);
export default router;