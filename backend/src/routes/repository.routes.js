import express from 'express';
import { connectRepository, 
                getRepositoryDetails, 
                    getRepositoryTree, 
                        getFileContent,
                            analyzeRepository,
                            getRepositoryDependencies
        } from '../controllers/repository.controller.js';

const router = express.Router();

router.post('/connect', connectRepository);
router.get('/:owner/:repo', getRepositoryDetails);
router.get('/:owner/:repo/tree', getRepositoryTree);
router.get('/:owner/:repo/files', getFileContent);
router.post('/:owner/:repo/analyze', analyzeRepository);
router.get(
            '/:owner/:repo/dependencies',
            getRepositoryDependencies
            );

export default router;