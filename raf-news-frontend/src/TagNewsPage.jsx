import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

function TagNewsPage() {

    const { tag } = useParams();

    const [news, setNews] = useState([]);

    useEffect(() => {

        axios
            .get(
                `http://localhost:3000/news/tag/${tag}`
            )
            .then(res => {
                setNews(res.data);
            });

    }, [tag]);

    return (

        <>
            <Navbar />

            <div style={{ padding: "40px" }}>

                <h1>
                    Vesti za tag: {tag}
                </h1>

                <hr />

                {news.length === 0 ? (

                    <p>Nema vesti za ovaj tag.</p>

                ) : (

                    news.map(item => (

                        <div key={item.id}>

                            <h3>
                                <Link
                                    to={`/news/${item.id}`}
                                >
                                    {item.title}
                                </Link>
                            </h3>

                            <p>{item.content}</p>

                            <hr />

                        </div>

                    ))

                )}

            </div>

        </>

    );

}

export default TagNewsPage;