from flask import Flask, request, jsonify
import numpy as np

from kmeans import KMeans

app = Flask(__name__)

@app.route("/")
def hello_world():
    data = request.get_json()
    
    points = np.array(data['points'])
    k = int(data['k'])
    
    centroids, assigments = KMeans.kmeans(points,k)

    
    result = {
        'centroids': centroids.tolist(),
        'assignments': assigments.tolist()
    }
    
    return jsonify(result)
    

if __name__ == "__main__":
    app.run(port=5000, debug=True)
   