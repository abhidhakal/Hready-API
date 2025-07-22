const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Employee creates a request/report
router.post('/', protect, upload.single('attachment'), requestController.createRequest);

// Admin gets all requests
router.get('/', protect, adminOnly, requestController.getAllRequests);

// Employee gets their own requests
router.get('/my', protect, requestController.getMyRequests);

// Admin updates request status
router.put('/:id/status', protect, adminOnly, requestController.updateRequestStatus);

// Admin or employee deletes a request
router.delete('/:id', protect, requestController.deleteRequest);

module.exports = router; 