# Stage 1: Build the React frontend
FROM node:14 as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Java backend
FROM maven:3.8.1-openjdk-17 as backend-build
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

# Stage 4: Final stage
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built artifacts from previous stages
COPY --from=frontend-build /app/frontend/build /app/frontend/build
COPY --from=backend-build /app/backend/target/*.jar /app/app.jar
COPY --from=python-env /usr/local/lib/python3.8 /usr/local/lib/python3.8
COPY --from=python-env /usr/local/bin/python /usr/local/bin/python

# Copy Python scripts
COPY backend/ml /app/ml

# Expose the port the app runs on
EXPOSE 8080

# Run the Java application
CMD ["java", "-jar", "/app/app.jar"]

