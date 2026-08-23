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

