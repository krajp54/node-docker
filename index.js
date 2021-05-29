const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");

const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_IP,
    MONGO_PORT,
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET,
} = require("./config/config");

let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
});

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

/*
 * Para las conexiones de la base de datos podemos hacer uso del
 * DNS interno de la red en Docker que se crea junto al comando
 * "docker-compose", a traves del nombre de los servicios declarados
 * en el archivo .yml
 */
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

/*
 * En este caso, debido a que Docker ni un gestor como Kubernetes puede
 * manejar que el contenedor de la base de datos este totalmente listo para
 * ser usado, debemos brindarle dicha caracteristica a nuestra aplicacion
 * con la finalidad de evitar posibles errores
 */
const connectWithRetry = () => {
    mongoose
        .connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })
        .then(() => {
            console.log("Successfully connected to database");
        })
        .catch((err) => {
            console.log(err);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

app.enable("trust proxy");

app.use(cors({}));
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: SESSION_SECRET,
        cookie: {
            secure: false,
            resave: false,
            saveUninitialize: false,
            httpOnly: true,
            maxAge: 60000,
        },
    })
);

app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.send("<h1>Hello JP from a production enviroment</h1>");
    console.log("hi there");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
