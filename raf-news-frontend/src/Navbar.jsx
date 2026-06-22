import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {

    const isLoggedIn =
        !!localStorage.getItem("token");

    const token =
        localStorage.getItem("token");

    const [loggedUserName, setLoggedUserName] =
        useState("");

    useEffect(() => {

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

    }, []);

    const logout = () => {

        localStorage.removeItem("token");

        window.location.href = "/";

    };

    let role = "";

    if (token) {

        const payload =
            JSON.parse(
                atob(token.split(".")[1])
            );

        role = payload.role;

    }

    return (

        <div
            style={{
                position: "sticky",
                top: 0,
                background: "#1e3a8a",
                color: "white",
                padding: "15px 25px",
                borderBottom: "1px solid gray",
                zIndex: 1000,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}
        >

            <div>

                {isLoggedIn && (
                    <b>
                        Ulogovan kao:
                        {" "}
                        {loggedUserName}
                    </b>
                )}

            </div>

            <div>

                <Link to="/">
                    <button>Vesti</button>
                </Link>

                {" "}

                {isLoggedIn && (
                    <>
                        <Link to="/categories">
                            <button>Kategorije</button>
                        </Link>

                        {" "}

                        {role === "ADMIN" && (
                            <Link to="/users">
                                <button>Korisnici</button>
                            </Link>
                        )}
                    </>
                )}

            </div>

            <div>

                {isLoggedIn && (
                    <button onClick={logout}>
                        Logout
                    </button>
                )}

            </div>

        </div>

    );

}

export default Navbar;