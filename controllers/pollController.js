import PollService from '../services/pollService.js';

export const createPoll = async (req, res) => {
  try {
    const { roomId, question, options } = req.body;
    const createdBy = req.user.id;
    const poll = await PollService.createPoll({ roomId, question, options, createdBy });
    res.status(201).json({ success: true, poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPollsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const polls = await PollService.getPollsByRoom(roomId);
    res.json({ success: true, polls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body;
    const userId = req.user.id;
    const vote = await PollService.vote({ pollId, userId, optionIndex });
    res.json({ success: true, vote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVotesByPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const votes = await PollService.getVotesByPoll(pollId);
    res.json({ success: true, votes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closePoll = async (req, res) => {
  try {
    const { pollId } = req.body;
    const userId = req.user.id;
    const poll = await PollService.getPollById(pollId);
    console.log('Intentando cerrar encuesta:', { pollId, userId, poll });
    if (!poll) return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
    if (poll.created_by !== userId) {
      return res.status(403).json({ success: false, message: 'Solo el creador puede finalizar la encuesta' });
    }
    const closed = await PollService.closePoll(pollId);
    res.json({ success: true, poll: closed });
  } catch (error) {
    console.error('Error al cerrar encuesta:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};