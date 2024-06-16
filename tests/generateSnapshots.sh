#docker build -t playwright_image .
docker run --name playwright playwright_image
docker cp playwright:tests/email.spec.js-snapshots tests
docker rm playwright
read -p "Press enter to continue"