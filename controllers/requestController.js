const Request = require('../models/Request');

// Create a new request/report (employee)
exports.createRequest = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const attachment = req.file ? `/uploads/${req.file.filename}` : undefined;
    const request = new Request({
      title,
      message,
      type: type || 'request',
      createdBy: req.user._id,
      attachment
    });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Error creating request', error: err.message });
  }
};

// Get all requests (admin)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('createdBy', 'name email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests', error: err.message });
  }
};

// Get my requests (employee)
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ createdBy: req.user._id });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching my requests', error: err.message });
  }
};

// Update request status (admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, adminComment },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Error updating request status', error: err.message });
  }
};

// Delete a request (admin or employee)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting request', error: err.message });
  }
}; 