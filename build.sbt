ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.13.16"

lazy val akkaVersion = "2.8.0"
lazy val akkaHttpVersion = "10.5.0"

lazy val root = (project in file("."))
  .settings(
    name := "test_akka",

    // Dépendances Akka
    libraryDependencies ++= Seq(
      "com.typesafe.akka" %% "akka-actor-typed" % akkaVersion, // Akka Actors (typed)
      "com.typesafe.akka" %% "akka-stream" % akkaVersion,      // Akka Streams
      "com.typesafe.akka" %% "akka-http" % akkaHttpVersion,    // Akka HTTP
      "ch.qos.logback" % "logback-classic" % "1.4.14",         // Logging SLF4J
      "ch.megard" %% "akka-http-cors" % "1.1.3",               // CORS support
      "io.spray" %% "spray-json" % "1.3.6",                    // JSON
      "com.softwaremill.sttp.client3" %% "core" % "3.8.11",    // HTTP client pour API externes
      "org.postgresql" % "postgresql" % "42.5.1",              // PostgreSQL
      "com.typesafe.slick" %% "slick" % "3.3.3",               // Slick ORM
      "com.typesafe.slick" %% "slick-hikaricp" % "3.3.3",       // Slick avec HikariCP (connexion DB)
      "com.typesafe.akka" %% "akka-http-spray-json" % akkaHttpVersion
    )
  )
