package services

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.util.Timeout
import actors.{AddAsset, GetPortfolio, PortfolioActor, PortfolioCommand, RemoveAsset}
import models.Portfolio

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import java.time.LocalDate
import scala.math.{sqrt, pow}

class PortfolioService(
                        portfolioActor: ActorRef[PortfolioCommand],
                        dbService: DatabaseService,
                        marketService: MarketService
                      )(implicit ec: ExecutionContext, system: ActorSystem[_]) {

  private implicit val timeout: Timeout = 5.seconds

  /** ✅ Ajouter un actif */
  def addAsset(userId: Int, symbol: String, quantity: Double): Future[String] = {
    portfolioActor.ask(replyTo => AddAsset(userId, symbol, quantity, replyTo))
  }

  /** ✅ Supprimer un actif */
  def removeAsset(userId: Int, symbol: String): Future[String] = {
    portfolioActor.ask(replyTo => RemoveAsset(userId, symbol, replyTo))
  }

  /** ✅ Récupérer le portefeuille */
  def getPortfolio(userId: Int): Future[Portfolio] = {
    portfolioActor.ask(replyTo => GetPortfolio(userId, replyTo))
  }

  /** ✅ Enregistrer la valeur quotidienne du portefeuille */
  def saveDailyPortfolioValue(userId: Int, value: Double): Future[Unit] = {
    dbService.savePortfolioHistory(userId, value).map(_ => ())
  }

  /** ✅ Calcul de la volatilité */
  def calculateVolatility(userId: Int): Future[Double] = {
    dbService.getDailyReturns(userId).map { returns =>
      if (returns.isEmpty) 0.0
      else {
        val mean = returns.sum / returns.length
        val variance = returns.map(r => pow(r - mean, 2)).sum / returns.length
        sqrt(variance)
      }
    }
  }

  /** ✅ Calcul RSI */
  def calculateRSI(symbol: String): Future[Double] = {
    marketService.getCryptoHistoricalPrices(symbol, 14).map { prices =>
      if (prices.length < 2) return Future.successful(50.0)

      val gains = prices.sliding(2).collect { case List(a, b) if b > a => b - a }.toList
      val losses = prices.sliding(2).collect { case List(a, b) if b < a => a - b }.toList

      val avgGain = if (gains.nonEmpty) gains.sum / gains.length else 0.0
      val avgLoss = if (losses.nonEmpty) losses.sum / losses.length else 0.0

      val rs = if (avgLoss == 0) Double.MaxValue else avgGain / avgLoss
      100 - (100 / (1 + rs))
    }
  }



  /** ✅ Calcul MACD */
  def calculateMACD(symbol: String): Future[Double] = {
    marketService.getCryptoHistoricalPrices(symbol, 26).map { prices =>
      if (prices.length < 26) return Future.successful(0.0)

      val ema12 = calculateEMA(prices.takeRight(12), 12)
      val ema26 = calculateEMA(prices, 26)
      ema12 - ema26
    }
  }

  /** ✅ Calcul EMA */
  private def calculateEMA(prices: List[Double], period: Int): Double = {
    val smoothing = 2.0 / (period + 1)
    prices.foldLeft(prices.head)((ema, price) => (price - ema) * smoothing + ema)
  }
}





