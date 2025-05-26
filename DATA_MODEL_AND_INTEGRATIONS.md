# Meepot - Data Model and Integrations Documentation

## Overview
Meepot is an event management platform that helps users organize social gatherings like dinners, parties, and other events. The system uses a hybrid architecture with Firebase for production and localStorage for development, integrating AI capabilities through OpenRouter.

## Core Data Entities

### 1. Events (Dinners)
**Purpose**: Central entity representing any social gathering
- **Storage**: Firebase `dinners` collection / localStorage `cenary_local_dinners`
- **Business Logic**: 
  - Events can be of various types (dinner, lunch, aperitif, coffee, dessert, birthday, party, travel, outdoor)
  - Each event has an organizer who created it
  - Events can have multiple participants with different roles and permissions
  - Supports both public and private events with invitation management

### 2. Users & Authentication
**Purpose**: Manage user identity and access control
- **Storage**: Firebase Authentication + `users` collection
- **Business Logic**:
  - Users can create events, be invited to events, or join public events
  - Each user has roles and permissions within specific events
  - Display names are cached for performance
  - Supports social login and email/password authentication

### 3. Invitations
**Purpose**: Control access to events and track participation
- **Storage**: Firebase `userInvitations` collection
- **Types**:
  - **Personal**: Direct invitation to a specific person
  - **Group**: Shareable invitation link with optional participant limit
  - **Private**: Requires authentication with specific email
  - **Public**: Anyone can view, only invitees participate
  - **Hierarchical**: Invitees can invite others (chain invitations)
- **Lifecycle**: Draft → Sent → Viewed → Accepted/Declined/Expired/Revoked

### 4. Contacts
**Purpose**: Personal contact management for easy event invitations
- **Storage**: Firebase `userContacts` collection (per-user document)
- **Features**:
  - Automatic import from event invitations
  - Interaction history tracking
  - Categorization (friend, family, colleague, other)
  - Smart suggestions based on interaction frequency

### 5. Tasks & Assignments
**Purpose**: Coordinate who brings what or does what for an event
- **Storage**: Firebase `tasks` collection / localStorage
- **Features**:
  - Task assignment to participants
  - Cost tracking for shared expenses
  - Completion status tracking
  - Settlement integration for financial balance

### 6. Comments & Reviews
**Purpose**: Communication and feedback system
- **Storage**: Firebase `comments` collection / localStorage
- **Types**:
  - Regular comments for discussion
  - Reviews with 1-5 star ratings
  - Threaded replies support
  - Author attribution with nicknames

### 7. Financial Settlements
**Purpose**: Track and balance shared expenses
- **Storage**: Firebase `debtSettlements` collection / localStorage
- **Logic**:
  - Tracks who owes whom and how much
  - Supports marking debts as settled
  - Integrates with task costs

## Data Relationships

```
User (1) ─────┬──── creates ────> (N) Events
              │
              ├──── has ────────> (1) ContactList ────> (N) Contacts
              │
              ├──── receives ───> (N) Invitations
              │
              └──── participates > (N) Events
                                         │
Event (1) ────┬──── has ────────> (N) Participants (via invitations)
              │
              ├──── has ────────> (N) Tasks
              │
              ├──── has ────────> (N) Comments
              │
              └──── generates ──> (N) Settlements

Invitation (1) ── links ──> (1) User + (1) Event
```

## External Service Integrations

### 1. OpenRouter AI Integration
**Purpose**: Provides intelligent chatbot assistance
- **Provider**: OpenRouter.ai
- **Models Used**: 
  - Primary: `openai/gpt-4o-mini` (cost-effective)
  - Fallbacks: Claude 3 Sonnet, Gemini 1.5 Pro
- **Features**:
  - Natural language event planning assistance
  - Context-aware suggestions
  - Multi-turn conversation support
- **Security**: API key stored in environment variables (production) or local config (development)

### 2. Firebase Services
**Purpose**: Backend infrastructure for production
- **Services Used**:
  - Firestore: NoSQL database for all data entities
  - Authentication: User identity management
  - Cloud Functions: Serverless compute (future)
- **Benefits**:
  - Real-time data synchronization
  - Offline support
  - Scalable infrastructure

### 3. Netlify Functions
**Purpose**: Serverless API endpoints
- **Functions**:
  - `call-openrouter`: Proxy for AI chat requests
  - `verify-chatbot-password`: Access control for chatbot
  - `ping`: Health check endpoint
- **Security**: Hides API keys from client-side code

## Storage & Caching Strategy

### 1. Multi-Layer Caching
- **Memory Cache**: In-app cache service with TTL and size limits
- **localStorage**: Persistent cache for offline support
- **sessionStorage**: Temporary backup for critical data

### 2. Transaction Management
- **Purpose**: Ensure data consistency
- **Features**:
  - Automatic retry with exponential backoff
  - Queue management for rate limiting
  - Transaction logging for debugging
  - Backup creation before critical operations

### 3. Data Backup Strategy
- **Deleted Events**: Archived in `deletedDinners` collection
- **Event Modifications**: Backed up before updates
- **Critical Operations**: Create backups in multiple locations

## Privacy & Security Considerations

### 1. Data Access Control
- **Event-Level Permissions**:
  - Organizer: Full control
  - Co-organizer: Almost full control (can't delete)
  - Collaborator: Can manage content and invitations
  - Participant: Basic interaction rights
  - Guest: View-only access

### 2. Personal Data Protection
- **Contact Information**: Stored per-user, not globally accessible
- **Email Addresses**: Only visible to event organizers
- **Invitation Tokens**: UUID-based, unguessable
- **User Preferences**: Stored separately from event data

### 3. Data Validation Rules
- **Contacts**: Name required, email format validation
- **Invitations**: Valid event ID, sender authorization required
- **Events**: Title and date required, valid event type
- **Comments**: Content and author required, rating 1-5 for reviews

### 4. Security Best Practices
- **API Keys**: Never exposed to client-side code
- **Authentication**: Required for most operations
- **Rate Limiting**: Implemented at transaction service level
- **Input Sanitization**: All user inputs validated before storage
- **Audit Trail**: Critical operations logged with timestamps

## Data Retention & Cleanup
- **Active Data**: Retained indefinitely while user is active
- **Deleted Events**: Archived for recovery, users can permanently delete
- **Expired Invitations**: Marked as expired but retained for history
- **Cache Data**: Auto-expired based on TTL settings
- **Transaction Logs**: Limited to last 100 entries

## Business Value
The data model supports:
1. **Easy Event Planning**: Streamlined creation and management
2. **Social Connectivity**: Building and maintaining contact networks
3. **Fair Cost Sharing**: Transparent expense tracking
4. **Flexible Access Control**: Various invitation types for different scenarios
5. **AI-Powered Assistance**: Intelligent help for better event organization
6. **Offline Capability**: Local storage fallback for reliability