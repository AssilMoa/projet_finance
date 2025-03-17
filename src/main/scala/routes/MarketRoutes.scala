package routes

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import services.MarketService
import scala.util.{Failure, Success}

class MarketRoutes(marketService: MarketService) {

  val routes: Route = pathPrefix("market") {

    path("price") {
      get {
        parameters("symbol") { symbol =>
          val priceFuture = marketService.getCryptoPrice(symbol)

          onComplete(priceFuture) {
            case Success(Some(price)) =>
              complete(StatusCodes.OK, s"""{"symbol": "$symbol", "price": $price}""")

            case Success(None) =>
              complete(StatusCodes.NotFound, s"""{"error": "Prix introuvable pour $symbol"}""")

            case Failure(ex) =>
              complete(StatusCodes.InternalServerError, s"""{"error": "Erreur API: ${ex.getMessage}"}""")
          }
        }
      }
    }
  }
}



