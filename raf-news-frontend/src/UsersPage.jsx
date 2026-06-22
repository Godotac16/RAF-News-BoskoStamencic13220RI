import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

function UsersPage() {

    const [users, setUsers] = useState([]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userRole, setUserRole] = useState("CREATOR");

    const token = localStorage.getItem("token");

    const loggedUserId = token
    ? JSON.parse(
        atob(token.split(".")[1])
      ).id
    : null;

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
                            `Bearer ${token}`
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
                alert("Greška");
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
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);

            loadUsers();

        } catch (error) {

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Greška");
            }

        }

    };

    const deleteUser = async (id) => {

        try {

            const response = await axios.delete(
                `http://localhost:3000/users/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);

            loadUsers();

        } catch (error) {

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Greška");
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
                            `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);

            loadUsers();

        } catch (error) {

            alert("Greška");

        }

    };

    useEffect(() => {

        loadUsers();

    }, []);

    return (
    <>
         <Navbar />

        <div style={{ padding: "40px" }}>

            <h1>Korisnici</h1>

            <h2>Dodaj korisnika</h2>

            <input
                type="text"
                placeholder="Ime"
                value={firstName}
                onChange={(e) =>
                    setFirstName(e.target.value)
                }
            />

            <br /><br />

            <input
                type="text"
                placeholder="Prezime"
                value={lastName}
                onChange={(e) =>
                    setLastName(e.target.value)
                }
            />

            <br /><br />

            <input
                type="email"
                placeholder="Email"
                value={userEmail}
                onChange={(e) =>
                    setUserEmail(e.target.value)
                }
            />

            <br /><br />

            <input
                type="password"
                placeholder="Lozinka"
                value={userPassword}
                onChange={(e) =>
                    setUserPassword(e.target.value)
                }
            />

            {" "}

            <input
                type="password"
                placeholder="Potvrdi lozinku"
                value={confirmPassword}
                onChange={(e) =>
                    setConfirmPassword(e.target.value)
                }
            />

            <br /><br />

            <select
                value={userRole}
                onChange={(e) =>
                    setUserRole(e.target.value)
                }
            >
                <option value="CREATOR">
                    CREATOR
                </option>

                <option value="ADMIN">
                    ADMIN
                </option>
            </select>

            <br /><br />

            <button onClick={addUser}>
                Dodaj korisnika
            </button>

            <hr />

            <h2>Svi korisnici</h2>

            <ul>

                {users.map(user => (

                    <li key={user.id}>

                        <b>
                            {user.first_name}
                            {" "}
                            {user.last_name}
                        </b>

                        {" - "}

                        {user.email}

                        {" - "}

                        {user.role}

                        {" - "}

                        {user.active
                            ? "Aktivan"
                            : "Neaktivan"}

                        {" "}

                        <button
                            onClick={() =>
                                updateUser(user)
                            }
                        >
                            Izmeni
                        </button>

                        {" "}
                            {/*}   Ne znam da li sme admin sam sebe da obrise i deaktivira
                        <button
                            onClick={() =>
                                toggleUserStatus(user.id)
                            }
                        >
                            {user.active
                                ? "Deaktiviraj"
                                : "Aktiviraj"}
                        </button>

                        {" "}

                        <button
                            onClick={() =>
                                deleteUser(user.id)
                            }
                        >
                            Obriši
                        </button>

                            */} 
                        {user.id !== loggedUserId && (
                            <>
                                <button
                                    onClick={() =>
                                        toggleUserStatus(user.id)
                                    }
                                >
                                    {user.active
                                        ? "Deaktiviraj"
                                        : "Aktiviraj"}
                                </button>

                                {" "}

                                <button
                                    onClick={() =>
                                        deleteUser(user.id)
                                    }
                                >
                                    Obriši
                                </button>
                            </>
                        )}                        

                    </li>

                ))}

            </ul>

        </div>
    </>
    );

}

export default UsersPage;