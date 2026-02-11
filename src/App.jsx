import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

/* =======================
   LAYOUT (ใช้ร่วมกันทุกหน้า)
======================= */
function Layout({ children, isLoggedIn, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 text-white p-4 flex justify-between">
        <div className="flex gap-4">
          <Link to="/" className="font-bold">Home</Link>
          {!isLoggedIn && <Link to="/login">Login</Link>}
          {isLoggedIn && <Link to="/admin">Admin</Link>}
        </div>

        {isLoggedIn && (
          <button onClick={onLogout} className="text-sm font-bold">
            Logout
          </button>
        )}
      </nav>

      <div className="p-8">{children}</div>
    </div>
  );
}

/* =======================
   HOME (อ่านอย่างเดียว)
======================= */
function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/posts");
      setData(res.data.slice(0, 5));
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ข่าวสารทั้งหมด</h1>

      {data.map((item) => (
        <div key={item.id} className="bg-white p-4 rounded-lg mb-3 shadow">
          <h3 className="font-bold">{item.title}</h3>
          <p className="text-gray-600">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/* =======================
   LOGIN
======================= */
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const CORRECT_PASSWORD = "1234";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("กรุณากรอกข้อมูลให้ครบไอกาก");
      return;
    }

    if (password !== CORRECT_PASSWORD) {
      setError("รหัสผ่านไม่ถูกต้องเพราะกากเกินคน");
      return;
    }

    onLogin();
    navigate("/admin"); // ✅ เด้งไปหน้า Admin อัตโนมัติ
  };

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="ชื่อผู้ใช้"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 border rounded mb-3"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          เข้าสู่ระบบ
        </button>

        <p className="text-xs text-gray-400 mt-3 text-center">
          * รหัสผ่านตัวอย่าง: 1234
        </p>
      </form>
    </div>
  );
}

/* =======================
   ADMIN (CRUD)
======================= */
function Admin() {
  const [data, setData] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/posts");
      setData(res.data.slice(0, 5));
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle || !newBody) return;

    if (editingPost) {
      await axios.put(
        `https://jsonplaceholder.typicode.com/posts/${editingPost.id}`,
        { title: newTitle, body: newBody }
      );

      setData(
        data.map((item) =>
          item.id === editingPost.id
            ? { ...item, title: newTitle, body: newBody }
            : item
        )
      );

      setEditingPost(null);
    } else {
      const res = await axios.post(
        "https://jsonplaceholder.typicode.com/posts",
        { title: newTitle, body: newBody }
      );

      setData([res.data, ...data]);
    }

    setNewTitle("");
    setNewBody("");
  };

  const handleDelete = async (id) => {
    await axios.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);
    setData(data.filter((item) => item.id !== id));
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewTitle(post.title);
    setNewBody(post.body);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* FORM */}
      <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8">
        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="หัวข้อข่าว"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 border rounded mb-3"
          placeholder="เนื้อหาข่าว"
          rows="3"
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingPost ? "บันทึกการแก้ไข" : "เพิ่มข่าว"}
        </button>
      </form>

      {/* LIST */}
      {data.map((item) => (
        <div key={item.id} className="bg-white p-4 mb-3 shadow flex justify-between">
          <div>
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-gray-600">{item.body}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => handleEdit(item)} className="text-orange-500 text-sm">
              แก้ไข
            </button>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 text-sm">
              ลบ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =======================
   APP
======================= */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedLogin = localStorage.getItem("isLoggedIn");
    if (savedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Layout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/admin"
            element={
              isLoggedIn ? <Admin /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;