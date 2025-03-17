package services

import slick.jdbc.PostgresProfile.api._
import scala.concurrent.{ExecutionContext, Future}
import java.time.{LocalDateTime, LocalDate}
import java.sql.Timestamp

// Modèles de données
case class User(id: Int, firstName: String, lastName: String, email: String, password: String)
case class Portfolio(id: Int, userId: Int, assetSymbol: String, quantity: Double, price: Double, transactionDate: LocalDateTime)
case class PortfolioHistory(userId: Int, date: LocalDate, value: Double)

class DatabaseService(implicit ec: ExecutionContext) {
  val db = Database.forURL(
    url = "jdbc:postgresql://localhost/project_app",
    user = "postgres",
    password = "root",
    driver = "org.postgresql.Driver"
  )

  // Table des utilisateurs
  class UsersTable(tag: Tag) extends Table[User](tag, "users") {
    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def firstName = column[String]("first_name")
    def lastName = column[String]("last_name")
    def email = column[String]("email", O.Unique)
    def password = column[String]("password")
    def * = (id, firstName, lastName, email, password) <> (User.tupled, User.unapply)
  }

  // Table des portefeuilles
  class PortfoliosTable(tag: Tag) extends Table[Portfolio](tag, "portfolios") {
    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def userId = column[Int]("user_id")
    def assetSymbol = column[String]("asset_symbol")
    def quantity = column[Double]("quantity")
    def price = column[Double]("price")
    def transactionDate = column[Timestamp]("transaction_date")

    def * = (id, userId, assetSymbol, quantity, price, transactionDate).<>(
      { case (id, userId, symbol, quantity, price, timestamp) =>
        Portfolio(id, userId, symbol, quantity, price, timestamp.toLocalDateTime)
      },
      { portfolio: Portfolio =>
        Some((portfolio.id, portfolio.userId, portfolio.assetSymbol, portfolio.quantity, portfolio.price, Timestamp.valueOf(portfolio.transactionDate)))
      }
    )
  }

  // Table pour stocker les valeurs historiques du portefeuille
  class PortfolioHistoryTable(tag: Tag) extends Table[PortfolioHistory](tag, "portfolio_history") {
    def userId = column[Int]("user_id")
    def date = column[LocalDate]("date")
    def value = column[Double]("value")

    def * = (userId, date, value) <> (PortfolioHistory.tupled, PortfolioHistory.unapply)
  }

  val users = TableQuery[UsersTable]
  val portfolios = TableQuery[PortfoliosTable]
  val portfolioHistory = TableQuery[PortfolioHistoryTable]

  // 🔥 Création des tables si elles n'existent pas
  def createTables(): Future[Unit] = {
    println("📌 Vérification et création des tables si nécessaire...")
    db.run((users.schema ++ portfolios.schema ++ portfolioHistory.schema).createIfNotExists)
  }

  // ✅ Ajouter un utilisateur
  def addUser(firstName: String, lastName: String, email: String, password: String): Future[Int] = {
    println(s"📌 Ajout de l'utilisateur: $email")
    db.run(users += User(0, firstName, lastName, email, password))
  }

  // ✅ Vérifier les identifiants pour le login
  def getUser(email: String, password: String): Future[Option[User]] = {
    println(s"🔍 Recherche de l'utilisateur: $email")
    db.run(users.filter(u => u.email === email && u.password === password).result.headOption)
  }

  // ✅ Récupérer un utilisateur via son ID
  def getUserById(userId: Int): Future[Option[User]] = {
    println(s"🔍 Récupération de l'utilisateur avec ID: $userId")
    db.run(users.filter(_.id === userId).result.headOption)
  }

  // ✅ Ajouter un actif au portefeuille
  def addAsset(userId: Int, symbol: String, quantity: Double, price: Double): Future[Int] = {
    val transactionTime = LocalDateTime.now()
    println(s"📌 Ajout d'un actif: userId=$userId, symbol=$symbol, quantity=$quantity, price=$price, date=$transactionTime")

    db.run(portfolios += Portfolio(0, userId, symbol, quantity, price, transactionTime))
      .recover { case ex =>
        println(s"❌ Erreur lors de l'ajout d'un actif: ${ex.getMessage}")
        0
      }
  }

  // ✅ Récupérer le portefeuille d'un utilisateur
  def getPortfolio(userId: Int): Future[Seq[Portfolio]] = {
    println(s"📌 Récupération du portefeuille pour userId=$userId")
    db.run(portfolios.filter(_.userId === userId).result)
  }

  // ✅ Supprimer un actif du portefeuille
  def removeAsset(userId: Int, symbol: String): Future[Int] = {
    println(s"🗑️ Suppression de l'actif: userId=$userId, symbol=$symbol")
    db.run(portfolios.filter(a => a.userId === userId && a.assetSymbol === symbol).delete)
      .recover { case ex =>
        println(s"❌ Erreur lors de la suppression de l'actif: ${ex.getMessage}")
        0
      }
  }

  // ✅ Sauvegarde de l'historique du portefeuille
  def savePortfolioHistory(userId: Int, value: Double): Future[Int] = {
    val today = LocalDate.now()
    println(s"📊 Sauvegarde de la valeur du portefeuille pour userId=$userId | Date: $today | Valeur: $value")

    val insertQuery = portfolioHistory += PortfolioHistory(userId, today, value)
    db.run(insertQuery)
  }

  // ✅ Récupération des rendements quotidiens pour l'analyse de volatilité
  def getDailyReturns(userId: Int): Future[Seq[Double]] = {
    println(s"📊 Récupération des rendements quotidiens pour userId=$userId")

    val query = portfolioHistory
      .filter(_.userId === userId)
      .sortBy(_.date.asc)
      .map(_.value)
      .result

    db.run(query).map { values =>
      values.sliding(2).collect {
        case Seq(previous, current) if previous != 0 => (current - previous) / previous
      }.toSeq
    }
  }
}






