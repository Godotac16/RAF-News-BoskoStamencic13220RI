import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

function CategoriesPage() {

    const [categories, setCategories] = useState([]);
    const [news, setNews] = useState([]);

    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");

    const token = localStorage.getItem("token");

    const loadCategories = async () => {

        try {

            const response = await axios.get(
                "http://localhost:3000/categories"
            );

            setCategories(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const addCategory = async () => {

        try {

            const response = await axios.post(
                "http://localhost:3000/categories",
                {
                    name: categoryName,
                    description: categoryDescription
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);

            setCategoryName("");
            setCategoryDescription("");

            loadCategories();

        } catch (error) {

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Greška");
            }

        }

    };

    const deleteCategory = async (id) => {

        try {

            const response = await axios.delete(
                `http://localhost:3000/categories/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);

            loadCategories();

            } catch (error) {

                if (
                    error.response?.data?.code ===
                    "ER_ROW_IS_REFERENCED_2"
                ) {

                    alert(
                        "Ne možete obrisati kategoriju koja sadrži vesti."
                    );

                } else if (error.response?.data?.message) {

                    alert(error.response.data.message);

                } else {

                    alert("Greška");

                }

            }

    };

    const updateCategory = async (category) => {

        const newName = prompt(
            "Novi naziv:",
            category.name
        );

        if (!newName) return;

        const newDescription = prompt(
            "Novi opis:",
            category.description
        );

        if (!newDescription) return;

        try {

            const response = await axios.put(
                `http://localhost:3000/categories/${category.id}`,
                {
                    name: newName,
                    description: newDescription
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);

            loadCategories();

        } catch (error) {

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Greška");
            }

        }

    };

    const loadNewsByCategory = async (categoryId) => {

        try {

            const response = await axios.get(
                "http://localhost:3000/news"
            );

            const filtered = response.data.filter(
                item => item.category_id === categoryId
            );

            setNews(filtered);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        loadCategories();

    }, []);

    return (

    <>
        <Navbar />

        <div style={{ padding: "40px" }}>        

            <h1>Kategorije</h1>

            <h2>Dodaj kategoriju</h2>

            <input
                type="text"
                placeholder="Naziv kategorije"
                value={categoryName}
                onChange={(e) =>
                    setCategoryName(e.target.value)
                }
            />

            <br /><br />

            <input
                type="text"
                placeholder="Opis kategorije"
                value={categoryDescription}
                onChange={(e) =>
                    setCategoryDescription(e.target.value)
                }
            />

            <br /><br />

            <button onClick={addCategory}>
                Dodaj kategoriju
            </button>

            <hr />

            <h2>Sve kategorije</h2>

            <ul>

                {categories.map(category => (

                    <li key={category.id}>

                        <button
                            onClick={() =>
                                loadNewsByCategory(category.id)
                            }
                        >
                            {category.name}
                        </button>

                        {" - "}

                        {category.description}

                        {" "}

                        <button
                            onClick={() =>
                                updateCategory(category)
                            }
                        >
                            Izmeni
                        </button>

                        {" "}

                        <button
                            onClick={() =>
                                deleteCategory(category.id)
                            }
                        >
                            Obriši
                        </button>

                    </li>

                ))}

            </ul>

            <hr />

            <h2>Vesti iz odabrane kategorije</h2>

            {news.length === 0 ? (
                <p>Nijedna kategorija nije izabrana.</p>
            ) : (

                <ul>

                    {news.map(item => (

                        <li key={item.id}>

                            <h3>
                                <Link to={`/news/${item.id}`}>
                                    {item.title}
                                </Link>
                            </h3>

                            <p>{item.content}</p>

                            <p>
                                <b>Autor:</b> {item.author_name}
                            </p>

                            <p>
                                <b>Datum:</b>{" "}
                                {new Date(
                                    item.created_at
                                ).toLocaleString("sr-RS")}
                            </p>

                            <p>
                                <b>Tagovi:</b> {item.tags}
                            </p>

                            <hr />

                        </li>

                    ))}

                </ul>

            )}

        </div>
    </>
    );

}

export default CategoriesPage;