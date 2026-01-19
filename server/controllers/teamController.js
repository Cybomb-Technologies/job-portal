const Company = require('../models/Company');
const User = require('../models/User');

// @desc    Get all members of the company
// @route   GET /api/team/members
// @access  Private (Employer only)
const getTeamMembers = async (req, res) => {
    try {
        if (!req.user.companyId) {
            return res.status(404).json({ message: 'No company associated with this user' });
        }

        const company = await Company.findById(req.user.companyId).populate('members.user', 'name email profilePicture');
        
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json(company.members);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a member to the company by email
// @route   POST /api/team/members
// @access  Private (Company Admin only)
const addMember = async (req, res) => {
    const { email, role, name, password } = req.body;

    try {
        if (!req.user.companyId) {
            return res.status(404).json({ message: 'No company associated' });
        }

        // Check if requester is Admin
        if (req.user.companyRole !== 'Admin') {
            return res.status(403).json({ message: 'Only company admins can add members' });
        }

        let userToAdd = await User.findOne({ email });
        
        // If user doesn't exist, create a new one
        if (!userToAdd) {
            if (!name || !password) {
                return res.status(400).json({ message: 'User not found. To create a new account, please provide name and password.' });
            }
            
            userToAdd = await User.create({
                name,
                email,
                password,
                role: 'Employer',
                companyId: req.user.companyId,
                companyRole: role || 'Recruiter'
            });
        } else {
            // If user exists, check if they are already in a company
            if (userToAdd.role !== 'Employer') {
                return res.status(400).json({ message: 'User must be registered as an Employer' });
            }

            if (userToAdd.companyId) {
                return res.status(400).json({ message: 'User is already part of another company' });
            }

            // Update existing user record
            userToAdd.companyId = req.user.companyId;
            userToAdd.companyRole = role || 'Recruiter';
            await userToAdd.save();
        }

        const company = await Company.findById(req.user.companyId);
        
        // Check if user is already in this specific company's members array (redundant but safe)
        const isAlreadyMember = company.members.some(m => m.user.toString() === userToAdd._id.toString());
        if (!isAlreadyMember) {
            company.members.push({ user: userToAdd._id, role: role || 'Recruiter' });
            await company.save();
        }

        res.json({ 
            message: 'Member added successfully',
            user: {
                _id: userToAdd._id,
                name: userToAdd.name,
                email: userToAdd.email,
                role: userToAdd.companyRole
            }
        });
    } catch (error) {
        console.error("Add Member Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove a member from the company
// @route   DELETE /api/team/members/:userId
// @access  Private (Company Admin only)
const removeMember = async (req, res) => {
    try {
        const userIdToRemove = req.params.userId;

        if (req.user.companyRole !== 'Admin') {
            return res.status(403).json({ message: 'Only company admins can remove members' });
        }

        if (userIdToRemove === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot remove yourself' });
        }

        const company = await Company.findById(req.user.companyId);
        company.members = company.members.filter(m => m.user.toString() !== userIdToRemove);
        await company.save();

        const user = await User.findById(userIdToRemove);
        if (user) {
            user.companyId = undefined;
            user.companyRole = undefined;
            await user.save();
        }

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTeamMembers,
    addMember,
    removeMember
};
