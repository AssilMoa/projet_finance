package services

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.HttpRequest
import akka.http.scaladsl.unmarshalling.Unmarshal
import spray.json._
import scala.concurrent.{ExecutionContext, Future}

// ✅ Modèle JSON pour CoinGecko
case class CryptoPriceResponse(usd: Double)
case class MarketChartResponse(prices: List[List[Double]]) // 📌 Réponse pour les prix historiques
case class MarketData(name: String, symbol: String, current_price: Double, price_change_percentage_24h: Double, total_volume: Double)

object JsonSupport extends DefaultJsonProtocol {
  implicit val cryptoPriceFormat: RootJsonFormat[CryptoPriceResponse] = jsonFormat1(CryptoPriceResponse)
  implicit val marketChartFormat: RootJsonFormat[MarketChartResponse] = jsonFormat1(MarketChartResponse)
  implicit val marketDataFormat: RootJsonFormat[MarketData] = jsonFormat5(MarketData)
}

class MarketService()(implicit system: ActorSystem, ec: ExecutionContext) {
  import JsonSupport._

  private val coingeckoUrl = "https://api.coingecko.com/api/v3/simple/price"
  private val coingeckoBaseUrl = "https://api.coingecko.com/api/v3"

  // ✅ Fonction pour formater les symboles CoinGecko
  private def formatSymbol(symbol: String): String = symbol.toLowerCase.replace("-", "")

  // ✅ 📌 Récupérer le prix actuel d'une crypto en USD (Fonction EXISTANTE - NE PAS TOUCHER)
  def getCryptoPrice(symbol: String): Future[Option[Double]] = {
    val formattedSymbol = formatSymbol(symbol)
    val url = s"$coingeckoUrl?ids=$formattedSymbol&vs_currencies=usd"

    println(s"📡 Requête envoyée à CoinGecko : $url")

    Http().singleRequest(HttpRequest(uri = url)).flatMap { response =>
      Unmarshal(response.entity).to[String].map { jsonString =>
        println(s"📥 Réponse JSON brute : $jsonString")
        try {
          val json = jsonString.parseJson.asJsObject
          json.fields.get(formattedSymbol).flatMap { coinData =>
            coinData.convertTo[JsObject].fields.get("usd").map(_.convertTo[Double])
          }
        } catch {
          case ex: Exception =>
            println(s"❌ Erreur parsing JSON : ${ex.getMessage}")
            None
        }
      }
    }.recover { case ex =>
      println(s"❌ Erreur connexion API : ${ex.getMessage}")
      None
    }
  }

  // ✅ 📊 Calculer la performance en % d'un actif (Fonction EXISTANTE - NE PAS TOUCHER)
  def getPerformance(symbol: String, priceBought: Double): Future[Option[Double]] = {
    getCryptoPrice(symbol).map {
      case Some(priceNow) =>
        val performance = ((priceNow - priceBought) / priceBought) * 100
        println(s"📊 Performance de $symbol : $performance %")
        Some(performance)
      case None =>
        println(s"⚠️ Impossible d'obtenir le prix actuel pour $symbol")
        None
    }
  }

  // ✅ 📈 Récupérer les prix historiques d'une crypto sur X jours (NOUVEAU)
  def getCryptoHistoricalPrices(symbol: String, days: Int): Future[List[Double]] = {
    val formattedSymbol = formatSymbol(symbol)
    val url = s"$coingeckoBaseUrl/coins/$formattedSymbol/market_chart?vs_currency=usd&days=$days"

    println(s"📡 Requête API : $url")

    Http().singleRequest(HttpRequest(uri = url)).flatMap { response =>
      Unmarshal(response.entity).to[String].map { jsonString =>
        try {
          val json = jsonString.parseJson.asJsObject
          val prices = json.fields("prices").convertTo[List[List[Double]]]
          prices.map(_(1)) // 📈 Extraire uniquement les prix
        } catch {
          case ex: Exception =>
            println(s"❌ Erreur parsing JSON : ${ex.getMessage}")
            List.empty[Double]
        }
      }
    }.recover { case ex =>
      println(s"❌ Erreur connexion API : ${ex.getMessage}")
      List.empty[Double]
    }
  }

  // ✅ 🔥 Calculer la performance d'un actif sur une période donnée (NOUVEAU)
  def getPerformanceOverTime(symbol: String, days: Int): Future[Option[Double]] = {
    getCryptoHistoricalPrices(symbol, days).map { prices =>
      if (prices.length >= 2) {
        val startPrice = prices.head
        val endPrice = prices.last
        val performance = ((endPrice - startPrice) / startPrice) * 100
        println(s"📊 Performance de $symbol sur $days jours : $performance %")
        Some(performance)
      } else {
        println(s"⚠️ Pas assez de données pour calculer la performance de $symbol")
        None
      }
    }
  }

  // ✅ 🌍 Récupérer les tendances du marché (Top cryptos avec variations) (NOUVEAU)
  def getMarketTrends(): Future[List[MarketData]] = {
    val url = s"$coingeckoBaseUrl/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1"

    println(s"📡 Récupération des tendances du marché via : $url")

    Http().singleRequest(HttpRequest(uri = url)).flatMap { response =>
      Unmarshal(response.entity).to[String].map { jsonString =>
        try {
          jsonString.parseJson.convertTo[List[MarketData]]
        } catch {
          case ex: Exception =>
            println(s"❌ Erreur parsing JSON : ${ex.getMessage}")
            List.empty[MarketData]
        }
      }
    }.recover { case ex =>
      println(s"❌ Erreur connexion API : ${ex.getMessage}")
      List.empty[MarketData]
    }
  }
}



