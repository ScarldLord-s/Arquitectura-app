import ReportModel from '../models/reportModel.js';

class ReportService {
  async createReport({ userId, type, message }) {
    return await ReportModel.createReport({ userId, type, message });
  }

  async getAllReports() {
    return await ReportModel.getAllReports();
  }
}

export default new ReportService();
