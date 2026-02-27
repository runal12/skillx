# SkillX - Skill Exchange Platform

A modern web application for connecting people who want to share and learn skills from each other. Built with Django REST Framework backend and React frontend.

## 🚀 Features

### Core Functionality
- **User Authentication**: Registration, login, and profile management
- **Skill Exchange**: Users can list skills they have and skills they want to learn
- **Connection System**: Send and receive friend requests to connect with other users
- **Real-time Messaging**: Complete chat system with read status indicators
- **Message Read Status**: "Seen" indicators for messages
- **Unread Message Counts**: Visual indicators for unread messages
- **User Discovery**: Search and find users with complementary skills

### Messaging Features
- ✅ Real-time chat interface
- ✅ Message read status tracking
- ✅ "Seen" indicators after last message
- ✅ Unread message counts in conversation list
- ✅ Message deletion functionality
- ✅ Auto-refresh when returning to conversations

### User Features
- ✅ Profile management with skills
- ✅ Friend request system
- ✅ Connection management
- ✅ User search and discovery
- ✅ Responsive design for all devices

## 🛠 Technology Stack

### Backend
- **Django 5.2.11** - Web framework
- **Django REST Framework** - API development
- **MySQL** - Database
- **JWT Authentication** - User authentication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- MySQL 5.7+
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/skillx.git
cd skillx
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE skillx;

# Update settings.py with your database credentials
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

#### Start Backend Server
```bash
cd skillx
python manage.py runserver
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd skillx-frontend
npm install
```

#### Start Frontend Server
```bash
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000/api
- **Admin Panel**: http://127.0.0.1:8000/admin

## 📁 Project Structure

```
skillx/
├── skillx/                    # Django backend
│   ├── accounts/             # User accounts app
│   ├── skillx/               # Django settings
│   └── manage.py             # Django management
├── skillx-frontend/           # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── context/         # React context
│   └── public/              # Static files
├── .gitignore               # Git ignore file
└── README.md               # This file
```

## 🔧 Configuration

### Backend Settings (skillx/skillx/settings.py)
- Database credentials
- JWT settings
- CORS configuration
- Email settings (optional)

### Frontend Settings (skillx-frontend/src/services/api.js)
- API base URL
- Authentication headers

## 🎯 API Endpoints

### Authentication
- `POST /api/token/` - Login
- `POST /api/token/refresh/` - Refresh token
- `POST /api/register/` - Register user

### Users
- `GET /api/users/` - List users
- `GET /api/users/{id}/` - Get user profile
- `GET /api/search-users/` - Search users

### Connections
- `POST /api/send-request/` - Send friend request
- `GET /api/connection-requests/` - Get pending requests
- `POST /api/accept-request/{id}/` - Accept request
- `DELETE /api/delete-request/{id}/` - Delete request

### Messages
- `GET /api/conversations/` - Get conversations
- `POST /api/send-message/` - Send message
- `POST /api/mark-messages-read/{user_id}/` - Mark messages as read
- `DELETE /api/delete-conversation/{user_id}/` - Delete conversation

## 🧪 Testing

### Backend Tests
```bash
cd skillx
python manage.py test
```

### Frontend Tests
```bash
cd skillx-frontend
npm test
```

## 📦 Deployment

### Backend Deployment Options
- **Heroku** (Free tier available)
- **Render.com** (Free tier available)
- **DigitalOcean** ($5/month)
- **AWS EC2** (Free tier)

### Frontend Deployment
- **Netlify** (Free)
- **Vercel** (Free)
- **GitHub Pages** (Free)

### Environment Variables
```bash
# Backend
DATABASE_URL=mysql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
DEBUG=False

# Frontend
REACT_APP_API_URL=https://your-backend.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Django REST Framework for the powerful API framework
- React for the amazing frontend library
- Tailwind CSS for the utility-first CSS framework
- All contributors and users of SkillX

## 📞 Support

If you have any questions or need support, please:
- Create an issue on GitHub
- Contact the development team

**Built with ❤️ for the skill-sharing community**
