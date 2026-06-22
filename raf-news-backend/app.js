const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware");
const app = express();
const session = require("express-session");

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);
app.use(express.json());

app.use(
    session({
        secret: "raf-news-secret",
        resave: false,
        saveUninitialized: true
    })
);

app.get("/", (req, res) => {
    res.send("RAF News Backend Radi");
});

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Pogresan email ili lozinka"
                });
            }

            const user = results[0];

            if (!user.active) {

                return res.status(403).json({
                    message: "Korisnik nije aktivan"
                });

            }

            const validPassword =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!validPassword) {
                return res.status(401).json({
                    message: "Pogresan email ili lozinka"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                "moja_tajna_sifra"
            );

            res.json({
                message: "Uspesna prijava",
                token
            });

        }
    );

});

app.get(
    "/profile",
    authMiddleware,
    (req, res) => {

        res.json({
            message: "Pristup dozvoljen",
            user: req.user
        });

    }
);

app.get("/users", (req, res) => {

    db.query(
        `
        SELECT
            id,
            first_name,
            last_name,
            email,
            role,
            active
        FROM users
        `,
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

app.post(
    "/users",
    authMiddleware,
    async (req, res) => {

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Nemate dozvolu"
            });
        }

        const {
            first_name,
            last_name,
            email,
            password,
            role,
            active
        } = req.body;

        try {

            const hashedPassword =
                await bcrypt.hash(password, 10);

            db.query(
                `
                INSERT INTO users
                (
                    first_name,
                    last_name,
                    email,
                    password,
                    role,
                    active
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    first_name,
                    last_name,
                    email,
                    hashedPassword,
                    role,
                    active
                ],
                (err, result) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.json({
                        message:
                            "Korisnik uspesno dodat"
                    });

                }
            );

        } catch (err) {

            res.status(500).json(err);

        }

    }
);

app.put(
    "/users/:id",
    authMiddleware,
    (req, res) => {

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Nemate dozvolu"
            });
        }

        const { id } = req.params;

        const {
            first_name,
            last_name,
            email,
            role,
            active
        } = req.body;

        db.query(
            `
            UPDATE users
            SET
                first_name = ?,
                last_name = ?,
                email = ?,
                role = ?,
                active = ?
            WHERE id = ?
            `,
            [
                first_name,
                last_name,
                email,
                role,
                active,
                id
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Korisnik uspesno izmenjen"
                });

            }
        );

    }
);

app.delete(
    "/users/:id",
    authMiddleware,
    (req, res) => {

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Nemate dozvolu"
            });
        }

        const { id } = req.params;

        db.query(
            "DELETE FROM users WHERE id = ?",
            [id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Korisnik uspesno obrisan"
                });

            }
        );

    }
);

app.get("/categories", (req, res) => {

    db.query(
        "SELECT * FROM categories",
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

app.post(
    "/categories",
    authMiddleware,
    (req, res) => {

        const { name, description } = req.body;

        db.query(
            "INSERT INTO categories(name, description) VALUES(?, ?)",
            [name, description],
            (err, result) => {

                if (err) {

                    if (
                        err.code ===
                        "ER_DUP_ENTRY"
                    ) {
                        return res.status(400).json({
                            message:
                                "Kategorija vec postoji"
                        });
                    }

                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Kategorija uspesno dodata"
                });

            }
        );

    }
);

app.put(
    "/categories/:id",
    authMiddleware,
    (req, res) => {

        /*
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Nemate dozvolu"
            });
        }
        */

        const { id } = req.params;

        const {
            name,
            description
        } = req.body;

        db.query(
            `
            UPDATE categories
            SET
                name = ?,
                description = ?
            WHERE id = ?
            `,
            [
                name,
                description,
                id
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Kategorija uspesno izmenjena"
                });

            }
        );

    }
);

app.delete(
    "/categories/:id",
    authMiddleware,
    (req, res) => {

        /*
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Nemate dozvolu"
            });
        }
        */

        const { id } = req.params;

        db.query(
            "DELETE FROM categories WHERE id = ?",
            [id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Kategorija uspesno obrisana"
                });

            }
        );

    }
);

app.get("/news", (req, res) => {


    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    db.query(
        `
        SELECT
            news.*,
            categories.name AS category_name,
            CONCAT(
                users.first_name,
                ' ',
                users.last_name
            ) AS author_name,
            GROUP_CONCAT(tags.name) AS tags
        FROM news

        JOIN categories
            ON news.category_id = categories.id

        JOIN users
            ON news.author_id = users.id

        LEFT JOIN news_tags
            ON news.id = news_tags.news_id

        LEFT JOIN tags
            ON news_tags.tag_id = tags.id

        GROUP BY news.id

        ORDER BY news.id DESC

        LIMIT ? OFFSET ?
        `,
        [
            limit,
            offset
        ],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

app.get(
    "/news/search",
    (req, res) => {

        const { q } = req.query;

        db.query(
            `
            SELECT
                news.*,
                categories.name AS category_name,
                CONCAT(
                    users.first_name,
                    ' ',
                    users.last_name
                ) AS author_name,
                GROUP_CONCAT(tags.name) AS tags
            FROM news

            JOIN categories
                ON news.category_id = categories.id

            JOIN users
                ON news.author_id = users.id

            LEFT JOIN news_tags
                ON news.id = news_tags.news_id

            LEFT JOIN tags
                ON news_tags.tag_id = tags.id

            WHERE
                news.title LIKE ?
                OR news.content LIKE ?
                OR tags.name LIKE ?

            GROUP BY news.id

            ORDER BY news.id DESC
            `,
            [
                `%${q}%`,
                `%${q}%`,
                `%${q}%`
            ],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(results);

            }
        );

    }
);

app.post(
    "/news",
    authMiddleware,
    (req, res) => {

        const {
            title,
            content,
            category_id,
            tags
        } = req.body;

        const author_id =
            req.user.id;

        db.query(
            `
            INSERT INTO news
            (
                title,
                content,
                category_id,
                author_id
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                title,
                content,
                category_id,
                author_id
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                const newsId = result.insertId;

                const tagList = tags
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(tag => tag !== "");

                tagList.forEach(tag => {

                    db.query(
                        "INSERT IGNORE INTO tags(name) VALUES(?)",
                        [tag]
                    );

                });
                tagList.forEach(tag => {

                db.query(
                    "SELECT id FROM tags WHERE name = ?",
                    [tag],
                    (err, results) => {

                        if (err) {
                            return;
                        }

                        const tagId = results[0].id;

                        db.query(
                            `
                            INSERT IGNORE INTO news_tags
                            (
                                news_id,
                                tag_id
                            )
                            VALUES (?, ?)
                            `,
                            [
                                newsId,
                                tagId
                            ]
                        );

                    }
                );

            });

                res.json({
                    message:
                        "Vest uspesno dodata"
                });

            }
        );

    }
);

app.put(
    "/news/:id",
    authMiddleware,
    (req, res) => {

        const { id } = req.params;

        const {
            title,
            content,
            category_id,
            tags
        } = req.body;

        db.query(
            "DELETE FROM news_tags WHERE news_id = ?",
            [id],
            () => {

                const tagList = tags
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(tag => tag !== "");

                tagList.forEach(tag => {

                    db.query(
                        "INSERT IGNORE INTO tags(name) VALUES(?)",
                        [tag]
                    );

                    db.query(
                        "SELECT id FROM tags WHERE name = ?",
                        [tag],
                        (err, results) => {

                            if (err || results.length === 0) {
                                return;
                            }

                            const tagId = results[0].id;

                            db.query(
                                `
                                INSERT INTO news_tags
                                (
                                    news_id,
                                    tag_id
                                )
                                VALUES (?, ?)
                                `,
                                [id, tagId]
                            );

                        }
                    );

                });

            }
        );

        db.query(
            "SELECT * FROM news WHERE id = ?",
            [id],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "Vest ne postoji"
                    });
                }

                const news = results[0];

                if (
                    req.user.role !== "ADMIN" &&
                    news.author_id !== req.user.id
                ) {
                    return res.status(403).json({
                        message: "Nemate dozvolu"
                    });
                }

                db.query(
                    `
                    UPDATE news
                    SET
                        title = ?,
                        content = ?,
                        category_id = ?
                    WHERE id = ?
                    `,
                    [
                        title,
                        content,
                        category_id,
                        id
                    ],
                    (err, result) => {

                        if (err) {
                            return res.status(500).json(err);
                        }

                        res.json({
                            message: "Vest uspesno izmenjena"
                        });

                    }
                );

            }
        );

    }
);

app.delete(
    "/news/:id",
    authMiddleware,
    (req, res) => {

        const { id } = req.params;
        
        db.query(
            "SELECT * FROM news WHERE id = ?",
            [id],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "Vest ne postoji"
                    });
                }

                const news = results[0];

                if (
                    req.user.role !== "ADMIN" &&
                    news.author_id !== req.user.id
                ) {
                    return res.status(403).json({
                        message: "Nemate dozvolu"
                    });
                }

                db.query(
                    "DELETE FROM comments WHERE news_id = ?",
                    [id],
                    (err) => {

                        if (err) {
                            return res.status(500).json(err);
                        }

                        db.query(
                            "DELETE FROM news_tags WHERE news_id = ?",
                            [id],
                            (err) => {

                                if (err) {
                                    return res.status(500).json(err);
                                }

                                db.query(
                                    "DELETE FROM news WHERE id = ?",
                                    [id],
                                    (err, result) => {

                                        if (err) {
                                            return res.status(500).json(err);
                                        }

                                        res.json({
                                            message:
                                                "Vest uspesno obrisana"
                                        });

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);

app.patch(
    "/users/:id/status",
    authMiddleware,
    (req, res) => {

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Nemate dozvolu"
            });
        }

        const { id } = req.params;

        db.query(
            `
            UPDATE users
            SET active = NOT active
            WHERE id = ?
            `,
            [id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Status korisnika promenjen"
                });

            }
        );

    }
);

app.post("/comments", (req, res) => {

    const {
        news_id,
        author_name,
        content
    } = req.body;

    if (
        !news_id ||
        !author_name ||
        !content
    ) {
        return res.status(400).json({
            message: "Sva polja su obavezna"
        });
    }

    db.query(
        `
        INSERT INTO comments
        (
            news_id,
            author_name,
            content
        )
        VALUES (?, ?, ?)
        `,
        [
            news_id,
            author_name,
            content
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message:
                    "Komentar uspesno dodat"
            });

        }
    );

});

app.get(
    "/news/most-read",
    (req, res) => {

        db.query(
            `
            SELECT *
            FROM news
            WHERE created_at >=
                DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY views DESC
            LIMIT 10
            `,
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(results);

            }
        );

    }
);

app.get(
    "/news/:id/related",
    (req, res) => {

        const { id } = req.params;

        db.query(
            `
            SELECT DISTINCT
                n.id,
                n.title
            FROM news n

            JOIN news_tags nt
                ON n.id = nt.news_id

            WHERE nt.tag_id IN (

                SELECT tag_id
                FROM news_tags
                WHERE news_id = ?

            )

            AND n.id <> ?

            LIMIT 3
            `,
            [id, id],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(results);

            }
        );

    }
);

app.get(
    "/news/top-reactions",
    (req, res) => {

        db.query(
            `
            SELECT *,
                   (likes + dislikes)
                   AS reactions
            FROM news
            ORDER BY reactions DESC
            LIMIT 3
            `,
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(results);

            }
        );

    }
);

app.get(
    "/comments/news/:id",
    (req, res) => {

        const { id } = req.params;

        db.query(
            `
            SELECT *
            FROM comments
            WHERE news_id = ?
            ORDER BY created_at DESC
            `,
            [id],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(results);

            }
        );

    }
);

app.get(
    "/news/:id",
    (req, res) => {

        const { id } = req.params;

        if (!req.session.viewedNews) {
            req.session.viewedNews = [];
        }

        if (
            !req.session.viewedNews.includes(
                Number(id)
            )
        ) {

            req.session.viewedNews.push(
                Number(id)
            );

            db.query(
                `
                UPDATE news
                SET views = views + 1
                WHERE id = ?
                `,
                [id]
            );

        }

        db.query(
            `
            SELECT
                news.*,
                categories.name AS category_name,
                CONCAT(
                    users.first_name,
                    ' ',
                    users.last_name
                ) AS author_name,
                GROUP_CONCAT(tags.name) AS tags
            FROM news

            JOIN categories
                ON news.category_id = categories.id

            JOIN users
                ON news.author_id = users.id

            LEFT JOIN news_tags
                ON news.id = news_tags.news_id

            LEFT JOIN tags
                ON news_tags.tag_id = tags.id

            WHERE news.id = ?

            GROUP BY news.id
            `,
            [id],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "Vest nije pronađena"
                    });
                }

                res.json(results[0]);

            }
        );

    }
);

app.patch(
    "/news/:id/like",
    (req, res) => {

        if (!req.session.reactedNews) {
            req.session.reactedNews = [];
        }

        const newsId =
            Number(req.params.id);

        if (
            req.session.reactedNews.includes(
                newsId
            )
        ) {
            return res.status(400).json({
                message:
                    "Već ste reagovali na ovu vest"
            });
        }

        req.session.reactedNews.push(
            newsId
        );

        db.query(
            `
            UPDATE news
            SET likes = likes + 1
            WHERE id = ?
            `,
            [newsId],
            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Vest lajkovana"
                });

            }
        );

    }
);

app.patch(
    "/news/:id/dislike",
    (req, res) => {

        if (!req.session.reactedNews) {
            req.session.reactedNews = [];
        }

        const newsId =
            Number(req.params.id);

        if (
            req.session.reactedNews.includes(
                newsId
            )
        ) {
            return res.status(400).json({
                message:
                    "Već ste reagovali na ovu vest"
            });
        }

        req.session.reactedNews.push(
            newsId
        );

        db.query(
            `
            UPDATE news
            SET dislikes = dislikes + 1
            WHERE id = ?
            `,
            [newsId],
            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Vest dislajkovana"
                });

            }
        );

    }
);

app.patch(
    "/comments/:id/like",
    (req, res) => {

        if (!req.session.reactedComments) {
            req.session.reactedComments = [];
        }

        const commentId =
            Number(req.params.id);

        if (
            req.session.reactedComments.includes(
                commentId
            )
        ) {
            return res.status(400).json({
                message:
                    "Već ste reagovali na ovaj komentar"
            });
        }

        req.session.reactedComments.push(
            commentId
        );

        db.query(
            `
            UPDATE comments
            SET likes = likes + 1
            WHERE id = ?
            `,
            [commentId],
            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Komentar lajkovan"
                });

            }
        );

    }
);

app.patch(
    "/comments/:id/dislike",
    (req, res) => {

        if (!req.session.reactedComments) {
            req.session.reactedComments = [];
        }

        const commentId =
            Number(req.params.id);

        if (
            req.session.reactedComments.includes(
                commentId
            )
        ) {
            return res.status(400).json({
                message:
                    "Već ste reagovali na ovaj komentar"
            });
        }

        req.session.reactedComments.push(
            commentId
        );

        db.query(
            `
            UPDATE comments
            SET dislikes = dislikes + 1
            WHERE id = ?
            `,
            [commentId],
            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message:
                        "Komentar dislajkovan"
                });

            }
        );

    }
);

app.get(
    "/news/tag/:tag",
    (req, res) => {

        const { tag } = req.params;

        db.query(
            `
            SELECT
                news.*,
                categories.name AS category_name,
                CONCAT(
                    users.first_name,
                    ' ',
                    users.last_name
                ) AS author_name,
                GROUP_CONCAT(tags.name) AS tags
            FROM news

            JOIN categories
                ON news.category_id = categories.id

            JOIN users
                ON news.author_id = users.id

            JOIN news_tags
                ON news.id = news_tags.news_id

            JOIN tags
                ON news_tags.tag_id = tags.id

            WHERE news.id IN (
                SELECT news_tags.news_id
                FROM news_tags
                JOIN tags
                    ON news_tags.tag_id = tags.id
                WHERE tags.name = ?
            )

            GROUP BY news.id
            `,
            [tag],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(results);

            }
        );

    }
);

app.listen(3000, () => {
    console.log(
        "Server radi na portu 3000"
    );
});