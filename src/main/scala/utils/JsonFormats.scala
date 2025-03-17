package utils

import spray.json._
import services.PortfolioUpdate

// 🔥 Définition du format JSON pour PortfolioUpdate
trait JsonFormats extends DefaultJsonProtocol {
  implicit val portfolioUpdateFormat: RootJsonFormat[PortfolioUpdate] = jsonFormat2(PortfolioUpdate)
}

// ✅ Objet qui hérite du format JSON
object JsonFormats extends JsonFormats
