from flask import Flask, request, jsonify
import cv2
import face_recognition
import numpy as np
import base64

app = Flask(__name__)

# Store the user's face encoding
user_face_encoding = None

@app.route("/setup", methods=["POST"])
def setup():
    global user_face_encoding

    data = request.json
    image_data = base64.b64decode(data["image"])
    
    # Convert image to numpy array
    nparr = np.frombuffer(image_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Detect and encode the user's face
    face_locations = face_recognition.face_locations(frame)
    face_encodings = face_recognition.face_encodings(frame, face_locations)

    if len(face_encodings) == 1:
        user_face_encoding = face_encodings[0]
        return jsonify({"status": "success", "message": "User face stored."})
    else:
        return jsonify({"status": "error", "message": "No face or multiple faces detected."})

@app.route("/monitor", methods=["POST"])
def monitor():
    global user_face_encoding

    if user_face_encoding is None:
        return jsonify({"status": "error", "message": "User face not set up."})

    data = request.json
    image_data = base64.b64decode(data["image"])
    nparr = np.frombuffer(image_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Detect faces
    face_locations = face_recognition.face_locations(frame, model="hog")
    face_encodings = face_recognition.face_encodings(frame, face_locations)

    print(f"🔥 Detected {len(face_encodings)} face(s)")

    if len(face_encodings) == 0:
        return jsonify({"status": "warning", "message": "No face detected!"})

    if len(face_encodings) > 1:
        return jsonify({"status": "warning", "message": "Multiple faces detected!"})

    for face_encoding in face_encodings:
        # Compare face with user's face
        matches = face_recognition.compare_faces([user_face_encoding], face_encoding, tolerance=0.5)  # Less strict
        face_distance = face_recognition.face_distance([user_face_encoding], face_encoding)

        print(f"Face distance: {face_distance}")  # Debugging

        # Adjust threshold to reduce false warnings
        if not matches[0] and face_distance > 0.55:  # Increase threshold for stability
            return jsonify({"status": "warning", "message": "Unknown face detected!"})

    return jsonify({"status": "success", "message": "User verified."})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
