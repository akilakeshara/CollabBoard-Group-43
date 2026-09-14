const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, boardController.getBoards);
router.post('/', auth, boardController.createBoard);
router.get('/join/:token', auth, boardController.joinBoard);
router.get('/:id', auth, boardController.getBoardById);
router.put('/:id/rename', auth, boardController.renameBoard);
router.put('/:id', auth, boardController.updateBoard);
router.delete('/:id', auth, boardController.deleteBoard);

module.exports = router;
