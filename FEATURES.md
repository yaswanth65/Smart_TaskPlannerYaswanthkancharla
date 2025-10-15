# Goal Breakdown App - Enhanced Edition

A powerful AI-powered goal breakdown and task planning application with advanced features including progress tracking, analytics, caching, and export capabilities.

## 🚀 New Features Added

### Backend Enhancements

#### 1. **Request Tracking & Structured Logging**

- ✅ UUID-based request IDs for tracing
- ✅ Structured logging with Pino
- ✅ Correlation IDs in responses (X-Request-Id header)
- ✅ Comprehensive error logging

#### 2. **Enhanced Plan Persistence**

- ✅ Extended Plan schema with metadata:
  - `userId` - Optional user identification
  - `rawAiOutput` - Complete AI response for debugging
  - `parseStatus` - json/text/mock parsing status
  - `aiModel` - Which AI model was used
  - `aiLatencyMs` - Response time tracking
  - `requestId` - Request correlation
  - `cached` - Cache hit indicator

#### 3. **Task Progress Tracking**

- ✅ Task status management (todo/in-progress/done)
- ✅ Progress percentage (0-100%)
- ✅ Task notes and comments
- ✅ Update endpoint: `POST /api/plans/:id/tasks/:taskIndex/progress`

#### 4. **AI Service Improvements**

- ✅ 15-second timeout on AI calls
- ✅ Exponential backoff retry logic (up to 2 retries)
- ✅ Latency tracking for performance monitoring
- ✅ Enhanced JSON parsing with fallbacks
- ✅ Mock plan fallback when API unavailable

#### 5. **Intelligent Caching**

- ✅ LRU cache for repeated prompts
- ✅ Configurable TTL (default 1 hour)
- ✅ Automatic cache cleanup
- ✅ Cache statistics endpoint
- ✅ Significant cost savings on duplicate requests

#### 6. **Analytics & Monitoring**

- ✅ Request counting and tracking
- ✅ AI call metrics
- ✅ Cache hit rate monitoring
- ✅ Parse status distribution
- ✅ Average latency tracking
- ✅ Cost estimation
- ✅ Recent activity log
- ✅ GET `/api/stats` endpoint

#### 7. **Input Validation**

- ✅ Comprehensive validation middleware
- ✅ Goal length validation (5-500 characters)
- ✅ Task index validation
- ✅ Status enum validation
- ✅ Progress range validation
- ✅ Pagination validation
- ✅ Detailed error codes and messages

#### 8. **Rate Limiting**

- ✅ IP-based rate limiting
- ✅ Configurable limits (default: 30 requests/15 min)
- ✅ 429 status code for exceeded limits
- ✅ Standard rate limit headers

#### 9. **Additional Endpoints**

- ✅ `GET /api/plans` - List all plans with pagination
- ✅ `GET /api/plans/:id` - Get plan details
- ✅ `DELETE /api/plans/:id` - Delete a plan
- ✅ `POST /api/plans/:id/tasks/:taskIndex/progress` - Update task
- ✅ `GET /api/stats` - Analytics dashboard
- ✅ `GET /health` - Health check with request ID

### Frontend Enhancements

#### 1. **Plan History Management**

- ✅ Browse saved plans
- ✅ Load previous plans
- ✅ Delete unwanted plans
- ✅ Filter by user ID
- ✅ Display creation date and parse status

#### 2. **Task Progress Interface**

- ✅ Visual progress bars
- ✅ Status badges (To Do / In Progress / Done)
- ✅ Quick status update buttons
- ✅ Detailed edit mode with:
  - Status dropdown
  - Progress slider
  - Notes textarea
- ✅ Overall progress calculation
- ✅ Completion counter

#### 3. **Export Capabilities**

- ✅ Export as JSON
- ✅ Export as CSV (Excel-compatible)
- ✅ Export as Markdown
- ✅ Copy to clipboard
- ✅ Dropdown export menu

#### 4. **Analytics Dashboard**

- ✅ Real-time statistics
- ✅ Summary cards:
  - Total requests
  - AI calls made
  - Cache hit rate
  - Success rate
- ✅ Performance metrics
- ✅ Cost estimates
- ✅ Parse status distribution
- ✅ Recent activity feed
- ✅ Auto-refresh every 30 seconds

#### 5. **Enhanced UX**

- ✅ Tab navigation (Planner / Analytics)
- ✅ User ID persistence (localStorage)
- ✅ Save checkbox in goal input
- ✅ Visual indicators for saved plans
- ✅ Cache hit indicators
- ✅ Loading states
- ✅ Error handling with friendly messages
- ✅ Rate limit notifications

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.js                  # Main server with logging & rate limiting
│   ├── controllers/
│   │   └── planController.js     # Enhanced with caching & analytics
│   ├── models/
│   │   └── Plan.js              # Extended schema with metadata
│   ├── routes/
│   │   └── planRoutes.js        # All endpoints with validation
│   ├── services/
│   │   ├── aiService.js         # Improved with retries & timeout
│   │   ├── cacheService.js      # LRU cache implementation
│   │   └── analyticsService.js  # Metrics and cost tracking
│   └── middleware/
│       └── validation.js        # Input validation middleware
├── test-enhanced-api.js         # Comprehensive test suite
└── package.json

frontend/
├── src/
│   ├── App.jsx                  # Main app with tabs & history
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── GoalInput.jsx        # With save checkbox
│   │   ├── PlanView.jsx         # With progress & export
│   │   ├── LoadingOverlay.jsx
│   │   └── StatsDashboard.jsx   # Analytics visualization
│   └── utils/
│       └── exportUtils.js       # Export functions
└── package.json
```

## 🔧 Configuration

### Environment Variables

```env
# AI Configuration
GOOGLE_API_KEY=your_gemini_api_key
GOOGLE_MODEL=gemini-2.0-flash-001

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/goalplanner

# Server
PORT=5000
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_MAX=30  # requests per window
```

## 🚦 API Endpoints

### Plan Generation

```
POST /api/generate-plan
Body: {
  goal: string (required, 5-500 chars),
  save?: boolean,
  userId?: string,
  skipCache?: boolean
}
Response: {
  status: 'ok',
  message: string,
  data: { plan, saved?, cached },
  requestId: string
}
```

### Plan Management

```
GET /api/plans?userId=&limit=&page=
GET /api/plans/:id
DELETE /api/plans/:id
POST /api/plans/:id/tasks/:taskIndex/progress
  Body: { status?, progress?, notes? }
```

### Analytics

```
GET /api/stats
Response: {
  analytics: { summary, performance, parseStatus, statusCodes, requestsByHour, recentRequests },
  costs: { estimatedTotalCost, estimatedSavedCost, ... },
  cache: { hits, misses, hitRate, size, ... }
}
```

### Health Check

```
GET /health
Response: { status: 'ok', message, requestId }
```

## 📊 Metrics Tracked

- Total requests
- AI calls vs cached responses
- Cache hit rate
- Success rate
- Average latency
- Parse status distribution
- Cost estimates
- Recent activity
- Requests by hour

## 🎯 Performance Improvements

1. **Caching**: Reduces API calls for duplicate prompts (saves $$ and time)
2. **Retries**: Handles transient network failures automatically
3. **Timeouts**: Prevents hanging requests
4. **Rate Limiting**: Protects against abuse
5. **Pagination**: Efficient data loading
6. **Lazy Loading**: Components load as needed

## 💰 Cost Savings

The caching system provides significant cost savings:

- Duplicate prompts served from cache (0 cost)
- Estimated savings displayed in analytics
- Cache hit rate monitoring
- Configurable TTL for different use cases

## 🧪 Testing

Run the comprehensive test suite:

```bash
cd backend
node test-enhanced-api.js
```

Tests cover:

- Health check
- Plan generation with/without save
- List plans with pagination
- Get plan details
- Task progress updates
- Input validation
- Rate limiting
- Caching behavior

## 🔐 Security Features

- Input validation on all endpoints
- Rate limiting per IP
- Error codes without exposing internals
- Request ID tracking for audit
- Safe error messages

## 📝 Usage Examples

### Generate and Save a Plan

```javascript
const res = await axios.post("/api/generate-plan", {
  goal: "Launch a product in 2 weeks",
  save: true,
  userId: "user-123",
});
```

### Update Task Progress

```javascript
await axios.post("/api/plans/abc123/tasks/0/progress", {
  status: "in-progress",
  progress: 50,
  notes: "Started working on this",
});
```

### Get Analytics

```javascript
const stats = await axios.get("/api/stats");
console.log(stats.data.analytics.summary.cacheHitRate);
```

## 🎨 UI Features

- Clean, modern design with Tailwind CSS
- Smooth animations with Framer Motion
- Responsive layout
- Color-coded status badges
- Progress bars and percentage indicators
- Export dropdown menu
- Tab-based navigation
- Real-time analytics dashboard

## 🚀 Future Enhancements (Optional)

- WebSocket support for real-time updates
- Collaborative editing
- Task dependencies visualization (graph view)
- Calendar integration
- Email notifications
- Team workspaces
- Custom AI prompts
- Template library
- Mobile app

## 📄 License

MIT

## 👥 Contributing

Contributions welcome! Please ensure all tests pass before submitting PRs.

---

**Built with ❤️ using Express, MongoDB, React, and Google Gemini**
