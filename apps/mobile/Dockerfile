FROM node:20-alpine
WORKDIR /app

# Volume where the generated APK will be stored
VOLUME /shared

# Command that runs in a loop:
# 1. Creates a fake APK file
# 2. Sleeps to keep the container alive
CMD sh -c "echo 'This is a simulated APK for the PoC' > /shared/client.apk && echo 'APK generated in /shared/client.apk' && tail -f /dev/null"
