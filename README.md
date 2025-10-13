<b>Infosys Springboard Internship Project<b> 🏢

<b>Project Overview :<b><br>
* A User Dashboard Application built with React, Tailwind CSS, and FastAPI.<br>
* Users can register, log in, view their profiles, and access department-wise scoped information.<br>
* Developed as part of the Infosys Springboard Internship, with weekly progress tracking.<br><br>


<b>✨Features :</b> <br>
* User registration and login<br>
* Responsive dashboard layout<br>
* Department-wise user scoping<br>
* Profile page for each user<br>
* Dark mode support<br><br>


<b>🛠️ Tech Stack :<b><br>
<b>* Frontend:<b> React, Tailwind CSS, React Router<br>
<b>* Backend:<b> FastAPI, SQLAlchemy<br>
<b>* Database:<b> PostgreSQL<br>
<b>* Authentication:<b> JWT-based login<br><br>


<b>Weekly Progress :<b><br>
<b>* Week 1:<b> Setup project structure, user registration/login, database models<br>
<b>* Week 2:<b> Basic layout using Tailwind CSS, Dashboard after login, department-wise scoping<br><br>


<b>🚀 Setup Instructions<b> <br><br>

<b>Backend Setup :<b><br>
cd backend<br>
python -m venv .venv<br>
source .venv/bin/activate<br>
pip install -r requirements.txt<br>
uvicorn app.main:app --reload  # main.py is inside the app folder<br><br>

<b>Frontend Setup :<b><br>
cd frontend<br>
npm install<br>
npm start<br><br>


<b>Database :<b><br>
* Install PostgreSQL<br>
* Create database (e.g., bragboard_db)<br><br>


<b>🔐 Security :<b><br>
* Passwords are hashed using bcrypt<br>
* JWT tokens for authentication<br>
* CORS configured for frontend access<br>
* Environment variables for sensitive data<br>




