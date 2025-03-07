import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    const user = result.rows[0]

    if (user && await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ message: 'Login successful' }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

