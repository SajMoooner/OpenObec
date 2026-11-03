# Build the JAR with JDK 21 first; Java bytecode is architecture independent.
FROM eclipse-temurin:21-jre-jammy@sha256:1eac8b8fee11ca7d6725a48bc5d41992ed1561504ebae25490d2d062847e8269
WORKDIR /app
COPY app.jar /app/app.jar
COPY healthcheck.sh /app/healthcheck.sh
USER 10001:10001
ENV JAVA_TOOL_OPTIONS="-Xms32m -Xmx160m -XX:ActiveProcessorCount=2"
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
