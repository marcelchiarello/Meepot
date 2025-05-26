# Meepot Application - Detailed Use Cases

## 1. Event Creation and Management Scenarios

### Use Case 1.1: Create a Dinner Event
**Actor:** Host (Event Organizer)
**Role:** Authenticated user creating a social dinner event

**Preconditions:**
- User is logged into the application
- User has verified email address

**Main Flow:**
1. Host navigates to "Create Event" from the dashboard
2. Host fills in event details:
   - Event title (e.g., "Summer BBQ Party")
   - Date and time
   - Location address
   - Maximum number of guests
   - Description and special instructions
3. Host sets event visibility (public/private)
4. Host uploads event cover image (optional)
5. Host reviews and submits the event
6. System creates event and generates unique event ID
7. Host is redirected to event detail page

**Alternative Flows:**
- A1: If required fields are missing, system displays validation errors
- A2: If date is in the past, system prompts for valid future date
- A3: Host can save as draft and complete later

**Postconditions:**
- Event is created in the system
- Host becomes event administrator
- Event appears in host's event list
- Event is ready for invitation distribution

**Business Impact:**
- Enables social gathering organization
- Creates platform engagement
- Generates potential revenue through premium features

### Use Case 1.2: Edit Event Details
**Actor:** Host
**Role:** Event administrator

**Preconditions:**
- Event exists in the system
- User is the event host
- Event has not yet occurred

**Main Flow:**
1. Host navigates to "My Events"
2. Host selects event to edit
3. Host clicks "Edit Event"
4. Host modifies desired fields
5. Host saves changes
6. System validates and updates event
7. System notifies confirmed guests of changes

**Alternative Flows:**
- A1: If event has started, only limited edits allowed
- A2: If changes affect capacity, system checks current RSVPs

**Postconditions:**
- Event details are updated
- Guest notifications are sent
- Change history is logged

**Business Impact:**
- Reduces event cancellations
- Improves user satisfaction
- Maintains event accuracy

## 2. Invitation Workflows

### Use Case 2.1: Send Personal Invitations
**Actor:** Host
**Role:** Event organizer

**Preconditions:**
- Event is created
- Host has guest contact information

**Main Flow:**
1. Host opens event detail page
2. Host clicks "Invite Guests"
3. Host selects "Personal Invitations"
4. Host enters guest emails/phone numbers
5. Host personalizes invitation message
6. Host sets RSVP deadline
7. Host sends invitations
8. System generates unique invitation links
9. Guests receive invitations via email/SMS

**Alternative Flows:**
- A1: Host can import contacts from address book
- A2: Host can create invitation groups
- A3: Host can schedule invitation sending

**Postconditions:**
- Invitations are sent to guests
- Invitation status is tracked
- Host can monitor RSVP responses

**Business Impact:**
- Increases event attendance
- Provides engagement metrics
- Enables targeted communication

### Use Case 2.2: Share Public Event Link
**Actor:** Host
**Role:** Event organizer

**Preconditions:**
- Event is created and public
- Event has available capacity

**Main Flow:**
1. Host navigates to event page
2. Host clicks "Share Event"
3. System generates shareable link
4. Host copies link
5. Host shares via social media/messaging
6. Recipients can view event and RSVP

**Alternative Flows:**
- A1: Host can generate QR code
- A2: Host can embed event widget

**Postconditions:**
- Public link is active
- Event can receive open registrations
- Analytics track link usage

**Business Impact:**
- Expands event reach
- Reduces invitation friction
- Enables viral growth

## 3. Guest Participation Scenarios

### Use Case 3.1: RSVP to Event
**Actor:** Guest
**Role:** Invited participant

**Preconditions:**
- Guest receives valid invitation
- Event has available capacity

**Main Flow:**
1. Guest clicks invitation link
2. System displays event details
3. Guest reviews event information
4. Guest clicks "RSVP"
5. Guest enters name and contact info
6. Guest selects attendance status (Yes/No/Maybe)
7. Guest adds dietary restrictions/notes
8. Guest submits RSVP
9. System confirms registration
10. Host receives notification

**Alternative Flows:**
- A1: Guest can RSVP for multiple people
- A2: Guest can update RSVP later
- A3: If at capacity, guest joins waitlist

**Postconditions:**
- Guest is registered for event
- Guest receives confirmation email
- Guest appears in attendee list

**Business Impact:**
- Streamlines attendance tracking
- Reduces no-shows
- Improves event planning

### Use Case 3.2: View and Interact with Guest List
**Actor:** Guest
**Role:** Confirmed attendee

**Preconditions:**
- Guest has confirmed attendance
- Host allows guest list visibility

**Main Flow:**
1. Guest accesses event page
2. Guest views "Who's Coming" section
3. Guest sees other confirmed attendees
4. Guest can view public profiles
5. Guest can send messages to attendees
6. Guest can suggest friends to invite

**Alternative Flows:**
- A1: Guest can hide their attendance
- A2: Guest can connect on social media

**Postconditions:**
- Guest network expands
- Event community forms
- Engagement increases

**Business Impact:**
- Builds community
- Increases retention
- Enables networking

## 4. Task Assignment and Completion

### Use Case 4.1: Create and Assign Tasks
**Actor:** Host
**Role:** Event organizer

**Preconditions:**
- Event exists
- Guests have confirmed attendance

**Main Flow:**
1. Host navigates to event tasks
2. Host clicks "Add Task"
3. Host enters task details:
   - Task name (e.g., "Bring dessert")
   - Category (Food/Drinks/Supplies)
   - Quantity needed
   - Estimated cost
4. Host assigns to specific guest or opens for volunteers
5. Host saves task
6. Assigned guest receives notification

**Alternative Flows:**
- A1: Host can create task templates
- A2: Host can bulk import tasks
- A3: Guests can propose tasks

**Postconditions:**
- Task list is updated
- Assignments are tracked
- Progress is visible

**Business Impact:**
- Distributes event workload
- Reduces host burden
- Improves event success

### Use Case 4.2: Complete Assigned Task
**Actor:** Guest
**Role:** Task assignee

**Preconditions:**
- Guest has assigned task
- Event date approaches

**Main Flow:**
1. Guest receives task reminder
2. Guest views task details
3. Guest completes task preparation
4. Guest marks task as complete
5. Guest adds completion notes/photos
6. System updates task status
7. Host receives notification

**Alternative Flows:**
- A1: Guest can reassign task
- A2: Guest can request help
- A3: Guest can update progress

**Postconditions:**
- Task is marked complete
- Event readiness improves
- Accountability is maintained

**Business Impact:**
- Ensures event preparation
- Builds responsibility
- Reduces last-minute issues

## 5. Cost Tracking and Settlement

### Use Case 5.1: Track Event Expenses
**Actor:** Host/Guest
**Role:** Expense contributor

**Preconditions:**
- Event has cost-sharing enabled
- User has spending permissions

**Main Flow:**
1. User navigates to event costs
2. User clicks "Add Expense"
3. User enters expense details:
   - Amount spent
   - Category
   - Description
   - Receipt photo
4. User specifies cost split method
5. User submits expense
6. System calculates individual shares
7. Participants receive cost notifications

**Alternative Flows:**
- A1: User can edit expenses
- A2: Host can approve expenses
- A3: System can suggest fair splits

**Postconditions:**
- Expenses are recorded
- Balances are calculated
- Settlement needs identified

**Business Impact:**
- Simplifies cost sharing
- Reduces payment friction
- Prevents disputes

### Use Case 5.2: Settle Event Costs
**Actor:** Guest
**Role:** Event participant with balance

**Preconditions:**
- Event costs are finalized
- Guest has outstanding balance

**Main Flow:**
1. Guest receives settlement notification
2. Guest reviews expense breakdown
3. Guest checks amount owed
4. Guest selects payment method
5. Guest initiates payment
6. System processes payment
7. System updates balances
8. Host receives payment confirmation

**Alternative Flows:**
- A1: Guest can dispute charges
- A2: Guest can pay in installments
- A3: System can net out mutual debts

**Postconditions:**
- Balances are settled
- Payment records maintained
- Relationships preserved

**Business Impact:**
- Monetization opportunity
- Reduces financial friction
- Builds trust platform

## 6. AI Chatbot Interactions

### Use Case 6.1: Get Event Recommendations
**Actor:** User
**Role:** Platform user seeking events

**Preconditions:**
- User is on the platform
- Chatbot is accessible

**Main Flow:**
1. User opens chatbot interface
2. User types "Show me dinner events this weekend"
3. Chatbot processes natural language
4. Chatbot queries event database
5. Chatbot filters by user preferences
6. Chatbot presents relevant events
7. User can ask follow-up questions
8. Chatbot provides detailed information

**Alternative Flows:**
- A1: Chatbot suggests based on history
- A2: Chatbot can filter by criteria
- A3: Chatbot can explain recommendations

**Postconditions:**
- User discovers relevant events
- User engagement increases
- Preference data collected

**Business Impact:**
- Improves event discovery
- Increases attendance
- Enhances user experience

### Use Case 6.2: Get Event Planning Help
**Actor:** Host
**Role:** Event organizer

**Preconditions:**
- Host is planning event
- Chatbot is available

**Main Flow:**
1. Host asks "Help me plan a dinner for 20 people"
2. Chatbot asks clarifying questions:
   - Budget range
   - Dietary restrictions
   - Event style
3. Chatbot provides suggestions:
   - Menu ideas
   - Task lists
   - Timeline
4. Chatbot offers templates
5. Host selects recommendations
6. Chatbot helps implement choices

**Alternative Flows:**
- A1: Chatbot can analyze past events
- A2: Chatbot can suggest vendors
- A3: Chatbot can create checklists

**Postconditions:**
- Event planning simplified
- Best practices applied
- Host confidence increased

**Business Impact:**
- Reduces planning friction
- Improves event quality
- Increases platform value

## 7. Social Features Usage

### Use Case 7.1: Build Event Community
**Actor:** Guest
**Role:** Active participant

**Preconditions:**
- Multiple events attended
- Profile is complete

**Main Flow:**
1. Guest views "My Network"
2. Guest sees past co-attendees
3. Guest sends connection request
4. Connection accepts request
5. Guest can see connection's events
6. Guest can invite to future events
7. Guest builds dinner circle

**Alternative Flows:**
- A1: System suggests connections
- A2: Guest can join interest groups
- A3: Guest can follow favorite hosts

**Postconditions:**
- Social network grows
- Event invitations increase
- Community strengthens

**Business Impact:**
- Increases retention
- Builds network effects
- Creates platform stickiness

### Use Case 7.2: Share Event Memories
**Actor:** Guest/Host
**Role:** Event participant

**Preconditions:**
- Event has concluded
- User has event photos/content

**Main Flow:**
1. User navigates to past event
2. User clicks "Add Memories"
3. User uploads photos/videos
4. User tags attendees
5. User adds captions
6. System creates event album
7. Attendees receive notifications
8. Attendees can contribute content

**Alternative Flows:**
- A1: Auto-create from tagged photos
- A2: Generate event highlights
- A3: Create shareable recap

**Postconditions:**
- Event memories preserved
- Engagement continues post-event
- Content library grows

**Business Impact:**
- Extends event lifecycle
- Increases emotional connection
- Generates user content

## Summary

These use cases demonstrate Meepot's comprehensive approach to social event management, covering the entire event lifecycle from creation to post-event engagement. The platform creates value by:

1. **Simplifying Organization:** Streamlining event creation and management
2. **Enhancing Participation:** Making it easy to invite, RSVP, and engage
3. **Distributing Responsibility:** Enabling collaborative event preparation
4. **Managing Finances:** Transparently handling cost sharing
5. **Building Community:** Fostering connections beyond single events
6. **Leveraging AI:** Providing intelligent assistance throughout

Each use case contributes to a network effect where more users and events create more value for all participants, establishing Meepot as an essential tool for social dining experiences.