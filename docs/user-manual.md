# Academic Tracker User Manual

Version: 1.0  
Audience: Lecturers, supervisors, students, and project testers

## 1. Overview

Academic Tracker is a web application for tracking academic research progress. It supports lecturer and student accounts, supervised student profiles, milestones, weekly updates, progress meetings, task lists, thesis progress, publication tracking, evidence records, calendar visibility, and progress reports.

The application is designed around two main roles:

- Lecturer: manages supervised students and reviews progress.
- Student: submits updates, views assigned milestones, tracks tasks, and checks meeting schedules.

## 2. Getting Started

Open the application URL provided by the administrator. Use the sign-in screen to access your account.

For a live deployment, use your registered email and password. If the deployment allows preview mode, preview accounts are only for testing and should not be used for real progress records.

## 3. Account Registration

### Lecturer Account

1. Open the sign-in page.
2. Select the account creation option.
3. Enter your name, email, password, and choose Lecturer.
4. If email confirmation is enabled, confirm your email before signing in.
5. Sign in with the registered account.

### Student Account

1. The lecturer registers a supervised student profile using the student's email.
2. The student creates an account with the same email.
3. The lecturer opens the student profile and selects Link Student Account.
4. The student signs in and should see their own dashboard.

If the student sees "No student profile linked", the lecturer should verify that the student profile email and account email match, then link the account again.

## 4. Lecturer Workflow

### Dashboard

The lecturer dashboard gives a high-level overview of supervised students:

- Total supervised students by FYP, Master, and PhD category.
- Critical and delayed students.
- Pending tasks.
- Overdue deliverables.
- Near-graduation students.
- Monthly calendar.
- Supervision prioritizer.

Open an individual student profile to view detailed progress, thesis, milestone, update, and meeting information.

### Register A Student

1. Click Register Student.
2. Enter the student's name and email.
3. Select the academic track: FYP, Master, or PhD.
4. Set start, expected completion, and maximum completion dates.
5. Enter the research or thesis title.
6. Confirm registration.

The system automatically initializes milestone and thesis chapter records for the student.

### Link A Student Account

1. Open the registered student profile.
2. Confirm that the student has already created an account using the same email.
3. Click Link Student Account.
4. The button changes to Student Account Linked when successful.

### Review Student Profile

Inside a student profile, the lecturer can:

- Check overall progress and risk.
- Review assigned milestones.
- Approve or request revision for milestones.
- Read weekly updates.
- Provide feedback.
- Add meeting logs.
- Assign quick progress action items.
- Review thesis chapter progress.

### Schedule Meetings

1. Open Meeting Logs.
2. Select a student.
3. Choose meeting date and time.
4. Enter agenda, notes, and action item.
5. Click Schedule.

The meeting appears in the lecturer calendar and the student's calendar. Other students only see the slot as Supervisor busy.

## 5. Student Workflow

### Dashboard

The student dashboard shows:

- Overall progress.
- Study time used.
- Current risk status.
- Next deadline.
- Upcoming meeting.
- Assigned milestones.
- Task checklist.
- Recent meeting summary.
- Supervisor feedback.
- Thesis progress.
- Calendar.

### Submit Weekly Update

1. Open Weekly Updates.
2. Enter work completed this week.
3. Enter incomplete work, blockers, and next plan where relevant.
4. Select the related milestone.
5. Add an evidence file name if required.
6. Choose whether supervisor feedback is needed.
7. Submit the update.

### Update Milestone Progress

1. Open My Milestones.
2. Adjust the progress slider for the relevant milestone.
3. The milestone status updates based on progress.
4. Submitted or approved status is reviewed by the lecturer.

### Manage Tasks

1. Open Weekly Tasks.
2. Review assigned actions.
3. Mark tasks complete when done.
4. Add personal progress tasks when needed.

### View Meetings

Open Meeting Summary to view meeting notes, supervisor feedback, action items, and the next meeting date.

### Use The Calendar

The student calendar shows:

- Own meetings.
- Own tasks.
- Milestone deadlines.
- Weekly update deadlines.
- Supervisor busy slots.

Supervisor busy slots do not show other student names.

## 6. Reports

Lecturers can generate reports for:

- Student progress.
- Milestones.
- Meetings.
- Publications.
- Weekly updates.

Generated reports appear in the Reports tab.

## 7. Data Privacy Notes

- Students can only access their own profile and related records.
- Lecturers can access students they supervise.
- Other student meeting slots are hidden from student calendars and shown only as supervisor busy slots.
- Account authentication is handled through the live account system configured for the deployment.

## 8. Common Issues

### Invalid API Key

The live deployment environment variables are misconfigured. Ask the administrator to check the live database URL and publishable key, then redeploy.

### No Student Profile Linked

The student's account has not been linked to the registered student profile. The lecturer should open the student profile and link the account.

### Email Confirmation Opens The Wrong URL

The authentication redirect URL is misconfigured. The administrator should update the authentication Site URL and Redirect URLs to the deployed application URL.

### Too Many Signup Emails

The authentication email provider is rate limited. Wait before trying again, or configure a custom SMTP provider for production.

## 9. Administrator Deployment Checklist

Before sharing the application publicly:

1. Confirm Supabase migrations have been run.
2. Confirm Vercel environment variables are set.
3. Confirm authentication redirect URLs point to the deployed application.
4. Disable preview mode in public deployment.
5. Create a lecturer account.
6. Register and link a test student.
7. Test lecturer login, student login, meeting scheduling, and calendar visibility.

## 10. Support Procedure

When reporting an issue, include:

- Account role: Lecturer or Student.
- Page or tab where the problem happened.
- Student name or profile affected, if relevant.
- Error message shown.
- Time and browser used.

