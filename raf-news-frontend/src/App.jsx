import { useEffect, useState } from "react";
import axios from "axios";
import {
  Routes,
  Route
} from "react-router-dom";

import NewsDetails from "./NewsDetails";
import { Link } from "react-router-dom";
import CategoriesPage from "./CategoriesPage";
import UsersPage from "./UsersPage";
import TagNewsPage from "./TagNewsPage";
import Navbar from "./Navbar";

function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const [categories, setCategories] = useState([]);

  const [news, setNews] = useState([]);

  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCategoryId, setNewsCategoryId] = useState("");

  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("CREATOR");

  const [userRoleLogged, setUserRoleLogged] = useState("");

  const [searchText, setSearchText] = useState("");

  const [newsTags, setNewsTags] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isLoggedIn =
  !!localStorage.getItem("token");
  const [selectedCategory, setSelectedCategory] =
    useState(null);
  
  const [loggedUserName, setLoggedUserName] =
    useState("");
  
  const [mostReadNews, setMostReadNews] =
    useState([]);

  const [topReactions, setTopReactions] =
    useState([]);
  


  const getUserFromToken = () => {

      const token =
          localStorage.getItem("token");

      if (!token) return;

      const payload =
          JSON.parse(
              atob(token.split(".")[1])
          );

      setLoggedUserName(
          payload.first_name +
          " " +
          payload.last_name
      );

  };

  const searchNews = async () => {

    try {

      const response = await axios.get(
        `http://localhost:3000/news/search?q=${searchText}`
      );

      setNews(response.data);

    } catch (error) {

      alert("Greska pri pretrazi");

    }

  };

  const login = async () => {

    try {

      const response = await axios.post(
        "http://localhost:3000/login",
        {
          email,
          password
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      window.location.reload();

      setMessage(response.data.message);

    } catch (error) {

      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Greska na serveru");
      }

    }

  };

  const logout = () => {

    localStorage.removeItem("token");

    window.location.reload();

    setMessage("Odjavljeni ste");

  };

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
        alert("Greska na serveru");
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

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Greska prilikom brisanja");
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
        alert("Greska prilikom izmene");
      }

    }

  };

  const loadNews = async () => {

    try {

      const response = await axios.get(
        `http://localhost:3000/news?page=${currentPage}`
      );

      setNews(response.data);

    } catch (error) {
      console.log(error);
    }

  };

  const loadUsers = async () => {

    try {

      const response = await axios.get(
          "http://localhost:3000/users"
        );

        setUsers(response.data);

      } catch (error) {

      console.log(error);

    }

  };

  const deleteUser = async (id) => {

    try {

      const response = await axios.delete(
        `http://localhost:3000/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message);

      loadUsers();

    } catch (error) {

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Greska");
      }

    }

  };

  const updateUser = async (user) => {

    const newFirstName =
      prompt("Ime:", user.first_name);

    if (!newFirstName) return;

    const newLastName =
      prompt("Prezime:", user.last_name);

    if (!newLastName) return;

    const newEmail =
      prompt("Email:", user.email);

    if (!newEmail) return;

    const newRole =
      prompt("Role:", user.role);

    if (!newRole) return;

    try {

      const response = await axios.put(
        `http://localhost:3000/users/${user.id}`,
        {
          first_name: newFirstName,
          last_name: newLastName,
          email: newEmail,
          role: newRole,
          active: user.active
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message);

      loadUsers();

    } catch (error) {

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Greska");
      }

    }

  };

  const addNews = async () => {

    try {

      const response = await axios.post(
        "http://localhost:3000/news",
        {
          title: newsTitle,
          content: newsContent,
          category_id: newsCategoryId,
          tags: newsTags

        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message);

      setNewsTitle("");
      setNewsContent("");
      setNewsCategoryId("");
      setNewsTags("");

      loadNews();

    } catch (error) {

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Greska pri dodavanju vesti");
      }

    }

  };

  const deleteNews = async (id) => {

    try {

      const response = await axios.delete(
        `http://localhost:3000/news/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message);

      loadNews();

      axios
        .get("http://localhost:3000/news/most-read")
        .then(res => {
            setMostReadNews(res.data);
        });

      axios
        .get("http://localhost:3000/news/top-reactions")
        .then(res => {
            setTopReactions(res.data);
        });

    } catch (error) {

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Greska prilikom brisanja");
      }

    }

  };

  const updateNews = async (item) => {

    const newTitle = prompt(
      "Novi naslov:",
      item.title
    );

    if (!newTitle) return;

    const newContent = prompt(
      "Novi sadrzaj:",
      item.content
    );

    if (!newContent) return;

    const newTags =
        prompt(
            "Tagovi:",
            item.tags || ""
        );

    if (newTags === null) return;

    try {

      const response = await axios.put(
        `http://localhost:3000/news/${item.id}`,
        {
          title: newTitle,
          content: newContent,
          category_id: item.category_id,
          tags: newTags
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message);

      loadNews();

    } catch (error) {

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Greska prilikom izmene");
      }

    }

  };

  const getRoleFromToken = () => {

    const token = localStorage.getItem("token");

    if (!token) return;

    const payload =
      JSON.parse(atob(token.split(".")[1]));

    setUserRoleLogged(payload.role);

  };

  const addUser = async () => {

    if (userPassword !== confirmPassword) {
      alert("Lozinke se ne poklapaju");
      return;
    }

    try {

      const response = await axios.post(
        "http://localhost:3000/users",
        {
          first_name: firstName,
          last_name: lastName,
          email: userEmail,
          password: userPassword,
          role: userRole,
          active: 1
        },
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert(response.data.message);

      setFirstName("");
      setLastName("");
      setUserEmail("");
      setUserPassword("");
      setConfirmPassword("");

      loadUsers();

    } catch (error) {

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Greska");
      }

    }

  };

  const toggleUserStatus = async (id) => {

    try {

      const response = await axios.patch(
        `http://localhost:3000/users/${id}/status`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert(response.data.message);

      loadUsers();

    } catch (error) {

      alert("Greska");

    }

  };

  const filterByCategory = (categoryId) => {

      const filtered =
          news.filter(
              n => n.category_id === categoryId
          );

      setNews(filtered);

  };

  useEffect(() => {

    loadCategories();
    loadNews();
    loadUsers();
    getRoleFromToken();
    getUserFromToken();

    axios
    .get("http://localhost:3000/news/most-read")
    .then(res => {
        setMostReadNews(res.data);
    });
    axios
    .get(
        "http://localhost:3000/news/top-reactions"
    )
    .then(res => {
        setTopReactions(res.data);
    });


  }, [currentPage]);

  return (

    <Routes>

      <Route
        path="/news/:id"
        element={<NewsDetails />}
      />

      <Route
        path="/categories"
        element={<CategoriesPage />}
      />

      <Route
        path="/users"
        element={<UsersPage />}
      />

      <Route
        path="/tag/:tag"
        element={<TagNewsPage />}
      />

      <Route
        path="/"
        element={
    
    <>
    <Navbar />

    <div style={{ 
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px"
     }}>

      <h1>
        {isLoggedIn
          ? "RAF News"
          : "RAF News Login"}
      </h1>

      {!isLoggedIn ? (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <br /><br />

          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <br /><br />

          <button onClick={login}>
            Login
          </button>
          <br /><br />
        </>
      ) : (
        <>
        
        </>
      )}
      <br /><br />

      <h3>{message}</h3>

      <hr />

      <input
          type="text"
          placeholder="Pretraga vesti"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {" "}
        
      <button onClick={searchNews}>
        Pretrazi
      </button> 

      {" "} 

      <hr/>

      {" "}
      
      {isLoggedIn && (
      <>

        <h2>Dodaj vest</h2>

        <input
          type="text"
          placeholder="Naslov"
          value={newsTitle}
          onChange={(e) => setNewsTitle(e.target.value)}
        />

        <br /><br />

        <textarea
          placeholder="Sadrzaj"
          value={newsContent}
          onChange={(e) => setNewsContent(e.target.value)}
        />

        <br /><br />

      <input
        type="text"
        placeholder="Tagovi (odvojeni zarezom)"
        value={newsTags}
        onChange={(e) => setNewsTags(e.target.value)}
      />

        <br /><br />

        <select
          value={newsCategoryId}
          onChange={(e) => setNewsCategoryId(e.target.value)}
        >

          <option value="">
            Izaberi kategoriju
          </option>

          {categories.map(category => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}

        </select>

        <br /><br />

        <button onClick={addNews}>
          Dodaj vest
        </button>

        <hr />
        
      </>
      )}
        <div
          style={{
            position: "fixed",
            right: "20px",
            top: "10px",
            width: "250px",
            border: "1px solid black",
            padding: "10px",
            backgroundColor: "black"
          }}
        >
          
          <h3>Najčitanije vesti</h3>

          {mostReadNews.map(item => (

            <div key={item.id}>

              <Link to={`/news/${item.id}`}>
                {item.title}
              </Link>

              <br /><br />

            </div>

          ))}
          <hr />

          <h3>Najviše reakcija</h3>

          {topReactions.map(item => (

              <div key={item.id}>

                  <Link to={`/news/${item.id}`}>
                      {item.title}
                  </Link>

                  <br />

                  👍 {item.likes}
                  {" "}
                  👎 {item.dislikes}

                  <br /><br />

              </div>

          ))}
        </div>


      <h2>Sve vesti</h2>

      <ul>

        {news
          .filter(item =>
            !selectedCategory ||
            item.category_id === selectedCategory
          )
          .map(item => (

          <li key={item.id}>

            <h3>
              <Link to={`/news/${item.id}`}>
                {item.title}
              </Link>
            </h3>

            <p>{item.content}</p>

            <p>
              <b>Kategorija:</b> {item.category_name}
            </p>

            <p>
              <b>Objavljeno:</b>{" "}
              {new Date(item.created_at).toLocaleString("sr-RS")}
            </p>

          <p>
              <b>Tagovi:</b>{" "}

              {item.tags &&
                  item.tags
                      .split(",")
                      .map((tag, index) => (

                          <span key={tag}>

                              <Link to={`/tag/${tag}`}>
                                  {tag}
                              </Link>

                              {index <
                                  item.tags.split(",").length - 1
                                  ? " | "
                                  : ""}

                          </span>

                      ))
              }
          </p>

            {isLoggedIn && (
              <>
                <button
                  onClick={() => updateNews(item)}
                >
                  Izmeni
                </button>

                {" "}

                <button
                  onClick={() => deleteNews(item.id)}
                >
                  Obrisi
                </button>
              </>
            )}

            <hr />

          </li>

        ))}

      </ul>

      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prethodna
      </button>

      {" "}

      <span>
        Strana {currentPage}
      </span>

      {" "}

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={news.length < 10}
      >
        Sledeća
      </button>
              
       </div>
      
      </>

      }
    />

  </Routes>
);
}

export default App;