# Meepot  - Comprehensive Functional Analysis Report

## Executive Summary

Meepot is a comprehensive event management platform designed to revolutionize how people organize social gatherings. Originally conceived for dinner events, it has evolved into a full-featured solution that addresses the common pain points of event planning: scattered communications, unclear task assignments, complex expense splitting, and disorganized invitation management.

The application serves as a centralized hub where event organizers can create events, send invitations, assign tasks, track expenses, and communicate with participants - all in one place. By replacing fragmented WhatsApp conversations and spreadsheets with an integrated platform, Meepot significantly reduces the administrative burden of event planning while enhancing the social experience for all participants.

The platform's AI-powered assistant further streamlines the process by providing intelligent suggestions, natural language event creation, and automated task management, making event planning accessible and enjoyable for users of all technical abilities.

## 1. PROJECT OVERVIEW

### Application Purpose
Meepot solves the universal problem of organizing group events by providing a single platform that handles every aspect of event management from initial planning to post-event settlement.

### Target Users
- **Primary Users**: Social event organizers planning dinners, parties, trips, and outdoor activities
- **Secondary Users**: Event participants who need to track their commitments, tasks, and expenses
- **Tertiary Users**: Community groups and clubs organizing recurring social activities

### Core Value Proposition
- **For Organizers**: Eliminates the chaos of managing events through multiple channels
- **For Participants**: Provides clarity on what to bring, when to arrive, and what they owe
- **For Everyone**: Creates a permanent record of shared memories and experiences

### Business Model
The application operates on a freemium model (planned) where basic event creation is free, with premium features including:
- Unlimited event history
- Advanced AI assistance
- Premium invitation designs
- Detailed analytics and reporting
- Priority support

## 2. USER EXPERIENCE MAPPING

### User Types and Roles

#### 1. Organizer (Event Creator)
- **Permissions**: Full control over event management
- **Journey**: Account creation → Event creation → Invitation sending → Task assignment → Event execution → Cost settlement
- **Key Actions**: Create/edit/delete events, manage all participants, assign roles, track everything

#### 2. Co-organizer
- **Permissions**: Nearly full control except event deletion
- **Journey**: Receive role assignment → Help manage event → Coordinate with organizer
- **Key Actions**: Edit event details, manage invitations, assign tasks, handle participants

#### 3. Collaborator
- **Permissions**: Content and task management
- **Journey**: Accept invitation → Volunteer to help → Manage assigned areas
- **Key Actions**: Create tasks, manage some invitations, add content

#### 4. Participant
- **Permissions**: Basic interaction and personal task management
- **Journey**: Receive invitation → RSVP → Complete assigned tasks → Participate in event
- **Key Actions**: Update own status, complete tasks, add comments, view information

#### 5. Guest
- **Permissions**: Read-only access
- **Journey**: Receive invitation → View event details → Attend event
- **Key Actions**: View event information, see participant list

### User Journey Flows

#### Event Creation Flow
1. User logs in or registers
2. Navigates to "Create Event" 
3. Fills out event form:
   - Basic details (title, date, time, location)
   - Event type (dinner, lunch, party, trip, etc.)
   - Category (Food & Drink, Celebrations, Travel, Sports, etc.)
   - Description and special instructions
4. System creates event and assigns creator as Organizer
5. User is redirected to event detail page

#### Invitation Flow
1. Organizer opens invitation manager
2. Chooses invitation type:
   - Personal (specific individuals)
   - Link-based (shareable URL)
   - Public (open to community)
3. Customizes invitation message
4. Sends invitations
5. Tracks responses in real-time

#### Participation Flow
1. Recipient receives invitation (email/link/notification)
2. Views event details on public invitation page
3. Makes RSVP decision
4. If accepting:
   - Provides name (if not logged in)
   - Adds optional message
   - Submits response
5. Gains access to full event details based on assigned role

## 3. CORE FUNCTIONALITIES

### Event Management
- **Purpose**: Central hub for organizing any type of social gathering
- **Trigger**: User needs to organize an event
- **Inputs**: Event details, date/time, location, type, category
- **Process**: Validation → Storage → Notification to invitees
- **Outputs**: Created event with unique ID and management interface
- **Success**: Event created and accessible to organizer
- **Failures**: Invalid data, system errors (user notified)

### Invitation System
- **Purpose**: Streamline guest list management and RSVPs
- **Trigger**: Organizer ready to invite guests
- **Inputs**: Guest information, invitation type, custom message
- **Process**: Generate unique invitation → Send → Track responses
- **Outputs**: Invitation links, RSVP tracking, guest list updates
- **Success**: Invitations delivered and responses tracked
- **Failures**: Invalid contacts, delivery failures (retry options provided)

### Task Management
- **Purpose**: Coordinate who brings what and does what
- **Trigger**: Need to distribute responsibilities
- **Inputs**: Task description, assignee, category (food/drinks/supplies)
- **Process**: Create task → Assign → Notify → Track completion
- **Outputs**: Task list with assignments and status
- **Success**: Tasks completed before event
- **Failures**: Incomplete tasks (reminders sent)

### Cost Tracking & Settlement
- **Purpose**: Fairly split event expenses among participants
- **Trigger**: Expenses incurred for event
- **Inputs**: Expense details, amount, payer, split method
- **Process**: Record → Calculate splits → Generate settlement plan
- **Outputs**: Who owes whom and how much
- **Success**: All debts settled with minimum transactions
- **Failures**: Disputes (manual adjustment options)

### AI Assistant (Chatbot)
- **Purpose**: Simplify event planning with natural language interface
- **Trigger**: User needs help or wants quick actions
- **Inputs**: Natural language queries or commands
- **Process**: Parse intent → Execute action → Respond
- **Outputs**: Event suggestions, task creation, information retrieval
- **Success**: User request fulfilled accurately
- **Failures**: Unclear intent (clarification requested)

### Social Features
- **Purpose**: Build community and share experiences
- **Trigger**: Users want to connect and share
- **Inputs**: Friend requests, comments, photos
- **Process**: Validate → Store → Notify relevant users
- **Outputs**: Friend connections, event memories, discussions
- **Success**: Enhanced social connections
- **Failures**: Privacy violations prevented

## 4. DATA & INFORMATION FLOW

### Data Sources
- **User Input**: Registration info, event details, tasks, expenses
- **System Generated**: IDs, timestamps, calculations
- **External APIs**: Location data, AI responses
- **File Uploads**: Event photos, documents

### Data Transformations
- **RSVP Aggregation**: Individual responses → Guest list summary
- **Cost Calculations**: Individual expenses → Optimized settlement plan
- **Role Assignment**: User selection → Permission matrix application
- **Event Filtering**: All events → User-relevant subset

### Storage Requirements
- **Persistent Data**: User profiles, events, invitations, expenses
- **Transient Data**: Session info, UI state
- **Cached Data**: Frequent queries, AI responses
- **Audit Trail**: All modifications with timestamps

### Data Relationships
- Users ↔ Events (many-to-many via roles)
- Events ↔ Invitations (one-to-many)
- Events ↔ Tasks (one-to-many)
- Users ↔ Tasks (many-to-many via assignments)
- Events ↔ Expenses (one-to-many)
- Users ↔ Expenses (many-to-many via splits)

### Privacy/Security Considerations
- **Authentication Required**: For creating events and accessing private data
- **Role-Based Access**: Permissions enforced at data level
- **Public vs Private**: Events can be public or invitation-only
- **Data Encryption**: Sensitive data encrypted in transit and at rest
- **GDPR Compliance**: Data deletion and export capabilities

## 5. INTEGRATION POINTS

### External Services Used

#### Firebase Authentication
- **Purpose**: Secure user authentication and session management
- **Features Used**: Email/password, Google OAuth, password reset
- **Business Value**: Secure access without managing passwords

#### Firebase Firestore
- **Purpose**: Real-time data synchronization
- **Features Used**: Document storage, real-time listeners, offline support
- **Business Value**: Instant updates across all users

#### OpenRouter API
- **Purpose**: AI-powered assistant capabilities
- **Features Used**: Natural language processing, content generation
- **Business Value**: Intelligent automation and user assistance

#### Leaflet Maps
- **Purpose**: Visual location representation
- **Features Used**: Interactive maps, markers, location search
- **Business Value**: Clear venue identification

### APIs Consumed
- **Geolocation Services**: For map functionality
- **Email Services**: For invitation delivery (planned)
- **Payment Gateways**: For premium features (planned)
- **Calendar Integration**: For event syncing (planned)

### APIs Provided
- **RESTful API**: For all core operations
- **Webhook Support**: For external integrations (planned)
- **Public API**: For third-party developers (planned)

### Communication Methods
- **Real-time Updates**: WebSocket connections for live data
- **Notifications**: In-app, email, and push (planned)
- **Data Sync**: Automatic conflict resolution
- **Offline Support**: Queue actions for later sync

## 6. BUSINESS RULES & LOGIC

### Validation Rules
- **Events**: Must have title, date, and at least one organizer
- **Invitations**: Require valid event and recipient info
- **Tasks**: Must be assigned to event participants
- **Expenses**: Positive amounts only, must have payer

### Calculation Logic
- **Cost Splitting**: 
  - Equal split: Total ÷ number of participants
  - Custom split: Manual percentage allocation
  - Itemized split: Individual items assigned to specific people
- **Settlement Optimization**: Minimum number of transactions algorithm
- **RSVP Counting**: Accepted invitations only

### Decision Trees
- **Invitation Acceptance**:
  - Public event → Immediate acceptance
  - Requires approval → Pending status → Organizer review
  - Capacity limit → First-come-first-served
- **Permission Checking**:
  - Check user role → Check specific permission → Allow/Deny

### Workflow Rules
- **Event Lifecycle**: Draft → Published → Active → Completed → Archived
- **Invitation States**: Sent → Viewed → Responded → Confirmed
- **Task Progress**: Created → Assigned → In Progress → Completed
- **Settlement Flow**: Expenses Added → Calculated → Notified → Settled

### Access Control
- **Public Access**: Event preview, public RSVPs
- **Authenticated Access**: Full event details, personal dashboard
- **Role-Based Access**: Actions limited by assigned permissions
- **Owner Override**: Event creator retains full control

## 7. USE CASES & SCENARIOS

### UC1: Organizing a Dinner Party
**Actor**: Maria (Organizer)
**Preconditions**: Maria has a Meepot account
**Main Flow**:
1. Maria creates a dinner event for next Saturday
2. Sets capacity to 12 people
3. Creates food tasks (appetizers, main course, desserts)
4. Sends personal invitations to friends
5. Tracks RSVPs as they come in
6. Assigns tasks based on preferences
7. Uses chatbot to suggest menu ideas
8. Tracks expenses for wine and decorations
9. After dinner, calculates and shares cost splits
**Alternative Flows**: 
- Guest suggests different date (Maria updates event)
- More people want to come (Maria increases capacity)
**Postconditions**: Successful dinner with fair cost distribution
**Business Impact**: Reduces planning time by 70%, ensures nothing forgotten

### UC2: Planning a Weekend Trip
**Actor**: James (Organizer), Friends (Participants)
**Preconditions**: Group wants to plan hiking trip
**Main Flow**:
1. James creates multi-day event
2. Adds accommodation and transport details
3. Creates tasks for equipment, food, bookings
4. Friends collaborate on planning
5. Expenses tracked throughout trip
6. Photos shared in event
7. Final settlement calculated
**Alternative Flows**:
- Weather changes (update plans in app)
- Someone drops out (reassign tasks)
**Postconditions**: Successful trip with clear expense records
**Business Impact**: Eliminates confusion, preserves memories

### UC3: Community Potluck
**Actor**: Community Center (Organizer)
**Preconditions**: Monthly potluck tradition
**Main Flow**:
1. Create public event
2. Enable self-service task creation
3. Participants sign up for dishes
4. Track dietary restrictions
5. Send reminders
6. Check-in attendees
**Alternative Flows**:
- Too many desserts (suggest other categories)
- New member needs guidance (chatbot helps)
**Postconditions**: Balanced potluck with variety
**Business Impact**: Increased participation, better coordination

### UC4: Birthday Party Planning
**Actor**: Sophie (Organizer)
**Preconditions**: Surprise party planning needed
**Main Flow**:
1. Create private event marked "surprise"
2. Invite guests with secrecy note
3. Assign tasks: cake, decorations, distractions
4. Coordinate timing via app
5. Track gift contributions
6. Share photos after
**Alternative Flows**:
- Birthday person almost finds out (emergency communication)
- Venue changes (mass notification)
**Postconditions**: Successful surprise party
**Business Impact**: Complex coordination made simple

### UC5: Corporate Team Building
**Actor**: HR Manager (Organizer)
**Preconditions**: Quarterly team event needed
**Main Flow**:
1. Create event with RSVP tracking
2. Set dietary preference form
3. Assign team leaders as co-organizers
4. Track attendance for reporting
5. Manage activity sign-ups
6. Process company expense reimbursements
**Alternative Flows**:
- Budget changes (adjust activities)
- Remote participants (hybrid event features)
**Postconditions**: Successful team building with records
**Business Impact**: Professional event management, compliance tracking

## 8. RECONSTRUCTION GUIDE

To rebuild Meepot functionally, a development team would need to implement:

### Core Systems
1. **User Management**: Registration, authentication, profile management
2. **Event System**: CRUD operations, state management, categorization
3. **Invitation Engine**: Multiple invitation types, RSVP tracking, approval workflows
4. **Task Manager**: Assignment, tracking, categorization, completion
5. **Cost Tracker**: Expense recording, split calculation, settlement optimization
6. **Permission System**: Role-based access control with 6 roles and 13 permissions
7. **AI Assistant**: Natural language processing, context awareness, action execution

### Essential Features
1. **Real-time Updates**: Live synchronization of all data
2. **Offline Support**: Queue actions when offline
3. **Responsive Design**: Mobile and desktop optimized
4. **Notification System**: In-app and external notifications
5. **Data Export**: User data portability
6. **Search and Filter**: Find events, people, tasks quickly
7. **Social Features**: Friends, comments, sharing

### Business Logic Implementation
1. **Event Lifecycle Management**: State transitions and validations
2. **Cost Splitting Algorithm**: Optimal transaction calculation
3. **Permission Enforcement**: Check at every data access
4. **Invitation Workflows**: Different flows for different types
5. **Data Integrity**: Transactional updates, cascade rules
6. **Caching Strategy**: Performance optimization
7. **Audit Trail**: Complete history of all changes

### User Experience Requirements
1. **Intuitive Navigation**: Clear information architecture
2. **Progressive Disclosure**: Show advanced features as needed
3. **Contextual Help**: Inline guidance and AI assistance
4. **Quick Actions**: Common tasks accessible in 1-2 clicks
5. **Visual Feedback**: Clear status indicators
6. **Error Handling**: Graceful failures with recovery options
7. **Personalization**: Adapt to user preferences

### Integration Requirements
1. **Authentication Provider**: OAuth and traditional login
2. **Real-time Database**: For live updates
3. **AI Service**: For natural language features
4. **Map Service**: For location features
5. **Email Service**: For notifications
6. **File Storage**: For photos and documents
7. **Analytics**: For usage tracking

This functional specification provides everything needed to recreate Meepot's complete functionality while allowing flexibility in technical implementation choices.