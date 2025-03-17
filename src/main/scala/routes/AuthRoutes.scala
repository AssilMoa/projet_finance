package routes

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.model.StatusCodes
import services.DatabaseService
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class AuthRoutes(db: DatabaseService)(implicit ec: ExecutionContext) {
  val routes = pathPrefix("auth") {
    path("register") {
      post {
        parameters("firstName", "lastName", "email", "password") { (firstName, lastName, email, password) =>
          val saveUser = db.addUser(firstName, lastName, email, password)
          onComplete(saveUser) {
            case Success(_) => complete(StatusCodes.Created, "✅ Inscription réussie")
            case Failure(_) => complete(StatusCodes.Conflict, "❌ Email déjà utilisé")
          }
        }
      }
    } ~
      path("login") {
        post {
          parameters("email", "password") { (email, password) =>
            val user = db.getUser(email, password)
            onComplete(user) {
              case Success(Some(u)) =>
                complete(StatusCodes.OK, s"""{"userId": ${u.id}, "name": "${u.firstName} ${u.lastName}"}""") // 🔥 Correction ici
              case _ => complete(StatusCodes.Unauthorized, """{"error": "❌ Identifiants incorrects"}""")
            }
          }
        }
      }
  } ~
    pathPrefix("api") {
      path("user" / IntNumber) { userId =>
        get {
          val userFuture = db.getUserById(userId)
          onComplete(userFuture) {
            case Success(Some(user)) =>
              complete(StatusCodes.OK, s"""{"id": ${user.id}, "firstName": "${user.firstName}", "lastName": "${user.lastName}", "email": "${user.email}"}""")
            case _ => complete(StatusCodes.NotFound, """{"error": "❌ Utilisateur introuvable"}""")
          }
        }
      }
    }
}
