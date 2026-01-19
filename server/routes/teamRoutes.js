const express = require('express');
const router = express.Router();
const { getTeamMembers, addMember, removeMember } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/members')
    .get(getTeamMembers)
    .post(addMember);

router.route('/members/:userId')
    .delete(removeMember);

module.exports = router;
