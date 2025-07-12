import ReportService from '../services/reportService.js';

export const createReport = async (req, res) => {
  try {
    const { type, message } = req.body;
    const userId = req.user.id;

    if (!type || !message) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos.' });
    }

    const report = await ReportService.createReport({ userId, type, message });
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await ReportService.getAllReports();
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
