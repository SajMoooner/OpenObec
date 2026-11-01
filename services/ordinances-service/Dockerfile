FROM eclipse-temurin:21-jdk-jammy@sha256:4b1a74fbffbe6b4e7b6f0171a472478282fb463790a51edf10e465d578f22b69 AS build
WORKDIR /workspace
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY libs libs
COPY contracts contracts
COPY services services
RUN --mount=type=cache,target=/root/.m2,sharing=locked ./mvnw -B -pl services/ordinances-service -am -DskipTests package
FROM eclipse-temurin:21-jre-jammy@sha256:1eac8b8fee11ca7d6725a48bc5d41992ed1561504ebae25490d2d062847e8269
WORKDIR /app
COPY --from=build /workspace/services/ordinances-service/target/ordinances-service-0.1.0-SNAPSHOT.jar app.jar
COPY infra/java/healthcheck.sh /app/healthcheck.sh
USER 10001:10001
ENV JAVA_TOOL_OPTIONS="-Xms32m -Xmx192m"
EXPOSE 8086
ENTRYPOINT ["java","-jar","/app/app.jar"]
