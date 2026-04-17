const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│           📚 StudyPro Backend                │');
  console.log('├─────────────────────────────────────────────┤');
  console.log(`│  Server running on  → http://localhost:${PORT}  │`);
  console.log('│  Health check       → /api/health           │');
  console.log('│                                             │');
  console.log('│  Routes available:                          │');
  console.log('│    POST   /api/auth/register                │');
  console.log('│    GET    /api/auth/me                      │');
  console.log('│    GET    /api/dashboard                    │');
  console.log('│    CRUD   /api/goals                        │');
  console.log('│    CRUD   /api/sessions                     │');
  console.log('│    CRUD   /api/progress                     │');
  console.log('│    GET    /api/notifications                │');
  console.log('│    PATCH  /api/profile                      │');
  console.log('└─────────────────────────────────────────────┘');
  console.log('');
});
