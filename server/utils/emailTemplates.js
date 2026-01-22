
const getJobRecommendationEmail = (user, jobs) => {
    const jobItems = jobs.map(job => `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background-color: #ffffff;">
            <h3 style="margin: 0 0 5px; color: #2c3e50;">${job.title}</h3>
            <p style="margin: 0 0 5px; color: #7f8c8d; font-weight: bold;">${job.company}</p>
            <p style="margin: 0 0 10px; color: #555;">${job.location} • ${job.type}</p>
            
            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                <strong>Match:</strong> ${job.matchReasons.slice(0, 3).join(', ')}
            </p>

            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/jobs/${job._id}" 
               style="background-color: #3498db; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">
               View Job
            </a>
        </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .content { margin-bottom: 30px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #2c3e50; margin: 0;">Job Recommendations</h1>
                <p style="margin: 10px 0 0;">Top picks for you today, ${user.name}</p>
            </div>
            
            <div class="content">
                <p>Hello ${user.name},</p>
                <p>Based on your profile, we found some new opportunities that score a high match with your skills and experience.</p>
                
                <div style="margin-top: 25px;">
                    ${jobItems}
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/jobs" 
                       style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       View All Jobs
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>You received this email because you are a registered job seeker on our platform.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    getJobRecommendationEmail
};
