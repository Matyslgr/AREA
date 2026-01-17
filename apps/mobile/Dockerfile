FROM alpine:latest

RUN apk add --no-cache curl

WORKDIR /shared

CMD sh -c "echo 'Attempting download...' && \
    curl -f -L -o /shared/client.apk https://github.com/Matyslgr/AREA/releases/latest/download/client.apk || \
    (echo 'Download failed (404). Creating dummy APK for testing.' && echo 'DUMMY_CONTENT_FOR_VALIDATION' > /shared/client.apk) && \
    chmod 644 /shared/client.apk && \
    echo 'APK ready in volume.' && \
    tail -f /dev/null"