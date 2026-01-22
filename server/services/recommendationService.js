const Job = require("../models/Job");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { getJobRecommendationEmail } = require("../utils/emailTemplates");

/**
 * Calculate match score between a user and a job
 * @param {Object} user - User document
 * @param {Object} job - Job document
 * @returns {Object} { score, reasons }
 */
const calculateMatchScore = (user, job) => {
  let score = 0;
  const reasons = [];

  // A. Skill Match (High Weight: 10 per skill)
  if (job.skills && job.skills.length > 0) {
    const userSkillsLower = (user.skills || []).map((s) => s.toLowerCase());
    const matchingSkills = job.skills.filter((s) =>
      userSkillsLower.includes(s.toLowerCase()),
    );
    if (matchingSkills.length > 0) {
      score += matchingSkills.length * 10;
      reasons.push(`${matchingSkills.length} matching skills`);
    }
  }

  // B. Title Match (Medium Weight: 20)
  if (user.title && job.title) {
    const userTitle = user.title.toLowerCase();
    const jobTitle = job.title.toLowerCase();
    if (jobTitle.includes(userTitle) || userTitle.includes(jobTitle)) {
      score += 20;
      reasons.push("Job title match");
    }
  }

  // C. Location Match (Medium Weight: 15)
  if (
    user.currentLocation ||
    (user.preferredLocations && user.preferredLocations.length > 0)
  ) {
    const jobLoc = job.location.toLowerCase();
    const userLoc = (user.currentLocation || "").toLowerCase();
    const prefLocs = (user.preferredLocations || []).map((l) =>
      l.toLowerCase(),
    );

    if (
      jobLoc.includes(userLoc) ||
      prefLocs.some((pl) => jobLoc.includes(pl))
    ) {
      score += 15;
      reasons.push("Location match");
    } else if (jobLoc === "remote" || job.type === "Remote") {
      // Slight boost for Remote if not exact location match but user might be open
      score += 5;
    }
  }

  // D. Experience Match (Low Weight: 10)
  if (user.totalExperience !== undefined) {
    // loose check for undefined / null
    if (
      user.totalExperience >= job.experienceMin &&
      user.totalExperience <= job.experienceMax
    ) {
      score += 10;
      reasons.push("Experience level match");
    }
  }

  return { score, reasons };
};

/**
 * Find recommended jobs for a specific user
 * @param {Object} user - The user document
 * @param {number} limit - Max jobs to return
 * @returns {Promise<Array>} - Array of scored jobs
 */
const findMatchesForUser = async (user, limit = 5) => {
  try {
    // Fetch active jobs
    // Optimization: In production, use filters in DB query to reduce set size
    const jobs = await Job.find({ status: "Active" })
      .populate("postedBy", "name email profilePicture employerVerification")
      .sort({ createdAt: -1 })
      .limit(100);

    const scoredJobs = jobs.map((job) => {
      const { score, reasons } = calculateMatchScore(user, job);
      return { ...job.toObject(), score, matchReasons: reasons };
    });

    // 100% Functional Match Constraint
    // We set a threshold.
    // 15 points = approx 1.5 skills OR 1 skill + remote OR Title match OR Location Match
    // "100% functional" implies we shouldn't recommend random stuff.
    // Let's rely on the score. A score of 0, 5, 10 is likely weak.
    // 20+ implies at least 2 skills OR Title match.
    const MIN_SCORE_THRESHOLD = 15;

    scoredJobs.sort((a, b) => b.score - a.score);

    const recommendations = scoredJobs
      .filter((j) => j.score >= MIN_SCORE_THRESHOLD)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error(`Error finding matches for user ${user._id}:`, error);
    return [];
  }
};

/**
 * Send daily recommendation emails to all eligible job seekers
 */
const sendDailyEmails = async () => {
  console.log("Starting daily job recommendation email process...");
  try {
    const users = await User.find({
      role: "Job Seeker",
      isActive: true,
      email: { $exists: true, $ne: "" },
    });

    let emailCount = 0;

    for (const user of users) {
      const recommendations = await findMatchesForUser(user, 5);

      if (recommendations.length >= 3) {
        // Requirement: "recommended jobs(3 to 5)"
        // If we have fewer than 3 good matches, maybe skip to avoid spamming weak suggestions?
        // Or send what we have? The user said "recommended jobs(3 to 5)".
        // Let's send if we have at least 1 very good one, but let's stick to the prompt.
        // "match should be 100% functional"

        const html = getJobRecommendationEmail(user, recommendations);

        await sendEmail({
          email: user.email,
          subject: `Daily Job Matches for ${user.name} - ${new Date().toLocaleDateString()}`,
          message: `We found ${recommendations.length} new jobs for you!`,
          html,
        });

        emailCount++;
      }
    }

    console.log(`Daily emails sent to ${emailCount} users.`);
  } catch (error) {
    console.error("Error in sendDailyEmails:", error);
  }
};

module.exports = {
  calculateMatchScore,
  findMatchesForUser,
  sendDailyEmails,
};
