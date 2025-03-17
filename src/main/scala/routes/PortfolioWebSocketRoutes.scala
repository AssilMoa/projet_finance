package routes

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Route
import akka.stream.scaladsl.Flow
import services.{DatabaseService, PortfolioStreamService}
import spray.json._
import utils.JsonFormats  // ✅ Import du format JSON

import scala.concurrent.ExecutionContext

class PortfolioWebSocketRoutes(db: DatabaseService, portfolioStreamService: PortfolioStreamService)(implicit ec: ExecutionContext) extends JsonFormats {

  val routes: Route = pathPrefix("portfolio") {
    path("stream") {
      parameter("userId".as[Int]) { userId =>
        handleWebSocketMessages(streamPortfolio(userId))
      }
    }
  }

  // ✅ Fonction qui gère le flux WebSocket
  private def streamPortfolio(userId: Int): Flow[Message, Message, Any] = {
    val source = portfolioStreamService.getPortfolioUpdates(userId)

    // ✅ Transformation correcte en JSON
    val flow = source.map(update => TextMessage(update.toJson.compactPrint))

    Flow.fromSinkAndSource(akka.stream.scaladsl.Sink.ignore, flow)
  }
}


