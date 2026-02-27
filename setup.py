#!/usr/bin/env python
"""
SkillX Setup Script
Automated setup for SkillX application
"""

import os
import sys
import subprocess
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}")
    print(f"Running: {command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error in {description}: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    print("🚀 SkillX Setup Script")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("❌ Error: requirements.txt not found. Please run this script from the skillx root directory.")
        sys.exit(1)
    
    # Backend setup
    print("\n📦 Setting up Backend...")
    
    # Create virtual environment
    if platform.system() == "Windows":
        venv_cmd = "python -m venv venv"
        activate_cmd = "venv\\Scripts\\Activate"
    else:
        venv_cmd = "python3 -m venv venv"
        activate_cmd = "source venv/bin/activate"
    
    if not run_command(venv_cmd, "Creating virtual environment"):
        print("❌ Failed to create virtual environment")
        return
    
    # Install requirements
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("❌ Failed to install requirements")
        return
    
    # Run migrations
    if not run_command("python skillx/manage.py migrate", "Running database migrations"):
        print("❌ Failed to run migrations")
        return
    
    print("\n✅ Backend setup completed!")
    print("\n📝 Next steps:")
    print("1. Create a superuser: python skillx/manage.py createsuperuser")
    print("2. Start backend: python skillx/manage.py runserver")
    print("3. In a NEW terminal, setup frontend:")
    print("   cd skillx-frontend")
    print("   npm install")
    print("   npm start")
    print("\n🌐 Access the app at: http://localhost:3000")
    print("🔧 Backend API at: http://127.0.0.1:8000/api")

if __name__ == "__main__":
    main()
