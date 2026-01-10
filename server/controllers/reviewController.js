const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private (Candidate)
const addReview = async (req, res) => {
  const { employerId, rating, title, comment } = req.body;

  try {
    const employer = await User.findById(employerId);
    if (!employer || employer.role !== 'Employer') {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Check if review already exists
    const reviewExists = await Review.findOne({
      employer: employerId,
      candidate: req.user._id,
    });

    if (reviewExists) {
      return res.status(400).json({ message: 'You have already reviewed this employer' });
    }

    const review = await Review.create({
      employer: employerId,
      candidate: req.user._id,
      rating,
      title,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get reviews for an employer
// @route   GET /api/reviews/:employerId
// @access  Public (But filters hidden for public, shows all for employer)
const getReviews = async (req, res) => {
  try {
    const { employerId } = req.params;
    // We check if the requester is the employer themselves to show hidden reviews
    // This requires passing auth token even for this public-ish route if we want that logic here
    // Or we can rely on a separate route. Let's make it simple: 
    // If query ?all=true and user is the employer -> return all.
    // Actually simpler: Employer fetches from a separate 'my-reviews' route or we check req.user here if available.
    
    // For now, let's just return all reviews that are NOT hidden.
    // And create a separate "getMyReviews" for the employer dashboard.
    
    const reviews = await Review.find({ employer: employerId, isHidden: false })
      .populate('candidate', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get my reviews (as employer)
// @route   GET /api/reviews/my/all
// @access  Private (Employer)
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ employer: req.user._id })
            .populate('candidate', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' }); 
    }
}

// @desc    Toggle review visibility
// @route   PUT /api/reviews/:id/visibility
// @access  Private (Employer)
const toggleReviewVisibility = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    review.isHidden = !review.isHidden;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  addReview,
  getReviews,
  getMyReviews,
  toggleReviewVisibility,
};
