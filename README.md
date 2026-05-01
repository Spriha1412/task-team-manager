# Team Task Manager

A full-stack web application for managing team tasks. This project features a robust REST API backend and a responsive, modern frontend.

## Features
- **User Authentication:** Secure login and registration.
- **Dashboard:** Manage your projects and tasks seamlessly.
- **RESTful API:** Powered by FastAPI for high performance and automatic interactive documentation.
- **Modern UI:** Built with React and Vite for an optimized developer and user experience.

## Project Structure
- `backend/`: Contains the FastAPI application, SQLite database models, routers, and schemas.
- `frontend/`: Contains the React application powered by Vite, with routing and component-based architecture.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.8+

### Running the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:** `.\venv\Scripts\activate`
   - **Mac/Linux:** `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Running the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit [http://localhost:5173](http://localhost:5173).

## Technologies Used
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite, Uvicorn, bcrypt, pydantic
- **Frontend:** React, Vite, React Router DOM, Axios, Lucide React
