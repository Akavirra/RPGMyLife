import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { verifySessionToken, getUserById, logUserAction, verifyPassword, hashPassword, generateSalt } from '@/lib/auth';
import { uploadAvatar } from '@/lib/cloudinary';

// Validation constants
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Allowed image formats
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface ValidationError {
  field: string;
  message: string;
}

// Validate username
function validateUsername(username: string): ValidationError | null {
  if (!username || username.trim().length === 0) {
    return { field: 'username', message: 'Ім\'я користувача є обов\'язковим' };
  }
  
  if (username.length < USERNAME_MIN_LENGTH) {
    return { 
      field: 'username', 
      message: `Ім'я користувача повинно містити мінімум ${USERNAME_MIN_LENGTH} символів` 
    };
  }
  
  if (username.length > USERNAME_MAX_LENGTH) {
    return { 
      field: 'username', 
      message: `Ім'я користувача повинно містити максимум ${USERNAME_MAX_LENGTH} символів` 
    };
  }
  
  // Check for valid characters (alphanumeric, underscores, hyphens)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { 
      field: 'username', 
      message: 'Ім\'я користувача може містити лише літери, цифри, підкреслення та дефіси' 
    };
  }
  
  return null;
}

// Validate password
function validatePassword(password: string): ValidationError | null {
  if (!password || password.length === 0) {
    return { field: 'password', message: 'Пароль є обов\'язковим' };
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { 
      field: 'password', 
      message: `Пароль повинен містити мінімум ${PASSWORD_MIN_LENGTH} символів` 
    };
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      field: 'password', 
      message: 'Пароль повинен містити хотя б одну велику літеру, малу літеру, цифру та спеціальний символ' 
    };
  }
  
  return null;
}

// Validate image file
function validateImage(file: File): ValidationError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      field: 'avatar', 
      message: 'Дозволені формати зображення: JPEG, PNG, WEBP, GIF' 
    };
  }
  
  if (file.size > MAX_IMAGE_SIZE) {
    return { 
      field: 'avatar', 
      message: 'Розмір зображення не повинен перевищувати 5MB' 
    };
  }
  
  return null;
}

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        avatarUrl: user.avatarUrl,
        level: user.level,
        totalXp: user.totalXp,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    
    // Handle multipart form data (for file uploads)
    if (contentType.includes('multipart/form-data')) {
      return handleMultipartUpdate(request, session.userId);
    }
    
    // Handle JSON data (for regular updates)
    return handleJsonUpdate(request, session.userId);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle JSON updates (username, password)
async function handleJsonUpdate(request: NextRequest, userId: number): Promise<NextResponse> {
  const body = await request.json();
  const { username, firstName, currentPassword, newPassword, confirmPassword } = body;
  
  const errors: ValidationError[] = [];
  
  // Get current user
  const currentUser = await getUserById(userId);
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Validate and update username if provided
  if (username !== undefined && username !== currentUser.username) {
    const usernameError = validateUsername(username);
    if (usernameError) {
      errors.push(usernameError);
    } else {
      // Check for uniqueness
      const existingUser = await db.query.users.findFirst({
        where: or(
          eq(users.username, username),
          eq(users.email, username)
        ),
      });
      
      if (existingUser && existingUser.id !== userId) {
        errors.push({ 
          field: 'username', 
          message: 'Це ім\'я користувача вже зайняте' 
        });
      }
    }
  }
  
  // Handle password change
  if (newPassword) {
    // Verify current password
    if (!currentPassword) {
      errors.push({ 
        field: 'currentPassword', 
        message: 'Введіть поточний пароль' 
      });
    } else {
      const isValid = await verifyPassword(currentPassword, currentUser.passwordHash, currentUser.salt || '');
      if (!isValid) {
        errors.push({ 
          field: 'currentPassword', 
          message: 'Неправильний поточний пароль' 
        });
      }
    }
    
    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      errors.push(passwordError);
    }
    
    // Check password confirmation
    if (newPassword !== confirmPassword) {
      errors.push({ 
        field: 'confirmPassword', 
        message: 'Паролі не співпадають' 
      });
    }
  }
  
  // Return validation errors
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  
  // Build update object
  const updateData: Record<string, any> = {};
  
  if (username !== undefined && username !== currentUser.username) {
    updateData.username = username;
  }
  
  if (firstName !== undefined) {
    updateData.firstName = firstName;
  }
  
  // Update password if provided and valid
  if (newPassword && errors.length === 0) {
    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);
    
    await db.update(users)
      .set({
        passwordHash,
        salt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    // Log password change
    await logUserAction(userId, 'password_changed', {
      timestamp: new Date().toISOString(),
    });
  }
  
  // Update user profile
  if (Object.keys(updateData).length > 0) {
    await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    // Log profile update
    await logUserAction(userId, 'profile_updated', {
      updatedFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    });
  }
  
  // Fetch updated user
  const updatedUser = await getUserById(userId);
  
  return NextResponse.json({
    success: true,
    message: 'Профіль успішно оновлено',
    user: {
      id: updatedUser?.id,
      email: updatedUser?.email,
      username: updatedUser?.username,
      firstName: updatedUser?.firstName,
      avatarUrl: updatedUser?.avatarUrl,
      level: updatedUser?.level,
      totalXp: updatedUser?.totalXp,
    },
  });
}

// Handle multipart form data (file uploads)
async function handleMultipartUpdate(request: NextRequest, userId: number): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get('avatar') as File | null;
  const username = formData.get('username') as string | null;
  const firstName = formData.get('firstName') as string | null;
  
  const errors: ValidationError[] = [];
  
  // Get current user
  const currentUser = await getUserById(userId);
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Validate username if provided
  if (username) {
    const usernameError = validateUsername(username);
    if (usernameError) {
      errors.push(usernameError);
    } else if (username !== currentUser.username) {
      // Check for uniqueness
      const existingUser = await db.query.users.findFirst({
        where: or(
          eq(users.username, username),
          eq(users.email, username)
        ),
      });
      
      if (existingUser && existingUser.id !== userId) {
        errors.push({ 
          field: 'username', 
          message: 'Це ім\'я користувача вже зайняте' 
        });
      }
    }
  }
  
  // Validate and upload avatar if provided
  let avatarUrl = currentUser.avatarUrl;
  if (file) {
    const imageError = validateImage(file);
    if (imageError) {
      errors.push(imageError);
    } else {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadedUrl = await uploadAvatar(buffer, userId);
      if (uploadedUrl) {
        avatarUrl = uploadedUrl;
        
        // Log avatar update
        await logUserAction(userId, 'avatar_updated', {
          timestamp: new Date().toISOString(),
        });
      } else {
        errors.push({ 
          field: 'avatar', 
          message: 'Не вдалося завантажити зображення' 
        });
      }
    }
  }
  
  // Return validation errors
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  
  // Build update object
  const updateData: Record<string, any> = {};
  
  if (username && username !== currentUser.username) {
    updateData.username = username;
  }
  
  if (firstName !== null && firstName !== currentUser.firstName) {
    updateData.firstName = firstName;
  }
  
  if (avatarUrl !== currentUser.avatarUrl) {
    updateData.avatarUrl = avatarUrl;
  }
  
  // Update user profile
  if (Object.keys(updateData).length > 0) {
    await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    // Log profile update
    await logUserAction(userId, 'profile_updated', {
      updatedFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    });
  }
  
  // Fetch updated user
  const updatedUser = await getUserById(userId);
  
  return NextResponse.json({
    success: true,
    message: 'Профіль успішно оновлено',
    user: {
      id: updatedUser?.id,
      email: updatedUser?.email,
      username: updatedUser?.username,
      firstName: updatedUser?.firstName,
      avatarUrl: updatedUser?.avatarUrl,
      level: updatedUser?.level,
      totalXp: updatedUser?.totalXp,
    },
  });
}
