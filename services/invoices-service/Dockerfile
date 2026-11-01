FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY libs libs
COPY services services
RUN ./mvnw -B -pl services/invoices-service -am -DskipTests package
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /workspace/services/invoices-service/target/invoices-service-0.1.0-SNAPSHOT.jar app.jar
USER 10001:10001
ENV JAVA_TOOL_OPTIONS="-Xms32m -Xmx192m"
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]
