# Stage 1: Build the React frontend
FROM node:14 as frontend-build
WORKDIR /app/frontend
RUN npm config set registry https://registry.npmmirror.com/
COPY frontend/package*.json ./
RUN npm install
RUN chmod +x ./node_modules/.bin/webpack
RUN ls -l ./node_modules/.bin/webpack
COPY frontend/ ./
RUN npm cache clean --force && \
    npm install --save-dev webpack@5.75.0 webpack-cli@4.10.0 && \
    npm list webpack webpack-cli
# Add webpack build with progress
RUN npx webpack --mode production --stats detailed
# Verify build output exists
RUN ls -la build/
RUN node -v
RUN npm -v

# Stage 2: Build the Java backend
FROM maven:3.8.1-openjdk-11 as backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn package -DskipTests

# Stage 3: Setup Python environment for ML tasks
FROM python:3.8-slim as python-env
WORKDIR /app/ml
COPY backend/ml/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ml /app/ml

# Stage 4: Final stage
FROM openjdk:11-jdk-slim
WORKDIR /app

# Copy the built artifacts from previous stages
COPY --from=frontend-build /app/frontend/build /app/frontend/build
COPY --from=backend-build /app/backend/target/*.jar /app/app.jar
COPY --from=python-env /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages
COPY --from=python-env /app/ml /app/ml

# Expose the port the app runs on
EXPOSE 8080

# Run the Java application
CMD ["java", "-jar", "/app/app.jar"]
