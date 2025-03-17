package services

import scala.concurrent.{ExecutionContext, Future}
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.unmarshalling.Unmarshal
import spray.json._

object AlphaVantageService extends DefaultJsonProtocol {
  implicit val system: ActorSystem = ActorSystem()
  implicit val executionContext: ExecutionContext = system.dispatcher

  val apiKey = "TECTRYGEK7K3ORHX" // 🔥 Remplace avec ta clé Alpha Vantage

  // ✅ Obtenir le prix d'une action
  def getStockPrice(symbol: String): Future[Double] = {
    val url = s"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=$symbol&apikey=$apiKey"

    Http().singleRequest(HttpRequest(uri = url)).flatMap { response =>
      Unmarshal(response.entity).to[String].map { jsonString =>
        val json = jsonString.parseJson.asJsObject
        val price = json.fields.get("Global Quote").flatMap(_.asJsObject.fields.get("05. price"))
        price.map(_.convertTo[String].toDouble).getOrElse(0.0)
      }
    }
  }

  // ✅ Obtenir le prix d'une crypto-monnaie
  def getCryptoPrice(symbol: String): Future[Double] = {
    val url = s"https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=$symbol&to_currency=USD&apikey=$apiKey"

    Http().singleRequest(HttpRequest(uri = url)).flatMap { response =>
      Unmarshal(response.entity).to[String].map { jsonString =>
        val json = jsonString.parseJson.asJsObject
        val price = json.fields.get("Realtime Currency Exchange Rate").flatMap(_.asJsObject.fields.get("5. Exchange Rate"))
        price.map(_.convertTo[String].toDouble).getOrElse(0.0)
      }
    }
  }
}

