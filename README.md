# COPEX Connect

COPEX Community — Full Website Build Prompt

Build a complete, production-ready COPEX Community web platform focused on events, classes, workshops, communities, and registrations.

The website must feel like a modern community platform, not a basic college website. Use a premium glassmorphism UI with a clean dark interface, smooth animations, translucent cards, subtle gradients, rounded corners, and excellent responsive behavior.

1. Product Vision

COPEX is a community platform where users can:

Discover upcoming events

Browse and join classes

Register for workshops and competitions

Explore communities and clubs

View event schedules

Track registrations

Receive event updates

View their participation history

Manage their profile

Organizers/admins can:

Create and manage events

Create classes and workshops

Configure registration types

Manage participants

Approve registrations

Manage seats and waitlists

Publish announcements

Track event performance

Do not use fake/demo data in the final product. Build the application so real data can be connected through the backend/database.

2. UI/UX Direction

Use a premium glassmorphism design system.

Visual Style

Dark background

Frosted glass panels

backdrop-blur

Semi-transparent surfaces

Thin translucent borders

Soft shadows

Subtle gradient backgrounds

Large rounded corners

Modern typography

High-quality icons

Smooth hover states

Micro-interactions

Floating navigation elements

Minimal visual clutter

Avoid:

Generic Bootstrap-style layouts

Excessive gradients

Overly bright colors

Crowded dashboards

Fake statistics

Placeholder event content

Unnecessary animations

The interface should feel similar to a modern SaaS/community product.

3. Main Navigation

Create a responsive navigation bar:

COPEX logo

Home

Events

Classes

Communities

Calendar

My Registrations

Search

Notifications

Profile

Desktop navigation should use a floating/glass navbar.

Mobile navigation should use a clean bottom navigation or compact menu.

4. Landing Page

Create a premium homepage.

Hero Section

Large headline:

Learn. Connect. Participate.

Supporting text:

Discover events, classes, workshops and communities built to help you learn, participate and connect.

Buttons:

Explore Events

Explore Classes

Add a subtle animated glass background.

Do not use fake counters unless real backend statistics are available.

5. Featured Events

Create a horizontal event section.

Each event card should contain:

Event image/banner

Event type

Event title

Short description

Date

Time

Location

Organizer

Registration status

Available seats

Registration deadline

View Details button

Card design:

┌─────────────────────────────┐
│                             │
│       EVENT BANNER          │
│                             │
├─────────────────────────────┤
│ TECHNICAL WORKSHOP          │
│ AI & Future Technologies    │
│                             │
│ 📅 Date                     │
│ 🕐 Time                     │
│ 📍 Location                 │
│                             │
│ [ View Event ]              │
└─────────────────────────────┘


6. Events Page

Create a dedicated /events page.

Include:

Search

Search events by:

Event name

Organizer

Category

Location

Filters

All

Technical

Cultural

Workshop

Hackathon

Competition

Seminar

Club

Sports

Other

Additional filters:

Today

This Week

This Month

Upcoming

Free

Paid

Use glass filter chips and dropdowns.

7. Event Details Page

Create /events/[eventId].

Include:

Header

Event banner

Event category

Event title

Organizer

Date

Time

Venue/online location

Registration status

Main Content

About the event

Event schedule

Speakers

Trainers

Eligibility

Requirements

Rules

FAQs

Registration Card

Display:

Registration status

Seats available

Registration deadline

Registration type

Register Now button

On mobile, make the registration button sticky at the bottom.

8. Classes Page

Create /classes.

Classes can include:

Technical Classes

Programming

AI/ML

Electronics

Robotics

Design

Soft Skills

Career Sessions

Certification Classes

Workshops

Each class card should display:

Cover image

Class name

Instructor

Date

Duration

Mode

Level

Seats

Registration status

Modes:

Offline

Online

Hybrid

9. Class Details

Create /classes/[classId].

Include:

Class banner

Instructor profile

Course/class description

Learning outcomes

Schedule

Duration

Venue/link

Required skills

Eligibility

Number of seats

Registration deadline

Register button

10. Communities Page

Create /communities.

Users should be able to discover:

Technical communities

Department communities

Clubs

Interest groups

Project communities

Event communities

Community cards:

Logo

Name

Description

Category

Members

Upcoming events

Join button

11. Community Details

Create /communities/[communityId].

Sections:

Community header

About

Members

Events

Classes

Announcements

Projects

Community rules

Buttons:

Join Community

Leave Community

Only show actions according to the user's permissions.

12. Calendar

Create /calendar.

Display:

Monthly calendar

Weekly calendar

Upcoming events

Classes

Workshops

Registrations

Users can click an event to open its details.

Add filters:

Events

Classes

Workshops

Community activities

13. Registration System

Build a complete registration system.

Every event/class should support configurable registration types.

Registration Types

Individual Registration

User registers personally.

Team Registration

User creates or joins a team.

Fields:

Team name

Team leader

Team members

Student Registration

Collect:

Name

Email

Roll number

Department

Year

Section

Faculty Registration

Collect:

Name

Email

Department

Employee ID

Approval Registration

User submits registration and waits for organizer approval.

Invite-only Registration

Only invited users can register.

Limited-seat Registration

Registration automatically closes when seats are full.

Waitlist

When seats are full, users can join the waitlist.

14. Registration Flow

Create this complete flow:

Event Details
      ↓
Register Now
      ↓
Select Registration Type
      ↓
Registration Form
      ↓
Review Information
      ↓
Confirm Registration
      ↓
Registration Created
      ↓
Confirmation Page


Confirmation page:

Success state

Event name

Date

Time

Venue

Registration ID

Registration status

Add to calendar

View registration

15. My Registrations

Create /my-registrations.

Tabs:

Upcoming

Pending

Approved

Completed

Cancelled

Each registration card:

Event/class

Date

Registration ID

Status

Venue

View details

Cancel registration where allowed

16. User Profile

Create /profile.

Sections:

Personal Information

Profile photo

Name

Email

Phone

Department

Year

Section

Roll number

Participation

Registered events

Completed events

Classes joined

Communities joined

Settings

Account settings

Notification preferences

Privacy settings

17. Notifications

Create a notification center.

Notifications can include:

Registration confirmation

Registration approval

Registration rejection

Event reminder

Event schedule changes

Class updates

Community announcements

Waitlist availability

Use a glass dropdown/panel.

18. Authentication

Implement real authentication.

Support:

Create account

Login

Logout

Forgot password

Email verification

Password reset

Role-based access

User roles:

STUDENT
FACULTY
ORGANIZER
ADMIN


Protect private pages using authentication and authorization.

Do not expose admin functionality to normal users.

19. Admin Dashboard

Create a complete /admin dashboard.

Use a premium glass sidebar.

Sidebar:

Dashboard

Events
Classes
Communities
Registrations
Participants
Announcements
Calendar

Users
Organizers

Reports
Analytics

Settings


20. Admin Dashboard

Show real database-driven information:

Total events

Upcoming events

Active classes

Total registrations

Pending approvals

Active communities

Do not hardcode these values.

Create charts only when actual data exists.

21. Event Management

Admin/organizer can:

Create event

Edit event

Delete event

Publish/unpublish

Duplicate event

Configure registration

Set capacity

Set registration deadline

Manage speakers

Manage schedule

Manage venue

Manage participants

Event creation form:

Title

Description

Category

Banner

Organizer

Date

Start time

End time

Venue

Online meeting link

Capacity

Registration deadline

Registration type

Eligibility

Rules

FAQs

22. Class Management

Admin/organizer can:

Create class

Edit class

Delete class

Publish/unpublish

Add instructor

Set schedule

Set capacity

Configure registration

Manage participants

23. Registration Management

Admin should have a searchable registration table.

Columns:

Participant

Event/Class

Registration ID

Registration type

Registration date

Status

Actions

Actions:

View

Approve

Reject

Cancel

Export

Support bulk actions.

24. Participant Management

Create participant profiles.

Admin can:

View participant

View registrations

View participation history

Approve/reject registrations

Export participant information

Do not expose unnecessary private information.

25. Community Management

Admin can:

Create community

Edit community

Delete community

Add moderators

Manage members

Publish announcements

Link events

Link classes

26. Organizer Dashboard

Create /organizer.

Organizer can see:

Their events

Their classes

Registrations

Pending approvals

Participants

Event performance

Organizer permissions must be limited to their assigned content.

27. Search

Create global search.

Search across:

Events

Classes

Communities

Organizers

Use instant search suggestions and a dedicated search results page.

28. Responsive Design

The website must work perfectly on:

Desktop

Laptop

Tablet

Mobile

Mobile UI must not simply shrink the desktop design.

Create mobile-specific:

Navigation

Cards

Filters

Registration forms

Admin tables

Modals

29. Accessibility

Implement:

Keyboard navigation

Proper labels

Accessible forms

Focus states

Sufficient contrast

Semantic HTML

Screen-reader-friendly controls

Reduced-motion support

30. Loading & Empty States

Every data-driven page needs:

Loading

Use elegant glass skeleton loaders.

Empty

Examples:

No upcoming events

There are no upcoming events right now.

No registrations

You haven't registered for any events yet.

Provide a relevant action button.

Error

Show a clean error message and retry action.

31. Notifications & Confirmation UX

Use:

Toast notifications

Confirmation dialogs

Success screens

Error messages

Form validation

Avoid browser alert() dialogs.

32. Technical Architecture

Build this as a real production application.

Recommended stack:

Frontend

Next.js

React

TypeScript

Tailwind CSS

shadcn/ui

Lucide icons

Backend

Use a proper API/service layer.

Database

Use a production database such as PostgreSQL/Supabase.

Authentication

Use secure authentication with role-based authorization.

Storage

Use cloud storage for:

Event banners

Community logos

Profile photos

Class images

Documents

Never store large uploaded files directly in database fields.

33. Database Entities

Create proper relationships for:

User
Role
Event
EventCategory
EventSchedule
EventSpeaker
Class
Instructor
Community
CommunityMember
Registration
RegistrationMember
Waitlist
Announcement
Notification
Venue


Registration records must reference the actual user and event/class.

Do not duplicate important information unnecessarily.

34. Security

Implement:

Authentication

Authorization

Role-based permissions

Server-side validation

Input sanitization

Secure file uploads

Rate limiting where appropriate

Protected admin routes

Protected API routes

Secure environment variables

Never expose:

Database credentials

API secrets

Private storage keys

Authentication secrets

in frontend code.

35. Real Product Requirement

This is not a demo website.

Do not create:

Fake statistics

Fake users

Fake registrations

Fake event data

Fake charts

Fake notifications

Fake authentication

Create proper empty states when the database has no records.

Every dashboard number must come from the database.

Every registration must create a real database record.

Every event/class must be manageable through the admin interface.

36. Design System

Use consistent:

Border Radius

20–28px for major cards.

Glass Surface

Use translucent backgrounds with backdrop blur.

Buttons

Primary:

Bright accent

Rounded

Strong hover state

Secondary:

Transparent glass

Thin border

Cards

Glass background

Border

Blur

Shadow

Hover elevation

Typography

Use a clean modern font such as:

Inter

Geist

Plus Jakarta Sans

Use strong hierarchy:

Large hero heading

Medium section headings

Clear body text

Small metadata

37. Animations

Use subtle animations:

Card hover

Page transitions

Modal opening

Button interaction

Skeleton loading

Filter transitions

Notification appearance

Keep animations fast and professional.

Do not over-animate the interface.

38. Final Pages

Build all of these pages:

/
├── /events
├── /events/[eventId]
├── /classes
├── /classes/[classId]
├── /communities
├── /communities/[communityId]
├── /calendar
├── /search
├── /my-registrations
├── /profile
├── /notifications
│
├── /login
├── /register
├── /forgot-password
├── /verify-email
│
├── /organizer
├── /organizer/events
├── /organizer/classes
├── /organizer/registrations
│
└── /admin
    ├── /dashboard
    ├── /events
    ├── /classes
    ├── /communities
    ├── /registrations
    ├── /participants
    ├── /users
    ├── /organizers
    ├── /announcements
    ├── /calendar
    ├── /reports
    └── /settings


39. Final Goal

The finished COPEX Community platform should feel like a real modern event and learning ecosystem where students and community members can discover opportunities, register for activities, join classes, participate in communities, and manage their entire participation history from one place.

Prioritize:

Real functionality → Clean UX → Glassmorphism design → Responsive experience → Security → Accessibility → Performance

Build the complete application, not just a landing page or visual prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/86d1b527-a6ee-4f00-bba2-8f2f99af2692).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
