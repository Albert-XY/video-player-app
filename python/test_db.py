# -*- coding: utf-8 -*-
import psycopg2

try:
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        dbname='postgres',
        user='postgres',
        password='postgres'
    )
    print("Connected successfully!")
    conn.close()
except Exception as e:
    print(f"Error: {str(e)}")
