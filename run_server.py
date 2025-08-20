#!/usr/bin/env python3
"""
Flask 서버 실행 스크립트
"""

import os
from app import app

if __name__ == '__main__':
    # 환경 변수 설정
    os.environ.setdefault('FLASK_APP', 'app.py')
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('SECRET_KEY', 'your-super-secret-key-change-this-in-production')
    os.environ.setdefault('DATABASE_URL', 'sqlite:///dashboard.db')
    
    # 서버 실행
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )
