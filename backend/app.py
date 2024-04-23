from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np

from kmeans import KMeans

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
def hello_world():
    return "<h1>API is listening. POST on '/cluster'</h1>"

@app.route("/cluster", methods=["POST"])
def create_clusters():
    data = request.json
    markers = data.get("markers")
    points = np.array(markers)

    if len(points) == 0:
        return jsonify([])

    k = int(request.args.get("k", 2))
    _, assignments = KMeans.kmeans(points, k)

    updated_markers = [
        {"lat": markers[i][0], "lng": markers[i][1], "group": int(assignments[i])} for i in range(len(markers))
    ]
    
    return jsonify(updated_markers)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
