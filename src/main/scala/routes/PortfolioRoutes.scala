package routes

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import services.{DatabaseService, MarketService}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}
import spray.json._
import java.time.format.DateTimeFormatter
import scala.math.{pow, sqrt}

// Modèle JSON pour un actif du portefeuille avec performance
case class PortfolioResponse(symbol: String, quantity: Double, priceBought: Double, priceNow: Double, performance: Double)

// Format JSON pour la réponse des actifs
trait PortfolioJsonProtocol extends DefaultJsonProtocol {
  implicit val portfolioFormat: RootJsonFormat[PortfolioResponse] = jsonFormat5(PortfolioResponse)
}

class PortfolioRoutes(db: DatabaseService, marketService: MarketService)(implicit ec: ExecutionContext)
  extends PortfolioJsonProtocol {

  val dateFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

  val routes: Route = pathPrefix("portfolio") {

    concat(
      // Récupérer le portefeuille avec les prix mis à jour et calculer les performances
      path("get") {
        get {
          parameters("userId".as[Int]) { userId =>
            println(s"Récupération du portefeuille pour userId=$userId")

            val portfolioFuture = db.getPortfolio(userId)

            onComplete(portfolioFuture) {
              case Success(assets) if assets.nonEmpty =>
                println(s"Actifs trouvés pour userId=$userId : $assets")

                // Enrichir les actifs avec les prix et performances
                val enrichedAssetsFutures: Seq[Future[PortfolioResponse]] = assets.map { asset =>
                  marketService.getCryptoPrice(asset.assetSymbol).map {
                    case Some(priceNow) =>
                      val performance = ((priceNow - asset.price) / asset.price) * 100 // Calcul du gain/perte en %
                      PortfolioResponse(asset.assetSymbol, asset.quantity, asset.price, priceNow, performance)

                    case None =>
                      PortfolioResponse(asset.assetSymbol, asset.quantity, asset.price, asset.price, 0.0)
                  }
                }

                // Attendre toutes les réponses et envoyer la réponse finale
                val finalResponse: Future[List[PortfolioResponse]] = Future.sequence(enrichedAssetsFutures).map(_.toList)
                onSuccess(finalResponse) { response =>
                  complete(response)
                }

              case Success(_) =>
                println(s"Aucun actif trouvé pour userId=$userId")
                complete(StatusCodes.NotFound, "Aucun actif trouvé dans le portefeuille")

              case Failure(ex) =>
                println(s"Erreur récupération portefeuille: ${ex.getMessage}")
                complete(StatusCodes.InternalServerError, "Erreur récupération portefeuille")
            }
          }
        }
      },

      // Ajouter un actif avec CoinGecko et stocker le prix d'achat
      path("add") {
        post {
          parameters("userId".as[Int], "symbol", "quantity".as[Double]) { (userId, symbol, quantity) =>
            println(s"Ajout d'un actif pour userId=$userId : $symbol ($quantity unités)")

            val priceFuture = marketService.getCryptoPrice(symbol)

            val addAssetFuture = priceFuture.flatMap {
              case Some(price) =>
                println(s"Prix récupéré pour $symbol: $price USD")
                db.addAsset(userId, symbol, quantity, price)
              case None =>
                println(s"Impossible d'obtenir le prix pour $symbol.")
                Future.failed(new Exception(s"Prix introuvable pour $symbol"))
            }

            onComplete(addAssetFuture) {
              case Success(_) =>
                println(s"Actif $symbol ajouté avec succès pour userId=$userId")
                complete(StatusCodes.OK, "Actif ajouté")

              case Failure(ex) =>
                println(s"Erreur ajout actif: ${ex.getMessage}")
                complete(StatusCodes.InternalServerError, "Erreur ajout actif")
            }
          }
        }
      },

      // Supprimer un actif du portefeuille
      path("remove") {
        delete {
          parameters("userId".as[Int], "symbol") { (userId, symbol) =>
            println(s"Suppression de l'actif $symbol pour userId=$userId")

            val removeAssetFuture = db.removeAsset(userId, symbol)

            onComplete(removeAssetFuture) {
              case Success(_) =>
                println(s"Actif $symbol supprimé pour userId=$userId")
                complete(StatusCodes.OK, s"Actif $symbol retiré du portefeuille.")

              case Failure(ex) =>
                println(s"Erreur suppression actif: ${ex.getMessage}")
                complete(StatusCodes.InternalServerError, "Erreur suppression actif")
            }
          }
        }
      },

      // Calcul de la volatilité des rendements quotidiens
      path("volatility") {
        get {
          parameters("userId".as[Int]) { userId =>
            val volatilityFuture = db.getDailyReturns(userId).map { returns =>
              if (returns.isEmpty) 0.0
              else {
                val mean = returns.sum / returns.length
                val variance = returns.map(r => pow(r - mean, 2)).sum / returns.length
                sqrt(variance)
              }
            }
            onComplete(volatilityFuture) {
              case Success(volatility) => complete(volatility.toString)
              case Failure(ex) => complete(StatusCodes.InternalServerError, s"Erreur : ${ex.getMessage}")
            }
          }
        }
      },

      // Calcul du Sharpe Ratio
      path("sharpe-ratio") {
        get {
          parameters("userId".as[Int], "riskFreeRate".as[Double]) { (userId, riskFreeRate) =>
            val sharpeRatioFuture = db.getDailyReturns(userId).map { returns =>
              if (returns.isEmpty) 0.0
              else {
                val meanReturn = returns.sum / returns.length
                val variance = returns.map(r => pow(r - meanReturn, 2)).sum / returns.length
                val stdDev = sqrt(variance)
                if (stdDev == 0) 0.0 else (meanReturn - riskFreeRate) / stdDev
              }
            }
            onComplete(sharpeRatioFuture) {
              case Success(sharpeRatio) => complete(sharpeRatio.toString)
              case Failure(ex) => complete(StatusCodes.InternalServerError, s"Erreur : ${ex.getMessage}")
            }
          }
        }
      }
    )
  }
}




















