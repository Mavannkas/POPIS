# Notifications System Implementation

Complete in-app notifications system for event invitations and join request responses.

## Backend Implementation (popis-be)

### 1. Notifications Collection
**File**: `src/collections/Notifications.ts`

- Schema with fields:
  - `type`: event_invitation, join_request_accepted, join_request_rejected
  - `recipient`: User who receives the notification
  - `event`: Related event
  - `message`: Notification message text
  - `read`: Boolean flag
  - `metadata`: Additional JSON data
- Access control: Users can only see their own notifications
- Timestamps for createdAt/updatedAt

### 2. NotificationService
**File**: `src/services/NotificationService.ts`

Singleton service managing Server-Sent Events (SSE) connections:
- `addConnection(userId, response)`: Registers user SSE connection
- `removeConnection(userId, response)`: Cleans up disconnected users
- `sendNotification(userId, notification)`: Sends real-time notification to user
- `sendNotificationToMultiple(userIds, notification)`: Broadcasts to multiple users
- `getActiveConnectionsCount(userId?)`: Connection statistics

**No Express dependency** - uses generic response objects.

### 3. API Endpoints

#### SSE Stream Endpoint
**File**: `src/app/api/notifications/stream/route.ts`
- `GET /api/notifications/stream`
- Establishes SSE connection for real-time notifications
- Requires authentication
- Sends initial "connected" message
- Integrates with NotificationService

#### REST Endpoints

**Unread Notifications**
**File**: `src/app/api/notifications/unread/route.ts`
- `GET /api/notifications/unread`
- Returns all unread notifications for authenticated user
- Limit: 50 notifications

**All Notifications**
**File**: `src/app/api/notifications/all/route.ts`
- `GET /api/notifications/all?limit=20&page=1`
- Paginated list of all notifications
- Default limit: 20

**Mark as Read**
**File**: `src/app/api/notifications/mark-read/route.ts`
- `POST /api/notifications/mark-read`
- Body: `{ notificationId: string }`
- Marks notification as read
- Validates notification ownership

### 4. Notification Hooks

#### Invitations Collection
**File**: `src/collections/Invitations.ts` (line 158)

Sends notification when invitation is created:
- Creates notification in database
- Sends real-time notification via SSE
- Message: "Zostałeś zaproszony do wydarzenia: {event.title}"

#### Applications Collection
**File**: `src/collections/Applications.ts` (line 130)

Sends notification when application status changes:
- Triggers on status change from `pending` to `accepted` or `rejected`
- Creates notification in database
- Sends real-time notification via SSE
- Messages:
  - Accepted: "Twoje zgłoszenie do wydarzenia \"{event.title}\" zostało zaakceptowane!"
  - Rejected: "Twoje zgłoszenie do wydarzenia \"{event.title}\" zostało odrzucone."

## Frontend Implementation (popis-fe)

### 1. SSE Hook
**File**: `lib/hooks/useSSE.ts`

React Native compatible SSE implementation:
- Uses `fetch` with ReadableStream (no EventSource)
- Automatic reconnection with exponential backoff
- Max 5 reconnection attempts
- Message parsing and error handling
- Returns: `{ connected, error }`

### 2. Notification Context
**File**: `lib/notifications/context.tsx`

Global state management for notifications:
- `notifications`: Array of all notifications
- `unreadCount`: Count of unread notifications
- `loading`: Loading state
- `connected`: SSE connection status
- `fetchNotifications()`: Fetch all notifications
- `markAsRead(id)`: Mark single notification as read
- `markAllAsRead()`: Mark all notifications as read

**Features**:
- Automatic SSE connection when user is authenticated
- Real-time notification updates
- Persists notifications in state
- Integrates with auth context

### 3. Notifications Screen
**File**: `app/notifications.tsx`

Displays all notifications with:
- Pull-to-refresh functionality
- Loading states
- Connection status indicator
- Real-time updates via SSE
- Notification cards with:
  - Icon based on type
  - Title, message, timestamp
  - Unread indicator (red dot)
  - Click to navigate to event and mark as read
- Empty state UI
- Polish locale for dates

**Notification Types**:
- Event Invitation (envelope icon, primary color)
- Join Request Accepted (checkmark icon, green)
- Join Request Rejected (xmark icon, red)

### 4. Top Bar Badge
**File**: `components/ui/top-bar.tsx`

Real-time notification badge:
- Shows unread count from NotificationContext
- Red badge with count (or "9+" if > 9)
- Only visible when unreadCount > 0
- Updates automatically with SSE

### 5. App Layout
**File**: `app/_layout.tsx`

Added NotificationProvider to app:
```tsx
<AuthProvider>
  <NotificationProvider>
    <Stack>...</Stack>
  </NotificationProvider>
</AuthProvider>
```

## How It Works

### Event Invitation Flow
1. Organization creates invitation in admin panel
2. Backend `Invitations.afterChange` hook triggers
3. Notification created in database with type `event_invitation`
4. If user is connected via SSE, real-time notification sent
5. Frontend receives SSE message, adds to notifications state
6. Unread count updates in TopBar badge
7. User opens notifications screen, sees new invitation
8. User clicks notification → marks as read → navigates to event

### Join Request Accept/Reject Flow
1. Organization accepts/rejects application in admin panel
2. Backend `Applications.afterChange` hook triggers
3. Notification created with type `join_request_accepted` or `join_request_rejected`
4. Real-time notification sent via SSE
5. Frontend updates immediately
6. User sees notification in TopBar badge and notifications screen

## Testing

### Backend Testing
1. Create invitation via admin panel
2. Check notifications collection in database
3. Monitor server logs for SSE connection messages
4. Test API endpoints with authenticated requests

### Frontend Testing
1. Log in as volunteer user
2. Check SSE connection in console logs
3. Have organization send invitation
4. Verify notification appears in real-time
5. Test mark as read functionality
6. Test pull-to-refresh
7. Verify badge count updates

## Configuration

### Backend
No additional configuration needed. SSE runs on same server as API.

### Frontend
Requires `EXPO_PUBLIC_API_URL` environment variable set to backend URL.

## Dependencies

### Backend
- No new dependencies (uses Payload built-ins)

### Frontend
- `date-fns` (already installed) - for date formatting

## Notes

- Notifications are stored permanently (not deleted after read)
- SSE connections automatically reconnect on disconnect
- Only works when app is open (no push notifications)
- Authentication required for all endpoints
- SSE uses fetch with ReadableStream for React Native compatibility
