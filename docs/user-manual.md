# Academic Tracker User Manual

Version: 1.1  
For: Lecturers, students, testers, and administrators

## 1. What Academic Tracker Is

Academic Tracker is a web application for monitoring academic progress.

It is designed for:

- Lecturers or supervisors who manage and review student progress
- Students who submit updates, track milestones, and follow meeting schedules

The system helps track:

- student profiles
- milestones
- weekly updates
- meetings
- tasks
- thesis or report progress
- publications
- progress reports
- calendar availability

## 2. Before You Start

You need:

- the application link
- your registered email address
- your password

If you do not have an account yet, follow the steps in the account section below.

## 3. Roles In The System

There are two main user roles:

### Lecturer

Lecturers can:

- register students
- view all students under their supervision
- review milestones
- give feedback
- schedule meetings
- assign tasks
- generate reports

### Student

Students can:

- view their own profile
- update milestone progress
- submit weekly updates
- check assigned tasks
- view meeting logs
- view supervisor busy slots in the calendar

## 4. Signing In

1. Open the application link.
2. Enter your email.
3. Enter your password.
4. Click `Sign In`.

If email confirmation is enabled for the deployment, confirm your email first before signing in.

## 5. Creating Accounts

Account creation is different for lecturers and students.

### 5.1 Lecturer Account Creation

Use these steps if you are the lecturer or first supervisor using the system.

1. Open the sign-in page.
2. Click `Create account`.
3. Enter your full name.
4. Enter your email.
5. Enter your password.
6. Choose `Lecturer`.
7. Submit the form.
8. Confirm your email if required.
9. Sign in.

### 5.2 Student Account Creation

Students should not create an account before the lecturer has registered their profile.

Correct sequence:

1. Lecturer registers the student profile first.
2. Student creates an account using the same email address.
3. Lecturer links the student account to the registered profile.
4. Student signs in and uses the dashboard.

### Important Rule For Students

The student's account email must match the email used by the lecturer during student registration.

If the emails do not match, the student account cannot be linked properly.

## 6. How A Lecturer Registers A Student

1. Sign in as lecturer.
2. On the dashboard, click `Register Student`.
3. Fill in:
   - student name
   - student email
   - academic category: FYP, Master, or PhD
   - start date
   - expected completion date
   - maximum completion date
   - thesis or research title
4. Submit the form.

After submission:

- the student profile is created
- milestone templates are initialized
- thesis chapter records are prepared

## 7. How A Student Creates Their Account

After the lecturer has registered the student profile:

1. Open the sign-in page.
2. Click `Create account`.
3. Enter your full name.
4. Enter the exact same email used by the lecturer.
5. Enter your password.
6. Choose `Student`.
7. Submit the form.
8. Confirm the email if required.

At this stage, the student account exists, but it may still need to be linked by the lecturer.

## 8. How The Lecturer Links A Student Account

After the student creates an account:

1. Sign in as lecturer.
2. Open the student's profile.
3. Confirm the student email in the system matches the student account email.
4. Click `Link Student Account`.

When successful:

- the button changes to `Student Account Linked`
- the student can sign in and access the correct dashboard

## 9. What To Do If A Student Sees "No Student Profile Linked"

This means the student account exists, but it is not connected to the registered student profile.

Check the following:

1. Was the student registered by the lecturer first?
2. Did the student use the same email address?
3. Did the lecturer click `Link Student Account`?

If not, repeat the account linking process.

## 10. Lecturer Dashboard Guide

The lecturer dashboard is the control center for supervision.

It shows:

- total supervised students
- counts by FYP, Master, and PhD
- high-risk students
- overdue items
- task workload
- near-graduation students
- monthly calendar
- priority rankings

### Main Lecturer Tabs

#### Dashboard

Use this for the overall summary.

#### Students List

Use this to find and open an individual student profile.

#### Deadlines Calendar

Use this to review meetings, milestones, and deadlines by month.

#### Weekly Updates

Use this to review submitted progress updates and requests for feedback.

#### Meeting Logs

Use this to:

- review past meetings
- schedule new meetings
- monitor follow-up items

#### Milestones Map

Use this to review milestone progress across students.

#### Publications Tracker

Use this to review publication progress.

#### Thesis Chapters

Use this to monitor chapter-level thesis progress.

#### Reports

Use this to generate progress-related reports.

## 11. Lecturer Student Profile Guide

When a lecturer opens a student profile, they can:

- view overall progress
- review time used
- check risk status
- read weekly updates
- review task progress
- review thesis chapter progress
- add meeting logs
- assign action items
- approve milestones
- request revisions

## 12. How A Lecturer Schedules A Meeting

1. Open `Meeting Logs`.
2. Select the student.
3. Choose the meeting date.
4. Choose the meeting time.
5. Enter the agenda.
6. Enter notes or feedback.
7. Enter at least one action item.
8. Click `Schedule`.

After scheduling:

- the meeting appears in the lecturer calendar
- the meeting appears in the student's calendar
- other students only see the lecturer as busy, not the student name

## 13. Student Dashboard Guide

The student dashboard is the student's personal workspace.

It shows:

- overall progress
- time used
- current risk
- next deadline
- next meeting
- milestones
- tasks
- thesis progress
- supervisor feedback
- calendar

## 14. How A Student Uses The Dashboard

### 14.1 Update Milestones

1. Open `My Milestones`.
2. Find the relevant milestone.
3. Adjust the progress value.
4. Save the updated progress.

Note:

- milestone progress may affect the student's risk and overall progress
- some milestone statuses still need lecturer approval

### 14.2 Submit Weekly Updates

1. Open `Weekly Updates`.
2. Enter:
   - what was completed
   - what was not completed
   - blockers
   - next week's plan
3. Select the related milestone if needed.
4. Add the evidence file name if required.
5. Choose whether urgent feedback is needed.
6. Submit the update.

### 14.3 Manage Tasks

1. Open `Weekly Tasks`.
2. Review the tasks assigned by the lecturer.
3. Mark tasks completed when finished.
4. Add personal tasks if needed.

### 14.4 Read Meeting Logs

1. Open `Meeting Summary`.
2. Read:
   - meeting date
   - supervisor feedback
   - action items
   - next meeting date

### 14.5 Use The Calendar

The student calendar shows:

- personal meetings
- personal tasks
- milestone deadlines
- weekly update deadlines
- lecturer busy slots

The calendar does not show other students' private details.

## 15. Notification Bell

The bell icon now opens notifications.

### Lecturer Notifications Can Show

- students needing attention
- feedback requests
- overdue tasks

### Student Notifications Can Show

- pending tasks
- upcoming meetings
- supervisor feedback

Clicking a notification opens the related area of the system.

## 16. Reports

Lecturers can generate reports for:

- student progress
- milestones
- meetings
- publications
- weekly updates

Generated reports appear in the `Reports` tab.

## 17. Privacy And Visibility

The system is designed so users only see what they should see.

### Students Can See

- their own profile
- their own meetings
- their own tasks
- their own updates
- their own milestones
- lecturer busy slots without other student names

### Lecturers Can See

- students they supervise
- student progress details
- student meetings
- student tasks
- student updates

## 18. Common Problems And Fixes

### Problem: Invalid API Key

Meaning:

The live deployment is connected to the wrong environment variables.

Action:

Ask the administrator to check:

- live database URL
- publishable key
- deployment environment variables

### Problem: No Student Profile Linked

Meaning:

The student account was created, but not linked to the registered student profile.

Action:

The lecturer should open the student profile and click `Link Student Account`.

### Problem: Email Confirmation Opens The Wrong Website

Meaning:

The authentication redirect URL is incorrect.

Action:

The administrator must update the authentication Site URL and Redirect URLs.

### Problem: Signup Email Limit Reached

Meaning:

The email provider is rate limited.

Action:

- wait and try again later
- or use a proper SMTP configuration for production

## 19. Administrator Checklist

Before real users start testing:

1. Confirm database migrations have been run.
2. Confirm live environment variables are correct.
3. Confirm redirect URLs match the deployed application.
4. Confirm preview mode is disabled on public deployment if required.
5. Create a lecturer account.
6. Register at least one student.
7. Create the student account.
8. Link the student account.
9. Test lecturer login.
10. Test student login.
11. Test meeting scheduling.
12. Test calendar visibility.

## 20. When Reporting A Bug

Please include:

- whether you are a Lecturer or Student
- which page or tab has the problem
- the student name involved, if relevant
- the exact error message
- what action you were trying to perform
- the time the issue happened
- browser or device used

