const User = require('../models/User');

// @desc    Get all candidates with filters
// @route   GET /api/candidates
// @access  Private (Employer only)
const getCandidates = async (req, res) => {
    try {
        const { keyword, location, title, skill, preferredLocation } = req.query;

        let query = { role: 'Job Seeker' };

        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' };
        }

        if (location) {
            query.currentLocation = { $regex: location, $options: 'i' };
        }

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        if (skill) {
             // If skill is a comma-separated string, split it, otherwise treat as single
             const skillsArray = skill.split(',').map(s => s.trim()).filter(s => s);
             if (skillsArray.length > 0) {
                 // Match if the user has AT LEAST one of the skills (OR logic) or ALL?
                 // Usually search is "contains this skill".
                 // Let's do: user.skills contains at least one of the searched skills
                 // $in: matches any value in the array
                 query.skills = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
             }
        }

        if (preferredLocation) {
            query.preferredLocations = { $regex: preferredLocation, $options: 'i' };
        }
        
        // Exclude password and other sensitive fields
        const candidates = await User.find(query).select('-password -resetPasswordToken -resetPasswordExpire');

        res.json(candidates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get candidate by ID
// @route   GET /api/candidates/:id
// @access  Private (Employer only)
const getCandidateById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire');

        if (user && user.role === 'Job Seeker') {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getCandidates, getCandidateById };
