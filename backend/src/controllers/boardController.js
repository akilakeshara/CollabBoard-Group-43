const Board = require('../models/Board');

exports.getBoards = async (req, res) => {
  try {
    // Return all boards so the whole team can collaborate
    const boards = await Board.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const board = new Board({
      name: req.body.name,
      owner: req.user.id,
      members: [req.user.id],
      inviteToken: require('crypto').randomBytes(16).toString('hex'),
      activityLog: [{ action: 'Board created', user: req.user.id }],
      columns: [{ id: 'To Do', title: 'To Do' }, { id: 'Doing', title: 'Doing' }, { id: 'Done', title: 'Done' }],
      tasks: []
    });
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('members', 'name username')
      .populate('owner', 'name username')
      .populate('tasks.assignees', 'name username')
      .populate('tasks.comments.user', 'name username')
      .populate('activityLog.user', 'name username');
    if (!board) return res.status(404).json({ message: 'Board not found' });
    // Check access... for now, simple access
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { tasks, version } = req.body;
    const boardId = req.params.id;

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    if (version !== undefined && board.version !== version) {
      return res.status(409).json({ message: 'Conflict: The board has been updated by someone else.', currentBoard: board });
    }

    board.tasks = tasks;
    board.version += 1;
    await board.save();

    // emit via socket? This will be done in the route or server via req.io if attached, but usually we just return success and let client fetch or server emit
    if (req.io) {
      req.io.to(boardId).emit('boardUpdated', board);
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.renameBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    board.name = name;
    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.joinBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ inviteToken: req.params.token });
    if (!board) return res.status(404).json({ message: 'Invalid invite link' });
    
    if (!board.members.includes(req.user.id)) {
      board.members.push(req.user.id);
      board.activityLog.push({ action: 'Joined the board', user: req.user.id });
      await board.save();
    }
    res.json({ boardId: board._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
