import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

function NewsDetails() {

    const { id } = useParams();

    const [news, setNews] = useState(null);

    const [comments, setComments] = useState([]);

    const [authorName, setAuthorName] = useState("");
    const [commentContent, setCommentContent] = useState("");

    const isLoggedIn =
        !!localStorage.getItem("token");
    
    const [loggedUserName, setLoggedUserName] =
    useState("");

    const [relatedNews, setRelatedNews] =
    useState([]);

    useEffect(() => {

        axios
            .get(
                `http://localhost:3000/news/${id}`,
                {
                    withCredentials: true
                }
            )
            .then(res => {
                setNews(res.data);
            });

        axios
            .get(
                `http://localhost:3000/comments/news/${id}`
            )
            .then(res => {
                setComments(res.data);
            });
        axios
            .get(
                `http://localhost:3000/news/${id}/related`
            )
            .then(res => {
                setRelatedNews(res.data);
            });       
        if (isLoggedIn) {

            const payload =
                JSON.parse(
                    atob(
                        localStorage
                            .getItem("token")
                            .split(".")[1]
                    )
                );

            setLoggedUserName(
                payload.first_name +
                " " +
                payload.last_name
            );

        }

    }, [id]);

    const addComment = async () => {

        try {

            await axios.post(
                "http://localhost:3000/comments",
                {
                    news_id: id,
                    author_name: isLoggedIn
                        ? loggedUserName
                        : authorName,
                    content: commentContent
                }
            );

            setAuthorName("");
            setCommentContent("");

            const response = await axios.get(
                `http://localhost:3000/comments/news/${id}`
            );

            setComments(response.data);

        } catch (error) {

            alert("Greska");

        }

    };

    const likeNews = async () => {

        try {

            await axios.patch(
                `http://localhost:3000/news/${id}/like`,
                {},
                {
                    withCredentials: true
                }
            );

            const response = await axios.get(
                `http://localhost:3000/news/${id}`,
                {
                    withCredentials: true
                }
            );

            setNews(response.data);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Greška"
            );

        }

    };

    const dislikeNews = async () => {

        try {

            await axios.patch(
                `http://localhost:3000/news/${id}/dislike`,
                {},
                {
                    withCredentials: true
                }
            );

            const response = await axios.get(
                `http://localhost:3000/news/${id}`,
                {
                    withCredentials: true
                }
            );

            setNews(response.data);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Greška"
            );

        }

    };

    const likeComment = async (commentId) => {

        try {

            await axios.patch(
                `http://localhost:3000/comments/${commentId}/like`,
                {},
                {
                    withCredentials: true
                }
            );

            const response = await axios.get(
                `http://localhost:3000/comments/news/${id}`
            );

            setComments(response.data);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Greska"
            );

        }

    };

    const dislikeComment = async (commentId) => {

        try {

            await axios.patch(
                `http://localhost:3000/comments/${commentId}/dislike`,
                {},
                {
                    withCredentials: true
                }
            );

            const response = await axios.get(
                `http://localhost:3000/comments/news/${id}`
            );

            setComments(response.data);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Greska"
            );

        }

    };

    if (!news) {
        return <h2>Učitavanje...</h2>;
    }

    return (
        <>
            <Navbar />

            <div style={{ padding: "40px" }}>

            <h1>{news.title}</h1>

            <p>{news.content}</p>

            <p>
                <b>Autor:</b> {news.author_name}
            </p>

            <p>
                <b>Kategorija:</b> {news.category_name}
            </p>

            <p>
                <b>Objavljeno:</b>{" "}
                {new Date(news.created_at)
                    .toLocaleString("sr-RS")}
            </p>

            <p>
                <b>Pregledi:</b> {news.views}
            </p>

            <p>
                👍 {news.likes}
                {"  "}
                👎 {news.dislikes}
            </p>

            <button onClick={likeNews}>
                Like
            </button>

            {" "}

            <button onClick={dislikeNews}>
                Dislike
            </button>

            <p>
                <b>Tagovi:</b> {news.tags}
            </p>

            <hr />

            <h2>Komentari</h2>

            {comments.length === 0 ? (
                <p>Nema komentara.</p>
            ) : (
                comments.map(comment => (

                    <div key={comment.id}>

                        <p>
                            <b>
                                {comment.author_name}
                            </b>
                        </p>

                        <p>
                            {comment.content}
                        </p>
                        <p>
                            👍 {comment.likes}
                            {" "}
                            👎 {comment.dislikes}
                        </p>

                        <button
                            onClick={() => likeComment(comment.id)}
                        >
                            Like
                        </button>

                        {" "}

                        <button
                            onClick={() => dislikeComment(comment.id)}
                        >
                            Dislike
                        </button>                        

                        <p>
                            {new Date(
                                comment.created_at
                            ).toLocaleString("sr-RS")}
                        </p>

                        <hr />

                    </div>

                ))
            )}

            <h2>Dodaj komentar</h2>

            {!isLoggedIn && (
                <>
                    <input
                        type="text"
                        placeholder="Ime"
                        value={authorName}
                        onChange={(e) =>
                            setAuthorName(e.target.value)
                        }
                    />

                    <br /><br />
                </>
            )}
            <br /><br />

            <textarea
                placeholder="Komentar"
                value={commentContent}
                onChange={(e) =>
                    setCommentContent(e.target.value)
                }
            />

            <br /><br />

            <button onClick={addComment}>
                Dodaj komentar
            </button>

            <hr />

            <h2>Pročitaj još...</h2>

            {relatedNews.length === 0 ? (

                <p>Nema povezanih vesti.</p>

            ) : (

                relatedNews.map(item => (

                    <div key={item.id}>

                        <Link
                            to={`/news/${item.id}`}
                        >
                            {item.title}
                        </Link>

                        <br /><br />

                    </div>

                ))

            )}

        </div>
        </>
    );
}

export default NewsDetails;