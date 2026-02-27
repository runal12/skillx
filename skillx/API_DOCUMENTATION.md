# SkillX API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All endpoints (except register and login) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
- **POST** `/register/`
- **Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "password_confirm": "securepassword",
  "bio": "I love teaching programming",
  "skills_have": "Python, JavaScript, React",
  "skills_want": "Django, Machine Learning"
}
```
- **Response:** `201 Created`

#### Login
- **POST** `/login/`
- **Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```
- **Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Refresh Token
- **POST** `/refresh/`
- **Body:**
```json
{
  "refresh": "your_refresh_token"
}
```

#### Logout
- **POST** `/logout/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### User Profile

#### Get Current User Profile
- **GET** `/profile/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "I love teaching programming",
  "skills_have": "Python, JavaScript, React",
  "skills_want": "Django, Machine Learning"
}
```

#### Update User Profile
- **PUT** `/profile/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "username": "johndoe_updated",
  "email": "john_updated@example.com",
  "bio": "Updated bio",
  "skills_have": "Python, JavaScript, React, Django",
  "skills_want": "Machine Learning, AI"
}
```

#### Get User Details
- **GET** `/users/{user_id}/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Same as profile but for specific user

### Users & Search

#### List All Users
- **GET** `/users/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of user objects (excluding current user)

#### Search Users by Skill
- **GET** `/search/?skill=python`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of users who have the specified skill

### Connections

#### Send Connection Request
- **POST** `/send-request/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "receiver_id": 2
}
```

#### Get Pending Requests
- **GET** `/pending-requests/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of pending connection requests

#### Accept Connection Request
- **POST** `/accept-request/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "request_id": 5
}
```

#### Reject Connection Request
- **POST** `/reject-request/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "request_id": 5
}
```

#### Get My Connections
- **GET** `/my-connections/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of accepted connections

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "error": "Error description"
}
```

Common status codes:
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found

## Models

### User
- `id`: Integer (Primary Key)
- `username`: String (Unique)
- `email`: String (Unique)
- `bio`: Text (Optional)
- `skills_have`: String (Optional, comma-separated)
- `skills_want`: String (Optional, comma-separated)

### ConnectionRequest
- `id`: Integer (Primary Key)
- `sender`: User (ForeignKey)
- `receiver`: User (ForeignKey)
- `status`: String ('pending' or 'accepted')
- `created_at`: DateTime
