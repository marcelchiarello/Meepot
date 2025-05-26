# Business Rules and Logic Documentation

## 1. Role-Based Permissions Matrix

### User Roles (from `/client/src/firebase/models/roles.js`)

| Role | Priority | Description |
|------|----------|-------------|
| `organizer` | 5 | Event creator/owner with full control |
| `co_organizer` | 4 | Co-organizer with near-complete access |
| `collaborator` | 3 | Collaborator with operational permissions |
| `participant` | 2 | Standard participant with basic interaction |
| `guest` | 1 | Guest with minimal view-only access |
| `pending` | 0 | Awaiting confirmation/approval |

### Permission Matrix

| Permission | Organizer | Co-Organizer | Collaborator | Participant | Guest | Pending |
|------------|-----------|--------------|--------------|-------------|-------|---------|
| `manage_event` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `delete_event` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `manage_invites` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `approve_requests` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `manage_participants` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `assign_roles` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `remove_participants` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `manage_tasks` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `manage_content` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `post_messages` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `view_participants` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `view_contacts` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `view_details` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Special Rules:
- Event creator always has all permissions regardless of assigned role
- Role priority determines the highest role when multiple roles exist
- Permissions are checked using `userHasPermission(eventData, userId, permission)`

## 2. Invitation Approval Workflows

### Invitation Types (from `/client/src/firebase/models/invitation.js`)

1. **PERSONAL**: Individual invitation to specific person
2. **GROUP**: Shareable group invitation
3. **PRIVATE**: Requires authentication with specific email
4. **PUBLIC**: Anyone can view, only invited can participate
5. **HIERARCHICAL**: Invitee can invite others

### Invitation States

```
DRAFT → SENT → VIEWED → ACCEPTED/DECLINED
                  ↓
           PENDING_APPROVAL → ACCEPTED/DECLINED
                  ↓
              EXPIRED/REVOKED/EXITED
```

### Approval Workflow Rules

1. **Standard Flow (requiresApproval = false)**:
   - User accepts invitation → Immediately added to participants
   - Status: SENT → VIEWED → ACCEPTED

2. **Approval Required Flow (requiresApproval = true)**:
   - User accepts invitation → Status: PENDING_APPROVAL
   - Organizer reviews request → ACCEPTED/DECLINED
   - User cannot see full event details until approved

3. **Group Invitation Rules**:
   - Maximum accepted users limit enforced
   - Duplicate name checking (case-insensitive)
   - Expiration date validation
   - Each acceptance tracked individually

### Business Logic for Invitation Response:
```javascript
// From invitationService.js respondToInvitation()
1. Validate invitation exists and is not expired
2. For GROUP invitations:
   - Check if name already taken
   - Verify user hasn't already accepted
   - Check maximum participants not exceeded
3. Update invitation status
4. Update event statistics (pending/accepted/declined counts)
5. Update participant lists (invitations, guests, guestData)
6. Calculate optimal money transfers if costs involved
7. Create audit trail entry
```

## 3. Event State Management

### Event Properties
- **Status**: Currently implied through date comparison (no explicit status field)
- **Visibility**: Controlled by `isPublic` flag and user permissions
- **Capacity**: Managed through `maxGuests` property

### Event Types (from eventUtils.js)
Categories:
- Food & Drink: dinner, lunch, aperitif, coffee, dessert
- Special Occasions: birthday, party, bachelor, anniversary
- Big Events: wedding, concert, cultural
- Sports & Activities: sport_event, group_activity, tournament
- Travel & Experiences: travel, outdoor, weekend, day_trip

## 4. Form Validation Rules

### Event Creation (DinnerForm.js)
**Required Fields**:
- `title`: Event title (non-empty string)
- `date`: Event date (valid date)
- `eventType`: Selected event type

**Optional Fields**:
- `description`: Event description
- `location`: Event location
- `eventCategory`: Automatically determined from eventType

**Validation Logic**:
```javascript
if (!title || !date || !eventType) {
  alert('Per favore, inserisci titolo, data e tipo di evento');
  return;
}
```

### Invitation Creation
**Required Fields**:
- `dinnerId`: Event ID
- `fromUserId`: Sender ID
- `toName`: Recipient name (for PERSONAL invitations)

**Validation Rules**:
- For GROUP invitations:
  - `maxAcceptedUsers` must be >= 1 and <= 1000
  - `expiresAt` must be future date
- Email validation for PRIVATE invitations
- Permission check: User must have `MANAGE_INVITES` permission

## 5. Cost Calculation and Settlement Logic

### Cost Calculation Formula (CostSummary.js)
```
Total Cost = Sum of all tasks with cost > 0
Cost Per Guest = Total Cost / Number of Participants
Individual Balance = Amount Paid - Cost Per Guest
```

### Settlement Rules:
1. **Task Cost Assignment**:
   - Each task can have a cost and a `paidBy` field
   - If `paidBy` is empty, defaults to first assignee or first guest

2. **Balance Calculation**:
   - Positive balance: Guest paid more than their share
   - Negative balance: Guest owes money
   - Tolerance: ±0.01€ for rounding errors

3. **Optimal Transfer Algorithm**:
   - Uses greedy algorithm to minimize number of transfers
   - Matches largest debtor with largest creditor
   - Continues until all balances settled

4. **Settlement Tracking**:
   - Each transfer tracked with `from`, `to`, `amount`
   - Settlement status persisted in database
   - Visual indicators for paid/unpaid transfers

## 6. Access Control Patterns

### Event Access Rules:
1. **View Event Details**:
   - Requires `VIEW_DETAILS` permission
   - Public events visible to all authenticated users
   - Private events require invitation or role

2. **Edit Event**:
   - Requires `MANAGE_EVENT` permission
   - Only organizer and co-organizer roles

3. **Manage Participants**:
   - Add participants: `MANAGE_PARTICIPANTS` permission
   - Remove participants: `REMOVE_PARTICIPANTS` permission
   - Assign roles: `ASSIGN_ROLES` permission

4. **Task Management**:
   - Create/edit tasks: `MANAGE_TASKS` permission
   - Available to organizer, co-organizer, collaborator, participant

### Data Visibility Rules:
- **Guest Contact Info**: Requires `VIEW_CONTACTS` permission
- **Full Participant List**: Requires `VIEW_PARTICIPANTS` permission
- **Event Statistics**: Visible to all with `VIEW_DETAILS` permission

## 7. Data Integrity Rules

### Transaction Safety:
- All multi-document updates use Firestore transactions
- Backup created before critical operations
- Atomic updates for invitation acceptance

### Validation Constraints:
1. **Unique Constraints**:
   - Invitation tokens must be unique (UUID v4)
   - Guest names unique per event (case-insensitive)

2. **Referential Integrity**:
   - Event must exist for invitation creation
   - User must exist for role assignment
   - Parent invitation must exist for hierarchical invites

3. **Business Logic Constraints**:
   - Cannot delete event with active participants
   - Cannot exceed maximum participants for group invites
   - Cannot accept expired invitations

## 8. Audit and History Tracking

### Tracked Actions:
1. **Invitation History**:
   - Creation, viewing, acceptance, rejection
   - Includes timestamp, user ID, action details

2. **Role Changes**:
   - All role assignments tracked with timestamp
   - Tracks who assigned the role

3. **Event Modifications**:
   - Major changes logged (not fully implemented)

### Metadata Tracking:
- Source of action (web, mobile, API)
- User agent and IP (for security)
- Timestamp for all operations

## 9. Notification Rules

### Trigger Events:
1. New invitation received
2. Invitation accepted/declined
3. Approval request submitted
4. Approval request resolved
5. New task assigned
6. Event details changed

### Notification Channels:
- In-app notifications (planned)
- Email notifications (planned)
- Push notifications (planned in requirements)

## 10. Data Retention and Cleanup

### Expiration Rules:
1. **Invitations**:
   - Expired invitations marked but not deleted
   - Group invitations expire based on `expiresAt` field

2. **Events**:
   - No automatic deletion implemented
   - Past events remain accessible

3. **Settlements**:
   - Completed settlements retained for history
   - No automatic cleanup

## Implementation Status

### Fully Implemented:
- Role-based permission system
- Basic invitation workflow
- Cost calculation and settlement
- Form validation
- Access control checks

### Partially Implemented:
- Invitation approval workflow (UI pending)
- Audit trail (basic implementation)
- Event state management (implicit only)

### Planned but Not Implemented:
- Email/push notifications
- Advanced approval workflows
- Event cancellation flow
- Automated cleanup jobs
- Full audit logging