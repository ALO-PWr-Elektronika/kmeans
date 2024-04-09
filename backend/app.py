from flask import Flask, request, jsonify, render_template
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


@app.route("/kmeans")
def hello():
    points = np.array([(1, 2), (3, 4), (5, 6), (7, 8)])
    k = 2
    centroids, assigments = KMeans.kmeans(points,k)
    
    result = {
        'points': points,
        'k': k,
        'centroids': centroids.tolist(),
        'assignments': assigments.tolist()
    }

    return render_template('kmeans.html', result=result)
    

if __name__ == "__main__":
    app.run(port=5000, debug=True)
   