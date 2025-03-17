package services

import akka.actor.ActorSystem
import akka.stream.scaladsl.{Source, BroadcastHub, Keep}
import akka.stream.{Materializer, OverflowStrategy}
import scala.concurrent.ExecutionContext

case class PortfolioUpdate(symbol: String, newPrice: Double)

class PortfolioStreamService(marketService: MarketService)(implicit system: ActorSystem, mat: Materializer, ec: ExecutionContext) {

  private val (queue, source) = Source.queue[PortfolioUpdate](bufferSize = 10, OverflowStrategy.dropHead)
    .toMat(BroadcastHub.sink[PortfolioUpdate])(Keep.both)
    .run()

  def publishUpdate(update: PortfolioUpdate): Unit = queue.offer(update)

  def getPortfolioUpdates(userId: Int): Source[PortfolioUpdate, Any] = source
}

