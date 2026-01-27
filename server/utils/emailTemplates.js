
const getJobRecommendationEmail = (user, jobs) => {
    const jobItems = jobs.map(job => `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background-color: #ffffff;">
            <h3 style="margin: 0 0 5px; color: #2c3e50;">${job.title}</h3>
            <p style="margin: 0 0 5px; color: #7f8c8d; font-weight: bold;">${job.company}</p>
            <p style="margin: 0 0 10px; color: #555;">${job.location} • ${job.type}</p>
            
            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                <strong>Match:</strong> ${job.matchReasons.slice(0, 3).join(', ')}
            </p>

            <a href="${process.env.CLIENT_URL}/jobs/${job._id}" 
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
                    <a href="${process.env.CLIENT_URL}/jobs" 
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

const getApplicationSuccessEmail = (user, job) => {
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
            .success-icon { color: #2ecc71; font-size: 48px; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">✓</div>
                <h1 style="color: #2c3e50; margin: 0;">Application Successful</h1>
            </div>
            
            <div class="content">
                <p>Hello ${user.name},</p>
                <p>Your application for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong> has been successfully submitted.</p>
                
                <div style="background-color: #f4f6f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2c3e50;">Application Details:</h3>
                    <p style="margin: 5px 0;"><strong>Job Title:</strong> ${job.title}</p>
                    <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                    <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
                </div>
                
                <p>The employer will review your application and contact you if your profile matches their requirements.</p>
                
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${process.env.CLIENT_URL}/my-applications" 
                       style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       View My Applications
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Good luck with your job search!</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getApplicationStatusChangeEmail = (user, job, status) => {
    let statusColor = '#3498db';
    let statusMessage = `The status of your application has been updated to <strong>${status}</strong>.`;

    if (status === 'Shortlisted') {
        statusColor = '#2ecc71';
        statusMessage = `Congratulations! You have been <strong>Shortlisted</strong> for this position.`;
    } else if (status === 'Rejected') {
        statusColor = '#e74c3c';
        statusMessage = `We appreciate your interest, but unfortunately, your application was not selected at this time.`;
    } else if (status === 'Interview Scheduled') {
        statusColor = '#9b59b6';
        statusMessage = `Great news! You have been selected for an interview.`;
    }

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
            .status-badge { display: inline-block; padding: 5px 15px; border-radius: 15px; background-color: ${statusColor}; color: white; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #2c3e50; margin: 0;">Application Status Update</h1>
                <p style="margin: 10px 0 0;">${job.title} at ${job.company}</p>
            </div>
            
            <div class="content">
                <p>Hello ${user.name},</p>
                <p>${statusMessage}</p>
                
                <div style="background-color: #f4f6f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Job Title:</strong> ${job.title}</p>
                    <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                    <p style="margin: 5px 0;"><strong>New Status:</strong> <span class="status-badge">${status}</span></p>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${process.env.CLIENT_URL}/my-applications" 
                       style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       View Application
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for using our platform.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getNewJobNotificationEmail = (user, job, company) => {
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
            .company-logo { width: 80px; height: 80px; object-fit: contain; border-radius: 10px; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                ${company.profilePicture ? `<img src="${company.profilePicture.startsWith('http') ? company.profilePicture : process.env.VITE_SERVER_URL + company.profilePicture}" alt="${company.name}" class="company-logo">` : ''}
                <h1 style="color: #2c3e50; margin: 0;">New Job Alert</h1>
                <p style="margin: 10px 0 0;">${company.name} just posted a new job</p>
            </div>
            
            <div class="content">
                <p>Hello ${user.name},</p>
                <p>A company you follow, <strong>${company.name}</strong>, has just posted a new job opening.</p>
                
                <div style="background-color: #f4f6f7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #3498db;">
                    <h2 style="margin-top: 0; color: #2c3e50;">${job.title}</h2>
                    <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
                    <p style="margin: 5px 0;"><strong>Type:</strong> ${job.type}</p>
                    <p style="margin: 5px 0;"><strong>Experience:</strong> ${job.experienceMin} - ${job.experienceMax} Years</p>
                    <p style="margin: 5px 0;"><strong>Salary:</strong> ${job.salaryMin} - ${job.salaryMax} (${job.salaryFrequency})</p>
                </div>
                
                <p>Be among the first to apply!</p>
                
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${process.env.CLIENT_URL}/jobs/${job._id}" 
                       style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                       View Job & Apply
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>You received this email because you follow ${company.name} on our platform.</p>
                <p><a href="${process.env.CLIENT_URL}/companies/${company._id}" style="color: #999;">Manage Notification Settings</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    getJobRecommendationEmail,
    getApplicationSuccessEmail,
    getApplicationStatusChangeEmail,
    getNewJobNotificationEmail
};
