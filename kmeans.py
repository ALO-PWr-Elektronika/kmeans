import numpy as np

class KMeans:
    @staticmethod
    def euclidean_distance(point1, point2):
        """
        Calculate the Euclidean distance between two points.
        """
        return np.sqrt(np.sum((point1 - point2) ** 2))

    @staticmethod
    def kmeans(points, k, max_iters=100):
        """
        Perform the k-means clustering algorithm on a set of points.
        """
        centroids = points[np.random.choice(len(points), k, replace=False)]

        for _ in range(max_iters):
            assignments = np.argmin(
                np.array([[KMeans.euclidean_distance(point, centroid) for centroid in centroids] for point in points]), axis=1)

            new_centroids = np.array([points[assignments == i].mean(axis=0) for i in range(k)])

            if np.all(centroids == new_centroids):
                break

            centroids = new_centroids

        return centroids, assignments

    