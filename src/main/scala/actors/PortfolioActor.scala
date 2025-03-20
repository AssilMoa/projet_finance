package actors

import akka.actor.typed.{ActorRef, Behavior}
import akka.actor.typed.scaladsl.{Behaviors, LoggerOps}
import models._
import services.MarketService

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

// Définition des commandes pour Akka Typed
sealed trait PortfolioCommand
case class AddAsset(userId: Int, symbol: String, quantity: Double, replyTo: ActorRef[String]) extends PortfolioCommand
case class RemoveAsset(userId: Int, symbol: String, replyTo: ActorRef[String]) extends PortfolioCommand
case class GetPortfolio(userId: Int, replyTo: ActorRef[Portfolio]) extends PortfolioCommand
private case class PriceResponse(userId: Int, symbol: String, quantity: Double, price: Option[Double], replyTo: ActorRef[String]) extends PortfolioCommand

// Acteur gérant le portefeuille des utilisateurs
object PortfolioActor {
  private val portfolios: mutable.Map[Int, Portfolio] = mutable.Map()

  def apply(marketService: MarketService)(implicit ec: ExecutionContext): Behavior[PortfolioCommand] = Behaviors.setup { context =>
    Behaviors.receiveMessage {
      case AddAsset(userId, symbol, quantity, replyTo) =>
        context.log.info(s"Demande d'ajout d'actif : $symbol ($quantity unités) pour userId=$userId")

        // Vérifie que l'API de prix fonctionne bien
        val priceFuture: Future[Option[Double]] = marketService.getCryptoPrice(symbol)

        priceFuture.onComplete {
          case Success(Some(price)) =>
            context.self ! PriceResponse(userId, symbol, quantity, Some(price), replyTo)
          case Success(None) =>
            context.log.error(s"Prix introuvable pour $symbol.")
            replyTo ! s"Impossible de récupérer le prix pour $symbol."
          case Failure(ex) =>
            context.log.error(s"Erreur lors de la récupération du prix pour $symbol : ${ex.getMessage}")
            replyTo ! s"Erreur API lors de la récupération du prix pour $symbol."
        }
        Behaviors.same

      case PriceResponse(userId, symbol, quantity, Some(price), replyTo) =>
        val asset = Asset(symbol, quantity, price)

        // Mise à jour correcte du portefeuille
        val updatedPortfolio = portfolios.get(userId) match {
          case Some(portfolio) => portfolio.copy(assets = asset :: portfolio.assets)
          case None            => Portfolio(userId, List(asset))
        }

        portfolios.update(userId, updatedPortfolio)
        context.log.info(s"Ajouté $quantity unités de $symbol à $price USD pour userId=$userId")
        replyTo ! s"Ajouté $quantity unités de $symbol ($price USD) pour $userId."

        Behaviors.same

      case RemoveAsset(userId, symbol, replyTo) =>
        portfolios.get(userId) match {
          case Some(portfolio) =>
            val updatedAssets = portfolio.assets.filterNot(_.symbol == symbol)
            portfolios.update(userId, portfolio.copy(assets = updatedAssets))
            context.log.info(s"Actif $symbol supprimé pour userId=$userId")
            replyTo ! s"Actif $symbol supprimé pour userId=$userId."

          case None =>
            context.log.warn(s"Aucun portefeuille trouvé pour userId=$userId")
            replyTo ! s"Aucun portefeuille trouvé pour userId=$userId."
        }
        Behaviors.same

      case GetPortfolio(userId, replyTo) =>
        val portfolio = portfolios.getOrElse(userId, Portfolio(userId, List()))
        context.log.info(s"Envoi du portefeuille de userId=$userId: $portfolio")
        replyTo ! portfolio

        Behaviors.same
    }
  }
}

