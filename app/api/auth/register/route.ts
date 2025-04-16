import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 插入新用户
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    )

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    // 数据库连接错误
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    // 其他错误
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
