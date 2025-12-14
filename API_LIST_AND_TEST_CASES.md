# Danh Sách API và Test Cases

## 📋 Tổng quan
Backend có tổng cộng **16 API endpoints** được chia thành 5 nhóm chính: Health, Auth, User, Audio, và Folder.

---

## 1️⃣ Health Routes (`/api/health`)

### 1.1 GET /api/health
**Mô tả:** Kiểm tra trạng thái của server

**Method:** GET

**Request:**
```bash
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2025-12-14T10:30:00Z"
  }
}
```

## 2️⃣ Auth Routes (`/api/auth`)

### 2.1 POST /api/auth/register
**Mô tả:** Đăng ký tài khoản mới

**Method:** POST

**Request Body:**
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```



**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "message": "Missing required fields: fullname, email, password"
  }
}
```

---

### 2.2 POST /api/auth/login
**Mô tả:** Đăng nhập tài khoản

**Method:** POST

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "john@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "message": "Please provide email and password"
  }
}
```


### 2.3 GET /auth/me
**Mô tả:** Lấy thông tin user hiện tại (yêu cầu authentication)

**Method:** GET

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "john@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "User not authenticated"
  }
}
```

**Test Case:**
```typescript
describe('Auth - Get Current User', () => {
  let token: string;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'securePassword123'
      });

    token = loginRes.body.data.token;
  });

  it('should get current user with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('john@example.com');
    expect(response.body.data.name).toBe('John Doe');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .expect(401);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toContain('not authenticated');
  });
});
```

---

### 2.4 PUT /api/auth/profile
**Mô tả:** Cập nhật thông tin profile (yêu cầu authentication)

**Method:** PUT

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "fullname": "Jane Doe",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "newemail@example.com",
    "name": "Jane Doe"
  }
}
```

**Test Case:**
```typescript
describe('Auth - Update Profile', () => {
  let token: string;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'securePassword123'
      });

    token = loginRes.body.data.token;
  });

  it('should update profile successfully', async () => {
    const response = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'newemail@example.com',
        fullname: 'Jane Doe'
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('newemail@example.com');
    expect(response.body.data.name).toBe('Jane Doe');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .put('/api/auth/profile')
      .send({
        email: 'newemail@example.com'
      })
      .expect(401);
    
    expect(response.body.success).toBe(false);
  });
});
```

---

## 3️⃣ User Routes (`/api/users`)

### 3.1 GET /api/users/:id
**Mô tả:** Lấy thông tin user theo ID

**Method:** GET

**Request:**
```bash
GET /api/users/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "fullname": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2025-12-14T10:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Test Case:**
```typescript
describe('User API - Get User By ID', () => {
  let userId: string;

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123'
      });

    userId = response.body.data.user.id;
  });

  it('should get user by ID successfully', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('john@example.com');
    expect(response.body.data.fullname).toBe('John Doe');
  });

  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .get('/api/users/99999')
      .expect(404);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not found');
  });
});
```

---

### 3.2 POST /api/users
**Mô tả:** Tạo user mới (thường được sử dụng trong seeding)

**Method:** POST

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullname": "User Name",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullname": "User Name"
  }
}
```

**Test Case:**
```typescript
describe('User API - Create User', () => {
  it('should create a new user successfully', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'newuser@example.com',
        fullname: 'New User',
        password: 'securePassword123'
      })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('newuser@example.com');
    expect(response.body.data.fullname).toBe('New User');
  });

  it('should return error for duplicate email', async () => {
    await request(app)
      .post('/api/users')
      .send({
        email: 'duplicate@example.com',
        fullname: 'First User',
        password: 'password123'
      });

    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'duplicate@example.com',
        fullname: 'Second User',
        password: 'password123'
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
  });
});
```

---

## 4️⃣ Folder Routes (`/api/folders`)

### 4.1 GET /api/folders
**Mô tả:** Lấy danh sách folders (public hoặc user nếu authenticated)

**Method:** GET

**Headers (Optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Audios",
      "isPublic": false,
      "createdBy": 1,
      "createdAt": "2025-12-14T10:00:00Z",
      "_count": {
        "audios": 5
      }
    },
    {
      "id": 2,
      "name": "Shared Folder",
      "isPublic": true,
      "createdBy": 2,
      "createdAt": "2025-12-14T09:00:00Z",
      "_count": {
        "audios": 3
      }
    }
  ]
}
```

**Test Case:**
```typescript
describe('Folder API - Get All Folders', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    userId = registerRes.body.data.user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    token = loginRes.body.data.token;

    // Create a folder
    await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Folder',
        isPublic: false
      });
  });

  it('should get all folders for authenticated user', async () => {
    const response = await request(app)
      .get('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should get only public folders without authentication', async () => {
    const response = await request(app)
      .get('/api/folders')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    // Only public folders should be returned
    expect(response.body.data.every(f => f.isPublic === true)).toBe(true);
  });
});
```

---

### 4.2 POST /api/folders
**Mô tả:** Tạo folder mới (yêu cầu authentication)

**Method:** POST

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Learning Folder",
  "isPublic": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Learning Folder",
    "isPublic": false,
    "createdBy": 1,
    "createdAt": "2025-12-14T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Folder name is required"
}
```

**Test Case:**
```typescript
describe('Folder API - Create Folder', () => {
  let token: string;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    token = loginRes.body.data.token;
  });

  it('should create a folder successfully', async () => {
    const response = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'My Learning Folder',
        isPublic: false
      })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('My Learning Folder');
    expect(response.body.data.isPublic).toBe(false);
  });

  it('should return 400 when folder name is empty', async () => {
    const response = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        isPublic: false
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Folder name is required');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/api/folders')
      .send({
        name: 'Folder',
        isPublic: false
      })
      .expect(401);
    
    expect(response.body.success).toBe(false);
  });
});
```

---

### 4.3 GET /api/folders/:id
**Mô tả:** Lấy thông tin folder theo ID với danh sách audios

**Method:** GET

**Headers (Optional):**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Learning Folder",
    "isPublic": false,
    "createdBy": 1,
    "createdAt": "2025-12-14T10:00:00Z",
    "audios": [
      {
        "id": 1,
        "title": "Lesson 1",
        "fileUrl": "/audio/lesson1.mp3",
        "duration": 300,
        "script": "Audio script content"
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Folder not found"
}
```

**Test Case:**
```typescript
describe('Folder API - Get Folder By ID', () => {
  let token: string;
  let folderId: number;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    token = loginRes.body.data.token;

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Folder',
        isPublic: false
      });

    folderId = folderRes.body.data.id;
  });

  it('should get folder by ID with audios', async () => {
    const response = await request(app)
      .get(`/api/folders/${folderId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Folder');
    expect(Array.isArray(response.body.data.audios)).toBe(true);
  });

  it('should return 404 for non-existent folder', async () => {
    const response = await request(app)
      .get('/api/folders/99999')
      .expect(404);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not found');
  });
});
```

---

### 4.4 PUT /api/folders/:id
**Mô tả:** Cập nhật thông tin folder (yêu cầu authentication + ownership)

**Method:** PUT

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Folder Name",
  "isPublic": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Folder Name",
    "isPublic": true,
    "createdBy": 1,
    "updatedAt": "2025-12-14T11:00:00Z"
  }
}
```

**Test Case:**
```typescript
describe('Folder API - Update Folder', () => {
  let token: string;
  let folderId: number;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    token = loginRes.body.data.token;

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Original Folder',
        isPublic: false
      });

    folderId = folderRes.body.data.id;
  });

  it('should update folder successfully', async () => {
    const response = await request(app)
      .put(`/api/folders/${folderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Folder Name',
        isPublic: true
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Updated Folder Name');
    expect(response.body.data.isPublic).toBe(true);
  });

  it('should return 403 when updating other user folder', async () => {
    // Register another user
    const otherUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

    const otherLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'other@example.com',
        password: 'password123'
      });

    const otherToken = otherLoginRes.body.data.token;

    const response = await request(app)
      .put(`/api/folders/${folderId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        name: 'Hacked Name',
        isPublic: true
      })
      .expect(403);
    
    expect(response.body.success).toBe(false);
  });
});
```

---

### 4.5 DELETE /api/folders/:id
**Mô tả:** Xóa folder (yêu cầu authentication + ownership)

**Method:** DELETE

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**Test Case:**
```typescript
describe('Folder API - Delete Folder', () => {
  let token: string;
  let folderId: number;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    token = loginRes.body.data.token;

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Folder to Delete',
        isPublic: false
      });

    folderId = folderRes.body.data.id;
  });

  it('should delete folder successfully', async () => {
    const response = await request(app)
      .delete(`/api/folders/${folderId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);

    // Verify folder is deleted
    const getRes = await request(app)
      .get(`/api/folders/${folderId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .delete(`/api/folders/${folderId}`)
      .expect(401);
    
    expect(response.body.success).toBe(false);
  });
});
```

---

## 5️⃣ Audio Routes (`/api/audios`)

### 5.1 GET /api/audios
**Mô tả:** Lấy danh sách audios của user hiện tại với filters

**Method:** GET

**Query Parameters:**
- `userId` (required): ID của user
- `search` (optional): Tìm kiếm theo tên
- `isSuspend` (optional): Lọc theo trạng thái suspend (true/false)
- `folderId` (optional): Lọc theo folder ID

**Request:**
```bash
GET /api/audios?userId=1&search=lesson&folderId=1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Lesson 1",
      "script": "Content of the audio",
      "fileUrl": "/audio/lesson1.mp3",
      "duration": 300,
      "folderId": 1,
      "createdBy": 1,
      "isSuspend": false,
      "createdAt": "2025-12-14T10:00:00Z",
      "audioStats": {
        "playCount": 5,
        "lastPlayed": "2025-12-14T09:00:00Z"
      }
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "userId is required"
}
```

**Test Case:**
```typescript
describe('Audio API - Get Audio List', () => {
  let token: string;
  let userId: string;
  let folderId: number;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    userId = registerRes.body.data.user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    token = loginRes.body.data.token;

    // Create a folder
    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Folder',
        isPublic: false
      });

    folderId = folderRes.body.data.id;
  });

  it('should get audio list for user', async () => {
    const response = await request(app)
      .get(`/api/audios?userId=${userId}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should filter audios by search', async () => {
    const response = await request(app)
      .get(`/api/audios?userId=${userId}&search=lesson`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });

  it('should return 400 without userId', async () => {
    const response = await request(app)
      .get('/api/audios')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('userId is required');
  });
});
```

---

### 5.2 POST /api/audios
**Mô tả:** Upload audio file mới

**Method:** POST

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): Audio file (mp3, wav, etc)
- `title` (required): Tiêu đề audio
- `script` (optional): Nội dung script
- `folderId` (required): Folder ID
- `duration` (required): Thời lượng (giây)
- `userId` (required): User ID

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Audio",
    "script": "Audio script",
    "fileUrl": "/audio/upload_1234567890.mp3",
    "duration": 300,
    "folderId": 1,
    "createdBy": 1,
    "createdAt": "2025-12-14T10:30:00Z"
  }
}
```

**Test Case:**
```typescript
describe('Audio API - Create Audio', () => {
  let userId: string;
  let folderId: number;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    userId = registerRes.body.data.user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    const token = loginRes.body.data.token;

    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Folder',
        isPublic: false
      });

    folderId = folderRes.body.data.id;
  });

  it('should upload audio successfully', async () => {
    const response = await request(app)
      .post('/api/audios')
      .field('title', 'My Audio')
      .field('script', 'Audio content')
      .field('folderId', folderId.toString())
      .field('duration', '300')
      .field('userId', userId)
      .attach('file', 'path/to/test-audio.mp3')
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('My Audio');
    expect(response.body.data.duration).toBe(300);
  });

  it('should return 400 when file is missing', async () => {
    const response = await request(app)
      .post('/api/audios')
      .field('title', 'My Audio')
      .field('folderId', folderId.toString())
      .field('duration', '300')
      .field('userId', userId)
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('No file uploaded');
  });

  it('should return 400 when userId is missing', async () => {
    const response = await request(app)
      .post('/api/audios')
      .field('title', 'My Audio')
      .field('folderId', folderId.toString())
      .field('duration', '300')
      .attach('file', 'path/to/test-audio.mp3')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('userId is required');
  });
});
```

---

### 5.3 GET /api/audios/:id
**Mô tả:** Lấy thông tin audio theo ID

**Method:** GET

**Query Parameters:**
- `userId` (optional): Để kiểm tra quyền sở hữu

**Request:**
```bash
GET /api/audios/1?userId=1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Audio",
    "script": "Audio content",
    "fileUrl": "/audio/audio1.mp3",
    "duration": 300,
    "folderId": 1,
    "createdBy": 1,
    "isSuspend": false,
    "createdAt": "2025-12-14T10:00:00Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**Test Case:**
```typescript
describe('Audio API - Get Audio By ID', () => {
  let userId: string;
  let audioId: number;

  beforeEach(async () => {
    // Create user and audio...
  });

  it('should get audio by ID with correct userId', async () => {
    const response = await request(app)
      .get(`/api/audios/${audioId}?userId=${userId}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(audioId);
  });

  it('should return 403 when userId does not match', async () => {
    const response = await request(app)
      .get(`/api/audios/${audioId}?userId=999`)
      .expect(403);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Access denied');
  });

  it('should return 404 for non-existent audio', async () => {
    const response = await request(app)
      .get(`/api/audios/99999?userId=${userId}`)
      .expect(404);
    
    expect(response.body.success).toBe(false);
  });
});
```

---

### 5.4 PUT /api/audios/:id
**Mô tả:** Cập nhật thông tin audio (yêu cầu ownership)

**Method:** PUT

**Request Body:**
```json
{
  "title": "Updated Title",
  "script": "Updated script",
  "folderId": 2,
  "userId": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "script": "Updated script",
    "folderId": 2,
    "createdBy": 1
  },
  "message": "Audio updated successfully"
}
```

**Test Case:**
```typescript
describe('Audio API - Update Audio', () => {
  let userId: string;
  let audioId: number;

  beforeEach(async () => {
    // Create user and audio...
  });

  it('should update audio successfully', async () => {
    const response = await request(app)
      .put(`/api/audios/${audioId}`)
      .send({
        title: 'Updated Title',
        script: 'Updated script',
        userId: userId
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Updated Title');
  });

  it('should return 403 when userId does not match', async () => {
    const response = await request(app)
      .put(`/api/audios/${audioId}`)
      .send({
        title: 'Hacked Title',
        userId: '999'
      })
      .expect(403);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Access denied');
  });
});
```

---

### 5.5 DELETE /api/audios/:id
**Mô tả:** Xóa audio (yêu cầu ownership)

**Method:** DELETE

**Query Parameters:**
- `userId` (required): User ID để kiểm tra ownership

**Request:**
```bash
DELETE /api/audios/1?userId=1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Audio deleted successfully"
}
```

**Test Case:**
```typescript
describe('Audio API - Delete Audio', () => {
  let userId: string;
  let audioId: number;

  beforeEach(async () => {
    // Create user and audio...
  });

  it('should delete audio successfully', async () => {
    const response = await request(app)
      .delete(`/api/audios/${audioId}?userId=${userId}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);

    // Verify audio is deleted
    const getRes = await request(app)
      .get(`/api/audios/${audioId}?userId=${userId}`)
      .expect(404);
  });

  it('should return 403 when userId does not match', async () => {
    const response = await request(app)
      .delete(`/api/audios/${audioId}?userId=999`)
      .expect(403);
    
    expect(response.body.success).toBe(false);
  });
});
```

---

### 5.6 PATCH /api/audios/:id/move
**Mô tả:** Di chuyển audio sang folder khác

**Method:** PATCH

**Request Body:**
```json
{
  "folderId": 2,
  "userId": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Audio Title",
    "folderId": 2,
    "createdBy": 1
  },
  "message": "Audio moved successfully"
}
```

**Test Case:**
```typescript
describe('Audio API - Move Audio', () => {
  let userId: string;
  let audioId: number;
  let folder1Id: number;
  let folder2Id: number;

  beforeEach(async () => {
    // Create user and two folders...
  });

  it('should move audio to another folder', async () => {
    const response = await request(app)
      .patch(`/api/audios/${audioId}/move`)
      .send({
        folderId: folder2Id,
        userId: userId
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.folderId).toBe(folder2Id);
  });

  it('should return 403 when userId does not match', async () => {
    const response = await request(app)
      .patch(`/api/audios/${audioId}/move`)
      .send({
        folderId: folder2Id,
        userId: '999'
      })
      .expect(403);
    
    expect(response.body.success).toBe(false);
  });
});
```

---

### 5.7 GET /api/audios/folders
**Mô tả:** Lấy danh sách folders của user

**Method:** GET

**Query Parameters:**
- `userId` (required): User ID

**Request:**
```bash
GET /api/audios/folders?userId=1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Audios",
      "isPublic": false,
      "createdBy": 1
    },
    {
      "id": 2,
      "name": "Learning",
      "isPublic": false,
      "createdBy": 1
    }
  ]
}
```

**Test Case:**
```typescript
describe('Audio API - Get User Folders', () => {
  let userId: string;

  beforeEach(async () => {
    // Create user and folders...
  });

  it('should get all folders for user', async () => {
    const response = await request(app)
      .get(`/api/audios/folders?userId=${userId}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 400 without userId', async () => {
    const response = await request(app)
      .get('/api/audios/folders')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('userId is required');
  });
});
```

---

## 📊 API Summary Table

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/api/health` | ❌ | Kiểm tra server health |
| 2 | POST | `/api/auth/register` | ❌ | Đăng ký user mới |
| 3 | POST | `/api/auth/login` | ❌ | Đăng nhập |
| 4 | GET | `/api/auth/me` | ✅ | Lấy thông tin user hiện tại |
| 5 | PUT | `/api/auth/profile` | ✅ | Cập nhật profile |
| 6 | GET | `/api/users/:id` | ❌ | Lấy user theo ID |
| 7 | POST | `/api/users` | ❌ | Tạo user mới |
| 8 | GET | `/api/folders` | ⭕ | Lấy danh sách folders |
| 9 | POST | `/api/folders` | ✅ | Tạo folder mới |
| 10 | GET | `/api/folders/:id` | ⭕ | Lấy folder theo ID |
| 11 | PUT | `/api/folders/:id` | ✅ | Cập nhật folder |
| 12 | DELETE | `/api/folders/:id` | ✅ | Xóa folder |
| 13 | GET | `/api/audios` | ❌ | Lấy danh sách audios |
| 14 | POST | `/api/audios` | ❌ | Upload audio mới |
| 15 | GET | `/api/audios/:id` | ❌ | Lấy audio theo ID |
| 16 | PUT | `/api/audios/:id` | ❌ | Cập nhật audio |
| 17 | DELETE | `/api/audios/:id` | ❌ | Xóa audio |
| 18 | PATCH | `/api/audios/:id/move` | ❌ | Di chuyển audio |
| 19 | GET | `/api/audios/folders` | ❌ | Lấy folders của user |

**Legend:**
- ✅ = Cần authentication (token)
- ❌ = Không cần authentication
- ⭕ = Optional (nếu có token sẽ thấy private folders)

---

## 🚀 Hướng dẫn chạy tests

```bash
# Cài đặt dependencies
npm install

# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests watch mode
npm test -- --watch
```

---

## 📝 Ghi chú quan trọng

1. **Authentication**: Sử dụng JWT token được trả về từ `/api/auth/login`
2. **Ownership**: Một số API kiểm tra quyền sở hữu của user trước khi cho phép thực hiện
3. **File Upload**: Audio upload sử dụng `multipart/form-data`
4. **Error Handling**: Tất cả API trả về `success` flag và error message nếu có
5. **Pagination**: Hiện tại API không hỗ trợ pagination, trả về toàn bộ data

