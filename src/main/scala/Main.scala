package main

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.Materializer
import akka.http.scaladsl.server.Directives._
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import ch.megard.akka.http.cors.scaladsl.settings.CorsSettings
import akka.http.scaladsl.model.HttpMethods._

import services.{DatabaseService, MarketService, PortfolioStreamService}
import routes.{AuthRoutes, PortfolioRoutes, PortfolioWebSocketRoutes}

import scala.concurrent.ExecutionContextExecutor
import scala.collection.immutable.Seq

object Main extends App {
  implicit val system: ActorSystem = ActorSystem("ProjectApp")
  implicit val mat: Materializer = Materializer(system)
  implicit val executionContext: ExecutionContextExecutor = system.dispatcher

  // 🔥 Initialisation des services
  val dbService = new DatabaseService()
  val marketService = new MarketService()
  val portfolioStreamService = new PortfolioStreamService(marketService)

  // 🔥 Initialisation des routes
  val authRoutes = new AuthRoutes(dbService)
  val portfolioRoutes = new PortfolioRoutes(dbService, marketService)
  val portfolioWebSocketRoutes = new PortfolioWebSocketRoutes(dbService, portfolioStreamService)

  // ✅ Configuration CORS (Version Universelle)
  val corsSettings = CorsSettings.defaultSettings
    .withAllowGenericHttpRequests(true) // ✅ Autorise toutes les requêtes HTTP
    .withAllowedMethods(Seq(GET, POST, PUT, DELETE, OPTIONS)) // ✅ Autorise ces méthodes
    .withAllowCredentials(true) // ✅ Autorise les credentials (cookies, tokens)

  val corsRoutes = cors(corsSettings) {
    authRoutes.routes ~
      portfolioRoutes.routes ~
      portfolioWebSocketRoutes.routes
  }

  // ✅ Lancement du serveur HTTP
  val bindingFuture = Http().newServerAt("localhost", 8080).bind(corsRoutes)
  println("✅ Serveur démarré sur http://localhost:8080/ 🚀")
}












