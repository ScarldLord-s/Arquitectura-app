import PollModel from '../models/pollModel.js';
import PollVoteModel from '../models/pollVoteModel.js';

class PollService {
  async createPoll({ roomId, question, options, createdBy }) {
    return await PollModel.createPoll({ roomId, question, options, createdBy });
  }
  async getPollById(pollId) {
    return await PollModel.getPollById(pollId);
  }

  async getPollsByRoom(roomId) {
    return await PollModel.getPollsByRoom(roomId);
  }

  async vote({ pollId, userId, optionIndex }) {
    return await PollVoteModel.vote({ pollId, userId, optionIndex });
  }

  async getVotesByPoll(pollId) {
    return await PollVoteModel.getVotesByPoll(pollId);
  }

  async closePoll(pollId) {
    return await PollModel.closePoll(pollId);
  }
}

export default new PollService();