# 🎵 Sonic Task Hub

**Your central command center for tasks, habits, reminders, and life decisions**

Sonic Task Hub is an intelligent personal productivity system that serves as your central hub for managing all aspects of your productive life. Instead of overwhelming you with endless todo lists, it uses smart algorithms to organize everything into a clean, focused workspace.

## ✨ Features

### 🎯 Core Entities
- **📝 Tasks** - Action items with deadlines and priorities
- **🎯 Habits** - Recurring practices for personal development  
- **💭 Reminders** - Strategic thinking items and life decisions
- **🏷️ Categories** - Organize items with default and custom categories

### 🎨 Task Studio (Hub Management)
- **Advanced Filtering** - Filter by type, status, priority, category, and search
- **Smart Sorting** - Sort by any criteria with ascending/descending options
- **Bulk Operations** - Complete, snooze, or delete multiple items at once
- **Pagination** - Handle large datasets with configurable page sizes
- **Export Functionality** - Export data to CSV or JSON formats
- **Nested Subtasks** - Unlimited nesting for complex task breakdown

### 🔧 Smart Features (Future)
- **Auto-Detection** - Automatically categorize items based on keywords
- **Focus Algorithm** - Calculate daily focus scores for prioritization
- **Mood Assessment** - Workload stress analysis with recommendations
- **Progress Tracking** - Session tracking for habits with statistics

## 🏗️ Architecture

### Backend (Spring Boot + SQLite)
```
sonic-task-hub-api/
├── src/main/java/com/sonic/sonictaskhub/
│   ├── config/           # Security, Database configurations
│   ├── model/
│   │   ├── entity/       # JPA entities (User, Item, Category, Progress)
│   │   ├── enums/        # Type-safe enums
│   │   ├── dto/          # Data transfer objects
│   │   └── response/     # API response wrappers
│   ├── repository/       # JPA repositories with custom queries
│   ├── service/          # Business logic layer
│   └── web/
│       ├── controller/   # REST API endpoints
│       ├── filter/       # Request logging
│       └── handler/      # Global exception handling
└── pom.xml              # Maven dependencies
```

### Frontend (React + TypeScript + Tailwind)
```
sonic-task-hub-web/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Main application pages
│   ├── services/        # API service layer
│   ├── types/           # TypeScript definitions
│   ├── contexts/        # React contexts (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── styles/          # CSS and styling
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS setup
```

## 🚀 Quick Start

### Prerequisites
- **Java 17+** for backend
- **Node.js 18+** for frontend
- **Maven 3.8+** for backend build
- **Git** for version control

### Backend Setup

1. **Clone and navigate to backend:**
```bash
git clone <repository-url>
cd sonic-task-hub/sonic-task-hub-api
```

2. **Install dependencies and run:**
```bash
mvn clean install
mvn spring-boot:run
```

3. **Verify backend:**
- API will be available at `http://localhost:8080`
- Database file will be created at `data/sonictaskhub.db`
- Check endpoints: `http://localhost:8080/api/users/all`

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd ../sonic-task-hub-web
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access application:**
- Open `http://localhost:3000` in your browser
- Register a new account or use existing credentials

## 📖 API Documentation

### Authentication
```bash
# Register new user
POST /api/users/register
{
  "username": "john_doe",
  "password": "secure123",
  "email": "john@example.com",
  "displayName": "John Doe"
}

# Login
POST /api/users/login
{
  "username": "john_doe", 
  "password": "secure123"
}
```

### Items Management
```bash
# Get items with filters
GET /api/items/user/{userId}?type=TASK&status=PENDING&page=0&size=20

# Create item
POST /api/items/user/{userId}
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "type": "TASK",
  "priority": "HIGH",
  "complexity": "MEDIUM",
  "dueDate": "2024-12-31T23:59:59",
  "categoryId": 1
}

# Bulk operations
PUT /api/items/user/{userId}/bulk/complete
{ "itemIds": [1, 2, 3] }
```

### Categories
```bash
# Get available categories
GET /api/categories/user/{userId}

# Create custom category  
POST /api/categories/user/{userId}
{
  "name": "Personal Projects",
  "description": "My side projects", 
  "color": "#FF5733"
}
```

## 🎨 UI Components

### Task Studio Features
- **📊 Item Table** - Sortable columns with bulk selection
- **🔍 Advanced Filters** - Type, status, priority, category, search
- **⚡ Quick Actions** - Complete, snooze, edit, delete
- **📤 Export Options** - CSV/JSON with customizable filters
- **📱 Responsive Design** - Works on desktop and mobile

### Forms & Modals
- **➕ Item Form** - Create/edit with validation
- **⏰ Snooze Modal** - Preset and custom snooze options  
- **📋 Export Modal** - Configure export parameters
- **🔐 Auth Forms** - Login/register with form validation

## 🛠️ Development

### Backend Development
```bash
# Run with debug mode
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"

# Run tests
mvn test

# Build for production
mvn clean package
java -jar target/sonic-task-hub-api-1.0.0.jar
```

### Frontend Development
```bash
# Development with hot reload
npm run dev

# Type checking
npm run build

# Preview production build
npm run preview
```

### Database Schema
```sql
-- Core tables created automatically via JPA
users (id, username, password, email, display_name, is_active, created_at, updated_at)
categories (id, name, description, color, is_default, user_id, is_active, created_at, updated_at)  
items (id, title, description, type, priority, complexity, status, due_date, completed_at, snoozed_until, estimated_duration, actual_duration, user_id, category_id, parent_item_id, sort_order, created_at, updated_at)
item_progress (id, item_id, session_date, duration, notes, progress_value, progress_unit, created_at, updated_at)
```

## 🎯 Future Enhancements

### Smart Features
- **🤖 Auto-Detection** - AI-powered item categorization
- **📈 Focus Algorithm** - Priority scoring with urgency calculation
- **📊 Analytics Dashboard** - Productivity insights and trends
- **🌙 Daily Hub** - Simplified daily view with focus tasks

### Advanced Features  
- **📱 Mobile App** - React Native companion app
- **🔄 Real-time Sync** - WebSocket-based live updates
- **👥 Team Features** - Shared projects and collaboration
- **📧 Email Integration** - Email-to-task conversion
- **📅 Calendar Sync** - Integration with Google Calendar
- **🎨 Themes** - Dark mode and custom themes

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`) 
5. **Open Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spring Boot** - Robust backend framework
- **React** - Modern frontend library  
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **SQLite** - Lightweight database

---

**Built with ❤️ for productivity enthusiasts**

🎵 *Simple • Intelligent • Effective*
