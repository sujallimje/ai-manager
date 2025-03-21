import requests
import base64

# Load a test image (with multiple faces)
with open("photo2.jpg", "rb") as img_file:
    base64_image = base64.b64encode(img_file.read()).decode("utf-8")

# Send the image to Flask for monitoring
response = requests.post("http://localhost:5000/monitor", json={"image": base64_image})

print(response.json())  # Check if multiple face detection works
