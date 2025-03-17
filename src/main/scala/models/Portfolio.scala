package models

import spray.json.DefaultJsonProtocol
import spray.json.RootJsonFormat

case class Asset(symbol: String, quantity: Double, price: Double)
case class Portfolio(userId: Int, assets: List[Asset])


trait JsonSupport extends DefaultJsonProtocol {
  implicit val assetFormat: RootJsonFormat[Asset] = jsonFormat3(Asset)
  implicit val portfolioFormat: RootJsonFormat[Portfolio] = jsonFormat2(Portfolio)
}
