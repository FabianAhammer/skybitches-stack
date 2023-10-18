docker build -t skybitches-frontend frontend/.
docker build -t skybitches-backend backend/.
docker save -o skybitches-images.tar skybitches-frontend skybitches-backend
