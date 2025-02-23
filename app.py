from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt

app = Flask(__name__, template_folder="templates")
app.secret_key = 'done'  # Ensure you have a secret key for session management
CORS(app)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["techathon"]
users_collection = db["users"]
# profile_collection = db['profile']

# Home Page (Login Form)
@app.route("/")
def home():
    return render_template("home.html")

# Registration Page
@app.route("/register")
def register_page():
    return render_template("register.html")

# Login Page
@app.route("/login")
def login_page():
    return render_template("login.html")

# API Route for User Registration
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")
    college = data.get("college")

    if not email or not password or not username or not college:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    # Check if email already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"success": False, "message": "Email already registered"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # Store user in MongoDB
    user = {
        "email": email,
        "password": hashed_password,
        "username": username,
        "college": college
    }
    users_collection.insert_one(user)

    return jsonify({"success": True, "message": "Registration successful"}), 201

# API Route for User Login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"success": False, "message": "User not found, Please Register"}), 404

    if bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        session['user_email'] = email
        print(f"Email stored in session: {session.get('user_email')}")
        return jsonify({"success": True, "message": "Login successful"}), 200
    else:
        return jsonify({"success": False, "message": "Incorrect password"}), 401


@app.route('/get_user_email', methods=['GET'])
def get_user_email():
    email = session.get('user_email')
    print(f"Email retrieved from session: {email}")  # Debugging session value
    if email:
        return jsonify({'email': email})
    else:
        return jsonify({'error': 'User not logged in'}), 401


# @app.route('/form/<email>', methods=['GET'])
# def get_form_data(email):
#     profile = profile_collection.find_one({'email': email})
#     if profile:
#         return jsonify(profile)
#     else:
#         return jsonify({'error': 'Profile not found'}), 404

if __name__ == "__main__":
    app.run(debug=True)
